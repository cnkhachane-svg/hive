import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Please log in to save trusted stores" }, { status: 401 });
    }

    const { id: storeId } = params;

    const existing = await prisma.trustedStore.findUnique({
      where: {
        userId_storeId: {
          userId: user.id,
          storeId,
        },
      },
    });

    if (existing) {
      await prisma.trustedStore.delete({
        where: { id: existing.id },
      });
      return NextResponse.json({ isTrusted: false });
    } else {
      await prisma.trustedStore.create({
        data: {
          userId: user.id,
          storeId,
          notes: "Marked as trusted local kirana store",
        },
      });
      return NextResponse.json({ isTrusted: true });
    }
  } catch (error) {
    console.error("Trust toggle error:", error);
    return NextResponse.json({ error: "Failed to update trusted store" }, { status: 500 });
  }
}
