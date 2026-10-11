"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { User, Store, ShieldCheck, ArrowRight, Lock, Mail } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Login failed");
      } else {
        router.push("/");
        router.refresh();
      }
    } catch (err) {
      setError("An unexpected error occurred");
    } finally {
      setLoading(false);
    }
  };

  const handleQuickDemoLogin = async (demoRole: string) => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ demoRole }),
      });
      const data = await res.json();
      if (res.ok) {
        if (demoRole === "owner") router.push("/store-owner");
        else if (demoRole === "admin") router.push("/admin");
        else router.push("/");
        router.refresh();
      } else {
        setError(data.error || "Demo login failed");
      }
    } catch (err) {
      setError("Demo login error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto py-8 space-y-6">
      {/* Brand Header */}
      <div className="text-center space-y-2">
        <div className="w-12 h-12 bg-primary rounded-2xl flex items-center justify-center text-white text-2xl font-bold mx-auto shadow-subtle">
          🐝
        </div>
        <h1 className="text-2xl font-black text-charcoal">Sign In to HIVE</h1>
        <p className="text-xs text-charcoal-muted">
          Access your personalized comparison priorities and smart basket.
        </p>
      </div>

      {/* 1-Click Judge Personas Card */}
      <div className="bg-surface-pale rounded-3xl p-5 border border-primary/20 space-y-3">
        <div className="text-xs font-bold text-primary-dark uppercase tracking-wider text-center">
          ⚡ Hackathon Judge Instant Access
        </div>
        <p className="text-[11px] text-charcoal-muted text-center">
          Click any persona below to log in immediately without credentials:
        </p>

        <div className="grid grid-cols-1 gap-2">
          <button
            type="button"
            onClick={() => handleQuickDemoLogin("shopper")}
            className="w-full p-2.5 bg-white hover:bg-emerald-50 rounded-xl border border-primary/20 text-xs font-bold text-charcoal flex items-center justify-between shadow-subtle transition-colors"
          >
            <div className="flex items-center space-x-2">
              <User className="w-4 h-4 text-primary" />
              <span>Aarav Sharma (Shopper)</span>
            </div>
            <span className="text-[10px] text-primary">Login →</span>
          </button>

          <button
            type="button"
            onClick={() => handleQuickDemoLogin("owner")}
            className="w-full p-2.5 bg-white hover:bg-emerald-50 rounded-xl border border-primary/20 text-xs font-bold text-charcoal flex items-center justify-between shadow-subtle transition-colors"
          >
            <div className="flex items-center space-x-2">
              <Store className="w-4 h-4 text-primary" />
              <span>Ramesh Patel (Kirana Store Owner)</span>
            </div>
            <span className="text-[10px] text-primary">Login →</span>
          </button>

          <button
            type="button"
            onClick={() => handleQuickDemoLogin("admin")}
            className="w-full p-2.5 bg-white hover:bg-emerald-50 rounded-xl border border-primary/20 text-xs font-bold text-charcoal flex items-center justify-between shadow-subtle transition-colors"
          >
            <div className="flex items-center space-x-2">
              <ShieldCheck className="w-4 h-4 text-primary" />
              <span>System Administrator</span>
            </div>
            <span className="text-[10px] text-primary">Login →</span>
          </button>
        </div>
      </div>

      {/* Standard Form */}
      <div className="bg-white rounded-3xl border border-border p-6 shadow-card space-y-4">
        {error && (
          <div className="p-3 bg-rose-50 border border-rose-200 text-state-error rounded-xl text-xs font-semibold">
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-4 text-xs">
          <div>
            <label className="block font-bold text-charcoal mb-1">Email Address</label>
            <div className="relative">
              <Mail className="w-4 h-4 text-charcoal-faint absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@example.com"
                className="w-full pl-9 pr-3 py-2.5 bg-surface-muted border border-border rounded-xl text-xs text-charcoal outline-none focus:border-primary"
              />
            </div>
          </div>

          <div>
            <label className="block font-bold text-charcoal mb-1">Password</label>
            <div className="relative">
              <Lock className="w-4 h-4 text-charcoal-faint absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-9 pr-3 py-2.5 bg-surface-muted border border-border rounded-xl text-xs text-charcoal outline-none focus:border-primary"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-primary hover:bg-primary-dark text-white rounded-xl font-bold text-xs shadow-subtle transition-all"
          >
            {loading ? "Authenticating..." : "Sign In with Email"}
          </button>
        </form>

        <div className="text-center pt-2 text-xs text-charcoal-muted">
          Don&apos;t have an account?{" "}
          <Link href="/register" className="font-bold text-primary hover:underline">
            Register here
          </Link>
        </div>
      </div>
    </div>
  );
}
