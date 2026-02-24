import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const sponsor = await prisma.sponsor.findUnique({
      where: { id },
      select: {
        id: true,
        nome: true,
        empresa: true,
        briefing_areas: true,
        briefing_systems: true,
        briefing_ai_usage: true,
        form_status: true,
        form_responses: true,
        data_limite: true,
      },
    });

    if (!sponsor) {
      return NextResponse.json(
        { success: false, error: "Sponsor não encontrado" },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, sponsor });
  } catch (error) {
    console.error("[GET /api/sponsors/[id]]", error);
    return NextResponse.json(
      { success: false, error: "Erro ao buscar sponsor" },
      { status: 500 }
    );
  }
}
