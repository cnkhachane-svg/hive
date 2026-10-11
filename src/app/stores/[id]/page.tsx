"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { formatINR } from "@/lib/types";
import { 
  Store, 
  MapPin, 
  Phone, 
  Clock, 
  Star, 
  ShieldCheck, 
  Heart, 
  ArrowLeft, 
  Scale, 
  Plus, 
  Check, 
  MessageSquare,
  Sparkles
} from "lucide-react";

export default function StoreDetailPage() {
  const params = useParams();
  const router = useRouter();
  const storeId = params?.id as string;

  const [store, setStore] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isTrusted, setIsTrusted] = useState(false);
  const [search, setSearch] = useState("");

  // Feedback form state
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);
  const [rating, setRating] = useState(5);
  const [review, setReview] = useState("");
  const [spentRupees, setSpentRupees] = useState("");
  const [savedRupees, setSavedRupees] = useState("");
  const [submittingFeedback, setSubmittingFeedback] = useState(false);

  useEffect(() => {
    if (storeId) {
      loadStore();
    }
  }, [storeId]);

  const loadStore = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/stores/${storeId}`);
      if (res.ok) {
        const data = await res.json();
        setStore(data.store);
        setIsTrusted(data.store.isTrusted || false);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleTrust = async () => {
    try {
      const res = await fetch(`/api/stores/${storeId}/trust`, { method: "POST" });
      const data = await res.json();
      if (res.ok) {
        setIsTrusted(data.isTrusted);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleSubmitFeedback = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmittingFeedback(true);
    try {
      const res = await fetch(`/api/stores/${storeId}/feedback`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          rating,
          review,
          actualSpentPaise: Math.round(Number(spentRupees || 0) * 100),
          savedAmountPaise: Math.round(Number(savedRupees || 0) * 100),
        }),
      });
      if (res.ok) {
        setShowFeedbackModal(false);
        setReview("");
        setSpentRupees("");
        setSavedRupees("");
        loadStore();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSubmittingFeedback(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6 animate-pulse p-4">
        <div className="h-8 w-48 bg-surface-muted rounded-xl" />
        <div className="h-64 bg-surface-muted rounded-3xl" />
        <div className="h-96 bg-surface-muted rounded-3xl" />
      </div>
    );
  }

  if (!store) {
    return (
      <div className="p-12 text-center bg-white rounded-3xl border border-border shadow-card space-y-4">
        <h2 className="text-xl font-bold text-charcoal">Store Not Found</h2>
        <button
          onClick={() => router.push("/stores")}
          className="px-4 py-2 bg-primary text-white rounded-xl text-xs font-bold"
        >
          Back to Stores
        </button>
      </div>
    );
  }

  const inventory = store.inventory || [];
  const filteredInventory = search
    ? inventory.filter((inv: any) =>
        inv.product.name.toLowerCase().includes(search.toLowerCase()) ||
        inv.product.brand.toLowerCase().includes(search.toLowerCase())
      )
    : inventory;

  return (
    <div className="space-y-8 pb-16">
      {/* Back button & Store Info Card */}
      <div className="bg-white rounded-3xl border border-border p-6 sm:p-8 shadow-card space-y-6">
        <div className="flex items-center justify-between">
          <button
            onClick={() => router.back()}
            className="p-2.5 bg-surface-muted hover:bg-surface-pale text-charcoal rounded-2xl transition-colors border border-border"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>

          <button
            onClick={handleToggleTrust}
            className={`px-4 py-2 rounded-2xl border text-xs font-bold flex items-center space-x-1.5 transition-colors ${
              isTrusted
                ? "bg-rose-50 border-rose-200 text-rose-600"
                : "bg-surface-muted border-border text-charcoal-muted hover:bg-rose-50 hover:text-rose-600"
            }`}
          >
            <Heart className={`w-4 h-4 ${isTrusted ? "fill-rose-500" : ""}`} />
            <span>{isTrusted ? "My Trusted Kirana" : "Mark as Trusted"}</span>
          </button>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <h1 className="text-2xl sm:text-3xl font-black text-charcoal">{store.name}</h1>
              {store.verified ? (
                <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 bg-surface-pale text-primary-dark rounded-full text-xs font-bold border border-primary/20">
                  <ShieldCheck className="w-3.5 h-3.5 text-primary" />
                  <span>Verified Kirana</span>
                </span>
              ) : (
                <span className="px-2.5 py-0.5 bg-gray-100 text-charcoal-light rounded-full text-xs font-medium">
                  Demo Kirana
                </span>
              )}
            </div>

            <p className="text-xs sm:text-sm text-charcoal-muted flex items-center space-x-1">
              <MapPin className="w-4 h-4 text-primary shrink-0" />
              <span>{store.address}, {store.locality}</span>
              <span className="font-bold text-primary">• ~350m away (4 min walk)</span>
            </p>
          </div>

          <div className="flex items-center space-x-3 shrink-0">
            <a
              href={`tel:${store.phone}`}
              className="px-4 py-2.5 bg-surface-pale hover:bg-emerald-100 text-primary-dark rounded-xl text-xs font-bold border border-primary/20 flex items-center space-x-1.5 transition-colors"
            >
              <Phone className="w-3.5 h-3.5 text-primary" />
              <span>{store.phone}</span>
            </a>

            <button
              onClick={() => setShowFeedbackModal(true)}
              className="px-4 py-2.5 bg-primary hover:bg-primary-dark text-white rounded-xl text-xs font-bold shadow-subtle flex items-center space-x-1.5 transition-colors"
            >
              <MessageSquare className="w-3.5 h-3.5" />
              <span>Record Purchase</span>
            </button>
          </div>
        </div>

        {/* Store Metas */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-4 border-t border-border text-xs">
          <div className="p-3 bg-surface-muted rounded-2xl">
            <div className="text-charcoal-light text-[11px]">Rating</div>
            <div className="font-bold text-charcoal flex items-center space-x-1">
              <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
              <span>{store.rating} ({store.ratingCount} reviews)</span>
            </div>
          </div>
          <div className="p-3 bg-surface-muted rounded-2xl">
            <div className="text-charcoal-light text-[11px]">Operating Hours</div>
            <div className="font-bold text-charcoal">{store.openingHours}</div>
          </div>
          <div className="p-3 bg-surface-muted rounded-2xl">
            <div className="text-charcoal-light text-[11px]">Catalog Size</div>
            <div className="font-bold text-primary">{inventory.length} verified products</div>
          </div>
          <div className="p-3 bg-surface-muted rounded-2xl">
            <div className="text-charcoal-light text-[11px]">Status</div>
            <div className="font-bold text-primary">Open Now</div>
          </div>
        </div>
      </div>

      {/* Store Inventory Section */}
      <div className="bg-white rounded-3xl border border-border p-6 shadow-card space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-lg font-bold text-charcoal">Available In-Store Inventory</h2>
            <p className="text-xs text-charcoal-muted">Prices audited and synchronized directly by store owner</p>
          </div>

          <div className="w-full sm:w-64">
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Filter store items..."
              className="w-full px-3.5 py-2 bg-surface-muted border border-border rounded-xl text-xs text-charcoal outline-none focus:border-primary"
            />
          </div>
        </div>

        {/* Inventory List */}
        <div className="divide-y divide-border">
          {filteredInventory.map((inv: any) => (
            <div key={inv.id} className="py-3.5 flex items-center justify-between gap-4">
              <div className="space-y-0.5">
                <div className="font-bold text-sm text-charcoal">{inv.product.name}</div>
                <div className="text-xs text-charcoal-light flex items-center space-x-2">
                  <span>{inv.product.brand}</span>
                  <span>•</span>
                  <span>{inv.product.standardQuantity}</span>
                  <span>•</span>
                  <span className="text-primary font-semibold">
                    {inv.inStock ? `In Stock (${inv.stockQuantity} available)` : "Out of Stock"}
                  </span>
                </div>
              </div>

              <div className="flex items-center space-x-4">
                <div className="text-right">
                  <div className="font-black text-base text-primary">
                    {formatINR(inv.pricePaise)}
                  </div>
                  <div className="text-[10px] text-charcoal-light">In-Store Price</div>
                </div>

                <Link
                  href={`/compare/${inv.product.id}`}
                  className="px-3 py-1.5 bg-surface-pale hover:bg-primary hover:text-white text-primary-dark rounded-xl text-xs font-bold border border-primary/20 flex items-center space-x-1 transition-colors"
                >
                  <Scale className="w-3.5 h-3.5" />
                  <span>Compare</span>
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Customer Purchase Reviews */}
      <div className="bg-white rounded-3xl border border-border p-6 shadow-card space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-charcoal">Verified Customer Experience</h2>
          <span className="text-xs text-charcoal-light">{store.feedback?.length || 0} reviews</span>
        </div>

        <div className="space-y-3">
          {store.feedback && store.feedback.length > 0 ? (
            store.feedback.map((f: any) => (
              <div key={f.id} className="p-4 bg-surface-muted rounded-2xl space-y-1 text-xs">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-charcoal">{f.user.name}</span>
                  <div className="flex items-center text-amber-500">
                    {Array.from({ length: f.rating }).map((_, i) => (
                      <Star key={i} className="w-3 h-3 fill-amber-500" />
                    ))}
                  </div>
                </div>
                {f.review && <p className="text-charcoal-muted leading-relaxed">{f.review}</p>}
                {f.savedAmountPaise > 0 && (
                  <div className="text-[11px] font-semibold text-primary pt-1">
                    Verified savings: {formatINR(f.savedAmountPaise)}
                  </div>
                )}
              </div>
            ))
          ) : (
            <p className="text-xs text-charcoal-muted py-4 text-center">
              No customer reviews recorded yet. Be the first to record a purchase!
            </p>
          )}
        </div>
      </div>

      {/* FEEDBACK MODAL */}
      {showFeedbackModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-elevated border border-border space-y-4">
            <h3 className="font-bold text-lg text-charcoal">Record Kirana Purchase</h3>
            <p className="text-xs text-charcoal-muted">
              Add your experience to calculate verified savings in the Shopping Insights dashboard.
            </p>

            <form onSubmit={handleSubmitFeedback} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-charcoal mb-1">Rating (1 to 5 Stars)</label>
                <div className="flex space-x-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      type="button"
                      key={star}
                      onClick={() => setRating(star)}
                      className="p-1"
                    >
                      <Star className={`w-6 h-6 ${star <= rating ? "text-amber-500 fill-amber-500" : "text-gray-300"}`} />
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block font-bold text-charcoal mb-1">Amount Spent (₹)</label>
                <input
                  type="number"
                  required
                  value={spentRupees}
                  onChange={(e) => setSpentRupees(e.target.value)}
                  placeholder="e.g. 82"
                  className="w-full p-2.5 bg-surface-muted border border-border rounded-xl text-xs outline-none focus:border-primary"
                />
              </div>

              <div>
                <label className="block font-bold text-charcoal mb-1">Money Saved vs Online (₹)</label>
                <input
                  type="number"
                  value={savedRupees}
                  onChange={(e) => setSavedRupees(e.target.value)}
                  placeholder="e.g. 18"
                  className="w-full p-2.5 bg-surface-muted border border-border rounded-xl text-xs outline-none focus:border-primary"
                />
              </div>

              <div>
                <label className="block font-bold text-charcoal mb-1">Your Review / Notes</label>
                <textarea
                  rows={3}
                  value={review}
                  onChange={(e) => setReview(e.target.value)}
                  placeholder="Fresh milk, fast billing, very polite owner..."
                  className="w-full p-2.5 bg-surface-muted border border-border rounded-xl text-xs outline-none focus:border-primary"
                />
              </div>

              <div className="flex justify-end space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowFeedbackModal(false)}
                  className="px-4 py-2 bg-surface-muted text-charcoal rounded-xl font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingFeedback}
                  className="px-4 py-2 bg-primary text-white rounded-xl font-bold"
                >
                  {submittingFeedback ? "Saving..." : "Save Record"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
