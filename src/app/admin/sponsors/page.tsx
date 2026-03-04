import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

const STATUS_CONFIG = {
  pending: { label: "Aguardando", bg: "hsl(215 16% 47% / 0.1)", color: "hsl(215 16% 47%)" },
  in_progress: { label: "Em andamento", bg: "hsl(38 92% 50% / 0.1)", color: "hsl(32 95% 44%)" },
  completed: { label: "Concluído", bg: "hsl(142 71% 45% / 0.1)", color: "hsl(142 71% 35%)" },
} as const;

export default async function SponsorsPage() {
  const sponsors = await prisma.sponsor.findMany({
    orderBy: { created_at: "desc" },
    select: {
      id: true,
      nome: true,
      empresa: true,
      areas_contratadas: true,
      data_limite: true,
      form_status: true,
      created_at: true,
    },
  });

  return (
    <div
      className="min-h-screen"
      style={{ backgroundColor: "hsl(var(--color-dl-bg))" }}
    >
      <header
        className="dl-bar sticky top-0 z-10 px-6 py-4"
        style={{ borderBottom: "1px solid hsl(var(--color-dl-border))" }}
      >
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span
              className="dl-eyebrow"
              style={{ color: "hsl(var(--color-dl-primary))" }}
            >
              Dalton Lab
            </span>
            <span style={{ color: "hsl(var(--color-dl-border))" }}>/</span>
            <h1
              className="font-semibold font-display"
              style={{ color: "hsl(var(--color-dl-text))" }}
            >
              Sponsors
            </h1>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-6 py-8">
        <div className="dl-card overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr style={{ borderBottom: "1px solid hsl(var(--color-dl-border))" }}>
                {["Empresa", "Sponsor", "Áreas contratadas", "Status", "Prazo"].map(
                  (col) => (
                    <th
                      key={col}
                      className="px-5 py-3 text-left font-semibold"
                      style={{ color: "hsl(var(--color-dl-muted))" }}
                    >
                      {col}
                    </th>
                  )
                )}
              </tr>
            </thead>
            <tbody>
              {sponsors.map((s) => {
                const status =
                  STATUS_CONFIG[s.form_status as keyof typeof STATUS_CONFIG] ??
                  STATUS_CONFIG.pending;
                return (
                  <tr
                    key={s.id}
                    style={{ borderBottom: "1px solid hsl(var(--color-dl-border))" }}
                    className="hover:bg-slate-50 transition-colors"
                  >
                    <td className="px-5 py-4">
                      <Link
                        href={`/admin/sponsors/${s.id}`}
                        className="block font-semibold"
                        style={{ color: "hsl(var(--color-dl-text))" }}
                      >
                        {s.empresa}
                      </Link>
                    </td>
                    <td className="px-5 py-4">
                      <Link
                        href={`/admin/sponsors/${s.id}`}
                        className="block"
                        style={{ color: "hsl(var(--color-dl-muted))" }}
                      >
                        {s.nome}
                      </Link>
                    </td>
                    <td className="px-5 py-4">
                      <Link
                        href={`/admin/sponsors/${s.id}`}
                        className="block"
                      >
                        <div className="flex flex-wrap gap-1">
                          {s.areas_contratadas.map((area) => (
                            <span
                              key={area}
                              className="inline-block text-xs px-2 py-0.5 rounded-full"
                              style={{
                                backgroundColor: "hsl(var(--color-dl-primary) / 0.08)",
                                color: "hsl(var(--color-dl-primary))",
                              }}
                            >
                              {area}
                            </span>
                          ))}
                        </div>
                      </Link>
                    </td>
                    <td className="px-5 py-4">
                      <Link href={`/admin/sponsors/${s.id}`} className="block">
                        <span
                          className="inline-block text-xs font-medium px-2.5 py-1 rounded-full"
                          style={{
                            backgroundColor: status.bg,
                            color: status.color,
                          }}
                        >
                          {status.label}
                        </span>
                      </Link>
                    </td>
                    <td
                      className="px-5 py-4"
                      style={{ color: "hsl(var(--color-dl-muted))" }}
                    >
                      <Link href={`/admin/sponsors/${s.id}`} className="block">
                        {format(new Date(s.data_limite), "dd/MM", { locale: ptBR })}
                      </Link>
                    </td>
                  </tr>
                );
              })}
              {sponsors.length === 0 && (
                <tr>
                  <td
                    colSpan={5}
                    className="px-5 py-10 text-center"
                    style={{ color: "hsl(var(--color-dl-muted))" }}
                  >
                    Nenhum sponsor cadastrado ainda.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </main>
    </div>
  );
}
