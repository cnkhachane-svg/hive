import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ saved: [] });
    }

    const saved = await prisma.savedProduct.findMany({
      where: { userId: user.id },
      include: {
        product: {
          include: {
            category: true,
            onlineOffers: { orderBy: { pricePaise: "asc" }, take: 1 },
            storeInventory: {
              include: { store: true },
              orderBy: { pricePaise: "asc" },
              take: 1,
            },
          },
        },
      },
    });

    return NextResponse.json({
      saved: saved.map((s) => ({
        id: s.id,
        productId: s.product.id,
        name: s.product.name,
        brand: s.product.brand,
        category: s.product.category.name,
        standardQuantity: s.product.standardQuantity,
        imageUrl: s.product.imageUrl,
        bestOnlinePricePaise: s.product.onlineOffers[0]?.pricePaise || 0,
        bestKiranaPricePaise: s.product.storeInventory[0]?.pricePaise || 0,
      })),
    });
  } catch (error) {
    console.error("Saved products error:", error);
    return NextResponse.json({ error: "Failed to fetch saved products" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Please log in to save products" }, { status: 401 });
    }

    const { productId } = await request.json();
    if (!productId) {
      return NextResponse.json({ error: "Product ID required" }, { status: 400 });
    }

    const existing = await prisma.savedProduct.findUnique({
      where: {
        userId_productId: {
          userId: user.id,
          productId,
        },
      },
    });

    if (existing) {
      await prisma.savedProduct.delete({ where: { id: existing.id } });
      return NextResponse.json({ isSaved: false });
    } else {
      await prisma.savedProduct.create({
        data: {
          userId: user.id,
          productId,
        },
      });
      return NextResponse.json({ isSaved: true });
    }
  } catch (error) {
    console.error("Toggle saved error:", error);
    return NextResponse.json({ error: "Failed to update saved item" }, { status: 500 });
  }
}
