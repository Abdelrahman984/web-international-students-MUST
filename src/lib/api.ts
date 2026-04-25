export function getApiUrl(): string {
  const env =
    (import.meta.env && (import.meta.env.VITE_API_URL as string | undefined)) ??
    undefined;
  if (env && env !== "") {
    return env.endsWith("/") ? env : `${env}/`;
  }
  if (typeof window !== "undefined" && window.location) {
    return `${window.location.origin.replace(/\/+$/, "")}/api/`;
  }
  return "/api/";
}

export function getPublicBaseUrl(): string {
  const api = getApiUrl();
  return api.replace(/\/api\/?$/, "");
}
