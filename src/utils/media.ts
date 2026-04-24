export const apiBaseUrl = (import.meta.env.VITE_API_BASE_URL as string | undefined)?.trim().replace(/\/$/, "");

export const resolveMediaUrl = (path: string | null): string => {
  if (!path) {
    return "/assets/placeholder-image.jpg"; // Provide a fallback
  }

  if (path.startsWith("http://") || path.startsWith("https://") || path.startsWith("data:")) {
    return path;
  }

  const normalizedPath = path.replace(/^\/+/, "");
  
  if (!apiBaseUrl) {
    return path.startsWith("/") ? path : `/${path}`;
  }

  if (normalizedPath.startsWith("storage/v1/object/public/")) {
    return `${apiBaseUrl}/${normalizedPath}`;
  }

  if (normalizedPath.startsWith("storage/v1/object/")) {
    return `${apiBaseUrl}/${normalizedPath.replace("storage/v1/object/", "storage/v1/object/public/")}`;
  }

  return `${apiBaseUrl}/${normalizedPath}`;
};
