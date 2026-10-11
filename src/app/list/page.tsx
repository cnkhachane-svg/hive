"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { formatINR, HybridOptimizationResult } from "@/lib/types";
import { 
  ShoppingBag, 
  Trash2, 
  Plus, 
  Minus, 
  Layers, 
  Truck, 
  Store, 
  CheckCircle2, 
  Sparkles, 
  ArrowRight, 
  Phone, 
  Navigation,
  RefreshCw,
  Info
} from "lucide-react";

export default function SmartShoppingListPage() {
  const [list, setList] = useState<any>(null);
  const [optimization, setOptimization] = useState<HybridOptimizationResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [optimizing, setOptimizing] = useState(false);
  const [activeTab, setActiveTab] = useState<"HYBRID" | "LOCAL" | "ONLINE">("HYBRID");

  useEffect(() => {
    loadListAndOptimize();
  }, []);

  const loadListAndOptimize = async () => {
    setLoading(true);
    try {
      const listRes = await fetch("/api/list");
      const listData = await listRes.json();
      setList(listData.list);

      // Trigger optimization calculation
      const optRes = await fetch("/api/list/optimize", { method: "POST" });
      const optData = await optRes.json();
      setOptimization(optData.result);

      if (optData.result?.recommendedScenario) {
        setActiveTab(optData.result.recommendedScenario);
      }
    } catch (err) {
      console.error("List load error:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateQuantity = async (itemId: string, newQty: number) => {
    try {
      await fetch("/api/list", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ itemId, quantity: newQty }),
      });
      loadListAndOptimize();
    } catch (err) {
      console.error(err);
    }
  };

  const handleRemoveItem = async (itemId: string) => {
    try {
      await fetch(`/api/list?itemId=${itemId}`, { method: "DELETE" });
      loadListAndOptimize();
    } catch (err) {
      console.error(err);
    }
  };

  const handleClearList = async () => {
    if (!confirm("Clear your entire shopping basket?")) return;
    try {
      await fetch("/api/list?clearAll=true", { method: "DELETE" });
      loadListAndOptimize();
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

  const items = list?.items || [];

  return (
    <div className="space-y-8 pb-16">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <h1 className="text-2xl sm:text-3xl font-black text-charcoal">Smart Shopping Basket</h1>
            <span className="px-2.5 py-0.5 bg-primary text-white text-xs font-bold rounded-full">
              {items.length} items
            </span>
          </div>
          <p className="text-xs text-charcoal-muted mt-1">
            Compare all-online delivery vs buying everything locally vs the HIVE Hybrid split basket.
          </p>
        </div>

        <div className="flex items-center space-x-2">
          {items.length > 0 && (
            <button
              onClick={handleClearList}
              className="px-3.5 py-2 text-xs font-semibold text-charcoal-light hover:text-state-error rounded-xl hover:bg-rose-50 border border-border transition-colors flex items-center space-x-1"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Clear List</span>
            </button>
          )}
          <Link
            href="/search"
            className="px-4 py-2 bg-surface-pale hover:bg-emerald-100 text-primary-dark rounded-xl text-xs font-bold border border-primary/20 transition-colors flex items-center space-x-1.5"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add More Items</span>
          </Link>
        </div>
      </div>

      {items.length === 0 ? (
        <div className="p-16 text-center bg-white rounded-3xl border border-border shadow-card space-y-4">
          <div className="w-16 h-16 bg-surface-pale text-primary rounded-full flex items-center justify-center mx-auto text-2xl font-bold">
            🐝
          </div>
          <h2 className="text-xl font-bold text-charcoal">Your basket is empty</h2>
          <p className="text-xs text-charcoal-muted max-w-sm mx-auto">
            Browse our catalog to add multiple grocery items and let HIVE optimize your complete shopping plan.
          </p>
          <Link
            href="/search"
            className="inline-flex px-6 py-2.5 bg-primary text-white rounded-xl text-xs font-bold shadow-subtle"
          >
            Explore Catalog
          </Link>
        </div>
      ) : (
        <div className="space-y-8">
          {/* OPTIMIZER VERDICT BANNER */}
          {optimization && (
            <div className="p-6 bg-gradient-to-r from-surface-pale via-white to-emerald-50 rounded-3xl border border-primary/40 shadow-card space-y-4">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="space-y-1">
                  <div className="inline-flex items-center space-x-1.5 px-3 py-1 bg-white rounded-full text-xs font-bold uppercase tracking-wider text-primary-dark shadow-subtle border border-primary/20">
                    <Sparkles className="w-3.5 h-3.5 text-primary" />
                    <span>HIVE Multi-Product Basket Optimizer</span>
                  </div>
                  <h2 className="text-2xl font-black text-charcoal">
                    {optimization.headline}
                  </h2>
                  <p className="text-xs sm:text-sm text-charcoal-muted max-w-2xl leading-relaxed">
                    {optimization.explanation}
                  </p>
                </div>

                <div className="p-4 bg-white rounded-2xl border border-border text-center md:text-right shadow-subtle shrink-0">
                  <div className="text-[10px] font-bold uppercase text-charcoal-light">Total Basket Savings</div>
                  <div className="text-2xl font-black text-primary">
                    {formatINR(optimization.savingsPaise)}
                  </div>
                  <div className="text-[10px] text-charcoal-light">vs Alternative Methods</div>
                </div>
              </div>

              {/* Tradeoff Note */}
              <div className="pt-3 border-t border-border/60 text-xs text-charcoal flex items-center space-x-2">
                <span className="font-bold text-primary">Logistics Analysis:</span>
                <span className="text-charcoal-muted">{optimization.tradeoffAnalysis}</span>
              </div>
            </div>
          )}

          {/* THREE-WAY SCENARIO CARDS */}
          {optimization && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              {/* Scenario 1: All Online */}
              <div 
                onClick={() => setActiveTab("ONLINE")}
                className={`p-5 rounded-3xl border cursor-pointer transition-all ${
                  activeTab === "ONLINE"
                    ? "bg-white border-sky-400 shadow-elevated ring-2 ring-sky-300"
                    : "bg-surface-muted border-border hover:bg-white"
                }`}
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center space-x-2">
                    <Truck className="w-5 h-5 text-sky-600" />
                    <h3 className="font-bold text-charcoal text-sm">All-Online Basket</h3>
                  </div>
                  {optimization.recommendedScenario === "ONLINE" && (
                    <span className="px-2 py-0.5 bg-primary text-white text-[10px] font-bold rounded-full">
                      Winner
                    </span>
                  )}
                </div>

                <div className="text-2xl font-black text-charcoal mb-2">
                  {formatINR(optimization.scenarios.allOnline.totalEffectivePaise)}
                </div>

                <div className="space-y-1.5 text-xs text-charcoal-muted border-t border-border pt-3">
                  <div className="flex justify-between">
                    <span>Items Subtotal:</span>
                    <span className="font-semibold text-charcoal">
                      {formatINR(optimization.scenarios.allOnline.itemsCostPaise)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Delivery (1 Order):</span>
                    <span className="font-semibold text-charcoal">
                      {formatINR(optimization.scenarios.allOnline.deliveryOrTravelFeePaise)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Fulfillment:</span>
                    <span className="font-semibold text-charcoal">
                      ~{optimization.scenarios.allOnline.estimatedMinutes} mins
                    </span>
                  </div>
                </div>
              </div>

              {/* Scenario 2: All Local Kirana */}
              <div 
                onClick={() => setActiveTab("LOCAL")}
                className={`p-5 rounded-3xl border cursor-pointer transition-all ${
                  activeTab === "LOCAL"
                    ? "bg-white border-primary shadow-elevated ring-2 ring-primary/30"
                    : "bg-surface-muted border-border hover:bg-white"
                }`}
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center space-x-2">
                    <Store className="w-5 h-5 text-primary" />
                    <h3 className="font-bold text-charcoal text-sm">All-Local Kirana</h3>
                  </div>
                  {optimization.recommendedScenario === "KIRANA" && (
                    <span className="px-2 py-0.5 bg-primary text-white text-[10px] font-bold rounded-full">
                      Winner
                    </span>
                  )}
                </div>

                <div className="text-2xl font-black text-primary mb-2">
                  {formatINR(optimization.scenarios.allLocal.totalEffectivePaise)}
                </div>

                <div className="space-y-1.5 text-xs text-charcoal-muted border-t border-border pt-3">
                  <div className="flex justify-between">
                    <span>Items Subtotal:</span>
                    <span className="font-semibold text-charcoal">
                      {formatINR(optimization.scenarios.allLocal.itemsCostPaise)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Travel Cost:</span>
                    <span className="font-semibold text-charcoal">
                      {formatINR(optimization.scenarios.allLocal.deliveryOrTravelFeePaise)} (Walk)
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Fulfillment:</span>
                    <span className="font-semibold text-charcoal">
                      ~{optimization.scenarios.allLocal.estimatedMinutes} mins (Instant)
                    </span>
                  </div>
                </div>
              </div>

              {/* Scenario 3: Optimized Hybrid */}
              <div 
                onClick={() => setActiveTab("HYBRID")}
                className={`p-5 rounded-3xl border cursor-pointer transition-all ${
                  activeTab === "HYBRID"
                    ? "bg-surface-pale border-primary shadow-elevated ring-2 ring-primary/40"
                    : "bg-surface-muted border-border hover:bg-white"
                }`}
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center space-x-2">
                    <Layers className="w-5 h-5 text-primary" />
                    <h3 className="font-bold text-charcoal text-sm">Optimized Hybrid 🐝</h3>
                  </div>
                  {optimization.recommendedScenario === "HYBRID" && (
                    <span className="px-2 py-0.5 bg-primary text-white text-[10px] font-bold rounded-full">
                      Winner
                    </span>
                  )}
                </div>

                <div className="text-2xl font-black text-charcoal mb-2">
                  {formatINR(optimization.scenarios.hybrid.totalEffectivePaise)}
                </div>

                <div className="space-y-1.5 text-xs text-charcoal-muted border-t border-border pt-3">
                  <div className="flex justify-between">
                    <span>Items Subtotal:</span>
                    <span className="font-semibold text-charcoal">
                      {formatINR(optimization.scenarios.hybrid.itemsCostPaise)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Delivery / Travel:</span>
                    <span className="font-semibold text-charcoal">
                      {formatINR(optimization.scenarios.hybrid.deliveryOrTravelFeePaise)}
                    </span>
                  </div>
                  <div className="flex justify-between font-bold text-primary">
                    <span>Net Advantage:</span>
                    <span>Save {formatINR(optimization.savingsPaise)}</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ITEM-BY-ITEM ALLOCATION PLAN */}
          <div className="bg-white rounded-3xl border border-border p-6 shadow-card space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-bold text-lg text-charcoal">
                  Item-by-Item Purchase Allocation Plan
                </h3>
                <p className="text-xs text-charcoal-muted">
                  Detailed rationale for where each item should be purchased.
                </p>
              </div>
              <span className="text-xs text-charcoal-light">
                Prices calculated using current Pune inventory
              </span>
            </div>

            <div className="divide-y divide-border">
              {optimization?.hybridItems.map((item) => {
                const isOnline = item.chosenSource === "ONLINE";
                return (
                  <div key={item.productId} className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="space-y-1">
                      <div className="flex items-center space-x-2">
                        <span className="font-bold text-sm text-charcoal">{item.productName}</span>
                        <span className="text-xs text-charcoal-light">({item.quantity} {item.unit})</span>
                      </div>
                      <div className="flex items-center space-x-2 text-xs">
                        <span className={`inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full font-bold text-[10px] ${
                          isOnline ? "bg-sky-100 text-sky-800" : "bg-surface-pale text-primary-dark"
                        }`}>
                          {isOnline ? <Truck className="w-3 h-3" /> : <Store className="w-3 h-3" />}
                          <span>Buy from {item.chosenStoreOrPlatform}</span>
                        </span>
                        <span className="text-charcoal-muted text-[11px]">• {item.reason}</span>
                      </div>
                    </div>

                    <div className="flex items-center space-x-4">
                      {/* Quantity Modifier */}
                      <div className="flex items-center space-x-2 bg-surface-muted px-2.5 py-1 rounded-xl border border-border">
                        <button
                          onClick={() => {
                            const found = items.find((i: any) => i.productId === item.productId);
                            if (found) handleUpdateQuantity(found.id, item.quantity - 1);
                          }}
                          className="p-1 hover:text-primary text-charcoal-muted"
                          title="Decrease"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="text-xs font-bold text-charcoal w-4 text-center">{item.quantity}</span>
                        <button
                          onClick={() => {
                            const found = items.find((i: any) => i.productId === item.productId);
                            if (found) handleUpdateQuantity(found.id, item.quantity + 1);
                          }}
                          className="p-1 hover:text-primary text-charcoal-muted"
                          title="Increase"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>

                      <div className="text-right">
                        <div className="font-bold text-sm text-charcoal">{formatINR(item.itemTotalPaise)}</div>
                        <div className="text-[10px] text-charcoal-light">{formatINR(item.itemPricePaise)} / unit</div>
                      </div>

                      <button
                        onClick={() => {
                          const found = items.find((i: any) => i.productId === item.productId);
                          if (found) handleRemoveItem(found.id);
                        }}
                        className="p-2 text-charcoal-faint hover:text-state-error rounded-lg"
                        title="Remove"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* ACTION FOOTER */}
          <div className="p-6 bg-surface-pale/80 rounded-3xl border border-primary/20 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="space-y-0.5 text-center sm:text-left">
              <div className="text-xs font-bold uppercase tracking-wider text-primary-dark">
                Ready to execute your shopping plan?
              </div>
              <p className="text-xs text-charcoal-muted">
                HIVE is a decision engine. Contact your local store or open quick commerce to order.
              </p>
            </div>

            <div className="flex items-center space-x-3">
              <a
                href="tel:+919823011223"
                className="px-4 py-2.5 bg-white hover:bg-emerald-50 text-charcoal rounded-xl text-xs font-bold border border-border shadow-subtle flex items-center space-x-1.5 transition-colors"
              >
                <Phone className="w-3.5 h-3.5 text-primary" />
                <span>Call Apna Kirana</span>
              </a>

              <Link
                href="/stores"
                className="px-5 py-2.5 bg-primary hover:bg-primary-dark text-white rounded-xl text-xs font-bold shadow-subtle flex items-center space-x-1.5 transition-colors"
              >
                <Navigation className="w-3.5 h-3.5" />
                <span>Get Kirana Directions</span>
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
