import {
  BasketScenario,
  HybridOptimizedItem,
  HybridOptimizationResult,
  formatINR,
} from "./types";

export interface BasketInputItem {
  productId: string;
  productName: string;
  brand: string;
  quantity: number;
  unit: string;
  onlineOffer: {
    platform: string;
    pricePaise: number;
    inStock: boolean;
    estimatedMinutes: number;
  };
  kiranaOffer: {
    storeName: string;
    pricePaise: number;
    inStock: boolean;
    distanceKm: number;
    estimatedMinutes: number;
  };
}

/**
 * Optimizes a multi-product basket across All-Online, All-Local, and Hybrid options
 */
export function optimizeBasket(
  items: BasketInputItem[],
  config: {
    singleOnlineDeliveryFeePaise?: number;
    singleLocalTravelCostPaise?: number;
    freeDeliveryThresholdPaise?: number;
  } = {}
): HybridOptimizationResult {
  if (!items || items.length === 0) {
    const emptyScenario: BasketScenario = {
      type: "HYBRID",
      title: "Empty Basket",
      itemsCostPaise: 0,
      deliveryOrTravelFeePaise: 0,
      serviceFeePaise: 0,
      discountPaise: 0,
      totalEffectivePaise: 0,
      estimatedMinutes: 0,
      totalStops: 0,
      savingsVsAlternativePaise: 0,
      items: [],
    };
    return {
      recommendedScenario: "HYBRID",
      headline: "Basket is empty",
      explanation: "Add items to your smart list to calculate optimization.",
      savingsPaise: 0,
      scenarios: {
        allOnline: emptyScenario,
        allLocal: emptyScenario,
        hybrid: emptyScenario,
      },
      hybridItems: [],
      tradeoffAnalysis: "No items present to analyze.",
    };
  }

  const baseDeliveryFee = config.singleOnlineDeliveryFeePaise ?? 2500; // ₹25
  const freeThreshold = config.freeDeliveryThresholdPaise ?? 50000; // Free delivery above ₹500
  const travelCost = config.singleLocalTravelCostPaise ?? 0; // ₹0 default walking travel

  // 1. Calculate All-Online Scenario
  let onlineItemsTotalPaise = 0;
  let onlineMaxMinutes = 20;
  const allOnlineItems: BasketScenario["items"] = [];

  for (const item of items) {
    const cost = item.onlineOffer.pricePaise * item.quantity;
    onlineItemsTotalPaise += cost;
    onlineMaxMinutes = Math.max(onlineMaxMinutes, item.onlineOffer.estimatedMinutes);
    allOnlineItems.push({
      productId: item.productId,
      productName: item.productName,
      quantity: item.quantity,
      source: "ONLINE",
      vendor: item.onlineOffer.platform,
      effectivePaise: cost,
    });
  }

  const onlineDeliveryFee = onlineItemsTotalPaise >= freeThreshold ? 0 : baseDeliveryFee;
  const allOnlineTotalEffective = onlineItemsTotalPaise + onlineDeliveryFee;

  const allOnlineScenario: BasketScenario = {
    type: "ONLINE",
    title: "All-Online Basket",
    itemsCostPaise: onlineItemsTotalPaise,
    deliveryOrTravelFeePaise: onlineDeliveryFee,
    serviceFeePaise: 0,
    discountPaise: 0,
    totalEffectivePaise: allOnlineTotalEffective,
    estimatedMinutes: onlineMaxMinutes,
    totalStops: 1, // Single doorstep delivery
    savingsVsAlternativePaise: 0,
    items: allOnlineItems,
  };

  // 2. Calculate All-Local Scenario
  let localItemsTotalPaise = 0;
  let localMaxMinutes = 5;
  const allLocalItems: BasketScenario["items"] = [];

  for (const item of items) {
    const cost = item.kiranaOffer.pricePaise * item.quantity;
    localItemsTotalPaise += cost;
    localMaxMinutes = Math.max(localMaxMinutes, item.kiranaOffer.estimatedMinutes);
    allLocalItems.push({
      productId: item.productId,
      productName: item.productName,
      quantity: item.quantity,
      source: "KIRANA",
      vendor: item.kiranaOffer.storeName,
      effectivePaise: cost,
    });
  }

  const allLocalTotalEffective = localItemsTotalPaise + travelCost;

  const allLocalScenario: BasketScenario = {
    type: "KIRANA",
    title: "All-Local Kirana Basket",
    itemsCostPaise: localItemsTotalPaise,
    deliveryOrTravelFeePaise: travelCost,
    serviceFeePaise: 0,
    discountPaise: 0,
    totalEffectivePaise: allLocalTotalEffective,
    estimatedMinutes: localMaxMinutes,
    totalStops: 1, // Single trip to local kirana
    savingsVsAlternativePaise: 0,
    items: allLocalItems,
  };

  // 3. Calculate Hybrid Scenario (Item-by-item optimization)
  const hybridItems: HybridOptimizedItem[] = [];
  const hybridScenarioItems: BasketScenario["items"] = [];
  let hybridItemsTotalPaise = 0;
  let hasOnlineItems = false;
  let hasKiranaItems = false;
  let hybridEstimatedMinutes = 0;

  for (const item of items) {
    const onlineCost = item.onlineOffer.pricePaise * item.quantity;
    const kiranaCost = item.kiranaOffer.pricePaise * item.quantity;

    // Determine cheaper unit price
    let chosenSource: "ONLINE" | "KIRANA" = "KIRANA";
    let chosenVendor = item.kiranaOffer.storeName;
    let chosenPrice = item.kiranaOffer.pricePaise;
    let chosenTotal = kiranaCost;
    let savingsVsAlt = 0;
    let reason = "";

    if (item.onlineOffer.inStock && (!item.kiranaOffer.inStock || onlineCost < kiranaCost)) {
      chosenSource = "ONLINE";
      chosenVendor = item.onlineOffer.platform;
      chosenPrice = item.onlineOffer.pricePaise;
      chosenTotal = onlineCost;
      savingsVsAlt = kiranaCost - onlineCost;
      reason = `Online is ${formatINR(savingsVsAlt)} cheaper (${item.onlineOffer.platform})`;
      hasOnlineItems = true;
      hybridEstimatedMinutes = Math.max(hybridEstimatedMinutes, item.onlineOffer.estimatedMinutes);
    } else {
      chosenSource = "KIRANA";
      chosenVendor = item.kiranaOffer.storeName;
      chosenPrice = item.kiranaOffer.pricePaise;
      chosenTotal = kiranaCost;
      savingsVsAlt = Math.max(0, onlineCost - kiranaCost);
      reason = savingsVsAlt > 0 
        ? `Kirana is ${formatINR(savingsVsAlt)} cheaper (${item.kiranaOffer.storeName})`
        : `Immediate local pickup at ${item.kiranaOffer.storeName}`;
      hasKiranaItems = true;
      hybridEstimatedMinutes = Math.max(hybridEstimatedMinutes, item.kiranaOffer.estimatedMinutes);
    }

    hybridItemsTotalPaise += chosenTotal;

    hybridItems.push({
      productId: item.productId,
      productName: item.productName,
      brand: item.brand,
      quantity: item.quantity,
      unit: item.unit,
      chosenSource,
      chosenStoreOrPlatform: chosenVendor,
      itemPricePaise: chosenPrice,
      itemTotalPaise: chosenTotal,
      onlinePricePaise: item.onlineOffer.pricePaise,
      kiranaPricePaise: item.kiranaOffer.pricePaise,
      savingsAgainstAlternatePaise: savingsVsAlt,
      reason,
    });

    hybridScenarioItems.push({
      productId: item.productId,
      productName: item.productName,
      quantity: item.quantity,
      source: chosenSource,
      vendor: chosenVendor,
      effectivePaise: chosenTotal,
    });
  }

  // Add delivery fees only if an online order is actually placed
  const hybridOnlineTotal = hybridItems
    .filter((i) => i.chosenSource === "ONLINE")
    .reduce((sum, i) => sum + i.itemTotalPaise, 0);

  const hybridDeliveryFee = hasOnlineItems
    ? hybridOnlineTotal >= freeThreshold
      ? 0
      : baseDeliveryFee
    : 0;

  const hybridTravelFee = hasKiranaItems ? travelCost : 0;
  const hybridTotalEffective = hybridItemsTotalPaise + hybridDeliveryFee + hybridTravelFee;

  const hybridScenario: BasketScenario = {
    type: "HYBRID",
    title: "Optimized Hybrid Basket",
    itemsCostPaise: hybridItemsTotalPaise,
    deliveryOrTravelFeePaise: hybridDeliveryFee + hybridTravelFee,
    serviceFeePaise: 0,
    discountPaise: 0,
    totalEffectivePaise: hybridTotalEffective,
    estimatedMinutes: hybridEstimatedMinutes,
    totalStops: (hasOnlineItems ? 1 : 0) + (hasKiranaItems ? 1 : 0),
    savingsVsAlternativePaise: 0,
    items: hybridScenarioItems,
  };

  // 4. Compare all 3 Scenarios and Determine Recommendation
  const options = [
    { type: "HYBRID" as const, cost: hybridTotalEffective, scenario: hybridScenario },
    { type: "KIRANA" as const, cost: allLocalTotalEffective, scenario: allLocalScenario },
    { type: "ONLINE" as const, cost: allOnlineTotalEffective, scenario: allOnlineScenario },
  ];

  // Sort by lowest total effective cost
  options.sort((a, b) => a.cost - b.cost);
  const best = options[0];

  // Also check if hybrid is identical to all-local or all-online:
  let recommendedScenario: "ONLINE" | "KIRANA" | "HYBRID" = best.type;
  if (recommendedScenario === "HYBRID") {
    if (!hasOnlineItems) recommendedScenario = "KIRANA";
    else if (!hasKiranaItems) recommendedScenario = "ONLINE";
  }

  // Calculate savings vs next best alternative
  const secondBestCost = options[1]?.cost ?? best.cost;
  const worstCost = Math.max(allOnlineTotalEffective, allLocalTotalEffective, hybridTotalEffective);
  const maxSavings = Math.max(0, worstCost - best.cost);

  let headline = "";
  let explanation = "";
  let tradeoffAnalysis = "";

  if (recommendedScenario === "HYBRID") {
    headline = "HIVE Recommends the Optimized Hybrid Basket 🐝";
    const onlineItemCount = hybridItems.filter((i) => i.chosenSource === "ONLINE").length;
    const kiranaItemCount = hybridItems.filter((i) => i.chosenSource === "KIRANA").length;
    explanation = `Save ${formatINR(maxSavings)} overall by splitting your order: order ${onlineItemCount} bulk/discount items online and pick up ${kiranaItemCount} staples at your local kirana.`;
    tradeoffAnalysis = `Requires 1 quick walk to the local kirana (~${localMaxMinutes} mins) while the remaining items are delivered to your door in ~${onlineMaxMinutes} mins.`;
  } else if (recommendedScenario === "KIRANA") {
    headline = "HIVE Recommends Buying Everything Locally 🏪";
    explanation = `Purchasing all items at your neighborhood kirana costs ${formatINR(best.cost)}, saving ${formatINR(maxSavings)} compared with online orders without waiting for deliveries.`;
    tradeoffAnalysis = `Everything ready in ~${localMaxMinutes} minutes from a single trusted store visit. Zero online delivery surcharges.`;
  } else {
    headline = "HIVE Recommends Ordering Everything Online 📦";
    explanation = `Online platforms offer combined basket savings of ${formatINR(maxSavings)} with free/discounted doorstep delivery for your entire list.`;
    tradeoffAnalysis = `Arrives in ~${onlineMaxMinutes} mins right at your door with zero travel required.`;
  }

  // Set relative savings for scenarios
  allOnlineScenario.savingsVsAlternativePaise = Math.max(0, worstCost - allOnlineTotalEffective);
  allLocalScenario.savingsVsAlternativePaise = Math.max(0, worstCost - allLocalTotalEffective);
  hybridScenario.savingsVsAlternativePaise = Math.max(0, worstCost - hybridTotalEffective);

  return {
    recommendedScenario,
    headline,
    explanation,
    savingsPaise: maxSavings,
    scenarios: {
      allOnline: allOnlineScenario,
      allLocal: allLocalScenario,
      hybrid: hybridScenario,
    },
    hybridItems,
    tradeoffAnalysis,
  };
}
