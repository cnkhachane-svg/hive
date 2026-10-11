import {
  OnlineOption,
  KiranaOption,
  UserPreferencesConfig,
  RecommendationResult,
  RecommendationScore,
  formatINR,
} from "./types";

export const DEFAULT_PREFERENCES: UserPreferencesConfig = {
  mainPriority: "COST",
  urgency: "NOT_URGENT",
  preferredRadiusKm: 3.0,
  transportMode: "WALK",
  walkCostPerKm: 0,
  bikeCostPerKm: 500, // ₹5/km
  carCostPerKm: 1200, // ₹12/km
};

/**
 * Calculates travel cost in paise for a round trip to a local kirana store
 */
export function calculateTravelCostPaise(
  distanceKm: number,
  mode: "WALK" | "BIKE" | "CAR" = "WALK",
  walkCostPerKm: number = 0,
  bikeCostPerKm: number = 500,
  carCostPerKm: number = 1200
): number {
  if (mode === "WALK") {
    return Math.round(distanceKm * walkCostPerKm * 2);
  }
  if (mode === "BIKE") {
    return Math.round(distanceKm * bikeCostPerKm * 2);
  }
  return Math.round(distanceKm * carCostPerKm * 2);
}

/**
 * Computes online effective cost:
 * Online effective cost = product price + delivery fee + service fees + other applicable charges − discounts
 */
export function calculateOnlineEffectiveCostPaise(option: {
  pricePaise: number;
  deliveryFeePaise: number;
  serviceFeePaise?: number;
  discountPaise?: number;
}): number {
  const service = option.serviceFeePaise ?? 0;
  const discount = option.discountPaise ?? 0;
  return Math.max(0, option.pricePaise + option.deliveryFeePaise + service - discount);
}

/**
 * Computes kirana effective cost:
 * Kirana effective cost = product price + estimated travel cost + other applicable costs − local discounts
 */
export function calculateKiranaEffectiveCostPaise(option: {
  pricePaise: number;
  travelCostPaise?: number;
  discountPaise?: number;
  otherChargesPaise?: number;
}): number {
  const travel = option.travelCostPaise ?? 0;
  const discount = option.discountPaise ?? 0;
  const other = option.otherChargesPaise ?? 0;
  return Math.max(0, option.pricePaise + travel + other - discount);
}

/**
 * Evaluates options and computes deterministic recommendation scores
 */
export function evaluateRecommendation(
  online: OnlineOption,
  kirana: KiranaOption,
  preferences: UserPreferencesConfig = DEFAULT_PREFERENCES
): RecommendationResult {
  // 1. Feasibility Condition: check availability
  const onlineFeasible = online.inStock;
  const kiranaFeasible = kirana.inStock;

  // 2. Base weights adjusted by priority and urgency
  let wCost = 0.45;
  let wTime = 0.25;
  let wConvenience = 0.10;
  let wDistance = 0.10;
  let wTrust = 0.10;

  switch (preferences.mainPriority) {
    case "COST":
      wCost = 0.55;
      wTime = 0.15;
      wConvenience = 0.10;
      wDistance = 0.10;
      wTrust = 0.10;
      break;
    case "TIME":
      wCost = 0.20;
      wTime = 0.50;
      wConvenience = 0.10;
      wDistance = 0.10;
      wTrust = 0.10;
      break;
    case "CONVENIENCE":
      wCost = 0.25;
      wTime = 0.20;
      wConvenience = 0.40;
      wDistance = 0.05;
      wTrust = 0.10;
      break;
    case "TRUST":
      wCost = 0.25;
      wTime = 0.15;
      wConvenience = 0.10;
      wDistance = 0.10;
      wTrust = 0.40;
      break;
    case "DISTANCE":
      wCost = 0.25;
      wTime = 0.20;
      wConvenience = 0.05;
      wDistance = 0.40;
      wTrust = 0.10;
      break;
    case "AVAILABILITY":
      wCost = 0.30;
      wTime = 0.30;
      wConvenience = 0.10;
      wDistance = 0.15;
      wTrust = 0.15;
      break;
  }

  // Urgency modifier
  if (preferences.urgency === "RIGHT_NOW") {
    wTime = Math.min(0.65, wTime + 0.30);
    wCost = Math.max(0.15, wCost - 0.20);
    wConvenience = Math.max(0.05, wConvenience - 0.10);
  } else if (preferences.urgency === "FEW_HOURS") {
    wTime = Math.min(0.40, wTime + 0.10);
    wCost = Math.max(0.30, wCost - 0.10);
  }

  // Normalize weights sum to 1.0
  const totalWeight = wCost + wTime + wConvenience + wDistance + wTrust;
  wCost /= totalWeight;
  wTime /= totalWeight;
  wConvenience /= totalWeight;
  wDistance /= totalWeight;
  wTrust /= totalWeight;

  // 3. Compute factor sub-scores (0 - 100)
  // Cost scoring: compare relative to lower cost
  const minCost = Math.min(online.effectiveCostPaise, kirana.effectiveCostPaise);
  const maxCost = Math.max(online.effectiveCostPaise, kirana.effectiveCostPaise);
  const costDiff = maxCost - minCost;

  let onlineCostScore = 100;
  let kiranaCostScore = 100;
  if (costDiff > 0 && maxCost > 0) {
    const penalty = Math.min(70, Math.round((costDiff / maxCost) * 100));
    if (online.effectiveCostPaise > kirana.effectiveCostPaise) {
      onlineCostScore = Math.max(10, 100 - penalty);
    } else {
      kiranaCostScore = Math.max(10, 100 - penalty);
    }
  }

  // Time scoring: faster fulfillment = higher score
  // E.g. 4 mins -> ~95 score, 25 mins -> ~75 score, 120 mins -> ~40 score
  const onlineTimeScore = Math.max(10, Math.min(100, Math.round(100 - (online.estimatedMinutes / 120) * 80)));
  const kiranaTimeScore = Math.max(10, Math.min(100, Math.round(100 - (kirana.estimatedMinutes / 60) * 60)));

  // Convenience scoring:
  // Online delivers directly to home (+15 baseline convenience)
  const onlineConvenienceScore = 90;
  // Kirana requires stepping out, but gives immediate in-hand satisfaction
  const kiranaConvenienceScore = kirana.distanceKm <= 0.5 ? 85 : Math.max(30, 85 - Math.round(kirana.distanceKm * 20));

  // Distance scoring:
  // Online delivers from warehouse (neutral 70 score)
  const onlineDistanceScore = 70;
  // Kirana: 0.35 km is excellent (95), drops over distance
  const kiranaDistanceScore = Math.max(20, Math.min(100, Math.round(100 - (kirana.distanceKm / 5) * 80)));

  // Trust scoring:
  // Online platforms have standard platform trust (~80)
  const onlineTrustScore = 80;
  // Kirana: based on rating, verified status, and personal trust
  let kiranaTrustScore = Math.round((kirana.rating / 5.0) * 85);
  if (kirana.verified) kiranaTrustScore += 10;
  if (kirana.isTrustedByUser) kiranaTrustScore += 15;
  kiranaTrustScore = Math.min(100, Math.max(30, kiranaTrustScore));

  // If not feasible, score is 0
  const onlineFinal = onlineFeasible
    ? Math.round(
        onlineCostScore * wCost +
        onlineTimeScore * wTime +
        onlineConvenienceScore * wConvenience +
        onlineDistanceScore * wDistance +
        onlineTrustScore * wTrust
      )
    : 0;

  const kiranaFinal = kiranaFeasible
    ? Math.round(
        kiranaCostScore * wCost +
        kiranaTimeScore * wTime +
        kiranaConvenienceScore * wConvenience +
        kiranaDistanceScore * wDistance +
        kiranaTrustScore * wTrust
      )
    : 0;

  const onlineScores: RecommendationScore = {
    overallScore: onlineFinal,
    costScore: onlineCostScore,
    timeScore: onlineTimeScore,
    convenienceScore: onlineConvenienceScore,
    distanceScore: onlineDistanceScore,
    trustScore: onlineTrustScore,
  };

  const kiranaScores: RecommendationScore = {
    overallScore: kiranaFinal,
    costScore: kiranaCostScore,
    timeScore: kiranaTimeScore,
    convenienceScore: kiranaConvenienceScore,
    distanceScore: kiranaDistanceScore,
    trustScore: kiranaTrustScore,
  };

  // Determine Winner
  let winner: "ONLINE" | "KIRANA" | "TIE" = "TIE";
  if (!onlineFeasible && kiranaFeasible) {
    winner = "KIRANA";
  } else if (!kiranaFeasible && onlineFeasible) {
    winner = "ONLINE";
  } else if (kiranaFinal > onlineFinal) {
    winner = "KIRANA";
  } else if (onlineFinal > kiranaFinal) {
    winner = "ONLINE";
  } else {
    // If scores tie, break tie by lower effective cost
    winner = kirana.effectiveCostPaise <= online.effectiveCostPaise ? "KIRANA" : "ONLINE";
  }

  // Cost difference & savings
  const costDifferencePaise = Math.abs(online.effectiveCostPaise - kirana.effectiveCostPaise);
  const timeDifferenceMinutes = Math.abs(online.estimatedMinutes - kirana.estimatedMinutes);

  // Natural language explanations
  let headline = "";
  let explanation = "";
  let tradeOffSummary = "";

  if (winner === "KIRANA") {
    const savings = online.effectiveCostPaise - kirana.effectiveCostPaise;
    headline = "HIVE recommends Nearby Kirana";
    const distanceMeters = Math.round(kirana.distanceKm * 1000);

    if (savings > 0) {
      explanation = `Save ${formatINR(savings)} compared with online shopping. The product is available now, and ${kirana.storeName} is approximately ${distanceMeters < 1000 ? `${distanceMeters} metres` : `${kirana.distanceKm.toFixed(1)} km`} away (~${kirana.estimatedMinutes} mins).`;
    } else if (savings === 0) {
      explanation = `Both options have an identical cost of ${formatINR(kirana.effectiveCostPaise)}, but visiting ${kirana.storeName} is ${timeDifferenceMinutes} mins faster and supports your neighborhood store.`;
    } else {
      explanation = `Even though online costs ${formatINR(Math.abs(savings))} less, ${kirana.storeName} is reachable in just ${kirana.estimatedMinutes} minutes (${distanceMeters}m away), fulfilling your urgent need immediately.`;
    }

    if (online.effectiveCostPaise < kirana.effectiveCostPaise) {
      tradeOffSummary = `Trade-off: You pay ${formatINR(Math.abs(savings))} more at the kirana, but receive it ${timeDifferenceMinutes} minutes faster without waiting for delivery slots.`;
    } else {
      tradeOffSummary = `Zero trade-offs: Kirana is both cheaper by ${formatINR(savings)} and faster by ${timeDifferenceMinutes} minutes.`;
    }
  } else {
    const savings = kirana.effectiveCostPaise - online.effectiveCostPaise;
    headline = `HIVE recommends ${online.platform} (Online)`;
    if (savings > 0) {
      explanation = `Online shopping saves ${formatINR(savings)} after factoring in delivery fees. Delivered right to your doorstep in ~${online.estimatedMinutes} mins.`;
    } else {
      explanation = `Convenient doorstep delivery via ${online.platform} in ~${online.estimatedMinutes} mins aligns best with your convenience priority.`;
    }
    tradeOffSummary = `Trade-off: Delivered in ${online.estimatedMinutes} mins without stepping outside, compared to a ${kirana.estimatedMinutes}-min visit to ${kirana.storeName}.`;
  }

  return {
    winner,
    bestOptionTitle: winner === "KIRANA" ? kirana.storeName : online.platform,
    headline,
    explanation,
    savingsPaise: costDifferencePaise,
    timeDifferenceMinutes,
    onlineOption: online,
    kiranaOption: kirana,
    onlineScores,
    kiranaScores,
    weightsUsed: {
      cost: Math.round(wCost * 100),
      time: Math.round(wTime * 100),
      convenience: Math.round(wConvenience * 100),
      distance: Math.round(wDistance * 100),
      trust: Math.round(wTrust * 100),
    },
    tradeOffSummary,
  };
}
