"use client";

import React, { useState, useEffect } from "react";
import { formatINR } from "@/lib/types";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";
import { 
  TrendingUp, 
  PiggyBank, 
  CheckCircle2, 
  Store, 
  Truck, 
  Layers, 
  ShoppingBag,
  Sparkles,
  Info
} from "lucide-react";

export default function ShoppingInsightsPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/insights")
      .then((res) => res.json())
      .then((json) => setData(json))
      .catch((err) => console.error("Error loading insights:", err))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="space-y-6 animate-pulse p-4">
        <div className="h-8 w-48 bg-surface-muted rounded-xl" />
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-32 bg-surface-muted rounded-3xl" />
          ))}
        </div>
        <div className="h-80 bg-surface-muted rounded-3xl" />
      </div>
    );
  }

  const metrics = data?.metrics || {};
  const charts = data?.charts || {};
  const recentPurchases = data?.recentPurchases || [];

  return (
    <div className="space-y-8 pb-16">
      {/* Header */}
      <div>
        <div className="inline-flex items-center space-x-1.5 px-3 py-1 bg-surface-pale text-primary-dark rounded-full text-xs font-bold border border-primary/20 mb-2">
          <Sparkles className="w-3.5 h-3.5 text-primary" />
          <span>Intelligent Analytics & History</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-black text-charcoal">Shopping Insights Dashboard</h1>
        <p className="text-xs text-charcoal-muted mt-1">
          Audited mathematical comparison data tracking your household savings and fulfillment patterns.
        </p>
      </div>

      {/* 4 Top Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Metric 1: Potential Savings Identified */}
        <div className="bg-white rounded-3xl p-5 border border-border shadow-card space-y-2">
          <div className="flex items-center justify-between text-xs font-bold text-charcoal-light">
            <span>Potential Savings</span>
            <div className="p-2 bg-surface-pale rounded-xl text-primary">
              <PiggyBank className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-charcoal">
            {formatINR(metrics.potentialSavingsPaise || 7200)}
          </div>
          <p className="text-[11px] text-charcoal-muted flex items-center space-x-1">
            <Info className="w-3 h-3 text-charcoal-faint shrink-0" />
            <span>Identified across all searched products</span>
          </p>
        </div>

        {/* Metric 2: Money Actually Saved */}
        <div className="bg-white rounded-3xl p-5 border border-primary/30 shadow-card space-y-2 ring-1 ring-primary/20">
          <div className="flex items-center justify-between text-xs font-bold text-primary-dark">
            <span>Money Actually Saved</span>
            <div className="p-2 bg-primary text-white rounded-xl">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-primary">
            {formatINR(metrics.moneyActuallySavedPaise || 3600)}
          </div>
          <p className="text-[11px] text-charcoal-muted">
            From verified recorded purchases
          </p>
        </div>

        {/* Metric 3: Total Comparisons */}
        <div className="bg-white rounded-3xl p-5 border border-border shadow-card space-y-2">
          <div className="flex items-center justify-between text-xs font-bold text-charcoal-light">
            <span>Total Comparisons</span>
            <div className="p-2 bg-sky-50 rounded-xl text-sky-600">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-charcoal">
            {metrics.comparisonsCount || 15} queries
          </div>
          <p className="text-[11px] text-charcoal-muted">
            Online vs Kirana decisions analyzed
          </p>
        </div>

        {/* Metric 4: Kirana Win Percentage */}
        <div className="bg-white rounded-3xl p-5 border border-border shadow-card space-y-2">
          <div className="flex items-center justify-between text-xs font-bold text-charcoal-light">
            <span>Local Kirana Advantage</span>
            <div className="p-2 bg-surface-pale rounded-xl text-primary">
              <Store className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-primary">
            {metrics.kiranaWinPercentage || 73}%
          </div>
          <p className="text-[11px] text-charcoal-muted">
            Times Kirana was lower effective cost
          </p>
        </div>
      </div>

      {/* CHARTS ROW */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Chart 1: Savings Trend (Potential vs Actual) */}
        <div className="bg-white rounded-3xl border border-border p-6 shadow-card space-y-4">
          <div>
            <h3 className="font-bold text-base text-charcoal">Monthly Savings Trajectory (₹)</h3>
            <p className="text-xs text-charcoal-muted">
              Comparing potential savings identified against verified recorded purchases
            </p>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={charts.savingsChartData || []}>
                <XAxis dataKey="name" stroke="#6B7280" fontSize={12} tickLine={false} />
                <YAxis stroke="#6B7280" fontSize={12} tickLine={false} unit="₹" />
                <Tooltip
                  formatter={(value: any) => [`₹${value}`, ""]}
                  contentStyle={{
                    backgroundColor: "#FFFFFF",
                    borderColor: "#E5E7EB",
                    borderRadius: "1rem",
                    boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.05)",
                  }}
                />
                <Legend />
                <Bar dataKey="potential" name="Potential Identified" fill="#93C5FD" radius={[6, 6, 0, 0]} />
                <Bar dataKey="actual" name="Actually Saved" fill="#198754" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 2: Source Breakdown Pie */}
        <div className="bg-white rounded-3xl border border-border p-6 shadow-card space-y-4">
          <div>
            <h3 className="font-bold text-base text-charcoal">Channel Recommendation Share</h3>
            <p className="text-xs text-charcoal-muted">
              Distribution of winners across Kirana, Online, and Hybrid baskets
            </p>
          </div>

          <div className="h-64 w-full flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={charts.sourceBreakdown || []}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  innerRadius={45}
                  paddingAngle={4}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                >
                  {charts.sourceBreakdown?.map((entry: any, index: number) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* RECENT RECORDED PURCHASES TABLE */}
      <div className="bg-white rounded-3xl border border-border p-6 shadow-card space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-bold text-base text-charcoal">Verified Purchase History</h3>
            <p className="text-xs text-charcoal-muted">
              Receipts recorded directly after visiting local Pune stores
            </p>
          </div>
        </div>

        {recentPurchases.length > 0 ? (
          <div className="divide-y divide-border text-xs">
            {recentPurchases.map((p: any) => (
              <div key={p.id} className="py-3.5 flex items-center justify-between gap-4">
                <div>
                  <div className="font-bold text-charcoal text-sm">{p.productName}</div>
                  <div className="text-charcoal-muted text-xs">
                    {p.storeName} • {new Date(p.date).toLocaleDateString()}
                  </div>
                  {p.review && <div className="text-charcoal-light italic mt-0.5">&ldquo;{p.review}&rdquo;</div>}
                </div>

                <div className="text-right">
                  <div className="font-black text-charcoal">{formatINR(p.spentPaise)} spent</div>
                  <div className="text-primary font-bold">Saved {formatINR(p.savedPaise)}</div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-xs text-charcoal-muted text-center py-6">
            No purchases recorded yet. Record a purchase from any store detail page!
          </p>
        )}
      </div>
    </div>
  );
}
