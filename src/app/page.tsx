"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { formatINR } from "@/lib/types";
import ProductCard from "@/components/ProductCard";
import StoreCard from "@/components/StoreCard";
import { 
  Search, 
  MapPin, 
  Scale, 
  Sparkles, 
  ArrowRight, 
  Store, 
  Truck, 
  ShieldCheck, 
  TrendingUp, 
  Tag, 
  CheckCircle2, 
  Layers,
  Zap,
  ShoppingBag
} from "lucide-react";

export default function HomePage() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [featuredProducts, setFeaturedProducts] = useState<any[]>([]);
  const [nearbyStores, setNearbyStores] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetch("/api/products").then((r) => r.json()),
      fetch("/api/stores").then((r) => r.json()),
    ])
      .then(([productsData, storesData]) => {
        if (productsData.products) {
          setFeaturedProducts(productsData.products);
          setCategories(productsData.categories || []);
        }
        if (storesData.stores) {
          setNearbyStores(storesData.stores);
        }
      })
      .catch((err) => console.error("Error loading home data:", err))
      .finally(() => setLoading(false));
  }, []);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
    } else {
      router.push("/search");
    }
  };

  const riceProduct = featuredProducts.find((p) => p.name.toLowerCase().includes("rice"));

  return (
    <div className="space-y-12 pb-16">
      {/* 1. HERO SECTION */}
      <section className="relative rounded-3xl bg-gradient-to-br from-surface-pale via-white to-emerald-50/50 p-6 sm:p-10 border border-primary/20 shadow-card overflow-hidden">
        <div className="max-w-3xl space-y-4">
          <div className="inline-flex items-center space-x-2 px-3 py-1 bg-white rounded-full text-xs font-bold text-primary-dark shadow-subtle border border-primary/20">
            <span className="text-base">🐝</span>
            <span>Decision-Support Intelligence</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-black text-charcoal tracking-tight leading-tight">
            Shop smarter. <br />
            <span className="text-primary">Choose better.</span>
          </h1>

          <p className="text-base sm:text-lg text-charcoal-muted leading-relaxed font-medium">
            Existing platforms help people buy. <span className="text-charcoal font-bold">HIVE helps you decide where to buy</span> — comparing online quick commerce with nearby trusted kiranas to save you real money and time.
          </p>

          {/* Prominent Search Bar */}
          <form onSubmit={handleSearchSubmit} className="pt-2">
            <div className="flex items-center bg-white rounded-2xl border-2 border-primary/30 p-1.5 shadow-elevated focus-within:border-primary transition-all">
              <div className="pl-3 pr-2 text-charcoal-light">
                <Search className="w-5 h-5 text-primary" />
              </div>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="What do you need today? (e.g. Rice 1kg, Milk, Oil, Biscuits)"
                className="w-full bg-transparent text-charcoal placeholder-charcoal-light text-sm sm:text-base outline-none py-2"
              />
              <button
                type="submit"
                className="px-5 py-2.5 bg-primary hover:bg-primary-dark text-white rounded-xl font-bold text-sm shadow-subtle transition-all shrink-0 flex items-center space-x-1.5"
              >
                <span>Compare</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </form>

          {/* Quick Filter Badges */}
          <div className="flex items-center space-x-2 pt-1 text-xs text-charcoal-light flex-wrap gap-y-2">
            <span className="font-semibold text-charcoal">Popular:</span>
            {["Rice 1 kg", "Milk 1L", "Bread", "Cooking Oil", "Biscuits", "Tata Salt"].map((tag) => (
              <button
                key={tag}
                onClick={() => router.push(`/search?q=${encodeURIComponent(tag)}`)}
                className="px-2.5 py-1 bg-white hover:bg-surface-pale border border-border rounded-lg text-charcoal-muted hover:text-primary transition-colors text-xs"
              >
                {tag}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* 2. THE THREE POSSIBILITIES HIGHLIGHT (Online vs Kirana vs Hybrid) */}
      <section className="space-y-4">
        <div className="text-center max-w-2xl mx-auto space-y-1">
          <h2 className="text-2xl font-black text-charcoal">The Three Shopping Horizons</h2>
          <p className="text-xs text-charcoal-muted">
            HIVE mathematically analyzes every purchase across all three channels.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          <div className="p-6 bg-white rounded-3xl border border-border hover:border-sky-300 shadow-card transition-all">
            <div className="w-12 h-12 rounded-2xl bg-sky-100 flex items-center justify-center text-sky-700 mb-4">
              <Truck className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-lg text-charcoal mb-1">1. Online Quick Commerce</h3>
            <p className="text-xs text-charcoal-muted leading-relaxed mb-4">
              Doorstep delivery from Blinkit, Zepto, or Instamart. Best for bulky non-perishables and bulk discounts, but carries delivery and service fees.
            </p>
            <div className="text-[11px] font-semibold text-sky-700 bg-sky-50 p-2.5 rounded-xl border border-sky-100">
              Formula: Base Price + Delivery + Platform Fee − Coupon
            </div>
          </div>

          <div className="p-6 bg-white rounded-3xl border border-primary/40 shadow-card transition-all relative overflow-hidden ring-1 ring-primary/20">
            <div className="absolute top-3 right-3 px-2 py-0.5 bg-primary text-white text-[10px] font-bold rounded-full">
              Local First
            </div>
            <div className="w-12 h-12 rounded-2xl bg-surface-pale flex items-center justify-center text-primary-dark mb-4">
              <Store className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-lg text-charcoal mb-1">2. Nearby Kirana Stores</h3>
            <p className="text-xs text-charcoal-muted leading-relaxed mb-4">
              Zero delivery markup, reachable in 3-5 minutes on foot. Immediate in-hand fulfillment, verified neighborhood stock, and community support.
            </p>
            <div className="text-[11px] font-semibold text-primary-dark bg-surface-pale p-2.5 rounded-xl border border-primary/20">
              Formula: In-Store Price + Travel Cost − Local Discount
            </div>
          </div>

          <div className="p-6 bg-white rounded-3xl border border-border hover:border-amber-400 shadow-card transition-all">
            <div className="w-12 h-12 rounded-2xl bg-amber-100 flex items-center justify-center text-amber-800 mb-4">
              <Layers className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-lg text-charcoal mb-1">3. HIVE Hybrid Shopping 🐝</h3>
            <p className="text-xs text-charcoal-muted leading-relaxed mb-4">
              Our unique multi-item basket optimizer. Splits your shopping list to buy staples locally and bulk items online for the lowest net expenditure.
            </p>
            <div className="text-[11px] font-semibold text-amber-900 bg-amber-50 p-2.5 rounded-xl border border-amber-200">
              Optimizer: Dynamic Mixed Basket with Shared Delivery Fees
            </div>
          </div>
        </div>
      </section>

      {/* 3. SECTION 25 ACCEPTANCE TEST SHOWCASE */}
      {riceProduct && (
        <section className="bg-gradient-to-r from-emerald-50 via-white to-surface-pale p-6 sm:p-8 rounded-3xl border border-primary/30 shadow-card">
          <div className="flex flex-col lg:flex-row items-center justify-between gap-6">
            <div className="space-y-2 max-w-xl">
              <div className="inline-flex items-center space-x-1.5 px-3 py-1 bg-white rounded-full text-xs font-bold text-primary shadow-subtle border border-primary/20">
                <Zap className="w-3.5 h-3.5 fill-primary" />
                <span>Section 25 Verified Test Case</span>
              </div>
              <h2 className="text-2xl font-black text-charcoal">
                1 kg Rice: Online (₹100) vs Apna Kirana (₹82)
              </h2>
              <p className="text-xs sm:text-sm text-charcoal-muted leading-relaxed">
                Online base ₹80 + ₹20 delivery fee = ₹100 in 25 mins. <br />
                Apna Kirana ₹82 in-store + ₹0 walking = ₹82 in 4 mins (350m away). <br />
                <span className="font-bold text-primary">HIVE recommends Kirana: save ₹18 and get it 21 minutes faster.</span>
              </p>
            </div>

            <div className="flex items-center space-x-3 shrink-0">
              <Link
                href={`/compare/${riceProduct.id}`}
                className="px-6 py-3.5 bg-primary hover:bg-primary-dark text-white rounded-2xl font-bold text-sm shadow-card flex items-center space-x-2 transition-transform hover:scale-105"
              >
                <span>Launch Side-by-Side Comparison</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* 4. FREQUENTLY PURCHASED PRODUCTS */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-black text-charcoal">Frequently Compared Products</h2>
            <p className="text-xs text-charcoal-muted">Compare online prices vs nearby kirana prices in 1 click</p>
          </div>
          <Link
            href="/search"
            className="text-xs font-bold text-primary hover:text-primary-dark flex items-center space-x-1"
          >
            <span>View All ({featuredProducts.length})</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-64 rounded-3xl bg-surface-muted animate-pulse border border-border" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {featuredProducts.slice(0, 4).map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </section>

      {/* 5. NEARBY KIRANA STORES CAROUSEL / GRID */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-black text-charcoal">Nearby Kirana Stores in Kothrud, Pune</h2>
            <p className="text-xs text-charcoal-muted">Neighborhood stores with verified real-time stock</p>
          </div>
          <Link
            href="/stores"
            className="text-xs font-bold text-primary hover:text-primary-dark flex items-center space-x-1"
          >
            <span>Explore All Kiranas</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {nearbyStores.slice(0, 3).map((store) => (
            <StoreCard key={store.id} store={store} />
          ))}
        </div>
      </section>

      {/* 6. HOW HIVE WORKS */}
      <section className="bg-white rounded-3xl border border-border p-8 shadow-card space-y-6">
        <div className="text-center max-w-xl mx-auto space-y-2">
          <div className="text-xs font-bold uppercase tracking-wider text-primary">Simple & Explainable</div>
          <h2 className="text-2xl font-black text-charcoal">How HIVE Works</h2>
          <p className="text-xs text-charcoal-muted leading-relaxed">
            HIVE is not a payment gateway or an e-commerce clone. We provide intelligent, transparent decision support.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-2">
          <div className="p-5 rounded-2xl bg-surface-muted space-y-2">
            <div className="w-8 h-8 rounded-xl bg-primary text-white flex items-center justify-center font-bold text-sm">
              1
            </div>
            <h3 className="font-bold text-charcoal text-sm">Full Cost Discovery</h3>
            <p className="text-xs text-charcoal-muted leading-relaxed">
              We aggregate online platform offers with nearby kirana shelf prices, adding delivery charges, surge fees, and travel estimates.
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-surface-muted space-y-2">
            <div className="w-8 h-8 rounded-xl bg-primary text-white flex items-center justify-center font-bold text-sm">
              2
            </div>
            <h3 className="font-bold text-charcoal text-sm">Personalized Scoring Engine</h3>
            <p className="text-xs text-charcoal-muted leading-relaxed">
              Our deterministic algorithm weights price, delivery minutes, walking distance, stock feasibility, and your trusted stores to pick the winner.
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-surface-muted space-y-2">
            <div className="w-8 h-8 rounded-xl bg-primary text-white flex items-center justify-center font-bold text-sm">
              3
            </div>
            <h3 className="font-bold text-charcoal text-sm">Hybrid Basket Optimization</h3>
            <p className="text-xs text-charcoal-muted leading-relaxed">
              When buying multiple items, HIVE splits your basket across online and local channels to minimize total household spend.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
