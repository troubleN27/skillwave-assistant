"use client";

import { Loader2Icon, LogOutIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { authClient } from "@/lib/auth-client";

export function SignOutButton() {
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
        className="justify-start"
        onClick={handleSignOut}
        disabled={pending}
      >
        {pending ? <Loader2Icon className="animate-spin" /> : <LogOutIcon />}
        Выйти
      </Button>
      {failed && (
        <p role="alert" className="px-2 text-xs text-destructive">
          Не удалось выйти, попробуйте ещё раз
        </p>
      )}
    </div>
  );
}
