// construct API routes url (client only!) API routes don't exist on server..
export function apiUrl(path: string) {
  const base =
    typeof window === "undefined"
      ? process.env.NEXT_PUBLIC_BASE_URL ??
        `http://localhost:${process.env.PORT ?? 3000}` // this is for dev only
      : "";
  return `${base}${path}`;
}
