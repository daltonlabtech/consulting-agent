"use client";

import { useRouter } from "next/navigation";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";

export function LogoutButton() {
  const router = useRouter();

  async function handleLogout() {
    const supabase = createSupabaseBrowserClient();
    await supabase.auth.signOut();
    router.push("/admin");
  }

  return (
    <button onClick={handleLogout} className="dl-btn-ghost text-sm px-3 py-1.5">
      Sair
    </button>
  );
}
