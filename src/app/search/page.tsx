"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import ProductCard from "@/components/ProductCard";
import { Search, Filter, SlidersHorizontal, ArrowUpDown, X } from "lucide-react";

function SearchContent() {
  const searchParams = useSearchParams();
  const initialQuery = searchParams.get("q") || "";

  const [query, setQuery] = useState(initialQuery);
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [sortBy, setSortBy] = useState("featured");
  const [products, setProducts] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProducts();
  }, [query, selectedCategory, sortBy]);

  const fetchProducts = () => {
    setLoading(true);
    const params = new URLSearchParams();
    if (query.trim()) params.set("q", query.trim());
    if (selectedCategory !== "all") params.set("category", selectedCategory);
    if (sortBy !== "featured") params.set("sort", sortBy);

    fetch(`/api/products?${params.toString()}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.products) {
          setProducts(data.products);
          setCategories(data.categories || []);
        }
      })
      .catch((err) => console.error("Error fetching products:", err))
      .finally(() => setLoading(false));
  };

  const handleClear = () => {
    setQuery("");
    setSelectedCategory("all");
    setSortBy("featured");
  };

  return (
    <div className="space-y-6 pb-16">
      {/* Header and Search */}
      <div className="bg-white rounded-3xl border border-border p-6 shadow-card space-y-4">
        <div>
          <h1 className="text-2xl font-black text-charcoal">Search & Compare Catalog</h1>
          <p className="text-xs text-charcoal-muted">
            Find grocery staples and compare live local kirana prices with quick-commerce platforms.
          </p>
        </div>

        {/* Search Input Bar */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="w-5 h-5 absolute left-3.5 top-1/2 -translate-y-1/2 text-charcoal-faint" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search by product name, brand (e.g. Rice, Britannia, Amul, Oil)..."
              className="w-full pl-11 pr-10 py-3 bg-surface-muted border border-border rounded-2xl text-sm text-charcoal placeholder-charcoal-light focus:bg-white focus:border-primary outline-none transition-all shadow-subtle"
            />
            {query && (
              <button
                onClick={() => setQuery("")}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 p-1 text-charcoal-faint hover:text-charcoal"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          <div className="flex items-center space-x-2">
            <div className="relative shrink-0">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="appearance-none pl-9 pr-8 py-3 bg-white border border-border rounded-2xl text-xs font-semibold text-charcoal outline-none cursor-pointer hover:border-primary transition-colors shadow-subtle"
              >
                <option value="featured">Featured Order</option>
                <option value="name">Sort by Name</option>
              </select>
              <ArrowUpDown className="w-4 h-4 text-charcoal-muted absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>

            {(query || selectedCategory !== "all" || sortBy !== "featured") && (
              <button
                onClick={handleClear}
                className="px-3.5 py-3 text-xs font-bold text-state-error hover:bg-rose-50 rounded-2xl border border-rose-200 transition-colors shrink-0"
              >
                Reset
              </button>
            )}
          </div>
        </div>

        {/* Categories Pills */}
        <div className="flex items-center space-x-2 overflow-x-auto pb-1 pt-1 no-scrollbar">
          <button
            onClick={() => setSelectedCategory("all")}
            className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all shrink-0 ${
              selectedCategory === "all"
                ? "bg-primary text-white shadow-subtle"
                : "bg-surface-muted text-charcoal-muted hover:bg-surface-pale hover:text-primary"
            }`}
          >
            All Products ({products.length})
          </button>
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.slug)}
              className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all shrink-0 ${
                selectedCategory === cat.slug
                  ? "bg-primary text-white shadow-subtle"
                  : "bg-surface-muted text-charcoal-muted hover:bg-surface-pale hover:text-primary"
              }`}
            >
              {cat.name}
            </button>
          ))}
        </div>
      </div>

      {/* Results Grid */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="h-72 rounded-3xl bg-surface-muted animate-pulse border border-border" />
          ))}
        </div>
      ) : products.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      ) : (
        <div className="p-12 text-center bg-white rounded-3xl border border-border shadow-card space-y-3">
          <div className="text-4xl">🔍</div>
          <h3 className="text-lg font-bold text-charcoal">No matching products found</h3>
          <p className="text-xs text-charcoal-muted max-w-sm mx-auto">
            Try searching for common staples like &ldquo;Rice&rdquo;, &ldquo;Milk&rdquo;, &ldquo;Oil&rdquo;, or &ldquo;Bread&rdquo;.
          </p>
          <button
            onClick={handleClear}
            className="px-4 py-2 bg-primary text-white rounded-xl text-xs font-bold"
          >
            Clear Search
          </button>
        </div>
      )}
    </div>
  );
}

export default function SearchPage() {
  return (
    <Suspense
      fallback={
        <div className="p-8 text-center text-xs text-charcoal-muted">
          Loading catalog...
        </div>
      }
    >
      <SearchContent />
    </Suspense>
  );
}
