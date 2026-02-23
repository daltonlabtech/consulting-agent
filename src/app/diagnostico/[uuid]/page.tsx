import { prisma } from "@/lib/prisma";
import { Respostas } from "@/types";
import { DiagnosticoForm } from "@/components/forms/DiagnosticoForm";

interface PageProps {
  params: Promise<{ uuid: string }>;
}

export default async function DiagnosticoPage({ params }: PageProps) {
  const { uuid } = await params;

  const entrevistado = await prisma.entrevistado.findUnique({
    where: { id: uuid },
    include: { sponsor: true },
  });

  if (!entrevistado) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 px-6">
        <div className="text-center max-w-sm">
          <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-4">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="32"
              height="32"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#dc2626"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="8" x2="12" y2="12" />
              <line x1="12" y1="16" x2="12.01" y2="16" />
            </svg>
          </div>
          <h1 className="text-xl font-bold text-gray-800 mb-2">
            Link inválido ou expirado
          </h1>
          <p className="text-gray-600 text-sm">
            Verifique se você está usando o link correto enviado pelo seu gestor.
          </p>
        </div>
      </div>
    );
  }

  if (entrevistado.status === "concluido") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 px-6">
        <div className="text-center max-w-sm">
          <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="32"
              height="32"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#16a34a"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <polyline points="20 6 9 17 4 12" />
            </svg>
          </div>
          <h1 className="text-xl font-bold text-gray-800 mb-2">
            Obrigado, {entrevistado.nome}!
          </h1>
          <p className="text-gray-600 text-sm">
            Você já respondeu o diagnóstico. Suas respostas foram registradas com sucesso.
          </p>
        </div>
      </div>
    );
  }

  return (
    <DiagnosticoForm
      entrevistadoId={entrevistado.id}
      entrevistadoNome={entrevistado.nome}
      empresaNome={entrevistado.sponsor.empresa}
      initialSection={entrevistado.secao_atual}
      initialRespostas={entrevistado.respostas as Respostas}
    />
  );
}
