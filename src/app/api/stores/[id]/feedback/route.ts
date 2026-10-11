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
      return NextResponse.json({ error: "Please log in to leave feedback" }, { status: 401 });
    }

    const { id: storeId } = params;
    const body = await request.json();
    const { rating, review, actualSpentPaise, savedAmountPaise, productId } = body;

    const feedback = await prisma.purchaseFeedback.create({
      data: {
        userId: user.id,
        storeId,
        productId: productId || null,
        rating: Math.min(5, Math.max(1, Number(rating) || 5)),
        review: review?.trim() || null,
        actualSpentPaise: Number(actualSpentPaise) || 0,
        savedAmountPaise: Number(savedAmountPaise) || 0,
        isVerifiedPurchase: true,
      },
    });

    // Update store average rating
    const allStoreFeedback = await prisma.purchaseFeedback.findMany({
      where: { storeId },
      select: { rating: true },
    });

    const avgRating =
      allStoreFeedback.reduce((sum, f) => sum + f.rating, 0) / allStoreFeedback.length;

    await prisma.store.update({
      where: { id: storeId },
      data: {
        rating: Math.round(avgRating * 10) / 10,
        ratingCount: allStoreFeedback.length,
      },
    });

    return NextResponse.json({ success: true, feedback });
  } catch (error) {
    console.error("Feedback error:", error);
    return NextResponse.json({ error: "Failed to record feedback" }, { status: 500 });
  }
}
