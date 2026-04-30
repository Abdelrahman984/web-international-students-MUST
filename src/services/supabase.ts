import axios from "axios";
import { jwtDecode } from "jwt-decode";

type GenericRecord = Record<string, unknown>;

type QueryResult<T> = {
  data: T | null;
  error: { message: string; code?: string } | null;
  count?: number | null;
};

type SessionLike = {
  access_token: string;
  user: UserLike;
};

type UserLike = {
  id: string;
  email: string;
  user_metadata: Record<string, unknown>;
};

type AuthStateListener = (
  event: "SIGNED_IN" | "SIGNED_OUT" | "TOKEN_REFRESHED",
  session: SessionLike | null,
) => void;

const TOKEN_STORAGE_KEY = "must_auth_token";
const USER_STORAGE_KEY = "must_auth_user";
const USER_ID_STORAGE_KEY = "auth_user_id";

const getApiBaseUrl = (): string => {
  const configured = (
    import.meta.env.VITE_API_BASE_URL as string | undefined
  )?.trim();
  if (!configured) {
    return "";
  }

  return configured.endsWith("/") ? configured.slice(0, -1) : configured;
};

const apiBaseUrl = getApiBaseUrl();

if (!apiBaseUrl) {
  console.warn("VITE_API_BASE_URL is not configured.");
}

const toError = (error: unknown): { message: string; code?: string } => {
  if (axios.isAxiosError(error)) {
    const payload = error.response?.data as Record<string, unknown> | undefined;
    const message =
      (typeof payload?.message === "string" && payload.message) ||
      (typeof payload?.error === "string" && payload.error) ||
      error.message ||
      "Request failed.";

    return {
      message,
      code: error.code,
    };
  }

  if (error instanceof Error) {
    return { message: error.message };
  }

  return { message: "Request failed." };
};

const normalizeUserFromToken = (token: string): UserLike | null => {
  try {
    const claims = jwtDecode<Record<string, unknown>>(token);
    const id =
      (typeof claims.sub === "string" && claims.sub) ||
      (typeof claims.nameid === "string" && claims.nameid) ||
      (typeof claims[
        "http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier"
      ] === "string" &&
        (claims[
          "http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier"
        ] as string)) ||
      (typeof claims.userId === "string" && claims.userId) ||
      "";
    const email =
      (typeof claims.email === "string" && claims.email) ||
      (typeof claims.unique_name === "string" && claims.unique_name) ||
      "";
    const roleValue =
      (typeof claims.role === "string" && claims.role) ||
      (typeof claims[
        "http://schemas.microsoft.com/ws/2008/06/identity/claims/role"
      ] === "string" &&
        (claims[
          "http://schemas.microsoft.com/ws/2008/06/identity/claims/role"
        ] as string)) ||
      "visitor";

    return {
      id: id || email || "user",
      email,
      user_metadata: {
        role: roleValue.toLowerCase(),
        universityId:
          (typeof claims.universityId === "string" && claims.universityId) ||
          (typeof claims.student_id === "string" && claims.student_id) ||
          undefined,
      },
    };
  } catch {
    return null;
  }
};

const readToken = (): string | null => {
  if (typeof window === "undefined") {
    return null;
  }

  return localStorage.getItem(TOKEN_STORAGE_KEY);
};

const readStoredUser = (): UserLike | null => {
  if (typeof window === "undefined") {
    return null;
  }

  const raw = localStorage.getItem(USER_STORAGE_KEY);
  if (!raw) {
    return null;
  }

  try {
    return JSON.parse(raw) as UserLike;
  } catch {
    return null;
  }
};

const listeners = new Set<AuthStateListener>();

const emitAuthEvent = (
  event: "SIGNED_IN" | "SIGNED_OUT" | "TOKEN_REFRESHED",
  session: SessionLike | null,
) => {
  listeners.forEach((listener) => listener(event, session));
};

const persistSession = (token: string, user: UserLike) => {
  if (typeof window === "undefined") {
    return;
  }

  localStorage.setItem(TOKEN_STORAGE_KEY, token);
  localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(user));
  if (user.id) {
    localStorage.setItem(USER_ID_STORAGE_KEY, user.id);
  }
};

const clearSession = () => {
  if (typeof window === "undefined") {
    return;
  }

  localStorage.removeItem(TOKEN_STORAGE_KEY);
  localStorage.removeItem(USER_STORAGE_KEY);
  localStorage.removeItem(USER_ID_STORAGE_KEY);
};

const getCurrentSession = (): SessionLike | null => {
  const token = readToken();
  if (!token) {
    return null;
  }

  const user = readStoredUser() || normalizeUserFromToken(token);
  if (!user) {
    return null;
  }

  return {
    access_token: token,
    user,
  };
};

const apiClient = axios.create({
  baseURL: apiBaseUrl,
});

const authorizedClient = (token?: string) => {
  const resolvedToken = token || readToken();

  return axios.create({
    baseURL: apiBaseUrl,
    headers: resolvedToken
      ? {
          Authorization: `Bearer ${resolvedToken}`,
        }
      : undefined,
  });
};

const tableEndpoint = (table: string): string => `/api/${table}`;

class QueryBuilder {
  private table: string;

  private filters: Array<(row: GenericRecord) => boolean> = [];

  private orders: Array<{ field: string; ascending: boolean }> = [];

  private rowLimit: number | null = null;

  private operation: "select" | "update" | "delete" = "select";

  private updatePayload: GenericRecord | null = null;

  private expectSingle = false;

  private expectMaybeSingle = false;

  private withCount = false;

  constructor(table: string) {
    this.table = table;
  }

  select(
    _columns = "*",
    options?: { head?: boolean; count?: "exact" | "planned" | "estimated" },
  ) {
    this.operation = "select";
    this.withCount = options?.count === "exact";
    return this;
  }

  eq(field: string, value: unknown) {
    this.filters.push((row) => row[field] === value);
    return this;
  }

  neq(field: string, value: unknown) {
    this.filters.push((row) => row[field] !== value);
    return this;
  }

  in(field: string, values: unknown[]) {
    this.filters.push((row) => values.includes(row[field]));
    return this;
  }

  ilike(field: string, pattern: string) {
    const needle = pattern.replace(/%/g, "").toLowerCase();
    this.filters.push((row) =>
      String(row[field] ?? "")
        .toLowerCase()
        .includes(needle),
    );
    return this;
  }

  or(expression: string) {
    const clauses = expression
      .split(",")
      .map((item) => item.trim())
      .filter(Boolean)
      .map((item) => {
        const [left, value] = item.split(".eq.");
        return {
          left,
          value: (value || "").replace(/\\,/g, ","),
        };
      });

    this.filters.push((row) =>
      clauses.some((clause) => String(row[clause.left] ?? "") === clause.value),
    );

    return this;
  }

  order(
    field: string,
    options?: { ascending?: boolean; nullsFirst?: boolean },
  ) {
    this.orders.push({ field, ascending: options?.ascending !== false });
    return this;
  }

  limit(value: number) {
    this.rowLimit = value;
    return this;
  }

  maybeSingle<T = GenericRecord>() {
    this.expectMaybeSingle = true;
    return this.execute<T>();
  }

  single<T = GenericRecord>() {
    this.expectSingle = true;
    return this.execute<T>();
  }

  update(payload: GenericRecord) {
    this.operation = "update";
    this.updatePayload = payload;
    return this;
  }

  delete() {
    this.operation = "delete";
    return this;
  }

  then<TResult1 = QueryResult<unknown>, TResult2 = never>(
    onfulfilled?:
      | ((value: QueryResult<unknown>) => TResult1 | PromiseLike<TResult1>)
      | null,
    onrejected?: ((reason: unknown) => TResult2 | PromiseLike<TResult2>) | null,
  ): Promise<TResult1 | TResult2> {
    return this.execute().then(
      onfulfilled || undefined,
      onrejected || undefined,
    );
  }

  private async listRows(): Promise<QueryResult<GenericRecord[]>> {
    try {
      const { data } = await apiClient.get(tableEndpoint(this.table));
      const rows = Array.isArray(data) ? (data as GenericRecord[]) : [];

      let filtered = rows.filter((row) =>
        this.filters.every((predicate) => predicate(row)),
      );

      this.orders.forEach(({ field, ascending }) => {
        filtered = [...filtered].sort((a, b) => {
          const av = a[field];
          const bv = b[field];
          if (av == null && bv == null) return 0;
          if (av == null) return ascending ? 1 : -1;
          if (bv == null) return ascending ? -1 : 1;
          if (av === bv) return 0;
          return av > bv ? (ascending ? 1 : -1) : ascending ? -1 : 1;
        });
      });

      if (typeof this.rowLimit === "number") {
        filtered = filtered.slice(0, this.rowLimit);
      }

      return {
        data: filtered,
        error: null,
        count: this.withCount ? filtered.length : null,
      };
    } catch (error) {
      return {
        data: null,
        error: toError(error),
      };
    }
  }

  private async execute<T = GenericRecord>(): Promise<QueryResult<T>> {
    if (this.operation === "select") {
      const listResult = await this.listRows();
      if (listResult.error || !listResult.data) {
        return listResult as QueryResult<T>;
      }

      const rows = listResult.data;
      if (this.expectSingle || this.expectMaybeSingle) {
        const row = rows[0] ?? null;
        if (this.expectSingle && !row) {
          return {
            data: null,
            error: { message: "No rows found." },
          };
        }

        return {
          data: row as T,
          error: null,
          count: listResult.count,
        };
      }

      return {
        data: rows as unknown as T,
        error: null,
        count: listResult.count,
      };
    }

    if (this.operation === "update") {
      const listed = await this.listRows();
      if (listed.error || !listed.data) {
        return listed as QueryResult<T>;
      }

      try {
        const updates = listed.data.map(async (row) => {
          const id = row.id;
          if (id == null) {
            return;
          }

          await authorizedClient().put(`${tableEndpoint(this.table)}/${id}`, {
            ...row,
            ...this.updatePayload,
          });
        });

        await Promise.all(updates);

        return {
          data: null,
          error: null,
        };
      } catch (error) {
        return {
          data: null,
          error: toError(error),
        };
      }
    }

    const listed = await this.listRows();
    if (listed.error || !listed.data) {
      return listed as QueryResult<T>;
    }

    try {
      await Promise.all(
        listed.data.map(async (row) => {
          const id = row.id;
          if (id == null) {
            return;
          }

          await authorizedClient().delete(`${tableEndpoint(this.table)}/${id}`);
        }),
      );

      return {
        data: null,
        error: null,
      };
    } catch (error) {
      return {
        data: null,
        error: toError(error),
      };
    }
  }
}

const queryTable = (table: string) => ({
  select(
    columns = "*",
    options?: { head?: boolean; count?: "exact" | "planned" | "estimated" },
  ) {
    return new QueryBuilder(table).select(columns, options);
  },
  insert(payload: GenericRecord | GenericRecord[]) {
    return (async (): Promise<QueryResult<unknown>> => {
      try {
        if (Array.isArray(payload)) {
          const requests = payload.map((item) =>
            authorizedClient().post(tableEndpoint(table), item),
          );
          const responses = await Promise.all(requests);
          return {
            data: responses.map((response) => response.data),
            error: null,
          };
        }

        const { data } = await authorizedClient().post(
          tableEndpoint(table),
          payload,
        );
        return { data, error: null };
      } catch (error) {
        return { data: null, error: toError(error) };
      }
    })();
  },
  upsert(payload: GenericRecord[], options?: { onConflict?: string }) {
    return (async (): Promise<QueryResult<unknown>> => {
      try {
        const key = options?.onConflict || "id";
        await Promise.all(
          payload.map(async (item) => {
            const keyValue = item[key];
            if (keyValue == null) {
              await authorizedClient().post(tableEndpoint(table), item);
              return;
            }

            const { data } = await apiClient.get(tableEndpoint(table));
            const rows = Array.isArray(data) ? (data as GenericRecord[]) : [];
            const existing = rows.find((row) => row[key] === keyValue);

            if (existing?.id != null) {
              await authorizedClient().put(
                `${tableEndpoint(table)}/${existing.id}`,
                {
                  ...existing,
                  ...item,
                },
              );
              return;
            }

            await authorizedClient().post(tableEndpoint(table), item);
          }),
        );

        return { data: null, error: null };
      } catch (error) {
        return { data: null, error: toError(error) };
      }
    })();
  },
  update(payload: GenericRecord) {
    return new QueryBuilder(table).update(payload);
  },
  delete() {
    return new QueryBuilder(table).delete();
  },
});

export const isSupabaseConfigured = Boolean(apiBaseUrl);

export function getSupabaseConfigError(): string | null {
  if (isSupabaseConfigured) {
    return null;
  }

  return "API is not configured. Missing VITE_API_BASE_URL.";
}

export const supabase = {
  from(table: string) {
    return queryTable(table);
  },
  auth: {
    async signInWithPassword(input: { email: string; password: string }) {
      try {
        const { data } = await apiClient.post("/api/Auth/login", input);
        const responseUserId =
          (typeof data?.id === "string" && data.id.trim()) || "";
        const token =
          (typeof data?.token === "string" && data.token) ||
          (typeof data?.jwt === "string" && data.jwt) ||
          (typeof data?.accessToken === "string" && data.accessToken) ||
          "";

        if (!token) {
          return {
            data: { user: null, session: null },
            error: { message: "Token missing from login response." },
          };
        }

        const tokenUser = normalizeUserFromToken(token);
        const user =
          (data?.user as UserLike | undefined) ||
          (tokenUser
            ? {
                ...tokenUser,
                id: responseUserId || tokenUser.id,
                user_metadata: {
                  ...(tokenUser.user_metadata || {}),
                  ...(data?.profileMetadata
                    ? { profileMetadata: data.profileMetadata }
                    : {}),
                },
              }
            : {
                id: responseUserId || input.email,
                email: input.email,
                user_metadata: {
                  ...(data?.profileMetadata
                    ? { profileMetadata: data.profileMetadata }
                    : {}),
                },
              });

        persistSession(token, user);
        emitAuthEvent("SIGNED_IN", { access_token: token, user });

        return {
          data: {
            user,
            session: {
              access_token: token,
            },
          },
          error: null,
        };
      } catch (error) {
        return { data: { user: null, session: null }, error: toError(error) };
      }
    },
    async signUp(input: {
      email: string;
      password: string;
      options?: { data?: Record<string, unknown> };
    }) {
      try {
        const roleRaw = String(
          input.options?.data?.role || "visitor",
        ).toLowerCase();
        const role =
          roleRaw === "college-member"
            ? "student"
            : roleRaw === "admin"
              ? "advisor"
              : roleRaw;

        const otpValue = String(input.options?.data?.otp ?? "");
        const otpQuery = otpValue ? `?otp=${encodeURIComponent(otpValue)}` : "";

        const { data } = await apiClient.post<{
          errorMessage?: string | null;
          token?: string | null;
          role?: string | null;
          expiration?: string | null;
          id?: string | null;
          profileMetadata?: unknown | null;
        }>(`/api/Auth/register/${role}${otpQuery}`, {
          email: input.email,
          password: input.password,
          fullName:
            String(
              input.options?.data?.displayName ||
                input.options?.data?.full_name ||
                "",
            ).trim() || null,
        });

        if (data?.errorMessage) {
          throw new Error(data.errorMessage);
        }

        return {
          data: {
            user: {
              id: input.email,
              email: input.email,
              user_metadata: input.options?.data || {},
            },
            session: null,
          },
          error: null,
        };
      } catch (error) {
        return { data: { user: null, session: null }, error: toError(error) };
      }
    },
    async signOut() {
      clearSession();
      emitAuthEvent("SIGNED_OUT", null);
      return { error: null };
    },
    async getSession() {
      return {
        data: {
          session: getCurrentSession(),
        },
        error: null,
      };
    },
    async getUser(token?: string) {
      const session = token
        ? { access_token: token, user: normalizeUserFromToken(token) }
        : getCurrentSession();

      return {
        data: {
          user: session?.user || null,
        },
        error: null,
      };
    },
    async updateUser(payload: {
      password?: string;
      data?: Record<string, unknown>;
    }) {
      const session = getCurrentSession();
      if (!session) {
        return {
          data: { user: null },
          error: { message: "No active user session found." },
        };
      }

      if (payload.password) {
        try {
          await authorizedClient(session.access_token).put(
            `/api/Users/${session.user.id}`,
            {
              password: payload.password,
            },
          );
        } catch {
          // Keep local auth state consistent even if backend endpoint is unavailable.
        }
      }

      const mergedUser: UserLike = {
        ...session.user,
        user_metadata: {
          ...session.user.user_metadata,
          ...(payload.data || {}),
        },
      };

      persistSession(session.access_token, mergedUser);
      emitAuthEvent("TOKEN_REFRESHED", {
        access_token: session.access_token,
        user: mergedUser,
      });

      return {
        data: {
          user: mergedUser,
        },
        error: null,
      };
    },
    onAuthStateChange(listener: AuthStateListener) {
      listeners.add(listener);

      return {
        data: {
          subscription: {
            unsubscribe() {
              listeners.delete(listener);
            },
          },
        },
      };
    },
  },
  storage: {
    from(bucket: string) {
      return {
        async upload(
          path: string,
          file: File,
          _options?: { cacheControl?: string; upsert?: boolean },
        ) {
          try {
            const formData = new FormData();
            formData.append("file", file);
            formData.append("path", path);
            formData.append("bucket", bucket);

            const { data } = await authorizedClient().post(
              "/api/Admin/upload-students",
              formData,
              {
                headers: {
                  "Content-Type": "multipart/form-data",
                },
              },
            );

            const url =
              (typeof data?.url === "string" && data.url) ||
              `${apiBaseUrl}/uploads/${bucket}/${path}`;

            return {
              data: { path, fullPath: path, publicUrl: url },
              error: null,
            };
          } catch (error) {
            return {
              data: null,
              error: toError(error),
            };
          }
        },
        getPublicUrl(path: string) {
          return {
            data: {
              publicUrl: `${apiBaseUrl}/uploads/${bucket}/${path}`,
            },
          };
        },
      };
    },
  },
};
