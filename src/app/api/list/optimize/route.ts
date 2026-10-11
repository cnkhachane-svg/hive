import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { optimizeBasket, BasketInputItem } from "@/lib/hybrid-optimizer";

export async function POST(request: Request) {
  try {
    const user = await getCurrentUser();
    const body = await request.json().catch(() => ({}));

    // Find active list
    let list = user
      ? await prisma.shoppingList.findFirst({
          where: { userId: user.id },
          include: {
            items: {
              include: {
                product: {
                  include: {
                    onlineOffers: { orderBy: { pricePaise: "asc" }, take: 1 },
                    storeInventory: {
                      include: { store: true },
                      orderBy: { pricePaise: "asc" },
                      take: 1,
                    },
                  },
                },
              },
            },
          },
        })
      : null;

    if (!list) {
      list = await prisma.shoppingList.findFirst({
        include: {
          items: {
            include: {
              product: {
                include: {
                  onlineOffers: { orderBy: { pricePaise: "asc" }, take: 1 },
                  storeInventory: {
                    include: { store: true },
                    orderBy: { pricePaise: "asc" },
                    take: 1,
                  },
                },
              },
            },
          },
        },
      });
    }

    if (!list || list.items.length === 0) {
      return NextResponse.json({
        result: optimizeBasket([]),
      });
    }

    const basketItems: BasketInputItem[] = list.items.map((item) => {
      const bestOnline = item.product.onlineOffers[0];
      const bestStore = item.product.storeInventory[0];

      return {
        productId: item.productId,
        productName: item.product.name,
        brand: item.product.brand,
        quantity: item.quantity,
        unit: item.product.unit,
        onlineOffer: {
          platform: bestOnline?.platform || "Online",
          pricePaise: bestOnline?.pricePaise || 99999,
          inStock: bestOnline ? bestOnline.inStock : false,
          estimatedMinutes: bestOnline?.estimatedMinutes || 30,
        },
        kiranaOffer: {
          storeName: bestStore?.store.name || "Apna Kirana",
          pricePaise: bestStore?.pricePaise || 99999,
          inStock: bestStore ? bestStore.inStock : false,
          distanceKm: 0.35,
          estimatedMinutes: 4,
        },
      };
    });

    const result = optimizeBasket(basketItems, {
      singleOnlineDeliveryFeePaise: 2500, // ₹25
      freeDeliveryThresholdPaise: 50000,  // ₹500
      singleLocalTravelCostPaise: 0,      // ₹0 walking
    });

    return NextResponse.json({ result });
  } catch (error) {
    console.error("Hybrid optimization error:", error);
    return NextResponse.json({ error: "Failed to optimize basket" }, { status: 500 });
  }
}
