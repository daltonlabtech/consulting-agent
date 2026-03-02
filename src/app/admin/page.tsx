import { redirect } from "next/navigation";
import { GoogleLoginButton } from "@/components/admin/GoogleLoginButton";

interface Props {
  searchParams: Promise<{ error?: string }>;
}

export default async function AdminLoginPage({ searchParams }: Props) {
  if (process.env.NODE_ENV === "development") {
    redirect("/admin/sponsors");
  }

  const { error } = await searchParams;

  return (
    <div
      className="min-h-screen flex items-center justify-center p-4"
      style={{ backgroundColor: "hsl(var(--color-dl-bg))" }}
    >
      <div className="dl-card p-8 w-full max-w-sm flex flex-col items-center gap-6">
        <div className="flex flex-col items-center gap-2 text-center">
          <span
            className="dl-eyebrow"
            style={{ color: "hsl(var(--color-dl-primary))" }}
          >
            Dalton Lab
          </span>
          <h1
            className="text-2xl font-bold font-display"
            style={{ color: "hsl(var(--color-dl-text))" }}
          >
            Área administrativa
          </h1>
          <p className="text-sm" style={{ color: "hsl(var(--color-dl-muted))" }}>
            Acesso restrito à equipe Dalton Lab
          </p>
        </div>

        {error === "unauthorized" && (
          <div
            className="w-full rounded-xl p-3 text-sm text-center"
            style={{
              backgroundColor: "hsl(var(--color-dl-error) / 0.08)",
              color: "hsl(var(--color-dl-error))",
              border: "1px solid hsl(var(--color-dl-error) / 0.2)",
            }}
          >
            Acesso restrito a emails <strong>@daltonlab.ai</strong>
          </div>
        )}

        <GoogleLoginButton />
      </div>
    </div>
  );
}
