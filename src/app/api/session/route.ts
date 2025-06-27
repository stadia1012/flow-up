// app/api/org-tree/route.ts
import { NextResponse } from "next/server";
import { getServerSession } from 'next-auth';
import { authOptions } from "@/lib/auth/auth";
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

export async function GET() {
  const session = await getServerSession(authOptions);


  return NextResponse.json({
    session
  });
}
