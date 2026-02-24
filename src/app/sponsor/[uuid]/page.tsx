import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { DiagnosticoSponsorForm } from "@/components/forms/DiagnosticoSponsorForm";
import { SponsorFormResponses } from "@/types";

interface Props {
  params: Promise<{ uuid: string }>;
}

export default async function SponsorFormPage({ params }: Props) {
  const { uuid } = await params;

  const sponsor = await prisma.sponsor.findUnique({
    where: { id: uuid },
    select: {
      id: true,
      nome: true,
      empresa: true,
      briefing_areas: true,
      briefing_systems: true,
      briefing_ai_usage: true,
      form_status: true,
      form_responses: true,
    },
  });

  if (!sponsor) notFound();

  if (sponsor.form_status === "completed") {
    return (
      <div className="min-h-screen flex items-center justify-center p-4" style={{ backgroundColor: "hsl(var(--color-dl-bg))" }}>
        <div className="dl-card p-8 max-w-md w-full text-center space-y-4">
          <div className="w-14 h-14 rounded-full flex items-center justify-center mx-auto" style={{ backgroundColor: "hsl(var(--color-dl-success) / 0.12)" }}>
            <svg className="w-7 h-7" style={{ color: "hsl(var(--color-dl-success))" }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h2 className="text-xl font-bold" style={{ fontFamily: "var(--font-space-grotesk)", color: "hsl(var(--color-dl-text))" }}>
            Formulário já preenchido
          </h2>
          <p className="text-sm" style={{ color: "hsl(var(--color-dl-muted))" }}>
            Obrigado, {sponsor.nome.split(" ")[0]}. Suas respostas foram recebidas com sucesso.
          </p>
        </div>
      </div>
    );
  }

  const initialResponses = (sponsor.form_responses ?? {}) as SponsorFormResponses;

  return (
    <DiagnosticoSponsorForm
      sponsorId={sponsor.id}
      sponsorNome={sponsor.nome}
      empresaNome={sponsor.empresa}
      briefingAreas={sponsor.briefing_areas}
      briefingSystems={sponsor.briefing_systems}
      briefingAiUsage={sponsor.briefing_ai_usage}
      initialResponses={initialResponses}
      formStatus={sponsor.form_status}
    />
  );
}
