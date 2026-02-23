interface SectionProgressProps {
  current: number;
  total?: number;
}

export function SectionProgress({ current, total = 5 }: SectionProgressProps) {
  const sectionTitles: Record<number, string> = {
    1: "Processo Atual",
    2: "Dores e Gargalos",
    3: "Ferramentas",
    4: "Uso de IA",
    5: "Visão de Futuro",
  };

  return (
    <div className="space-y-2">
      <div className="flex justify-between items-center">
        <span className="dl-eyebrow" style={{ color: "hsl(var(--color-dl-text))" }}>
          {sectionTitles[current]}
        </span>
        <span className="dl-eyebrow">
          {current}/{total}
        </span>
      </div>
      <div className="flex gap-1">
        {Array.from({ length: total }, (_, i) => (
          <div
            key={i}
            className={`dl-progress-segment${i + 1 <= current ? " active" : ""}`}
          />
        ))}
      </div>
    </div>
  );
}
