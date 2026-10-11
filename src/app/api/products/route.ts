import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get("q")?.trim() || "";
    const categorySlug = searchParams.get("category");
    const sort = searchParams.get("sort") || "featured";

    const whereClause: any = {};

    if (query) {
      whereClause.OR = [
        { name: { contains: query } },
        { brand: { contains: query } },
      ];
    }

    if (categorySlug && categorySlug !== "all") {
      whereClause.category = { slug: categorySlug };
    }

    const products = await prisma.product.findMany({
      where: whereClause,
      include: {
        category: true,
        onlineOffers: {
          orderBy: { pricePaise: "asc" },
          take: 1,
        },
        storeInventory: {
          include: {
            store: true,
          },
          orderBy: { pricePaise: "asc" },
          take: 1,
        },
      },
      orderBy: sort === "name" ? { name: "asc" } : { createdAt: "desc" },
    });

    const categories = await prisma.productCategory.findMany({
      orderBy: { name: "asc" },
    });

    return NextResponse.json({
      products: products.map((p) => {
        const bestOnline = p.onlineOffers[0] || null;
        const bestStore = p.storeInventory[0] || null;

        return {
          id: p.id,
          name: p.name,
          brand: p.brand,
          category: p.category.name,
          categorySlug: p.category.slug,
          standardQuantity: p.standardQuantity,
          unit: p.unit,
          imageUrl: p.imageUrl,
          bestOnline: bestOnline
            ? {
                platform: bestOnline.platform,
                pricePaise: bestOnline.pricePaise,
                deliveryFeePaise: bestOnline.deliveryFeePaise,
                inStock: bestOnline.inStock,
                estimatedMinutes: bestOnline.estimatedMinutes,
              }
            : null,
          bestStore: bestStore
            ? {
                storeName: bestStore.store.name,
                pricePaise: bestStore.pricePaise,
                inStock: bestStore.inStock,
                locality: bestStore.store.locality,
                rating: bestStore.store.rating,
              }
            : null,
        };
      }),
      categories,
    });
  } catch (error) {
    console.error("Products fetch error:", error);
    return NextResponse.json({ error: "Failed to load products" }, { status: 500 });
  }
}
