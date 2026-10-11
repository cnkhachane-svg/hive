"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { 
  MapPin, 
  Search, 
  ShoppingBag, 
  User, 
  LogOut, 
  Store, 
  ShieldCheck, 
  Menu, 
  X,
  ChevronDown
} from "lucide-react";

export default function Navbar() {
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [roleDropdownOpen, setRoleDropdownOpen] = useState(false);

  useEffect(() => {
    fetch("/api/auth/me")
      .then((res) => res.json())
      .then((data) => {
        if (data.authenticated) {
          setCurrentUser(data.user);
        }
      })
      .catch(() => {});
  }, []);

  const handleSwitchRole = async (role: string) => {
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ demoRole: role }),
      });
      const data = await res.json();
      if (data.success) {
        setCurrentUser(data.user);
        setRoleDropdownOpen(false);
        if (role === "owner") router.push("/store-owner");
        else if (role === "admin") router.push("/admin");
        else router.push("/");
        router.refresh();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    setCurrentUser(null);
    router.push("/");
    router.refresh();
  };

  return (
    <header className="sticky top-0 z-40 bg-white border-b border-border shadow-subtle">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Brand */}
          <div className="flex items-center space-x-6">
            <Link href="/" className="flex items-center space-x-2 group">
              <div className="w-9 h-9 rounded-xl bg-primary flex items-center justify-center text-white font-bold text-xl shadow-sm group-hover:bg-primary-dark transition-colors">
                🐝
              </div>
              <div>
                <span className="text-xl font-extrabold tracking-tight text-charcoal">
                  HIVE
                </span>
                <span className="hidden sm:inline-block ml-2 text-xs font-medium text-charcoal-light border-l border-border pl-2">
                  Shop smarter. Choose better.
                </span>
              </div>
            </Link>

            {/* Location selector */}
            <div className="hidden md:flex items-center space-x-1.5 px-3 py-1.5 bg-surface-pale text-primary-dark rounded-full text-xs font-semibold border border-primary/20">
              <MapPin className="w-3.5 h-3.5 text-primary" />
              <span>Kothrud, Pune</span>
              <span className="text-primary/60 font-normal">(Demo Area)</span>
            </div>
          </div>

          {/* Quick search input (desktop) */}
          <div className="hidden lg:flex flex-1 max-w-md mx-8">
            <div 
              onClick={() => router.push("/search")}
              className="w-full flex items-center px-4 py-2 bg-surface-muted border border-border rounded-xl text-charcoal-light text-sm hover:border-primary/50 cursor-pointer transition-colors shadow-subtle"
            >
              <Search className="w-4 h-4 text-charcoal-faint mr-2.5" />
              <span>Search rice, milk, oil, biscuits...</span>
            </div>
          </div>

          {/* Right Actions & Role Switcher */}
          <div className="flex items-center space-x-3">
            {/* Judge Quick Switcher */}
            <div className="relative">
              <button
                onClick={() => setRoleDropdownOpen(!roleDropdownOpen)}
                className="flex items-center space-x-1.5 px-3 py-1.5 bg-surface-pale hover:bg-emerald-100 text-primary-dark rounded-lg text-xs font-medium border border-primary/20 transition-colors"
                title="Switch test persona for hackathon evaluation"
              >
                <span className="w-2 h-2 rounded-full bg-primary animate-pulse"></span>
                <span>
                  Role: {currentUser ? currentUser.role : "Guest"}
                </span>
                <ChevronDown className="w-3 h-3 text-primary" />
              </button>

              {roleDropdownOpen && (
                <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-elevated border border-border py-2 z-50 text-xs">
                  <div className="px-3 py-1 text-charcoal-light font-semibold uppercase tracking-wider text-[10px]">
                    Hackathon Personas
                  </div>
                  <button
                    onClick={() => handleSwitchRole("shopper")}
                    className="w-full text-left px-3 py-2 hover:bg-surface-pale flex items-center space-x-2 text-charcoal"
                  >
                    <User className="w-4 h-4 text-primary" />
                    <div>
                      <div className="font-semibold">Shopper (Aarav)</div>
                      <div className="text-[10px] text-charcoal-light">Compare, save, optimize baskets</div>
                    </div>
                  </button>
                  <button
                    onClick={() => handleSwitchRole("owner")}
                    className="w-full text-left px-3 py-2 hover:bg-surface-pale flex items-center space-x-2 text-charcoal"
                  >
                    <Store className="w-4 h-4 text-primary" />
                    <div>
                      <div className="font-semibold">Store Owner (Ramesh)</div>
                      <div className="text-[10px] text-charcoal-light">Manage Apna Kirana stock & prices</div>
                    </div>
                  </button>
                  <button
                    onClick={() => handleSwitchRole("admin")}
                    className="w-full text-left px-3 py-2 hover:bg-surface-pale flex items-center space-x-2 text-charcoal"
                  >
                    <ShieldCheck className="w-4 h-4 text-primary" />
                    <div>
                      <div className="font-semibold">Administrator</div>
                      <div className="text-[10px] text-charcoal-light">Manage catalog & store audits</div>
                    </div>
                  </button>
                </div>
              )}
            </div>

            {/* Smart List Quick Link */}
            <Link
              href="/list"
              className="p-2 text-charcoal-muted hover:text-primary hover:bg-surface-pale rounded-xl transition-colors relative"
              title="Smart Basket"
            >
              <ShoppingBag className="w-5 h-5" />
            </Link>

            {/* Auth / Profile Link */}
            {currentUser ? (
              <div className="flex items-center space-x-2">
                <Link
                  href="/profile"
                  className="flex items-center space-x-1.5 px-3 py-1.5 bg-surface-muted hover:bg-surface-pale border border-border rounded-xl text-xs font-semibold text-charcoal transition-colors"
                >
                  <User className="w-3.5 h-3.5 text-primary" />
                  <span className="hidden sm:inline">{currentUser.name.split(" ")[0]}</span>
                </Link>
                <button
                  onClick={handleLogout}
                  className="p-1.5 text-charcoal-light hover:text-state-error rounded-lg"
                  title="Log out"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <Link
                href="/login"
                className="px-3.5 py-1.5 bg-primary hover:bg-primary-dark text-white rounded-xl text-xs font-semibold shadow-subtle transition-colors"
              >
                Sign In
              </Link>
            )}

            {/* Mobile menu button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 text-charcoal-muted hover:text-primary rounded-lg"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-border bg-white px-4 pt-3 pb-6 space-y-2">
          <Link
            href="/"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 rounded-lg text-sm font-semibold text-charcoal hover:bg-surface-pale"
          >
            Home
          </Link>
          <Link
            href="/search"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 rounded-lg text-sm font-semibold text-charcoal hover:bg-surface-pale"
          >
            Product Search & Compare
          </Link>
          <Link
            href="/stores"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 rounded-lg text-sm font-semibold text-charcoal hover:bg-surface-pale"
          >
            Nearby Kirana Stores
          </Link>
          <Link
            href="/list"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 rounded-lg text-sm font-semibold text-charcoal hover:bg-surface-pale"
          >
            Smart Shopping List & Hybrid Optimizer
          </Link>
          <Link
            href="/insights"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 rounded-lg text-sm font-semibold text-charcoal hover:bg-surface-pale"
          >
            Shopping Insights
          </Link>
          <Link
            href="/store-owner"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 rounded-lg text-sm font-semibold text-charcoal hover:bg-surface-pale"
          >
            Store Owner Dashboard
          </Link>
          <Link
            href="/admin"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 rounded-lg text-sm font-semibold text-charcoal hover:bg-surface-pale"
          >
            Admin Dashboard
          </Link>
        </div>
      )}
    </header>
  );
}
