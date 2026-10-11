export type UserRole = "USER" | "STORE_OWNER" | "ADMIN";

export type PriorityType =
  | "COST"
  | "TIME"
  | "CONVENIENCE"
  | "AVAILABILITY"
  | "TRUST"
  | "DISTANCE";

export type UrgencyType = "NOT_URGENT" | "FEW_HOURS" | "RIGHT_NOW";

export type TransportMode = "WALK" | "BIKE" | "CAR";

export interface UserPreferencesConfig {
  mainPriority: PriorityType;
  urgency: UrgencyType;
  preferredRadiusKm: number;
  transportMode: TransportMode;
  walkCostPerKm: number; // in paise
  bikeCostPerKm: number; // in paise
  carCostPerKm: number; // in paise
}

export interface OnlineOption {
  id: string;
  platform: string;
  pricePaise: number;
  deliveryFeePaise: number;
  serviceFeePaise: number;
  discountPaise: number;
  effectiveCostPaise: number;
  estimatedMinutes: number;
  inStock: boolean;
  lastUpdated: string | Date;
}

export interface KiranaOption {
  id: string;
  storeId: string;
  storeName: string;
  locality: string;
  distanceKm: number;
  estimatedMinutes: number;
  pricePaise: number;
  travelCostPaise: number;
  discountPaise: number;
  effectiveCostPaise: number;
  inStock: boolean;
  stockStatus: string;
  stockQuantity: number;
  rating: number;
  ratingCount: number;
  verified: boolean;
  isTrustedByUser?: boolean;
  phone: string;
  openingHours: string;
  lastUpdated: string | Date;
}

export interface RecommendationScore {
  overallScore: number; // 0 - 100
  costScore: number;
  timeScore: number;
  convenienceScore: number;
  distanceScore: number;
  trustScore: number;
}

export interface RecommendationResult {
  winner: "ONLINE" | "KIRANA" | "TIE";
  bestOptionTitle: string;
  headline: string;
  explanation: string;
  savingsPaise: number;
  timeDifferenceMinutes: number;
  onlineOption: OnlineOption;
  kiranaOption: KiranaOption;
  onlineScores: RecommendationScore;
  kiranaScores: RecommendationScore;
  weightsUsed: {
    cost: number;
    time: number;
    convenience: number;
    distance: number;
    trust: number;
  };
  tradeOffSummary: string;
}

export interface HybridOptimizedItem {
  productId: string;
  productName: string;
  brand: string;
  quantity: number;
  unit: string;
  chosenSource: "ONLINE" | "KIRANA";
  chosenStoreOrPlatform: string;
  itemPricePaise: number;
  itemTotalPaise: number;
  onlinePricePaise: number;
  kiranaPricePaise: number;
  savingsAgainstAlternatePaise: number;
  reason: string;
}

export interface BasketScenario {
  type: "ONLINE" | "KIRANA" | "HYBRID";
  title: string;
  itemsCostPaise: number;
  deliveryOrTravelFeePaise: number;
  serviceFeePaise: number;
  discountPaise: number;
  totalEffectivePaise: number;
  estimatedMinutes: number;
  totalStops: number;
  savingsVsAlternativePaise: number;
  items: Array<{
    productId: string;
    productName: string;
    quantity: number;
    source: "ONLINE" | "KIRANA";
    vendor: string;
    effectivePaise: number;
  }>;
}

export interface HybridOptimizationResult {
  recommendedScenario: "ONLINE" | "KIRANA" | "HYBRID";
  headline: string;
  explanation: string;
  savingsPaise: number;
  scenarios: {
    allOnline: BasketScenario;
    allLocal: BasketScenario;
    hybrid: BasketScenario;
  };
  hybridItems: HybridOptimizedItem[];
  tradeoffAnalysis: string;
}

export function formatINR(paise: number): string {
  const rupees = paise / 100;
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 2,
    minimumFractionDigits: rupees % 1 === 0 ? 0 : 2,
  }).format(rupees);
}

export function paiseToRupees(paise: number): number {
  return Math.round(paise) / 100;
}

export function rupeesToPaise(rupees: number): number {
  return Math.round(rupees * 100);
}
