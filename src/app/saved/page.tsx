"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { formatINR } from "@/lib/types";
import { Bookmark, Scale, Trash2, ArrowRight } from "lucide-react";

export default function SavedProductsPage() {
  const [saved, setSaved] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadSaved();
  }, []);

  const loadSaved = () => {
    setLoading(true);
    fetch("/api/saved")
      .then((res) => res.json())
      .then((data) => setSaved(data.saved || []))
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  };

  const handleRemove = async (productId: string) => {
    try {
      await fetch("/api/saved", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId }),
      });
      loadSaved();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="space-y-6 pb-16">
      <div className="bg-white rounded-3xl border border-border p-6 shadow-card">
        <h1 className="text-2xl font-black text-charcoal">Saved Products</h1>
        <p className="text-xs text-charcoal-muted mt-1">
          Your bookmarked essentials with instant price comparison across online and local sources.
        </p>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-44 bg-surface-muted rounded-3xl animate-pulse" />
          ))}
        </div>
      ) : saved.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {saved.map((item) => (
            <div
              key={item.id}
              className="bg-white rounded-3xl border border-border p-5 shadow-card flex flex-col justify-between hover:border-primary/30 transition-all"
            >
              <div>
                <div className="flex items-start justify-between mb-2">
                  <span className="text-[11px] font-bold text-primary uppercase tracking-wider">
                    {item.brand}
                  </span>
                  <button
                    onClick={() => handleRemove(item.productId)}
                    className="p-1 text-charcoal-faint hover:text-state-error rounded-lg"
                    title="Remove from saved"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                <h3 className="font-bold text-sm text-charcoal mb-3">{item.name}</h3>

                <div className="grid grid-cols-2 gap-2 p-2.5 bg-surface-muted rounded-2xl text-xs mb-4">
                  <div>
                    <div className="text-[10px] text-charcoal-light">Online Price</div>
                    <div className="font-bold text-charcoal">
                      {formatINR(item.bestOnlinePricePaise)}
                    </div>
                  </div>
                  <div>
                    <div className="text-[10px] text-primary-dark">Kirana Price</div>
                    <div className="font-black text-primary">
                      {formatINR(item.bestKiranaPricePaise)}
                    </div>
                  </div>
                </div>
              </div>

              <Link
                href={`/compare/${item.productId}`}
                className="w-full py-2.5 px-3 bg-surface-pale hover:bg-primary hover:text-white text-primary-dark rounded-xl font-bold text-xs flex items-center justify-center space-x-1.5 transition-colors border border-primary/20"
              >
                <Scale className="w-3.5 h-3.5" />
                <span>Compare Decisions</span>
              </Link>
            </div>
          ))}
        </div>
      ) : (
        <div className="p-16 text-center bg-white rounded-3xl border border-border shadow-card space-y-3">
          <Bookmark className="w-12 h-12 text-charcoal-faint mx-auto" />
          <h2 className="text-lg font-bold text-charcoal">No saved products yet</h2>
          <p className="text-xs text-charcoal-muted max-w-sm mx-auto">
            Click the bookmark icon on any product in the catalog to monitor prices here.
          </p>
          <Link
            href="/search"
            className="inline-flex px-5 py-2.5 bg-primary text-white rounded-xl text-xs font-bold"
          >
            Browse Products
          </Link>
        </div>
      )}
    </div>
  );
}
