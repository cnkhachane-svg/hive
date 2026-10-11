"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { User, Store, Lock, Mail } from "lucide-react";

export default function RegisterPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("USER");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password, role }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Registration failed");
      } else {
        if (role === "STORE_OWNER") router.push("/store-owner");
        else router.push("/");
        router.refresh();
      }
    } catch (err) {
      setError("An unexpected error occurred");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto py-8 space-y-6">
      <div className="text-center space-y-2">
        <div className="w-12 h-12 bg-primary rounded-2xl flex items-center justify-center text-white text-2xl font-bold mx-auto shadow-subtle">
          🐝
        </div>
        <h1 className="text-2xl font-black text-charcoal">Create HIVE Account</h1>
        <p className="text-xs text-charcoal-muted">
          Join the personalized shopping decision revolution.
        </p>
      </div>

      <div className="bg-white rounded-3xl border border-border p-6 shadow-card space-y-4">
        {error && (
          <div className="p-3 bg-rose-50 border border-rose-200 text-state-error rounded-xl text-xs font-semibold">
            {error}
          </div>
        )}

        <form onSubmit={handleRegister} className="space-y-4 text-xs">
          <div>
            <label className="block font-bold text-charcoal mb-1">Full Name</label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Aarav Sharma"
              className="w-full p-2.5 bg-surface-muted border border-border rounded-xl text-xs text-charcoal outline-none focus:border-primary"
            />
          </div>

          <div>
            <label className="block font-bold text-charcoal mb-1">Email Address</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="aarav@example.com"
              className="w-full p-2.5 bg-surface-muted border border-border rounded-xl text-xs text-charcoal outline-none focus:border-primary"
            />
          </div>

          <div>
            <label className="block font-bold text-charcoal mb-1">Password</label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="At least 6 characters"
              className="w-full p-2.5 bg-surface-muted border border-border rounded-xl text-xs text-charcoal outline-none focus:border-primary"
            />
          </div>

          <div>
            <label className="block font-bold text-charcoal mb-1">I am registering as:</label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setRole("USER")}
                className={`p-2.5 rounded-xl border text-center transition-all flex items-center justify-center space-x-1.5 ${
                  role === "USER"
                    ? "bg-surface-pale border-primary text-primary-dark font-bold"
                    : "bg-surface-muted border-border text-charcoal-muted"
                }`}
              >
                <User className="w-4 h-4 text-primary" />
                <span>Shopper</span>
              </button>

              <button
                type="button"
                onClick={() => setRole("STORE_OWNER")}
                className={`p-2.5 rounded-xl border text-center transition-all flex items-center justify-center space-x-1.5 ${
                  role === "STORE_OWNER"
                    ? "bg-surface-pale border-primary text-primary-dark font-bold"
                    : "bg-surface-muted border-border text-charcoal-muted"
                }`}
              >
                <Store className="w-4 h-4 text-primary" />
                <span>Store Owner</span>
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-primary hover:bg-primary-dark text-white rounded-xl font-bold text-xs shadow-subtle transition-all"
          >
            {loading ? "Creating Account..." : "Create Account"}
          </button>
        </form>

        <div className="text-center pt-2 text-xs text-charcoal-muted">
          Already have an account?{" "}
          <Link href="/login" className="font-bold text-primary hover:underline">
            Sign In
          </Link>
        </div>
      </div>
    </div>
  );
}
