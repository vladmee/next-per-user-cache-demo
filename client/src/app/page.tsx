import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { prewarmUserWidgets } from "./actions";

export default function Home() {
  // Mock sign in. Sets cookies manually
  async function signIn(formData: FormData) {
    "use server";
    const userId = formData.get("userId") as string;

    if (!userId || !userId.trim()) {
      return;
    }

    (await cookies()).set("demo_uid", userId, {
      httpOnly: true,
      sameSite: "lax",
      secure: true,
      path: "/",
      maxAge: 60 * 60 * 24 * 7,
    });

    // Start fetching the data immediately. This populates the KV
    await prewarmUserWidgets(userId);
    redirect("/dashboard");
  }

  return (
    <form action={signIn} className="grid gap-3">
      <h1 className="text-2xl font-semibold">Mock user sign in</h1>
      <label className="grid gap-1">
        <span className="text-sm opacity-70">Username (write anything)</span>
        <input
          required
          type="text"
          name="userId"
          autoComplete="off"
          className="rounded-lg px-3 py-2 bg-white/10 border border-white/10 outline-none"
        />
      </label>
      <button
        type="submit"
        className="rounded-xl px-5 py-3 bg-white/10 hover:bg-white/20 border border-white/10 cursor-pointer"
      >
        Sign in
      </button>
    </form>
  );
}
