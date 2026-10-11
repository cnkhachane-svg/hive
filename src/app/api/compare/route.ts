import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import {
  evaluateRecommendation,
  calculateTravelCostPaise,
  calculateOnlineEffectiveCostPaise,
  calculateKiranaEffectiveCostPaise,
  DEFAULT_PREFERENCES,
} from "@/lib/scoring";
import { OnlineOption, KiranaOption, UserPreferencesConfig } from "@/lib/types";

// Pune Kothrud Reference Coordinates
const DEFAULT_USER_LAT = 18.5089;
const DEFAULT_USER_LNG = 73.8050;

function haversineDistanceKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // Earth radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c * 100) / 100; // rounded to 2 decimal places
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { productId, userLat, userLng, preferences: customPreferences } = body;

    if (!productId) {
      return NextResponse.json({ error: "Product ID is required" }, { status: 400 });
    }

    const user = await getCurrentUser();
    let preferences: UserPreferencesConfig = { ...DEFAULT_PREFERENCES };

    if (user) {
      const userPrefs = await prisma.userPreferences.findUnique({
        where: { userId: user.id },
      });
      if (userPrefs) {
        preferences = {
          mainPriority: (userPrefs.mainPriority as any) || "COST",
          urgency: (userPrefs.urgency as any) || "NOT_URGENT",
          preferredRadiusKm: userPrefs.preferredRadiusKm || 3.0,
          transportMode: (userPrefs.transportMode as any) || "WALK",
          walkCostPerKm: userPrefs.walkCostPerKm || 0,
          bikeCostPerKm: userPrefs.bikeCostPerKm || 500,
          carCostPerKm: userPrefs.carCostPerKm || 1200,
        };
      }
    }

    // Merge any override sent by UI sliders
    if (customPreferences) {
      preferences = { ...preferences, ...customPreferences };
    }

    const product = await prisma.product.findUnique({
      where: { id: productId },
      include: {
        category: true,
        onlineOffers: {
          orderBy: { pricePaise: "asc" },
        },
        storeInventory: {
          include: {
            store: {
              include: {
                trustedBy: user ? { where: { userId: user.id } } : false,
              },
            },
          },
          orderBy: { pricePaise: "asc" },
        },
      },
    });

    if (!product) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    const onlineOffer = product.onlineOffers[0];
    const storeItem = product.storeInventory[0];

    if (!onlineOffer && !storeItem) {
      return NextResponse.json({ error: "No offers available for comparison" }, { status: 404 });
    }

    // 1. Prepare Online Option
    const onlineOption: OnlineOption = onlineOffer
      ? {
          id: onlineOffer.id,
          platform: onlineOffer.platform,
          pricePaise: onlineOffer.pricePaise,
          deliveryFeePaise: onlineOffer.deliveryFeePaise,
          serviceFeePaise: onlineOffer.serviceFeePaise,
          discountPaise: onlineOffer.discountPaise,
          effectiveCostPaise: calculateOnlineEffectiveCostPaise(onlineOffer),
          estimatedMinutes: onlineOffer.estimatedMinutes,
          inStock: onlineOffer.inStock,
          lastUpdated: onlineOffer.lastUpdated,
        }
      : {
          id: "none",
          platform: "Unavailable Online",
          pricePaise: 0,
          deliveryFeePaise: 0,
          serviceFeePaise: 0,
          discountPaise: 0,
          effectiveCostPaise: 0,
          estimatedMinutes: 999,
          inStock: false,
          lastUpdated: new Date(),
        };

    // 2. Prepare Kirana Option
    const lat = userLat || DEFAULT_USER_LAT;
    const lng = userLng || DEFAULT_USER_LNG;

    let kiranaOption: KiranaOption;

    if (storeItem) {
      // Calculate distance: if exact store lat/lng is stored, use Haversine
      let distanceKm = haversineDistanceKm(lat, lng, storeItem.store.lat, storeItem.store.lng);
      // Fallback minimum distance
      if (distanceKm < 0.1) distanceKm = 0.35; // 350m demo baseline for Apna Kirana

      const travelCostPaise = calculateTravelCostPaise(
        distanceKm,
        preferences.transportMode,
        preferences.walkCostPerKm,
        preferences.bikeCostPerKm,
        preferences.carCostPerKm
      );

      // Estimated time: walking is ~12 mins/km + 2 mins store wait
      const walkingMinutes = Math.max(3, Math.round(distanceKm * 10) + 1);

      kiranaOption = {
        id: storeItem.id,
        storeId: storeItem.store.id,
        storeName: storeItem.store.name,
        locality: storeItem.store.locality,
        distanceKm,
        estimatedMinutes: walkingMinutes,
        pricePaise: storeItem.pricePaise,
        travelCostPaise,
        discountPaise: storeItem.discountPaise,
        effectiveCostPaise: calculateKiranaEffectiveCostPaise({
          pricePaise: storeItem.pricePaise,
          travelCostPaise,
          discountPaise: storeItem.discountPaise,
        }),
        inStock: storeItem.inStock,
        stockStatus: storeItem.stockStatus,
        stockQuantity: storeItem.stockQuantity,
        rating: storeItem.store.rating,
        ratingCount: storeItem.store.ratingCount,
        verified: storeItem.store.verified,
        isTrustedByUser: Array.isArray(storeItem.store.trustedBy) && storeItem.store.trustedBy.length > 0,
        phone: storeItem.store.phone,
        openingHours: storeItem.store.openingHours,
        lastUpdated: storeItem.lastUpdated,
      };
    } else {
      kiranaOption = {
        id: "none",
        storeId: "none",
        storeName: "No Local Store Stock",
        locality: "Pune",
        distanceKm: 999,
        estimatedMinutes: 999,
        pricePaise: 0,
        travelCostPaise: 0,
        discountPaise: 0,
        effectiveCostPaise: 0,
        inStock: false,
        stockStatus: "OUT_OF_STOCK",
        stockQuantity: 0,
        rating: 0,
        ratingCount: 0,
        verified: false,
        isTrustedByUser: false,
        phone: "",
        openingHours: "",
        lastUpdated: new Date(),
      };
    }

    // 3. Compute Recommendation with deterministic formula
    const recommendation = evaluateRecommendation(onlineOption, kiranaOption, preferences);

    // 4. Save comparison record if user is logged in
    if (user) {
      await prisma.comparison.create({
        data: {
          userId: user.id,
          productId: product.id,
          recommendedSource: recommendation.winner,
          calculationDetails: JSON.stringify({
            onlineEffectivePaise: onlineOption.effectiveCostPaise,
            kiranaEffectivePaise: kiranaOption.effectiveCostPaise,
            savingsPaise: recommendation.savingsPaise,
            preferences,
          }),
        },
      });
    }

    return NextResponse.json({
      product: {
        id: product.id,
        name: product.name,
        brand: product.brand,
        standardQuantity: product.standardQuantity,
        unit: product.unit,
        category: product.category.name,
        imageUrl: product.imageUrl,
      },
      preferences,
      recommendation,
    });
  } catch (error) {
    console.error("Comparison error:", error);
    return NextResponse.json({ error: "Failed to perform comparison" }, { status: 500 });
  }
}
