"use client";

import React, { useState } from "react";
import { RecommendationResult, formatINR } from "@/lib/types";
import HiveScore from "./HiveScore";
import { 
  CheckCircle2, 
  Clock, 
  MapPin, 
  Truck, 
  Store, 
  Star, 
  ChevronDown, 
  ChevronUp, 
  AlertCircle,
  HelpCircle,
  ShieldCheck,
  Compass
} from "lucide-react";

interface ComparisonCardProps {
  result: RecommendationResult;
}

export default function ComparisonCard({ result }: ComparisonCardProps) {
  const [whyOpen, setWhyOpen] = useState(true);
  const { winner, headline, explanation, savingsPaise, timeDifferenceMinutes, onlineOption, kiranaOption, onlineScores, kiranaScores, tradeOffSummary } = result;

  const isKiranaWinner = winner === "KIRANA";
  const isOnlineWinner = winner === "ONLINE";

  return (
    <div className="space-y-6">
      {/* Top Recommendation Banner */}
      <div className={`p-6 rounded-3xl border transition-all ${
        isKiranaWinner
          ? "bg-surface-pale border-primary/40 shadow-card"
          : "bg-sky-50 border-sky-300 shadow-card"
      }`}>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-white shadow-subtle text-primary-dark">
              <CheckCircle2 className="w-3.5 h-3.5 text-primary" />
              <span>Smart Decision Engine Verdict</span>
            </div>
            <h2 className="text-2xl font-black text-charcoal">{headline}</h2>
            <p className="text-sm text-charcoal-muted max-w-2xl leading-relaxed">
              {explanation}
            </p>
          </div>

          <div className="bg-white p-4 rounded-2xl border border-border shadow-subtle shrink-0 text-center md:text-right">
            <div className="text-[11px] font-bold uppercase tracking-wider text-charcoal-light">
              Identified Advantage
            </div>
            <div className="text-2xl font-black text-primary">
              {savingsPaise > 0 ? `Save ${formatINR(savingsPaise)}` : `${timeDifferenceMinutes} mins faster`}
            </div>
            <div className="text-[11px] text-charcoal-light">
              Effective Net Advantage
            </div>
          </div>
        </div>

        {/* Trade-off pill */}
        {tradeOffSummary && (
          <div className="mt-4 pt-3 border-t border-border/60 flex items-center space-x-2 text-xs text-charcoal-muted">
            <Compass className="w-4 h-4 text-primary shrink-0" />
            <span className="font-semibold text-charcoal">{tradeOffSummary}</span>
          </div>
        )}
      </div>

      {/* Side-by-Side Comparison Columns */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* 1. Online Option Card */}
        <div className={`rounded-3xl p-6 bg-white border transition-all ${
          isOnlineWinner 
            ? "border-primary shadow-elevated ring-2 ring-primary/20" 
            : "border-border shadow-card"
        }`}>
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 rounded-2xl bg-sky-100 flex items-center justify-center text-sky-700">
                <Truck className="w-6 h-6" />
              </div>
              <div>
                <div className="flex items-center space-x-2">
                  <h3 className="font-bold text-lg text-charcoal">{onlineOption.platform}</h3>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-sky-100 text-sky-800">
                    Quick Commerce
                  </span>
                </div>
                <div className="text-xs text-charcoal-light">Doorstep Delivery</div>
              </div>
            </div>

            {isOnlineWinner && (
              <span className="px-3 py-1 bg-primary text-white text-xs font-bold rounded-full shadow-subtle">
                Selected
              </span>
            )}
          </div>

          {/* Pricing Formula Breakdown */}
          <div className="p-4 bg-surface-muted rounded-2xl space-y-2 text-xs mb-5 border border-border">
            <div className="flex justify-between text-charcoal-muted">
              <span>Product Base Price</span>
              <span className="font-semibold text-charcoal">{formatINR(onlineOption.pricePaise)}</span>
            </div>
            <div className="flex justify-between text-charcoal-muted">
              <span>Delivery Charges</span>
              <span className="font-semibold text-charcoal">{formatINR(onlineOption.deliveryFeePaise)}</span>
            </div>
            {onlineOption.serviceFeePaise > 0 && (
              <div className="flex justify-between text-charcoal-muted">
                <span>Platform / Handling Fee</span>
                <span className="font-semibold text-charcoal">{formatINR(onlineOption.serviceFeePaise)}</span>
              </div>
            )}
            {onlineOption.discountPaise > 0 && (
              <div className="flex justify-between text-primary font-medium">
                <span>Coupon / Platform Discount</span>
                <span>-{formatINR(onlineOption.discountPaise)}</span>
              </div>
            )}
            <div className="pt-2 border-t border-border flex justify-between items-baseline">
              <span className="font-bold text-sm text-charcoal">Online Effective Cost</span>
              <span className="font-black text-xl text-charcoal">
                {formatINR(onlineOption.effectiveCostPaise)}
              </span>
            </div>
          </div>

          {/* Key Attributes */}
          <div className="space-y-3 text-xs mb-6">
            <div className="flex items-center justify-between py-1.5 border-b border-border/50">
              <span className="text-charcoal-light flex items-center space-x-1.5">
                <Clock className="w-3.5 h-3.5 text-charcoal-muted" />
                <span>Delivery Time</span>
              </span>
              <span className="font-bold text-charcoal">~{onlineOption.estimatedMinutes} minutes</span>
            </div>
            <div className="flex items-center justify-between py-1.5 border-b border-border/50">
              <span className="text-charcoal-light flex items-center space-x-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-charcoal-muted" />
                <span>Stock Availability</span>
              </span>
              <span className={`font-bold ${onlineOption.inStock ? "text-primary" : "text-state-error"}`}>
                {onlineOption.inStock ? "Available Online" : "Out of Stock"}
              </span>
            </div>
            <div className="flex items-center justify-between py-1.5">
              <span className="text-charcoal-light">Data Verification</span>
              <span className="text-[11px] text-charcoal-muted">Live Demo Catalog</span>
            </div>
          </div>

          <HiveScore 
            score={onlineScores} 
            isWinner={isOnlineWinner} 
            title={onlineOption.platform}
            weights={result.weightsUsed} 
          />
        </div>

        {/* 2. Nearby Kirana Card */}
        <div className={`rounded-3xl p-6 bg-white border transition-all ${
          isKiranaWinner 
            ? "border-primary shadow-elevated ring-2 ring-primary/20" 
            : "border-border shadow-card"
        }`}>
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 rounded-2xl bg-surface-pale flex items-center justify-center text-primary-dark">
                <Store className="w-6 h-6" />
              </div>
              <div>
                <div className="flex items-center space-x-2">
                  <h3 className="font-bold text-lg text-charcoal">{kiranaOption.storeName}</h3>
                  {kiranaOption.verified && (
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-surface-pale text-primary-dark border border-primary/20 flex items-center space-x-0.5">
                      <ShieldCheck className="w-3 h-3 text-primary inline" />
                      <span>Verified</span>
                    </span>
                  )}
                </div>
                <div className="text-xs text-charcoal-light flex items-center space-x-1">
                  <MapPin className="w-3 h-3 text-charcoal-faint" />
                  <span>{kiranaOption.locality}</span>
                </div>
              </div>
            </div>

            {isKiranaWinner && (
              <span className="px-3 py-1 bg-primary text-white text-xs font-bold rounded-full shadow-subtle">
                Selected
              </span>
            )}
          </div>

          {/* Pricing Formula Breakdown */}
          <div className="p-4 bg-surface-muted rounded-2xl space-y-2 text-xs mb-5 border border-border">
            <div className="flex justify-between text-charcoal-muted">
              <span>Kirana In-Store Price</span>
              <span className="font-semibold text-charcoal">{formatINR(kiranaOption.pricePaise)}</span>
            </div>
            <div className="flex justify-between text-charcoal-muted">
              <span>Estimated Travel Cost</span>
              <span className="font-semibold text-charcoal">
                {kiranaOption.travelCostPaise === 0 ? "₹0 (Walking distance)" : formatINR(kiranaOption.travelCostPaise)}
              </span>
            </div>
            {kiranaOption.discountPaise > 0 && (
              <div className="flex justify-between text-primary font-medium">
                <span>Local Store Discount</span>
                <span>-{formatINR(kiranaOption.discountPaise)}</span>
              </div>
            )}
            <div className="pt-2 border-t border-border flex justify-between items-baseline">
              <span className="font-bold text-sm text-charcoal">Kirana Effective Cost</span>
              <span className="font-black text-xl text-primary">
                {formatINR(kiranaOption.effectiveCostPaise)}
              </span>
            </div>
          </div>

          {/* Key Attributes */}
          <div className="space-y-3 text-xs mb-6">
            <div className="flex items-center justify-between py-1.5 border-b border-border/50">
              <span className="text-charcoal-light flex items-center space-x-1.5">
                <MapPin className="w-3.5 h-3.5 text-charcoal-muted" />
                <span>Distance</span>
              </span>
              <span className="font-bold text-charcoal">
                {Math.round(kiranaOption.distanceKm * 1000)} metres (~{kiranaOption.estimatedMinutes} mins walk)
              </span>
            </div>
            <div className="flex items-center justify-between py-1.5 border-b border-border/50">
              <span className="text-charcoal-light flex items-center space-x-1.5">
                <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                <span>Trust & Rating</span>
              </span>
              <span className="font-bold text-charcoal">
                {kiranaOption.rating} / 5.0 ({kiranaOption.ratingCount} reviews)
              </span>
            </div>
            <div className="flex items-center justify-between py-1.5">
              <span className="text-charcoal-light flex items-center space-x-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-primary" />
                <span>Stock Status</span>
              </span>
              <span className="font-bold text-primary">
                {kiranaOption.stockStatus === "IN_STOCK" ? `In Stock (${kiranaOption.stockQuantity} units)` : "Limited"}
              </span>
            </div>
          </div>

          <HiveScore 
            score={kiranaScores} 
            isWinner={isKiranaWinner} 
            title={kiranaOption.storeName}
            weights={result.weightsUsed} 
          />
        </div>
      </div>

      {/* Expandable "Why this recommendation?" Section */}
      <div className="bg-white rounded-3xl border border-border p-6 shadow-card">
        <button
          onClick={() => setWhyOpen(!whyOpen)}
          className="w-full flex items-center justify-between text-left font-bold text-charcoal hover:text-primary transition-colors"
        >
          <div className="flex items-center space-x-2">
            <HelpCircle className="w-5 h-5 text-primary" />
            <span className="text-base">Why this recommendation? (Algorithm Explanation)</span>
          </div>
          {whyOpen ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
        </button>

        {whyOpen && (
          <div className="mt-4 pt-4 border-t border-border space-y-4 text-xs text-charcoal-muted leading-relaxed">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 bg-surface-muted rounded-2xl space-y-2">
                <div className="font-bold text-charcoal text-sm">Deterministic Formulas Applied:</div>
                <div className="font-mono text-[11px] bg-white p-2.5 rounded-xl border border-border text-charcoal">
                  Online = Base({formatINR(onlineOption.pricePaise)}) + Delivery({formatINR(onlineOption.deliveryFeePaise)}) - Discount({formatINR(onlineOption.discountPaise)}) = {formatINR(onlineOption.effectiveCostPaise)}
                </div>
                <div className="font-mono text-[11px] bg-white p-2.5 rounded-xl border border-border text-charcoal">
                  Kirana = Base({formatINR(kiranaOption.pricePaise)}) + Travel({formatINR(kiranaOption.travelCostPaise)}) - Discount({formatINR(kiranaOption.discountPaise)}) = {formatINR(kiranaOption.effectiveCostPaise)}
                </div>
              </div>

              <div className="p-4 bg-surface-muted rounded-2xl space-y-2">
                <div className="font-bold text-charcoal text-sm">Priority Weights Applied:</div>
                <div className="grid grid-cols-2 gap-2 text-[11px]">
                  <div>Cost: <span className="font-bold text-charcoal">{result.weightsUsed.cost}%</span></div>
                  <div>Time: <span className="font-bold text-charcoal">{result.weightsUsed.time}%</span></div>
                  <div>Convenience: <span className="font-bold text-charcoal">{result.weightsUsed.convenience}%</span></div>
                  <div>Distance: <span className="font-bold text-charcoal">{result.weightsUsed.distance}%</span></div>
                  <div>Trust: <span className="font-bold text-charcoal">{result.weightsUsed.trust}%</span></div>
                </div>
                <p className="text-[11px] text-charcoal-light">
                  Adjust your shopping priorities or urgency in the profile or filters above to see how weights adapt dynamically.
                </p>
              </div>
            </div>

            <p className="text-charcoal">
              {explanation}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
