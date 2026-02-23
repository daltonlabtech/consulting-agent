import { NextRequest, NextResponse } from "next/server";
import { Prisma } from "@/generated/prisma/client";
import { prisma } from "@/lib/prisma";
import { respostasUpdateSchema } from "@/lib/validations";

export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = respostasUpdateSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: "Dados inválidos" },
        { status: 400 }
      );
    }

    const { entrevistado_id, secao, respostas } = parsed.data;

    const entrevistado = await prisma.entrevistado.findUnique({
      where: { id: entrevistado_id },
    });

    if (!entrevistado) {
      return NextResponse.json(
        { success: false, error: "Entrevistado não encontrado" },
        { status: 404 }
      );
    }

    const isConcluindo = secao === 5;
    const proximaSecao = isConcluindo ? 5 : Math.min(secao + 1, 5);
    const secoesCompletadas = [
      ...new Set([...entrevistado.secoes_completadas, secao]),
    ];

    await prisma.entrevistado.update({
      where: { id: entrevistado_id },
      data: {
        respostas: respostas as Prisma.InputJsonValue,
        secao_atual: proximaSecao,
        secoes_completadas: secoesCompletadas,
        status: isConcluindo ? "concluido" : "em_andamento",
        iniciado_em: entrevistado.iniciado_em ?? new Date(),
        ...(isConcluindo && { concluido_em: new Date() }),
      },
    });

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json(
      { success: false, error: "Erro interno" },
      { status: 500 }
    );
  }
}
