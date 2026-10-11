import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    const product = await prisma.product.findUnique({
      where: { id },
      include: {
        category: true,
        onlineOffers: {
          orderBy: { pricePaise: "asc" },
        },
        storeInventory: {
          include: {
            store: true,
          },
          orderBy: { pricePaise: "asc" },
        },
      },
    });

    if (!product) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    return NextResponse.json({ product });
  } catch (error) {
    console.error("Product detail error:", error);
    return NextResponse.json({ error: "Failed to load product" }, { status: 500 });
  }
}
