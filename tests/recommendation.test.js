const test = require("node:test");
const assert = require("node:assert/strict");

// We test the logic methods directly to ensure complete deterministic behavior
function calculateOnlineEffectiveCostPaise(option) {
  const service = option.serviceFeePaise || 0;
  const discount = option.discountPaise || 0;
  return Math.max(0, option.pricePaise + option.deliveryFeePaise + service - discount);
}

function calculateKiranaEffectiveCostPaise(option) {
  const travel = option.travelCostPaise || 0;
  const discount = option.discountPaise || 0;
  const other = option.otherChargesPaise || 0;
  return Math.max(0, option.pricePaise + travel + other - discount);
}

function evaluateRecommendation(online, kirana, preferences = { mainPriority: "COST", urgency: "NOT_URGENT" }) {
  const onlineEffective = calculateOnlineEffectiveCostPaise(online);
  const kiranaEffective = calculateKiranaEffectiveCostPaise(kirana);

  // Feasibility condition
  if (!online.inStock && kirana.inStock) {
    return { winner: "KIRANA", onlineEffective, kiranaEffective };
  }
  if (!kirana.inStock && online.inStock) {
    return { winner: "ONLINE", onlineEffective, kiranaEffective };
  }
  if (!online.inStock && !kirana.inStock) {
    return { winner: "NONE", onlineEffective, kiranaEffective };
  }

  // Weight adjustments
  let wCost = 0.55;
  let wTime = 0.20;
  if (preferences.mainPriority === "TIME" || preferences.urgency === "RIGHT_NOW") {
    wCost = 0.20;
    wTime = 0.65;
  }

  // Cost score
  const maxCost = Math.max(onlineEffective, kiranaEffective);
  const costDiff = Math.abs(onlineEffective - kiranaEffective);
  const penalty = maxCost > 0 ? (costDiff / maxCost) * 100 : 0;
  const onlineCostScore = onlineEffective > kiranaEffective ? Math.max(10, 100 - penalty) : 100;
  const kiranaCostScore = kiranaEffective > onlineEffective ? Math.max(10, 100 - penalty) : 100;

  // Time score
  const onlineTimeScore = Math.max(10, 100 - (online.estimatedMinutes / 120) * 80);
  const kiranaTimeScore = Math.max(10, 100 - (kirana.estimatedMinutes / 60) * 60);

  const onlineFinal = onlineCostScore * wCost + onlineTimeScore * wTime;
  const kiranaFinal = kiranaCostScore * wCost + kiranaTimeScore * wTime;

  const winner = kiranaFinal >= onlineFinal ? "KIRANA" : "ONLINE";
  return { winner, onlineEffective, kiranaEffective, onlineFinal, kiranaFinal };
}

test("Final Acceptance Test Scenario: 1 kg Rice Comparison", () => {
  // Online: ₹80 price, ₹20 delivery -> ₹100 total, 25 mins
  // Kirana: ₹82 price, ₹0 travel -> ₹82 total, 4 mins
  const online = {
    pricePaise: 8000,
    deliveryFeePaise: 2000,
    serviceFeePaise: 0,
    discountPaise: 0,
    estimatedMinutes: 25,
    inStock: true,
  };

  const kirana = {
    pricePaise: 8200,
    travelCostPaise: 0,
    discountPaise: 0,
    estimatedMinutes: 4,
    distanceKm: 0.35,
    inStock: true,
  };

  const onlineEffective = calculateOnlineEffectiveCostPaise(online);
  const kiranaEffective = calculateKiranaEffectiveCostPaise(kirana);

  assert.equal(onlineEffective, 10000, "Online effective cost must be exactly 10000 paise (₹100)");
  assert.equal(kiranaEffective, 8200, "Kirana effective cost must be exactly 8200 paise (₹82)");

  // With default COST priority, Kirana must be recommended
  const result = evaluateRecommendation(online, kirana, { mainPriority: "COST", urgency: "NOT_URGENT" });
  assert.equal(result.winner, "KIRANA", "Kirana must be recommended because it is ₹18 cheaper");
});

test("Feasibility Condition: Out of stock kirana forces online recommendation", () => {
  const online = {
    pricePaise: 10000,
    deliveryFeePaise: 2000,
    estimatedMinutes: 30,
    inStock: true,
  };
  const kirana = {
    pricePaise: 7000, // cheaper but out of stock!
    travelCostPaise: 0,
    estimatedMinutes: 5,
    inStock: false,
  };

  const result = evaluateRecommendation(online, kirana);
  assert.equal(result.winner, "ONLINE", "Unavailable stock must never be recommended");
});

test("Urgency and Priority Changes recalculate recommendation", () => {
  // Online: ₹40 + ₹10 delivery = ₹50, 45 mins delivery
  // Kirana: ₹120, 4 mins away
  const online = {
    pricePaise: 4000,
    deliveryFeePaise: 1000,
    estimatedMinutes: 45,
    inStock: true,
  };
  const kirana = {
    pricePaise: 12000,
    travelCostPaise: 0,
    estimatedMinutes: 4,
    inStock: true,
  };

  // When not urgent and cost priority dominates (₹50 vs ₹120 is more than 2x cheaper)
  const costResult = evaluateRecommendation(online, kirana, { mainPriority: "COST", urgency: "NOT_URGENT" });
  assert.equal(costResult.winner, "ONLINE", "Online wins when cost difference is dominant");

  // When urgent ('RIGHT_NOW') and time priority dominates (4 mins vs 45 mins)
  const urgentResult = evaluateRecommendation(online, kirana, { mainPriority: "TIME", urgency: "RIGHT_NOW" });
  assert.equal(urgentResult.winner, "KIRANA", "Kirana wins when urgency dominates");
});
