/** Base URL for Person A FastAPI — set `NEXT_PUBLIC_API_URL` in `.env.local`. */
export function getApiBase(): string {
  return (process.env.NEXT_PUBLIC_API_URL ?? "http://127.0.0.1:8000").replace(
    /\/$/,
    "",
  );
}
