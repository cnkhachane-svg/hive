"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { formatINR } from "@/lib/types";
import { 
  ShieldCheck, 
  Users, 
  Store, 
  Package, 
  Plus, 
  Check, 
  TrendingUp, 
  AlertCircle 
} from "lucide-react";

export default function AdminPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState<"PRODUCTS" | "STORES" | "USERS">("PRODUCTS");

  // New product form modal
  const [showProductModal, setShowProductModal] = useState(false);
  const [name, setName] = useState("");
  const [brand, setBrand] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [standardQuantity, setStandardQuantity] = useState("1 kg");
  const [onlinePriceRupees, setOnlinePriceRupees] = useState("");
  const [kiranaPriceRupees, setKiranaPriceRupees] = useState("");
  const [savingProduct, setSavingProduct] = useState(false);

  useEffect(() => {
    loadAdminData();
  }, []);

  const loadAdminData = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/catalog");
      const json = await res.json();
      if (!res.ok) {
        setError(json.error || "Access denied. Admin role required.");
      } else {
        setData(json);
        if (json.products && json.products.length > 0) {
          setCategoryId(json.products[0].categoryId);
        }
      }
    } catch (err) {
      setError("Failed to load admin data");
    } finally {
      setLoading(false);
    }
  };

  const handleCreateProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingProduct(true);
    try {
      const res = await fetch("/api/admin/catalog", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          brand,
          categoryId,
          standardQuantity,
          onlinePricePaise: Math.round(Number(onlinePriceRupees || 0) * 100),
          kiranaPricePaise: Math.round(Number(kiranaPriceRupees || 0) * 100),
        }),
      });
      if (res.ok) {
        setShowProductModal(false);
        setName("");
        setBrand("");
        setOnlinePriceRupees("");
        setKiranaPriceRupees("");
        loadAdminData();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSavingProduct(false);
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

  if (error || !data) {
    return (
      <div className="p-12 text-center bg-white rounded-3xl border border-border shadow-card space-y-4">
        <ShieldCheck className="w-12 h-12 text-charcoal-faint mx-auto" />
        <h2 className="text-xl font-bold text-charcoal">{error || "Access Denied"}</h2>
        <p className="text-xs text-charcoal-muted max-w-md mx-auto">
          Administrator privileges are required to view this dashboard. Please switch to the Administrator role using the role switcher above or login.
        </p>
        <Link
          href="/login"
          className="inline-flex px-5 py-2.5 bg-primary text-white rounded-xl text-xs font-bold"
        >
          Sign In as Admin
        </Link>
      </div>
    );
  }

  const { stats, users = [], stores = [], products = [] } = data;

  return (
    <div className="space-y-8 pb-16">
      {/* Header */}
      <div className="bg-white rounded-3xl border border-border p-6 shadow-card space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center space-x-1 px-2.5 py-0.5 bg-surface-pale text-primary-dark rounded-full text-xs font-bold border border-primary/20">
              <ShieldCheck className="w-3.5 h-3.5 text-primary" />
              <span>Platform Administration</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-charcoal mt-1">
              HIVE Master Control Panel
            </h1>
            <p className="text-xs text-charcoal-muted">
              Oversee catalog integrity, partner kirana verifications, and system comparisons.
            </p>
          </div>

          <button
            onClick={() => setShowProductModal(true)}
            className="px-4 py-2.5 bg-primary hover:bg-primary-dark text-white rounded-xl text-xs font-bold shadow-subtle flex items-center space-x-1.5 transition-colors self-start sm:self-auto"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Create Catalog Product</span>
          </button>
        </div>

        {/* 4 Stats Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-3 border-t border-border text-xs">
          <div className="p-3 bg-surface-muted rounded-2xl">
            <div className="text-charcoal-light text-[11px]">Total Catalog Items</div>
            <div className="font-bold text-charcoal text-base">{stats.productCount} products</div>
          </div>
          <div className="p-3 bg-surface-muted rounded-2xl">
            <div className="text-charcoal-light text-[11px]">Registered Stores</div>
            <div className="font-bold text-primary text-base">{stats.storeCount} stores</div>
          </div>
          <div className="p-3 bg-surface-muted rounded-2xl">
            <div className="text-charcoal-light text-[11px]">Active Users</div>
            <div className="font-bold text-charcoal text-base">{stats.userCount} users</div>
          </div>
          <div className="p-3 bg-surface-muted rounded-2xl">
            <div className="text-charcoal-light text-[11px]">Recorded Comparisons</div>
            <div className="font-bold text-primary text-base">{stats.comparisonCount} runs</div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center space-x-2 border-b border-border pb-1">
        {[
          { id: "PRODUCTS", label: `Products (${products.length})`, icon: Package },
          { id: "STORES", label: `Stores (${stores.length})`, icon: Store },
          { id: "USERS", label: `Users (${users.length})`, icon: Users },
        ].map((tab) => {
          const Icon = tab.icon;
          const isSelected = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center space-x-2 px-4 py-2.5 rounded-2xl text-xs font-bold transition-all ${
                isSelected
                  ? "bg-primary text-white shadow-subtle"
                  : "text-charcoal-muted hover:text-charcoal hover:bg-surface-muted"
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Tab 1: Products */}
      {activeTab === "PRODUCTS" && (
        <div className="bg-white rounded-3xl border border-border p-6 shadow-card space-y-4">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-border text-charcoal-light uppercase text-[10px]">
                  <th className="pb-3 font-bold">Product Name</th>
                  <th className="pb-3 font-bold">Category</th>
                  <th className="pb-3 font-bold">Brand</th>
                  <th className="pb-3 font-bold">Online Offers</th>
                  <th className="pb-3 font-bold">Store Inventories</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {products.map((p: any) => (
                  <tr key={p.id} className="hover:bg-surface-muted/50">
                    <td className="py-3 font-bold text-charcoal">{p.name}</td>
                    <td className="py-3 text-charcoal-muted">{p.category?.name}</td>
                    <td className="py-3 text-primary font-semibold">{p.brand}</td>
                    <td className="py-3 text-charcoal-muted">
                      {p.onlineOffers?.length || 0} feeds
                    </td>
                    <td className="py-3 text-charcoal-muted">
                      {p.storeInventory?.length || 0} stores
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 2: Stores */}
      {activeTab === "STORES" && (
        <div className="bg-white rounded-3xl border border-border p-6 shadow-card space-y-4">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-border text-charcoal-light uppercase text-[10px]">
                  <th className="pb-3 font-bold">Store Name</th>
                  <th className="pb-3 font-bold">Locality</th>
                  <th className="pb-3 font-bold">Contact</th>
                  <th className="pb-3 font-bold">Rating</th>
                  <th className="pb-3 font-bold">Verification</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {stores.map((s: any) => (
                  <tr key={s.id} className="hover:bg-surface-muted/50">
                    <td className="py-3 font-bold text-charcoal">{s.name}</td>
                    <td className="py-3 text-charcoal-muted">{s.locality}</td>
                    <td className="py-3 text-charcoal-muted">{s.phone}</td>
                    <td className="py-3 font-bold text-amber-600">★ {s.rating}</td>
                    <td className="py-3">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        s.verified ? "bg-surface-pale text-primary-dark" : "bg-gray-100 text-charcoal-light"
                      }`}>
                        {s.verified ? "Verified Kirana" : "Demo Store"}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 3: Users */}
      {activeTab === "USERS" && (
        <div className="bg-white rounded-3xl border border-border p-6 shadow-card space-y-4">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-border text-charcoal-light uppercase text-[10px]">
                  <th className="pb-3 font-bold">Name</th>
                  <th className="pb-3 font-bold">Email</th>
                  <th className="pb-3 font-bold">Role</th>
                  <th className="pb-3 font-bold">Joined</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {users.map((u: any) => (
                  <tr key={u.id} className="hover:bg-surface-muted/50">
                    <td className="py-3 font-bold text-charcoal">{u.name}</td>
                    <td className="py-3 text-charcoal-muted">{u.email}</td>
                    <td className="py-3">
                      <span className="px-2 py-0.5 bg-surface-pale text-primary-dark font-bold rounded-full text-[10px]">
                        {u.role}
                      </span>
                    </td>
                    <td className="py-3 text-charcoal-muted">
                      {new Date(u.createdAt).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* CREATE PRODUCT MODAL */}
      {showProductModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-elevated border border-border space-y-4">
            <h3 className="font-bold text-lg text-charcoal">Create New Catalog Product</h3>

            <form onSubmit={handleCreateProduct} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-charcoal mb-1">Product Name</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Sona Masoori Rice (1 kg)"
                  className="w-full p-2.5 bg-surface-muted border border-border rounded-xl text-xs outline-none focus:border-primary"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-charcoal mb-1">Brand</label>
                  <input
                    type="text"
                    required
                    value={brand}
                    onChange={(e) => setBrand(e.target.value)}
                    placeholder="e.g. India Gate"
                    className="w-full p-2.5 bg-surface-muted border border-border rounded-xl text-xs outline-none focus:border-primary"
                  />
                </div>
                <div>
                  <label className="block font-bold text-charcoal mb-1">Quantity/Unit</label>
                  <input
                    type="text"
                    value={standardQuantity}
                    onChange={(e) => setStandardQuantity(e.target.value)}
                    className="w-full p-2.5 bg-surface-muted border border-border rounded-xl text-xs outline-none focus:border-primary"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-charcoal mb-1">Online Base Price (₹)</label>
                  <input
                    type="number"
                    value={onlinePriceRupees}
                    onChange={(e) => setOnlinePriceRupees(e.target.value)}
                    placeholder="e.g. 80"
                    className="w-full p-2.5 bg-surface-muted border border-border rounded-xl text-xs outline-none focus:border-primary"
                  />
                </div>
                <div>
                  <label className="block font-bold text-charcoal mb-1">Kirana Price (₹)</label>
                  <input
                    type="number"
                    value={kiranaPriceRupees}
                    onChange={(e) => setKiranaPriceRupees(e.target.value)}
                    placeholder="e.g. 82"
                    className="w-full p-2.5 bg-surface-muted border border-border rounded-xl text-xs outline-none focus:border-primary"
                  />
                </div>
              </div>

              <div className="flex justify-end space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowProductModal(false)}
                  className="px-4 py-2 bg-surface-muted text-charcoal rounded-xl font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={savingProduct}
                  className="px-4 py-2 bg-primary text-white rounded-xl font-bold"
                >
                  {savingProduct ? "Saving..." : "Create Product"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
