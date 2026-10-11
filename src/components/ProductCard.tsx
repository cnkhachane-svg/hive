"use client";

import React, { useState } from "react";
import Link from "next/link";
import { formatINR } from "@/lib/types";
import { Scale, Plus, Check, Bookmark, BookmarkCheck } from "lucide-react";

interface ProductCardProps {
  product: {
    id: string;
    name: string;
    brand: string;
    category: string;
    standardQuantity: string;
    imageUrl?: string | null;
    bestOnline?: {
      platform: string;
      pricePaise: number;
      deliveryFeePaise: number;
    } | null;
    bestStore?: {
      storeName: string;
      pricePaise: number;
      locality: string;
    } | null;
  };
  onAddedToBasket?: () => void;
}

export default function ProductCard({ product, onAddedToBasket }: ProductCardProps) {
  const [adding, setAdding] = useState(false);
  const [added, setAdded] = useState(false);
  const [saved, setSaved] = useState(false);

  const handleAddToBasket = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setAdding(true);
    try {
      const res = await fetch("/api/list", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId: product.id, quantity: 1 }),
      });
      if (res.ok) {
        setAdded(true);
        if (onAddedToBasket) onAddedToBasket();
        setTimeout(() => setAdded(false), 2000);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setAdding(false);
    }
  };

  const handleToggleSave = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    try {
      const res = await fetch("/api/saved", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId: product.id }),
      });
      const data = await res.json();
      setSaved(data.isSaved);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="group bg-white rounded-3xl border border-border overflow-hidden hover:border-primary/40 hover:shadow-card transition-all flex flex-col justify-between">
      {/* Product Image & Badges */}
      <div className="relative p-4 pb-0">
        <div className="w-full h-44 rounded-2xl bg-surface-muted overflow-hidden flex items-center justify-center relative">
          {product.imageUrl ? (
            <img
              src={product.imageUrl}
              alt={product.name}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            />
          ) : (
            <div className="text-4xl">🌾</div>
          )}

          <div className="absolute top-2.5 left-2.5">
            <span className="px-2.5 py-1 bg-white/90 backdrop-blur-md rounded-full text-[10px] font-bold text-charcoal shadow-subtle border border-border">
              {product.standardQuantity}
            </span>
          </div>

          <button
            onClick={handleToggleSave}
            className="absolute top-2.5 right-2.5 p-2 bg-white/90 backdrop-blur-md rounded-full text-charcoal-muted hover:text-primary transition-colors shadow-subtle border border-border"
            title={saved ? "Saved" : "Save product"}
          >
            {saved ? (
              <BookmarkCheck className="w-3.5 h-3.5 text-primary" />
            ) : (
              <Bookmark className="w-3.5 h-3.5" />
            )}
          </button>
        </div>
      </div>

      {/* Info & Price Preview */}
      <div className="p-5 flex-1 flex flex-col justify-between">
        <div>
          <div className="text-[11px] font-semibold text-primary uppercase tracking-wider mb-1">
            {product.brand}
          </div>
          <h3 className="font-bold text-charcoal text-sm line-clamp-2 leading-snug mb-3 group-hover:text-primary-dark transition-colors">
            {product.name}
          </h3>

          {/* Quick Price Matrix */}
          <div className="grid grid-cols-2 gap-2 p-2.5 bg-surface-pale/50 rounded-2xl border border-primary/10 text-xs mb-4">
            <div>
              <div className="text-[10px] text-charcoal-light font-medium truncate">
                {product.bestOnline?.platform || "Online"}
              </div>
              <div className="font-bold text-charcoal">
                {product.bestOnline ? formatINR(product.bestOnline.pricePaise) : "N/A"}
              </div>
            </div>
            <div className="border-l border-primary/20 pl-2">
              <div className="text-[10px] text-primary-dark font-medium truncate">
                Nearby Kirana
              </div>
              <div className="font-black text-primary">
                {product.bestStore ? formatINR(product.bestStore.pricePaise) : "N/A"}
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center space-x-2 pt-2">
          <Link
            href={`/compare/${product.id}`}
            className="flex-1 py-2 px-3 bg-surface-pale hover:bg-primary hover:text-white text-primary-dark rounded-xl font-bold text-xs flex items-center justify-center space-x-1.5 transition-colors border border-primary/20"
          >
            <Scale className="w-3.5 h-3.5" />
            <span>Compare</span>
          </Link>

          <button
            onClick={handleAddToBasket}
            disabled={adding}
            className={`p-2 rounded-xl text-xs font-semibold flex items-center justify-center transition-colors border ${
              added
                ? "bg-primary text-white border-primary"
                : "bg-surface-muted hover:bg-surface-pale text-charcoal-muted border-border hover:border-primary/30"
            }`}
            title="Add to Smart Basket"
          >
            {added ? <Check className="w-4 h-4 text-white" /> : <Plus className="w-4 h-4" />}
          </button>
        </div>
      </div>
    </div>
  );
}
