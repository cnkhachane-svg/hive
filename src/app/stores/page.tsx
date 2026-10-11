"use client";

import React, { useState, useEffect } from "react";
import StoreCard from "@/components/StoreCard";
import { Search, MapPin, Filter, ShieldCheck, Heart, Clock } from "lucide-react";

export default function NearbyStoresPage() {
  const [stores, setStores] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStores();
  }, [search, filter]);

  const fetchStores = () => {
    setLoading(true);
    const params = new URLSearchParams();
    if (search.trim()) params.set("q", search.trim());
    if (filter !== "all") params.set("filter", filter);

    fetch(`/api/stores?${params.toString()}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.stores) setStores(data.stores);
      })
      .catch((err) => console.error("Error fetching stores:", err))
      .finally(() => setLoading(false));
  };

  return (
    <div className="space-y-6 pb-16">
      {/* Header */}
      <div className="bg-white rounded-3xl border border-border p-6 shadow-card space-y-4">
        <div>
          <h1 className="text-2xl font-black text-charcoal">Nearby Kirana Stores</h1>
          <p className="text-xs text-charcoal-muted">
            Locate neighborhood kirana and provision stores with verified real-time stock around Kothrud, Pune.
          </p>
        </div>

        {/* Search & Filter Controls */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="w-5 h-5 absolute left-3.5 top-1/2 -translate-y-1/2 text-charcoal-faint" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search store name or locality (e.g. Apna Kirana, Laxmi, Mayur Colony)..."
              className="w-full pl-11 pr-4 py-3 bg-surface-muted border border-border rounded-2xl text-sm text-charcoal placeholder-charcoal-light focus:bg-white focus:border-primary outline-none transition-all shadow-subtle"
            />
          </div>

          <div className="flex items-center space-x-2 overflow-x-auto pb-1 no-scrollbar shrink-0">
            {[
              { id: "all", label: "All Stores" },
              { id: "verified", label: "Verified Only" },
              { id: "trusted", label: "My Trusted" },
              { id: "open", label: "Open Now" },
            ].map((f) => (
              <button
                key={f.id}
                onClick={() => setFilter(f.id)}
                className={`px-4 py-2.5 rounded-2xl text-xs font-bold transition-all shrink-0 ${
                  filter === f.id
                    ? "bg-primary text-white shadow-subtle"
                    : "bg-surface-muted text-charcoal-muted hover:bg-surface-pale hover:text-primary"
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Stores Grid */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-64 rounded-3xl bg-surface-muted animate-pulse border border-border" />
          ))}
        </div>
      ) : stores.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {stores.map((store) => (
            <StoreCard key={store.id} store={store} />
          ))}
        </div>
      ) : (
        <div className="p-12 text-center bg-white rounded-3xl border border-border shadow-card space-y-3">
          <div className="text-4xl">🏪</div>
          <h3 className="text-lg font-bold text-charcoal">No stores found matching your filters</h3>
          <p className="text-xs text-charcoal-muted">
            Try resetting your search or viewing All Stores.
          </p>
          <button
            onClick={() => { setSearch(""); setFilter("all"); }}
            className="px-4 py-2 bg-primary text-white rounded-xl text-xs font-bold"
          >
            Reset Filters
          </button>
        </div>
      )}
    </div>
  );
}
