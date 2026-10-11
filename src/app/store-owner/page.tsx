"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { formatINR } from "@/lib/types";
import { 
  Store, 
  Package, 
  Plus, 
  Save, 
  Check, 
  Edit3, 
  AlertCircle, 
  ShieldCheck, 
  Phone, 
  Clock, 
  MapPin,
  Scale
} from "lucide-react";

export default function StoreOwnerPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  // Add product form
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedProductId, setSelectedProductId] = useState("");
  const [newPriceRupees, setNewPriceRupees] = useState("");
  const [newQuantity, setNewQuantity] = useState("25");
  const [newDiscountRupees, setNewDiscountRupees] = useState("0");
  const [addingProduct, setAddingProduct] = useState(false);

  useEffect(() => {
    loadStoreData();
  }, []);

  const loadStoreData = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/store-owner/inventory");
      const json = await res.json();
      if (!res.ok) {
        setError(json.error || "Access denied. Store Owner role required.");
      } else {
        setData(json);
      }
    } catch (err) {
      setError("Failed to load store inventory");
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateItem = async (inventoryId: string, payload: any) => {
    setUpdatingId(inventoryId);
    try {
      await fetch("/api/store-owner/inventory", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ inventoryId, ...payload }),
      });
      loadStoreData();
    } catch (err) {
      console.error(err);
    } finally {
      setUpdatingId(null);
    }
  };

  const handleAddProductSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!data?.store?.id || !selectedProductId || !newPriceRupees) return;
    setAddingProduct(true);
    try {
      const res = await fetch("/api/store-owner/inventory", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          storeId: data.store.id,
          productId: selectedProductId,
          pricePaise: Math.round(Number(newPriceRupees) * 100),
          stockQuantity: Number(newQuantity) || 20,
          discountPaise: Math.round(Number(newDiscountRupees || 0) * 100),
        }),
      });
      if (res.ok) {
        setShowAddModal(false);
        setSelectedProductId("");
        setNewPriceRupees("");
        loadStoreData();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setAddingProduct(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6 animate-pulse p-4">
        <div className="h-8 w-48 bg-surface-muted rounded-xl" />
        <div className="h-64 bg-surface-muted rounded-3xl" />
      </div>
    );
  }

  if (error || !data?.store) {
    return (
      <div className="p-12 text-center bg-white rounded-3xl border border-border shadow-card space-y-4">
        <Store className="w-12 h-12 text-charcoal-faint mx-auto" />
        <h2 className="text-xl font-bold text-charcoal">{error || "No Store Registered"}</h2>
        <p className="text-xs text-charcoal-muted max-w-md mx-auto">
          Please log in as Ramesh (Kirana Owner) or register a store-owner account to manage local inventory.
        </p>
        <Link
          href="/login"
          className="inline-flex px-5 py-2.5 bg-primary text-white rounded-xl text-xs font-bold"
        >
          Go to Sign In
        </Link>
      </div>
    );
  }

  const { store, allProducts = [] } = data;
  const inventory = store.inventory || [];

  return (
    <div className="space-y-8 pb-16">
      {/* Header & Store Profile Bar */}
      <div className="bg-white rounded-3xl border border-border p-6 shadow-card space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="inline-flex items-center space-x-1 px-2.5 py-0.5 bg-surface-pale text-primary-dark rounded-full text-xs font-bold border border-primary/20">
              <Store className="w-3.5 h-3.5 text-primary" />
              <span>Owner Management Portal</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-charcoal">{store.name}</h1>
            <p className="text-xs text-charcoal-muted flex items-center space-x-2">
              <MapPin className="w-3.5 h-3.5 text-charcoal-faint" />
              <span>{store.address}, {store.locality}</span>
            </p>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={() => setShowAddModal(true)}
              className="px-4 py-2.5 bg-primary hover:bg-primary-dark text-white rounded-xl text-xs font-bold shadow-subtle flex items-center space-x-1.5 transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Product to Store</span>
            </button>
          </div>
        </div>

        {/* Store Metrics */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-3 border-t border-border text-xs">
          <div className="p-3 bg-surface-muted rounded-2xl">
            <div className="text-charcoal-light text-[11px]">Active Items</div>
            <div className="font-bold text-charcoal text-base">{inventory.length} products</div>
          </div>
          <div className="p-3 bg-surface-muted rounded-2xl">
            <div className="text-charcoal-light text-[11px]">In Stock Ratio</div>
            <div className="font-bold text-primary text-base">
              {inventory.filter((i: any) => i.inStock).length} / {inventory.length}
            </div>
          </div>
          <div className="p-3 bg-surface-muted rounded-2xl">
            <div className="text-charcoal-light text-[11px]">Public Store Rating</div>
            <div className="font-bold text-amber-600 text-base">★ {store.rating} ({store.ratingCount})</div>
          </div>
          <div className="p-3 bg-surface-muted rounded-2xl">
            <div className="text-charcoal-light text-[11px]">Store Status</div>
            <div className="font-bold text-primary text-base">Verified & Live</div>
          </div>
        </div>
      </div>

      {/* Inventory Management Table */}
      <div className="bg-white rounded-3xl border border-border p-6 shadow-card space-y-4">
        <div>
          <h2 className="text-lg font-bold text-charcoal">Your Live Kirana Inventory</h2>
          <p className="text-xs text-charcoal-muted">
            Any price or stock status change here will immediately reflect in the HIVE recommendation algorithm.
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-border text-charcoal-light uppercase text-[10px]">
                <th className="pb-3 font-bold">Product</th>
                <th className="pb-3 font-bold">In-Store Price (₹)</th>
                <th className="pb-3 font-bold">Discount (₹)</th>
                <th className="pb-3 font-bold">Quantity</th>
                <th className="pb-3 font-bold">Stock Status</th>
                <th className="pb-3 font-bold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {inventory.map((inv: any) => (
                <tr key={inv.id} className="hover:bg-surface-muted/50 transition-colors">
                  <td className="py-4 pr-3">
                    <div className="font-bold text-charcoal text-sm">{inv.product.name}</div>
                    <div className="text-charcoal-light text-[11px]">{inv.product.brand} • {inv.product.standardQuantity}</div>
                  </td>

                  <td className="py-4 pr-3">
                    <input
                      type="number"
                      defaultValue={inv.pricePaise / 100}
                      onBlur={(e) => {
                        const val = Number(e.target.value);
                        if (!isNaN(val) && val > 0 && val !== inv.pricePaise / 100) {
                          handleUpdateItem(inv.id, { pricePaise: Math.round(val * 100) });
                        }
                      }}
                      className="w-24 p-2 bg-surface-muted border border-border rounded-xl font-bold text-charcoal text-xs outline-none focus:border-primary"
                    />
                  </td>

                  <td className="py-4 pr-3">
                    <input
                      type="number"
                      defaultValue={inv.discountPaise / 100}
                      onBlur={(e) => {
                        const val = Number(e.target.value);
                        if (!isNaN(val) && val !== inv.discountPaise / 100) {
                          handleUpdateItem(inv.id, { discountPaise: Math.round(val * 100) });
                        }
                      }}
                      className="w-20 p-2 bg-surface-muted border border-border rounded-xl text-charcoal text-xs outline-none focus:border-primary"
                    />
                  </td>

                  <td className="py-4 pr-3">
                    <input
                      type="number"
                      defaultValue={inv.stockQuantity}
                      onBlur={(e) => {
                        const val = Number(e.target.value);
                        if (!isNaN(val) && val !== inv.stockQuantity) {
                          handleUpdateItem(inv.id, { stockQuantity: val });
                        }
                      }}
                      className="w-16 p-2 bg-surface-muted border border-border rounded-xl text-charcoal text-xs outline-none focus:border-primary"
                    />
                  </td>

                  <td className="py-4 pr-3">
                    <select
                      value={inv.stockStatus}
                      onChange={(e) => {
                        const status = e.target.value;
                        handleUpdateItem(inv.id, {
                          stockStatus: status,
                          inStock: status !== "OUT_OF_STOCK",
                        });
                      }}
                      className={`p-2 rounded-xl text-xs font-bold border outline-none ${
                        inv.stockStatus === "IN_STOCK"
                          ? "bg-surface-pale border-primary/30 text-primary-dark"
                          : inv.stockStatus === "LIMITED_STOCK"
                          ? "bg-amber-50 border-amber-300 text-amber-800"
                          : "bg-rose-50 border-rose-300 text-state-error"
                      }`}
                    >
                      <option value="IN_STOCK">In Stock</option>
                      <option value="LIMITED_STOCK">Limited Stock</option>
                      <option value="OUT_OF_STOCK">Out of Stock</option>
                    </select>
                  </td>

                  <td className="py-4 text-right">
                    <Link
                      href={`/compare/${inv.product.id}`}
                      className="inline-flex items-center space-x-1 px-3 py-1.5 bg-surface-pale hover:bg-primary hover:text-white text-primary-dark rounded-xl text-xs font-bold border border-primary/20 transition-colors"
                      title="View how HIVE compares your product"
                    >
                      <Scale className="w-3.5 h-3.5" />
                      <span>View Compare</span>
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* ADD PRODUCT MODAL */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-elevated border border-border space-y-4">
            <h3 className="font-bold text-lg text-charcoal">Add Product to Store Inventory</h3>
            <p className="text-xs text-charcoal-muted">
              Select an item from the master catalog and set your store shelf price.
            </p>

            <form onSubmit={handleAddProductSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-charcoal mb-1">Select Catalog Product</label>
                <select
                  required
                  value={selectedProductId}
                  onChange={(e) => setSelectedProductId(e.target.value)}
                  className="w-full p-2.5 bg-surface-muted border border-border rounded-xl text-xs font-semibold text-charcoal outline-none focus:border-primary"
                >
                  <option value="">-- Choose a Product --</option>
                  {allProducts.map((p: any) => (
                    <option key={p.id} value={p.id}>
                      {p.name} ({p.brand})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-bold text-charcoal mb-1">Store Price in Rupees (₹)</label>
                <input
                  type="number"
                  required
                  value={newPriceRupees}
                  onChange={(e) => setNewPriceRupees(e.target.value)}
                  placeholder="e.g. 82"
                  className="w-full p-2.5 bg-surface-muted border border-border rounded-xl text-xs outline-none focus:border-primary"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-charcoal mb-1">Stock Units</label>
                  <input
                    type="number"
                    value={newQuantity}
                    onChange={(e) => setNewQuantity(e.target.value)}
                    className="w-full p-2.5 bg-surface-muted border border-border rounded-xl text-xs outline-none focus:border-primary"
                  />
                </div>
                <div>
                  <label className="block font-bold text-charcoal mb-1">Discount (₹)</label>
                  <input
                    type="number"
                    value={newDiscountRupees}
                    onChange={(e) => setNewDiscountRupees(e.target.value)}
                    className="w-full p-2.5 bg-surface-muted border border-border rounded-xl text-xs outline-none focus:border-primary"
                  />
                </div>
              </div>

              <div className="flex justify-end space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 bg-surface-muted text-charcoal rounded-xl font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={addingProduct}
                  className="px-4 py-2 bg-primary text-white rounded-xl font-bold"
                >
                  {addingProduct ? "Adding..." : "Add to Inventory"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
