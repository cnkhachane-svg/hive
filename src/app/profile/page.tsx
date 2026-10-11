"use client";

import React, { useState, useEffect } from "react";
import { PriorityType, UrgencyType, TransportMode } from "@/lib/types";
import { User, Sliders, MapPin, Footprints, Bike, Car, Save, Check } from "lucide-react";

export default function ProfilePage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("USER");

  const [mainPriority, setMainPriority] = useState<PriorityType>("COST");
  const [urgency, setUrgency] = useState<UrgencyType>("NOT_URGENT");
  const [preferredRadiusKm, setPreferredRadiusKm] = useState(3.0);
  const [transportMode, setTransportMode] = useState<TransportMode>("WALK");

  useEffect(() => {
    fetch("/api/auth/me")
      .then((res) => res.json())
      .then((data) => {
        if (data.user) {
          setName(data.user.name || "Aarav Sharma");
          setEmail(data.user.email || "shopper@hive.in");
          setRole(data.user.role || "USER");

          if (data.user.preferences) {
            setMainPriority(data.user.preferences.mainPriority || "COST");
            setUrgency(data.user.preferences.urgency || "NOT_URGENT");
            setPreferredRadiusKm(data.user.preferences.preferredRadiusKm || 3.0);
            setTransportMode(data.user.preferences.transportMode || "WALK");
          }
        }
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await fetch("/api/auth/me", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          mainPriority,
          urgency,
          preferredRadiusKm,
          transportMode,
        }),
      });
      if (res.ok) {
        setSavedSuccess(true);
        setTimeout(() => setSavedSuccess(false), 2500);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
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

  return (
    <div className="max-w-3xl space-y-8 pb-16">
      <div>
        <h1 className="text-2xl sm:text-3xl font-black text-charcoal">Profile & Shopping Priorities</h1>
        <p className="text-xs text-charcoal-muted mt-1">
          Configure how the HIVE recommendation engine weighs prices, time, and distance for your household.
        </p>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        {/* User Identity Section */}
        <div className="bg-white rounded-3xl border border-border p-6 shadow-card space-y-4">
          <div className="flex items-center space-x-2 text-primary font-bold text-sm">
            <User className="w-4 h-4" />
            <span>Account Details</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block font-bold text-charcoal mb-1">Your Full Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full p-2.5 bg-surface-muted border border-border rounded-xl text-xs font-semibold text-charcoal outline-none focus:border-primary"
              />
            </div>
            <div>
              <label className="block font-bold text-charcoal mb-1">Email Address</label>
              <input
                type="email"
                disabled
                value={email}
                className="w-full p-2.5 bg-gray-100 border border-border rounded-xl text-xs font-semibold text-charcoal-light cursor-not-allowed"
              />
            </div>
          </div>

          <div className="flex items-center space-x-2 pt-2 text-xs">
            <span className="font-semibold text-charcoal">Active Role:</span>
            <span className="px-2.5 py-0.5 bg-surface-pale text-primary-dark font-bold rounded-full border border-primary/20">
              {role}
            </span>
          </div>
        </div>

        {/* Algorithm Priorities Configuration */}
        <div className="bg-white rounded-3xl border border-border p-6 shadow-card space-y-5">
          <div className="flex items-center space-x-2 text-primary font-bold text-sm">
            <Sliders className="w-4 h-4" />
            <span>HIVE Scoring Weights & Decision Engine Priorities</span>
          </div>

          {/* Main Priority */}
          <div className="space-y-1.5 text-xs">
            <label className="block font-bold text-charcoal">Default Primary Priority</label>
            <select
              value={mainPriority}
              onChange={(e) => setMainPriority(e.target.value as PriorityType)}
              className="w-full p-3 bg-surface-muted border border-border rounded-xl text-xs font-semibold text-charcoal outline-none focus:border-primary"
            >
              <option value="COST">Lowest Total Effective Cost (55% Cost Weight)</option>
              <option value="TIME">Fastest Fulfillment Speed (50% Time Weight)</option>
              <option value="CONVENIENCE">Doorstep Delivery Convenience (40% Weight)</option>
              <option value="DISTANCE">Shortest Physical Travel Distance (40% Weight)</option>
              <option value="TRUST">Trusted Store / Verified Rating (40% Weight)</option>
              <option value="AVAILABILITY">Strict Product In-Stock Feasibility</option>
            </select>
          </div>

          {/* Urgency Default */}
          <div className="space-y-1.5 text-xs">
            <label className="block font-bold text-charcoal">Default Urgency Baseline</label>
            <select
              value={urgency}
              onChange={(e) => setUrgency(e.target.value as UrgencyType)}
              className="w-full p-3 bg-surface-muted border border-border rounded-xl text-xs font-semibold text-charcoal outline-none focus:border-primary"
            >
              <option value="NOT_URGENT">Not Urgent (Standard grocery restocking)</option>
              <option value="FEW_HOURS">Within a few hours</option>
              <option value="RIGHT_NOW">Right now (Emergency requirement)</option>
            </select>
          </div>

          {/* Transport Mode */}
          <div className="space-y-1.5 text-xs">
            <label className="block font-bold text-charcoal">
              Transport Mode for Local Kirana Visits
            </label>
            <div className="grid grid-cols-3 gap-3">
              {[
                { id: "WALK", label: "Walking (₹0/km)", icon: Footprints },
                { id: "BIKE", label: "Two-Wheeler (₹5/km)", icon: Bike },
                { id: "CAR", label: "Four-Wheeler (₹12/km)", icon: Car },
              ].map((mode) => {
                const Icon = mode.icon;
                const isSelected = transportMode === mode.id;
                return (
                  <button
                    type="button"
                    key={mode.id}
                    onClick={() => setTransportMode(mode.id as TransportMode)}
                    className={`p-3 rounded-2xl border text-center transition-all flex flex-col items-center justify-center space-y-1 ${
                      isSelected
                        ? "bg-surface-pale border-primary text-primary-dark font-bold shadow-subtle"
                        : "bg-surface-muted border-border text-charcoal-muted hover:bg-white"
                    }`}
                  >
                    <Icon className="w-5 h-5 text-primary" />
                    <span className="text-[11px]">{mode.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Preferred Radius Slider */}
          <div className="space-y-2 text-xs pt-2">
            <div className="flex justify-between font-bold text-charcoal">
              <span>Preferred Local Store Radius</span>
              <span className="text-primary">{preferredRadiusKm} km</span>
            </div>
            <input
              type="range"
              min="0.5"
              max="10"
              step="0.5"
              value={preferredRadiusKm}
              onChange={(e) => setPreferredRadiusKm(parseFloat(e.target.value))}
              className="w-full accent-primary"
            />
            <div className="flex justify-between text-[10px] text-charcoal-light">
              <span>0.5 km (Strictly Walkable)</span>
              <span>5 km</span>
              <span>10 km (City Wide)</span>
            </div>
          </div>
        </div>

        {/* Submit Button */}
        <div className="flex items-center justify-between">
          {savedSuccess && (
            <div className="flex items-center space-x-1.5 text-xs font-bold text-primary">
              <Check className="w-4 h-4" />
              <span>Priorities updated successfully!</span>
            </div>
          )}
          <div className="ml-auto">
            <button
              type="submit"
              disabled={saving}
              className="px-6 py-3 bg-primary hover:bg-primary-dark text-white rounded-2xl text-xs font-bold shadow-subtle flex items-center space-x-2 transition-all"
            >
              <Save className="w-4 h-4" />
              <span>{saving ? "Saving..." : "Save Preferences"}</span>
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
