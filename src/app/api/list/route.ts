import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const user = await getCurrentUser();

    // Find user's list or fallback to demo list
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
      // Return the seeded demo list for guests
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

    if (!list) {
      return NextResponse.json({ list: { id: "empty", name: "My Smart Basket", items: [] } });
    }

    const items = list.items.map((item) => {
      const bestOnline = item.product.onlineOffers[0];
      const bestStore = item.product.storeInventory[0];

      return {
        id: item.id,
        productId: item.productId,
        productName: item.product.name,
        brand: item.product.brand,
        standardQuantity: item.product.standardQuantity,
        unit: item.product.unit,
        imageUrl: item.product.imageUrl,
        quantity: item.quantity,
        selectedPlan: item.selectedPlan,
        onlineOffer: bestOnline
          ? {
              platform: bestOnline.platform,
              pricePaise: bestOnline.pricePaise,
              deliveryFeePaise: bestOnline.deliveryFeePaise,
              inStock: bestOnline.inStock,
              estimatedMinutes: bestOnline.estimatedMinutes,
            }
          : {
              platform: "Online",
              pricePaise: 99999,
              deliveryFeePaise: 2500,
              inStock: false,
              estimatedMinutes: 30,
            },
        kiranaOffer: bestStore
          ? {
              storeName: bestStore.store.name,
              pricePaise: bestStore.pricePaise,
              inStock: bestStore.inStock,
              distanceKm: 0.35,
              estimatedMinutes: 4,
            }
          : {
              storeName: "Local Store",
              pricePaise: 99999,
              inStock: false,
              distanceKm: 0.5,
              estimatedMinutes: 10,
            },
      };
    });

    return NextResponse.json({
      list: {
        id: list.id,
        name: list.name,
        isSaved: list.isSaved,
        items,
      },
    });
  } catch (error) {
    console.error("Shopping list fetch error:", error);
    return NextResponse.json({ error: "Failed to fetch shopping list" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const user = await getCurrentUser();
    const body = await request.json();
    const { productId, quantity = 1 } = body;

    if (!productId) {
      return NextResponse.json({ error: "Product ID required" }, { status: 400 });
    }

    // Get or create shopping list
    let list = user
      ? await prisma.shoppingList.findFirst({ where: { userId: user.id } })
      : await prisma.shoppingList.findFirst();

    if (!list) {
      list = await prisma.shoppingList.create({
        data: {
          userId: user?.id || null,
          name: "My Smart Basket",
        },
      });
    }

    const existingItem = await prisma.shoppingListItem.findUnique({
      where: {
        shoppingListId_productId: {
          shoppingListId: list.id,
          productId,
        },
      },
    });

    if (existingItem) {
      const updated = await prisma.shoppingListItem.update({
        where: { id: existingItem.id },
        data: { quantity: existingItem.quantity + Number(quantity) },
      });
      return NextResponse.json({ success: true, item: updated });
    } else {
      const created = await prisma.shoppingListItem.create({
        data: {
          shoppingListId: list.id,
          productId,
          quantity: Number(quantity),
          selectedPlan: "AUTO",
        },
      });
      return NextResponse.json({ success: true, item: created });
    }
  } catch (error) {
    console.error("Add item error:", error);
    return NextResponse.json({ error: "Failed to add item to basket" }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const { itemId, quantity, selectedPlan } = body;

    if (!itemId) {
      return NextResponse.json({ error: "Item ID required" }, { status: 400 });
    }

    if (quantity !== undefined && quantity <= 0) {
      await prisma.shoppingListItem.delete({ where: { id: itemId } });
      return NextResponse.json({ success: true, deleted: true });
    }

    const updated = await prisma.shoppingListItem.update({
      where: { id: itemId },
      data: {
        ...(quantity !== undefined && { quantity: Number(quantity) }),
        ...(selectedPlan && { selectedPlan }),
      },
    });

    return NextResponse.json({ success: true, item: updated });
  } catch (error) {
    console.error("Update item error:", error);
    return NextResponse.json({ error: "Failed to update item" }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const itemId = searchParams.get("itemId");
    const clearAll = searchParams.get("clearAll");

    if (clearAll) {
      const user = await getCurrentUser();
      const list = user
        ? await prisma.shoppingList.findFirst({ where: { userId: user.id } })
        : await prisma.shoppingList.findFirst();

      if (list) {
        await prisma.shoppingListItem.deleteMany({
          where: { shoppingListId: list.id },
        });
      }
      return NextResponse.json({ success: true, cleared: true });
    }

    if (itemId) {
      await prisma.shoppingListItem.delete({ where: { id: itemId } });
      return NextResponse.json({ success: true, deleted: true });
    }

    return NextResponse.json({ error: "Item ID or clearAll required" }, { status: 400 });
  } catch (error) {
    console.error("Delete item error:", error);
    return NextResponse.json({ error: "Failed to remove item" }, { status: 500 });
  }
}
