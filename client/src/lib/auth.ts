import { cookies } from "next/headers";

// Mock sign in
export async function requireSession() {
  // Here we fake a user id from a cookie; throw if missing.
  const id = (await cookies()).get("demo_uid")?.value;
  if (!id) throw new Error("Not authenticated");
  return { userId: id };
}
