import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user || (user.role !== "STORE_OWNER" && user.role !== "ADMIN")) {
      return NextResponse.json({ error: "Unauthorized. Store Owner role required." }, { status: 403 });
    }

    // Find store owned by this user, or fallback to first store for admin
    let store = await prisma.store.findFirst({
      where: user.role === "ADMIN" ? {} : { ownerId: user.id },
      include: {
        inventory: {
          include: {
            product: {
              include: { category: true },
            },
          },
          orderBy: { lastUpdated: "desc" },
        },
      },
    });

    if (!store) {
      // If store owner has no store yet, attach them to Apna Kirana for smooth demo experience
      const firstStore = await prisma.store.findFirst();
      if (firstStore) {
        await prisma.store.update({
          where: { id: firstStore.id },
          data: { ownerId: user.id },
        });
        store = await prisma.store.findUnique({
          where: { id: firstStore.id },
          include: {
            inventory: {
              include: {
                product: { include: { category: true } },
              },
            },
          },
        });
      }
    }

    const allProducts = await prisma.product.findMany({
      select: { id: true, name: true, brand: true, standardQuantity: true },
    });

    return NextResponse.json({ store, allProducts });
  } catch (error) {
    console.error("Store inventory error:", error);
    return NextResponse.json({ error: "Failed to load store inventory" }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const user = await getCurrentUser();
    if (!user || (user.role !== "STORE_OWNER" && user.role !== "ADMIN")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const body = await request.json();
    const { inventoryId, pricePaise, inStock, stockStatus, stockQuantity, discountPaise } = body;

    if (!inventoryId) {
      return NextResponse.json({ error: "Inventory ID required" }, { status: 400 });
    }

    const updated = await prisma.storeInventory.update({
      where: { id: inventoryId },
      data: {
        ...(pricePaise !== undefined && { pricePaise: Number(pricePaise) }),
        ...(inStock !== undefined && { inStock: Boolean(inStock) }),
        ...(stockStatus && { stockStatus }),
        ...(stockQuantity !== undefined && { stockQuantity: Number(stockQuantity) }),
        ...(discountPaise !== undefined && { discountPaise: Number(discountPaise) }),
        lastUpdated: new Date(),
        source: "STORE_OWNER",
      },
    });

    return NextResponse.json({ success: true, item: updated });
  } catch (error) {
    console.error("Update inventory error:", error);
    return NextResponse.json({ error: "Failed to update inventory" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const user = await getCurrentUser();
    if (!user || (user.role !== "STORE_OWNER" && user.role !== "ADMIN")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const body = await request.json();
    const { storeId, productId, pricePaise, stockQuantity = 20, discountPaise = 0 } = body;

    if (!storeId || !productId || !pricePaise) {
      return NextResponse.json({ error: "Store, Product and Price are required" }, { status: 400 });
    }

    const item = await prisma.storeInventory.upsert({
      where: {
        storeId_productId: {
          storeId,
          productId,
        },
      },
      update: {
        pricePaise: Number(pricePaise),
        stockQuantity: Number(stockQuantity),
        discountPaise: Number(discountPaise),
        inStock: true,
        stockStatus: "IN_STOCK",
        lastUpdated: new Date(),
        source: "STORE_OWNER",
      },
      create: {
        storeId,
        productId,
        pricePaise: Number(pricePaise),
        stockQuantity: Number(stockQuantity),
        discountPaise: Number(discountPaise),
        inStock: true,
        stockStatus: "IN_STOCK",
        source: "STORE_OWNER",
      },
    });

    return NextResponse.json({ success: true, item });
  } catch (error) {
    console.error("Add inventory error:", error);
    return NextResponse.json({ error: "Failed to add product to inventory" }, { status: 500 });
  }
}
