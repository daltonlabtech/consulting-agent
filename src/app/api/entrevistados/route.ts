import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { entrevistadoCreateSchema } from "@/lib/validations";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = entrevistadoCreateSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: "Dados inválidos" },
        { status: 400 }
      );
    }

    const { nome, email, cargo, area, whatsapp, sponsor_id, tipo } = parsed.data;

    // Verificar se o sponsor existe
    const sponsor = await prisma.sponsor.findUnique({
      where: { id: sponsor_id },
    });

    if (!sponsor) {
      return NextResponse.json(
        { success: false, error: "Sponsor não encontrado" },
        { status: 404 }
      );
    }

    // Verificar se já existe entrevistado com este whatsapp
    const existing = await prisma.entrevistado.findUnique({
      where: { whatsapp },
    });

    if (existing) {
      return NextResponse.json(
        { success: false, error: "Já existe um entrevistado com este WhatsApp" },
        { status: 409 }
      );
    }

    const entrevistado = await prisma.entrevistado.create({
      data: {
        nome,
        cargo,
        area,
        whatsapp,
        sponsor_id,
        tipo,
        status: "nao_iniciado",
        secao_atual: 1,
        secoes_completadas: [],
        respostas: {},
      },
    });

    return NextResponse.json({
      success: true,
      entrevistado: {
        id: entrevistado.id,
        nome: entrevistado.nome,
        tipo: entrevistado.tipo,
      },
    });
  } catch {
    return NextResponse.json(
      { success: false, error: "Erro interno" },
      { status: 500 }
    );
  }
}
