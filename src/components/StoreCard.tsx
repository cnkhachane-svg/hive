"use client";

import React, { useState } from "react";
import Link from "next/link";
import { formatINR } from "@/lib/types";
import { 
  Store, 
  MapPin, 
  Star, 
  Phone, 
  Clock, 
  ShieldCheck, 
  Heart, 
  ArrowRight,
  ShoppingBag
} from "lucide-react";

interface StoreCardProps {
  store: {
    id: string;
    name: string;
    address: string;
    locality: string;
    distanceKm: number;
    phone: string;
    openingHours: string;
    isOpen: boolean;
    verified: boolean;
    rating: number;
    ratingCount: number;
    productCount: number;
    isTrusted?: boolean;
    sampleProducts?: Array<{
      name: string;
      pricePaise: number;
      inStock: boolean;
    }>;
  };
}

export default function StoreCard({ store }: StoreCardProps) {
  const [isTrusted, setIsTrusted] = useState(store.isTrusted || false);

  const handleToggleTrust = async (e: React.MouseEvent) => {
    e.preventDefault();
    try {
      const res = await fetch(`/api/stores/${store.id}/trust`, { method: "POST" });
      const data = await res.json();
      if (res.ok) {
        setIsTrusted(data.isTrusted);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const distanceMeters = Math.round(store.distanceKm * 1000);

  return (
    <div className="bg-white rounded-3xl border border-border hover:border-primary/40 hover:shadow-card transition-all p-5 flex flex-col justify-between">
      <div>
        {/* Header: Name, Distance, Trusted Heart */}
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="flex items-start space-x-3">
            <div className="w-11 h-11 rounded-2xl bg-surface-pale flex items-center justify-center text-primary-dark shrink-0">
              <Store className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center space-x-1.5 flex-wrap">
                <h3 className="font-bold text-charcoal text-base">{store.name}</h3>
                {store.verified ? (
                  <span className="inline-flex items-center space-x-0.5 px-2 py-0.5 bg-surface-pale text-primary-dark rounded-full text-[10px] font-bold border border-primary/20">
                    <ShieldCheck className="w-3 h-3 text-primary" />
                    <span>Verified</span>
                  </span>
                ) : (
                  <span className="px-2 py-0.5 bg-gray-100 text-charcoal-light rounded-full text-[10px] font-medium">
                    Demo Store
                  </span>
                )}
              </div>
              <p className="text-xs text-charcoal-muted flex items-center space-x-1 mt-0.5">
                <MapPin className="w-3 h-3 text-charcoal-faint shrink-0" />
                <span>{store.locality}</span>
                <span className="font-semibold text-primary">
                  • {distanceMeters < 1000 ? `${distanceMeters}m` : `${store.distanceKm.toFixed(1)}km`}
                </span>
              </p>
            </div>
          </div>

          <button
            onClick={handleToggleTrust}
            className={`p-2 rounded-full border transition-colors ${
              isTrusted
                ? "bg-rose-50 border-rose-200 text-rose-600"
                : "bg-surface-muted border-border text-charcoal-light hover:text-rose-500 hover:bg-rose-50"
            }`}
            title={isTrusted ? "Trusted Store" : "Mark as Trusted Store"}
          >
            <Heart className={`w-4 h-4 ${isTrusted ? "fill-rose-500" : ""}`} />
          </button>
        </div>

        {/* Operating status & Rating */}
        <div className="flex items-center space-x-3 py-2 text-xs border-y border-border/50 mb-3">
          <div className="flex items-center space-x-1 font-semibold text-charcoal">
            <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
            <span>{store.rating}</span>
            <span className="text-[10px] text-charcoal-light font-normal">
              ({store.ratingCount})
            </span>
          </div>
          <span className="text-border">•</span>
          <div className="flex items-center space-x-1 text-charcoal-muted">
            <Clock className="w-3.5 h-3.5 text-charcoal-faint" />
            <span>{store.openingHours}</span>
          </div>
        </div>

        {/* Available Products Pill Preview */}
        {store.sampleProducts && store.sampleProducts.length > 0 && (
          <div className="mb-4">
            <div className="text-[11px] font-bold text-charcoal-light uppercase tracking-wider mb-2 flex items-center justify-between">
              <span>Verified In Stock</span>
              <span className="text-[10px] text-primary font-semibold">
                {store.productCount} items
              </span>
            </div>
            <div className="space-y-1.5">
              {store.sampleProducts.slice(0, 3).map((prod, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between text-xs py-1 px-2.5 bg-surface-muted rounded-xl text-charcoal"
                >
                  <span className="truncate pr-2">{prod.name}</span>
                  <span className="font-bold text-primary shrink-0">
                    {formatINR(prod.pricePaise)}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Action Footer */}
      <div className="flex items-center space-x-2 pt-3 border-t border-border">
        <a
          href={`tel:${store.phone}`}
          className="p-2.5 bg-surface-muted hover:bg-surface-pale text-charcoal rounded-xl text-xs font-semibold flex items-center justify-center border border-border hover:border-primary/30 transition-colors"
          title={`Call ${store.phone}`}
        >
          <Phone className="w-3.5 h-3.5 text-primary" />
        </a>

        <Link
          href={`/stores/${store.id}`}
          className="flex-1 py-2.5 px-3 bg-surface-pale hover:bg-primary hover:text-white text-primary-dark rounded-xl font-bold text-xs flex items-center justify-center space-x-1.5 transition-colors border border-primary/20"
        >
          <span>View Inventory</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>
    </div>
  );
}
