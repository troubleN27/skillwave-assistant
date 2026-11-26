"use client";

import { Loader2Icon, LogOutIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { authClient } from "@/lib/auth-client";

export function SignOutButton() {
  const t = useTranslations("Admin.common");
  const router = useRouter();
  const [pending, setPending] = useState(false);
  const [failed, setFailed] = useState(false);

  async function handleSignOut() {
    setPending(true);
    setFailed(false);
    try {
      const { error } = await authClient.signOut();
      if (error) throw error;
      router.replace("/admin/login");
      router.refresh();
    } catch {
      setFailed(true);
      setPending(false);
    }
  }

  return (
    <div className="flex flex-col gap-1">
      <Button
        variant="ghost"
        className="justify-start hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
        onClick={handleSignOut}
        disabled={pending}
      >
        {pending ? <Loader2Icon className="animate-spin" /> : <LogOutIcon />}
        {t("signOut")}
      </Button>
      {failed && (
        <p role="alert" className="px-2 text-xs text-destructive">
          {t("signOutFailed")}
        </p>
      )}
    </div>
  );
}
