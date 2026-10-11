import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get("q")?.trim() || "";
    const filter = searchParams.get("filter") || "all"; // all, verified, trusted, open

    const user = await getCurrentUser();

    const stores = await prisma.store.findMany({
      where: {
        ...(query && {
          OR: [
            { name: { contains: query } },
            { locality: { contains: query } },
          ],
        }),
        ...(filter === "verified" && { verified: true }),
        ...(filter === "open" && { isOpen: true }),
      },
      include: {
        inventory: {
          include: {
            product: true,
          },
        },
        trustedBy: user ? { where: { userId: user.id } } : false,
        _count: {
          select: { inventory: true, feedback: true },
        },
      },
      orderBy: { rating: "desc" },
    });

    // Approximate distance from Kothrud center for demo
    const storeResults = stores.map((s, idx) => {
      const isTrusted = Array.isArray(s.trustedBy) && s.trustedBy.length > 0;
      // Stable demo distance
      const distances = [0.35, 0.65, 1.4, 1.1, 1.8];
      const dist = distances[idx % distances.length];

      return {
        id: s.id,
        name: s.name,
        address: s.address,
        locality: s.locality,
        city: s.city,
        lat: s.lat,
        lng: s.lng,
        distanceKm: dist,
        phone: s.phone,
        openingHours: s.openingHours,
        isOpen: s.isOpen,
        verified: s.verified,
        rating: s.rating,
        ratingCount: s.ratingCount,
        productCount: s._count.inventory,
        feedbackCount: s._count.feedback,
        isTrusted,
        sampleProducts: s.inventory.slice(0, 4).map((inv) => ({
          name: inv.product.name,
          pricePaise: inv.pricePaise,
          inStock: inv.inStock,
        })),
      };
    });

    const filtered = filter === "trusted" 
      ? storeResults.filter((s) => s.isTrusted)
      : storeResults;

    return NextResponse.json({ stores: filtered });
  } catch (error) {
    console.error("Stores fetch error:", error);
    return NextResponse.json({ error: "Failed to fetch stores" }, { status: 500 });
  }
}
