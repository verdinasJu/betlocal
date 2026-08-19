"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/client";

export function SignOutButton() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function signOut() {
    setLoading(true);
    const supabase = createClient();
    await supabase.auth.signOut();
    router.replace("/login");
    router.refresh();
  }

  return (
    <Button
      variant="outline"
      className="w-full"
      onClick={signOut}
      disabled={loading}
    >
      <LogOut className="h-4 w-4" />
      {loading ? "Cerrando…" : "Cerrar sesión"}
    </Button>
  );
}
