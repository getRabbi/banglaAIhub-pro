"use client";

import { FormEvent, Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

function AdminLoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [password, setPassword] = useState("");
  const [error, setError] = useState(searchParams.get("error") === "missing-secret" ? "Admin secret is not configured." : "");
  const [loading, setLoading] = useState(false);

  const nextPath = searchParams.get("next");
  const safeNextPath = nextPath?.startsWith("/admin") ? nextPath : "/admin";

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);
    setError("");

    const res = await fetch("/api/admin/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password }),
    });

    setLoading(false);
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setError(data.error || "Login failed");
      return;
    }

    router.replace(safeNextPath);
    router.refresh();
  };

  return (
    <main className="min-h-screen bg-[#07080f] flex items-center justify-center px-4">
      <form onSubmit={handleSubmit} className="glass-card w-full max-w-sm p-6">
        <div className="mb-6">
          <p className="text-xs uppercase tracking-wider text-gray-500 mb-2">BanglaAIHub</p>
          <h1 className="text-2xl font-bold text-white">Admin Login</h1>
        </div>
        <label className="text-xs text-gray-500 block mb-2" htmlFor="admin-password">Password</label>
        <input
          id="admin-password"
          type="password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          className="w-full px-3 py-2 rounded-lg bg-brand-navy border border-brand-border text-white focus:outline-none focus:border-brand-blue/50 text-sm"
          autoComplete="current-password"
          required
        />
        {error && <p className="text-sm text-red-400 mt-3">{error}</p>}
        <button type="submit" disabled={loading} className="btn-primary w-full mt-5">
          {loading ? "Signing in..." : "Sign in"}
        </button>
      </form>
    </main>
  );
}

export default function AdminLoginPage() {
  return (
    <Suspense fallback={<main className="min-h-screen bg-[#07080f]" />}>
      <AdminLoginForm />
    </Suspense>
  );
}
