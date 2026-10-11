import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { setSessionCookie, verifyPassword } from "@/lib/auth";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, password, demoRole } = body;

    // Fast-path demo login for hackathon judges & instant testing
    if (demoRole) {
      let targetEmail = "shopper@hive.in";
      if (demoRole === "STORE_OWNER" || demoRole === "owner") {
        targetEmail = "owner@hive.in";
      } else if (demoRole === "ADMIN" || demoRole === "admin") {
        targetEmail = "admin@hive.in";
      }

      const demoUser = await prisma.user.findUnique({
        where: { email: targetEmail },
      });

      if (!demoUser) {
        return NextResponse.json({ error: "Demo user not found. Run seed." }, { status: 404 });
      }

      setSessionCookie(demoUser.id);
      return NextResponse.json({
        success: true,
        user: {
          id: demoUser.id,
          name: demoUser.name,
          email: demoUser.email,
          role: demoUser.role,
        },
      });
    }

    if (!email || !password) {
      return NextResponse.json({ error: "Email and password are required" }, { status: 400 });
    }

    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase().trim() },
    });

    if (!user) {
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
    }

    const isValid = await verifyPassword(password, user.passwordHash);
    if (!isValid) {
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
    }

    setSessionCookie(user.id);
    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    console.error("Login error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
