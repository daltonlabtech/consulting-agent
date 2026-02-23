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
        <span className="text-sm font-medium text-gray-700">{sectionTitles[current]}</span>
        <span className="text-sm text-gray-500">
          {current} de {total}
        </span>
      </div>
      <div className="flex gap-1">
        {Array.from({ length: total }, (_, i) => (
          <div
            key={i}
            className={`h-1.5 flex-1 rounded-full transition-colors duration-300 ${
              i + 1 <= current ? "bg-blue-600" : "bg-gray-200"
            }`}
          />
        ))}
      </div>
    </div>
  );
}
