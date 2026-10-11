"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Sparkles, ArrowRight, ShieldCheck, Zap } from "lucide-react";

export default function DemoBanner() {
  const [riceId, setRiceId] = useState<string>("");

  useEffect(() => {
    fetch("/api/products?q=Rice")
      .then((res) => res.json())
      .then((data) => {
        if (data.products && data.products.length > 0) {
          setRiceId(data.products[0].id);
        }
      })
      .catch(() => {});
  }, []);

  return (
    <div className="bg-gradient-to-r from-emerald-50 via-surface-pale to-emerald-50 border-b border-primary/20 py-2.5 px-4 sm:px-6">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-3 text-xs">
        <div className="flex items-center space-x-2 text-charcoal">
          <span className="flex h-2 w-2 relative">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
          </span>
          <span className="font-bold text-primary-dark">Hackathon Demo Mode:</span>
          <span className="text-charcoal-muted hidden sm:inline">
            Seeded with real Pune kirana locations & current grocery pricing.
          </span>
        </div>

        <div className="flex items-center space-x-2 flex-wrap justify-center">
          {riceId && (
            <Link
              href={`/compare/${riceId}`}
              className="inline-flex items-center space-x-1 px-3 py-1 bg-white hover:bg-emerald-50 text-primary-dark rounded-full font-bold shadow-subtle border border-primary/30 transition-all hover:scale-105"
            >
              <Zap className="w-3 h-3 text-primary fill-primary" />
              <span>Test 1 kg Rice Comparison (Section 25)</span>
              <ArrowRight className="w-3 h-3" />
            </Link>
          )}

          <Link
            href="/list"
            className="inline-flex items-center space-x-1 px-3 py-1 bg-primary hover:bg-primary-dark text-white rounded-full font-bold shadow-subtle transition-all hover:scale-105"
          >
            <span>🐝 Test Hybrid Basket Optimizer</span>
            <ArrowRight className="w-3 h-3" />
          </Link>
        </div>
      </div>
    </div>
  );
}
