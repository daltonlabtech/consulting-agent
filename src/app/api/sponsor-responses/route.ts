import { NextRequest, NextResponse } from "next/server";
import { ZodError } from "zod";
import { prisma } from "@/lib/prisma";
import { sponsorResponseSchema } from "@/lib/validations";
import { SponsorFormResponses, SponsorKeyPerson } from "@/types";

export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json();
    const data = sponsorResponseSchema.parse(body);

    const sponsor = await prisma.sponsor.findUnique({
      where: { id: data.sponsor_id },
      select: { id: true, form_status: true, form_responses: true },
    });

    if (!sponsor) {
      return NextResponse.json(
        { success: false, error: "Sponsor não encontrado" },
        { status: 404 }
      );
    }

    const existing = (sponsor.form_responses ?? {}) as SponsorFormResponses;
    const merged: SponsorFormResponses = { ...existing, ...data.responses };

    const isSection6 = data.section === 6;
    const isFirstSection = sponsor.form_status === "pending";

    const updateData: Record<string, unknown> = {
      form_responses: merged,
      form_status: isSection6 ? "completed" : "in_progress",
      ...(isFirstSection && { form_started_at: new Date() }),
      ...(isSection6 && { form_completed_at: new Date() }),
    };

    await prisma.sponsor.update({
      where: { id: data.sponsor_id },
      data: updateData,
    });

    // On section 6 completion: create interviewee records from the people list
    if (isSection6 && merged.s6_key_people?.length) {
      const people = merged.s6_key_people as SponsorKeyPerson[];

      await prisma.entrevistado.createMany({
        data: people.map((p) => ({
          sponsor_id: data.sponsor_id,
          nome: p.nome,
          cargo: p.cargo,
          area: p.area,
          whatsapp: p.whatsapp,
        })),
        skipDuplicates: true,
      });
    }

    return NextResponse.json({ success: true, completed: isSection6 });
  } catch (error) {
    if (error instanceof ZodError) {
      return NextResponse.json(
        { success: false, errors: error.issues },
        { status: 400 }
      );
    }
    console.error("[PATCH /api/sponsor-responses]", error);
    return NextResponse.json(
      { success: false, error: "Erro ao salvar respostas" },
      { status: 500 }
    );
  }
}
