import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized. Admin role required." }, { status: 403 });
    }

    const [userCount, storeCount, productCount, comparisonCount] = await Promise.all([
      prisma.user.count(),
      prisma.store.count(),
      prisma.product.count(),
      prisma.comparison.count(),
    ]);

    const users = await prisma.user.findMany({
      select: { id: true, name: true, email: true, role: true, createdAt: true },
      orderBy: { createdAt: "desc" },
    });

    const stores = await prisma.store.findMany({
      include: {
        _count: { select: { inventory: true, feedback: true } },
      },
      orderBy: { name: "asc" },
    });

    const products = await prisma.product.findMany({
      include: {
        category: true,
        onlineOffers: true,
        storeInventory: true,
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({
      stats: { userCount, storeCount, productCount, comparisonCount },
      users,
      stores,
      products,
    });
  } catch (error) {
    console.error("Admin catalog error:", error);
    return NextResponse.json({ error: "Failed to load admin data" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const body = await request.json();
    const { name, brand, categoryId, standardQuantity, unit, imageUrl, onlinePricePaise, kiranaPricePaise } = body;

    if (!name || !brand || !categoryId) {
      return NextResponse.json({ error: "Name, brand and category are required" }, { status: 400 });
    }

    const product = await prisma.product.create({
      data: {
        name,
        brand,
        categoryId,
        standardQuantity: standardQuantity || "1 unit",
        unit: unit || "unit",
        imageUrl: imageUrl || "https://images.unsplash.com/photo-1542838132-92c53300491e?w=500&auto=format&fit=crop&q=60",
      },
    });

    // Add default online offer
    if (onlinePricePaise) {
      await prisma.onlineOffer.create({
        data: {
          platform: "Blinkit",
          productId: product.id,
          pricePaise: Number(onlinePricePaise),
          deliveryFeePaise: 2000,
          inStock: true,
          estimatedMinutes: 20,
        },
      });
    }

    // Add default kirana inventory to store 1
    if (kiranaPricePaise) {
      const firstStore = await prisma.store.findFirst();
      if (firstStore) {
        await prisma.storeInventory.create({
          data: {
            storeId: firstStore.id,
            productId: product.id,
            pricePaise: Number(kiranaPricePaise),
            inStock: true,
            stockQuantity: 25,
            source: "STORE_OWNER",
          },
        });
      }
    }

    return NextResponse.json({ success: true, product });
  } catch (error) {
    console.error("Admin product create error:", error);
    return NextResponse.json({ error: "Failed to create product" }, { status: 500 });
  }
}
