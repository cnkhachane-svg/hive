"use client";

import React from "react";
import { RecommendationScore } from "@/lib/types";
import { Sparkles, CheckCircle2, Info } from "lucide-react";

interface HiveScoreProps {
  score: RecommendationScore;
  isWinner: boolean;
  title: string;
  weights?: {
    cost: number;
    time: number;
    convenience: number;
    distance: number;
    trust: number;
  };
}

export default function HiveScore({ score, isWinner, title, weights }: HiveScoreProps) {
  const factors = [
    { label: "Cost Efficiency", val: score.costScore, weight: weights?.cost || 45 },
    { label: "Fulfillment Speed", val: score.timeScore, weight: weights?.time || 25 },
    { label: "Convenience", val: score.convenienceScore, weight: weights?.convenience || 10 },
    { label: "Store Distance", val: score.distanceScore, weight: weights?.distance || 10 },
    { label: "Trust & Quality", val: score.trustScore, weight: weights?.trust || 10 },
  ];

  return (
    <div
      className={`rounded-2xl p-5 border transition-all ${
        isWinner
          ? "bg-surface-pale/60 border-primary shadow-greenGlow ring-1 ring-primary/40"
          : "bg-surface-muted border-border"
      }`}
    >
      <div className="flex items-center justify-between mb-4">
        <div>
          <div className="flex items-center space-x-1.5">
            <span className="text-xs font-bold text-charcoal-light uppercase tracking-wider">
              {title}
            </span>
            {isWinner && (
              <span className="inline-flex items-center space-x-1 px-2 py-0.5 bg-primary text-white text-[10px] font-bold rounded-full">
                <CheckCircle2 className="w-2.5 h-2.5" />
                <span>Recommended</span>
              </span>
            )}
          </div>
          <div className="text-xs text-charcoal-light">HIVE Suitability Index</div>
        </div>

        {/* Circular / Large Score Badge */}
        <div
          className={`flex items-center justify-center w-14 h-14 rounded-2xl font-black text-2xl shadow-subtle ${
            isWinner
              ? "bg-primary text-white"
              : "bg-white text-charcoal-muted border border-border"
          }`}
        >
          {score.overallScore}
        </div>
      </div>

      {/* Factor Breakdown */}
      <div className="space-y-2.5 text-xs">
        {factors.map((f) => (
          <div key={f.label}>
            <div className="flex justify-between text-[11px] mb-1 font-medium text-charcoal">
              <span className="text-charcoal-muted">
                {f.label} <span className="text-[10px] text-charcoal-faint">({f.weight}% wt)</span>
              </span>
              <span className="font-bold">{f.val}/100</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-1.5 overflow-hidden">
              <div
                className={`h-1.5 rounded-full transition-all duration-500 ${
                  isWinner ? "bg-primary" : "bg-charcoal-faint"
                }`}
                style={{ width: `${Math.min(100, Math.max(0, f.val))}%` }}
              />
            </div>
          </div>
        ))}
      </div>

      <div className="mt-4 pt-3 border-t border-border/80 flex items-start space-x-1.5 text-[10px] text-charcoal-light">
        <Info className="w-3 h-3 text-charcoal-faint shrink-0 mt-0.5" />
        <span>
          Score reflects deterministic mathematical suitability for your active priority weights, not an absolute quality guarantee.
        </span>
      </div>
    </div>
  );
}
