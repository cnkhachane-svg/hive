"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import ComparisonCard from "@/components/ComparisonCard";
import { PriorityType, UrgencyType, TransportMode, formatINR } from "@/lib/types";
import { 
  ArrowLeft, 
  Sliders, 
  Sparkles, 
  Plus, 
  Check, 
  ShoppingBag,
  Zap,
  Clock,
  Compass,
  Car,
  Footprints,
  Bike
} from "lucide-react";

export default function CompareProductPage() {
  const params = useParams();
  const router = useRouter();
  const productId = params?.id as string;

  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<any>(null);
  const [mainPriority, setMainPriority] = useState<PriorityType>("COST");
  const [urgency, setUrgency] = useState<UrgencyType>("NOT_URGENT");
  const [transportMode, setTransportMode] = useState<TransportMode>("WALK");
  const [added, setAdded] = useState(false);

  useEffect(() => {
    if (productId) {
      runComparison();
    }
  }, [productId, mainPriority, urgency, transportMode]);

  const runComparison = async () => {
    try {
      const res = await fetch("/api/compare", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productId,
          preferences: {
            mainPriority,
            urgency,
            transportMode,
          },
        }),
      });

      if (res.ok) {
        const json = await res.json();
        setData(json);
      }
    } catch (err) {
      console.error("Comparison load error:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddToBasket = async () => {
    if (!productId) return;
    try {
      const res = await fetch("/api/list", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId, quantity: 1 }),
      });
      if (res.ok) {
        setAdded(true);
        setTimeout(() => setAdded(false), 2000);
      }
    } catch (err) {
      console.error(err);
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

  if (!data || !data.recommendation) {
    return (
      <div className="p-12 text-center bg-white rounded-3xl border border-border shadow-card space-y-4">
        <h2 className="text-xl font-bold text-charcoal">Comparison Not Available</h2>
        <p className="text-xs text-charcoal-muted">
          Could not find online offers or local kirana stock for this item.
        </p>
        <button
          onClick={() => router.push("/search")}
          className="px-4 py-2 bg-primary text-white rounded-xl text-xs font-bold"
        >
          Back to Search
        </button>
      </div>
    );
  }

  const { product, recommendation } = data;

  return (
    <div className="space-y-8 pb-16">
      {/* Top Breadcrumb & Product Meta */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center space-x-4">
          <button
            onClick={() => router.back()}
            className="p-2.5 bg-white border border-border hover:bg-surface-pale text-charcoal rounded-2xl transition-colors shadow-subtle"
            title="Go back"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <div className="flex items-center space-x-2 text-xs font-semibold text-primary">
              <span>{product.brand}</span>
              <span>•</span>
              <span className="text-charcoal-light">{product.category}</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-charcoal tracking-tight">
              {product.name}
            </h1>
          </div>
        </div>

        <button
          onClick={handleAddToBasket}
          className={`px-5 py-3 rounded-2xl text-xs font-bold flex items-center justify-center space-x-2 transition-all shadow-subtle ${
            added
              ? "bg-primary text-white"
              : "bg-primary hover:bg-primary-dark text-white"
          }`}
        >
          {added ? (
            <>
              <Check className="w-4 h-4" />
              <span>Added to Smart Basket</span>
            </>
          ) : (
            <>
              <Plus className="w-4 h-4" />
              <span>Add to Smart Basket</span>
            </>
          )}
        </button>
      </div>

      {/* Dynamic Recommendation Priority Tuning Bar */}
      <div className="bg-white rounded-3xl border border-border p-5 shadow-card space-y-4">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center space-x-2">
            <Sliders className="w-4 h-4 text-primary" />
            <span className="text-xs font-bold uppercase tracking-wider text-charcoal">
              Interactive Decision Controls
            </span>
          </div>
          <span className="text-[11px] text-charcoal-light">
            Toggle priorities to witness the mathematical scoring adjust in real-time.
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-1">
          {/* 1. Main Priority */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-charcoal flex items-center space-x-1">
              <span>Primary Preference</span>
            </label>
            <select
              value={mainPriority}
              onChange={(e) => setMainPriority(e.target.value as PriorityType)}
              className="w-full p-2.5 bg-surface-muted border border-border rounded-xl text-xs font-semibold text-charcoal outline-none focus:border-primary"
            >
              <option value="COST">Lowest Total Cost (Cost-focused)</option>
              <option value="TIME">Fastest Fulfillment (Time-focused)</option>
              <option value="CONVENIENCE">Doorstep Convenience</option>
              <option value="DISTANCE">Shortest Walking Distance</option>
              <option value="TRUST">Trusted Store / High Rating</option>
              <option value="AVAILABILITY">Product In-Stock Assurance</option>
            </select>
          </div>

          {/* 2. Urgency Level */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-charcoal flex items-center space-x-1">
              <span>How Urgently Needed?</span>
            </label>
            <select
              value={urgency}
              onChange={(e) => setUrgency(e.target.value as UrgencyType)}
              className="w-full p-2.5 bg-surface-muted border border-border rounded-xl text-xs font-semibold text-charcoal outline-none focus:border-primary"
            >
              <option value="NOT_URGENT">Not Urgent (Standard Schedule)</option>
              <option value="FEW_HOURS">Within a few hours</option>
              <option value="RIGHT_NOW">Right now (Emergency Need)</option>
            </select>
          </div>

          {/* 3. Transport Mode for Kirana */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-charcoal flex items-center space-x-1">
              <span>Local Travel Method</span>
            </label>
            <div className="grid grid-cols-3 gap-1.5 bg-surface-muted p-1 rounded-xl border border-border">
              <button
                type="button"
                onClick={() => setTransportMode("WALK")}
                className={`py-1.5 text-[11px] font-bold rounded-lg flex items-center justify-center space-x-1 transition-all ${
                  transportMode === "WALK" ? "bg-white text-primary shadow-subtle" : "text-charcoal-muted"
                }`}
                title="Walking (₹0 travel cost)"
              >
                <Footprints className="w-3 h-3" />
                <span>Walk (₹0)</span>
              </button>
              <button
                type="button"
                onClick={() => setTransportMode("BIKE")}
                className={`py-1.5 text-[11px] font-bold rounded-lg flex items-center justify-center space-x-1 transition-all ${
                  transportMode === "BIKE" ? "bg-white text-primary shadow-subtle" : "text-charcoal-muted"
                }`}
                title="Two-wheeler (₹5/km)"
              >
                <Bike className="w-3 h-3" />
                <span>Bike</span>
              </button>
              <button
                type="button"
                onClick={() => setTransportMode("CAR")}
                className={`py-1.5 text-[11px] font-bold rounded-lg flex items-center justify-center space-x-1 transition-all ${
                  transportMode === "CAR" ? "bg-white text-primary shadow-subtle" : "text-charcoal-muted"
                }`}
                title="Four-wheeler (₹12/km)"
              >
                <Car className="w-3 h-3" />
                <span>Car</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Comparison Component */}
      <ComparisonCard result={recommendation} />
    </div>
  );
}
