import { notFound } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { LogoutButton } from "@/components/admin/LogoutButton";
import { AdminSponsorTabs } from "@/components/admin/AdminSponsorTabs";

interface Props {
  params: Promise<{ id: string }>;
}

export default async function SponsorDetailPage({ params }: Props) {
  const { id } = await params;

  const sponsor = await prisma.sponsor.findUnique({
    where: { id },
    include: {
      entrevistados: {
        select: { nome: true, cargo: true, area: true, whatsapp: true },
      },
    },
  });

  if (!sponsor) notFound();

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
          <div className="flex items-center gap-2 text-sm" style={{ color: "hsl(var(--color-dl-muted))" }}>
            <span
              className="dl-eyebrow"
              style={{ color: "hsl(var(--color-dl-primary))" }}
            >
              Dalton Lab
            </span>
            <span style={{ color: "hsl(var(--color-dl-border))" }}>/</span>
            <Link
              href="/admin/sponsors"
              className="hover:underline"
              style={{ color: "hsl(var(--color-dl-muted))" }}
            >
              Sponsors
            </Link>
            <span style={{ color: "hsl(var(--color-dl-border))" }}>/</span>
            <span
              className="font-semibold font-display"
              style={{ color: "hsl(var(--color-dl-text))" }}
            >
              {sponsor.empresa}
            </span>
          </div>
          <LogoutButton />
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-6 py-8">
        <AdminSponsorTabs sponsor={sponsor} />
      </main>
    </div>
  );
}
