import { NextRequest, NextResponse } from "next/server";
import { ZodError } from "zod";
import { prisma } from "@/lib/prisma";
import { sponsorSetupSchema } from "@/lib/validations";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const data = sponsorSetupSchema.parse(body);

    const sponsor = await prisma.sponsor.create({
      data: {
        nome: data.nome_sponsor,
        empresa: data.empresa,
        whatsapp: data.whatsapp_sponsor,
        areas_contratadas: data.areas_contratadas,
        data_limite: data.data_limite,
        briefing_areas: data.briefing_areas ?? null,
        briefing_systems: data.briefing_systems ?? null,
        briefing_ai_usage: data.briefing_ai_usage ?? null,
      },
    });

    return NextResponse.json({ success: true, sponsor });
  } catch (error) {
    if (error instanceof ZodError) {
      return NextResponse.json(
        { success: false, errors: error.issues },
        { status: 400 }
      );
    }
    console.error("[POST /api/sponsors]", error);
    return NextResponse.json(
      { success: false, error: "Erro ao criar sponsor" },
      { status: 500 }
    );
  }
}
