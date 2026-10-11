"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Home,
  Scale,
  MapPin,
  ShoppingBag,
  Bookmark,
  BarChart3,
  User,
  Store,
  ShieldCheck,
  Sparkles,
} from "lucide-react";

export default function Sidebar() {
  const pathname = usePathname();

  const navItems = [
    { name: "Home", href: "/", icon: Home },
    { name: "Product Compare", href: "/search", icon: Scale },
    { name: "Nearby Kiranas", href: "/stores", icon: MapPin },
    { name: "Smart Basket", href: "/list", icon: ShoppingBag, badge: "Hybrid" },
    { name: "Saved Products", href: "/saved", icon: Bookmark },
    { name: "Shopping Insights", href: "/insights", icon: BarChart3 },
    { name: "Profile & Priorities", href: "/profile", icon: User },
  ];

  const managementItems = [
    { name: "Store Owner Portal", href: "/store-owner", icon: Store },
    { name: "Admin Dashboard", href: "/admin", icon: ShieldCheck },
  ];

  return (
    <aside className="w-64 bg-white border-r border-border shrink-0 hidden md:flex flex-col justify-between p-4 sticky top-16 h-[calc(100vh-4rem)]">
      <div className="space-y-6">
        <div>
          <div className="text-[11px] font-bold text-charcoal-light tracking-wider uppercase px-3 mb-2">
            Decision Hub
          </div>
          <nav className="space-y-1">
            {navItems.map((item) => {
              const isActive = pathname === item.href;
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                    isActive
                      ? "bg-surface-pale text-primary-dark shadow-subtle font-bold border border-primary/20"
                      : "text-charcoal-muted hover:text-charcoal hover:bg-surface-muted"
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <Icon className={`w-4 h-4 ${isActive ? "text-primary" : "text-charcoal-light"}`} />
                    <span>{item.name}</span>
                  </div>
                  {item.badge && (
                    <span className="px-2 py-0.5 text-[10px] uppercase font-bold rounded-full bg-primary text-white">
                      {item.badge}
                    </span>
                  )}
                </Link>
              );
            })}
          </nav>
        </div>

        <div>
          <div className="text-[11px] font-bold text-charcoal-light tracking-wider uppercase px-3 mb-2">
            Operations & Portal
          </div>
          <nav className="space-y-1">
            {managementItems.map((item) => {
              const isActive = pathname === item.href;
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center space-x-3 px-3.5 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                    isActive
                      ? "bg-surface-pale text-primary-dark shadow-subtle font-bold border border-primary/20"
                      : "text-charcoal-muted hover:text-charcoal hover:bg-surface-muted"
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? "text-primary" : "text-charcoal-light"}`} />
                  <span>{item.name}</span>
                </Link>
              );
            })}
          </nav>
        </div>
      </div>

      {/* Subtle Bee Tip / Hackathon Highlight */}
      <div className="p-3.5 bg-surface-pale rounded-2xl border border-primary/20 space-y-2">
        <div className="flex items-center space-x-1.5 text-xs font-bold text-primary-dark">
          <Sparkles className="w-3.5 h-3.5 text-primary" />
          <span>HIVE Decision Philosophy</span>
        </div>
        <p className="text-[11px] text-charcoal-muted leading-relaxed">
          &ldquo;Existing platforms help people buy. HIVE helps people decide where to buy.&rdquo;
        </p>
      </div>
    </aside>
  );
}
