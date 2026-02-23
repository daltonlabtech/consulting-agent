import { SponsorForm } from "@/components/forms/SponsorForm";

interface Props {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function SponsorPage({ searchParams }: Props) {
  const params = await searchParams;

  const initialValues = {
    empresa: typeof params.empresa === "string" ? params.empresa : "",
    nome_sponsor: typeof params.nome_sponsor === "string" ? params.nome_sponsor : "",
    whatsapp_sponsor:
      typeof params.whatsapp_sponsor === "string" ? params.whatsapp_sponsor : "",
  };

  return <SponsorForm initialValues={initialValues} />;
}
