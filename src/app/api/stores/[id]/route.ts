import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const user = await getCurrentUser();

    const store = await prisma.store.findUnique({
      where: { id },
      include: {
        inventory: {
          include: {
            product: {
              include: {
                category: true,
              },
            },
          },
          orderBy: { inStock: "desc" },
        },
        feedback: {
          include: {
            user: {
              select: { name: true },
            },
          },
          orderBy: { createdAt: "desc" },
          take: 10,
        },
        trustedBy: user ? { where: { userId: user.id } } : false,
      },
    });

    if (!store) {
      return NextResponse.json({ error: "Store not found" }, { status: 404 });
    }

    const isTrusted = Array.isArray(store.trustedBy) && store.trustedBy.length > 0;

    return NextResponse.json({
      store: {
        ...store,
        isTrusted,
        distanceKm: 0.35, // Demo distance for Kothrud
      },
    });
  } catch (error) {
    console.error("Store detail error:", error);
    return NextResponse.json({ error: "Failed to load store" }, { status: 500 });
  }
}
