import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ authenticated: false, user: null });
    }

    const fullUser = await prisma.user.findUnique({
      where: { id: user.id },
      include: {
        preferences: true,
        trustedStores: {
          select: { storeId: true },
        },
      },
    });

    return NextResponse.json({
      authenticated: true,
      user: {
        id: fullUser?.id,
        name: fullUser?.name,
        email: fullUser?.email,
        role: fullUser?.role,
        preferences: fullUser?.preferences,
        trustedStoreIds: fullUser?.trustedStores.map((t) => t.storeId) || [],
      },
    });
  } catch (error) {
    console.error("Auth me error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const {
      mainPriority,
      urgency,
      preferredRadiusKm,
      transportMode,
      walkCostPerKm,
      bikeCostPerKm,
      carCostPerKm,
      name,
    } = body;

    if (name) {
      await prisma.user.update({
        where: { id: user.id },
        data: { name: name.trim() },
      });
    }

    const updatedPrefs = await prisma.userPreferences.upsert({
      where: { userId: user.id },
      update: {
        ...(mainPriority && { mainPriority }),
        ...(urgency && { urgency }),
        ...(preferredRadiusKm !== undefined && { preferredRadiusKm: Number(preferredRadiusKm) }),
        ...(transportMode && { transportMode }),
        ...(walkCostPerKm !== undefined && { walkCostPerKm: Number(walkCostPerKm) }),
        ...(bikeCostPerKm !== undefined && { bikeCostPerKm: Number(bikeCostPerKm) }),
        ...(carCostPerKm !== undefined && { carCostPerKm: Number(carCostPerKm) }),
      },
      create: {
        userId: user.id,
        mainPriority: mainPriority || "COST",
        urgency: urgency || "NOT_URGENT",
        preferredRadiusKm: preferredRadiusKm ? Number(preferredRadiusKm) : 3.0,
        transportMode: transportMode || "WALK",
        walkCostPerKm: walkCostPerKm !== undefined ? Number(walkCostPerKm) : 0,
        bikeCostPerKm: bikeCostPerKm !== undefined ? Number(bikeCostPerKm) : 500,
        carCostPerKm: carCostPerKm !== undefined ? Number(carCostPerKm) : 1200,
      },
    });

    return NextResponse.json({ success: true, preferences: updatedPrefs });
  } catch (error) {
    console.error("Preferences update error:", error);
    return NextResponse.json({ error: "Failed to update preferences" }, { status: 500 });
  }
}
