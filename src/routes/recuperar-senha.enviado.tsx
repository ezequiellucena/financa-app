import { createFileRoute, Link } from "@tanstack/react-router";
import { CheckCircle2, MailCheck } from "lucide-react";

import { AuthShell } from "@/components/auth/AuthShell";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/recuperar-senha/enviado")({
  head: () => ({
    meta: [{ title: "Link enviado — FinançasApp" }],
  }),
  component: EnviadoPage,
});

function EnviadoPage() {
  return (
    <AuthShell>
      <div className="flex flex-col items-center text-center">
        <div className="relative mb-5">
          <div
            className="w-20 h-20 rounded-full flex items-center justify-center"
            style={{ background: "color-mix(in oklab, var(--success) 18%, transparent)" }}
          >
            <MailCheck className="w-10 h-10 text-success" />
          </div>
          <CheckCircle2 className="absolute -bottom-1 -right-1 w-7 h-7 text-success bg-card rounded-full" />
        </div>

        <h2 className="text-xl font-semibold text-foreground">
          Link enviado com sucesso!
        </h2>
        <p className="text-sm text-muted-foreground mt-2 max-w-sm">
          Enviamos um link para redefinição da sua senha para o e-mail informado.
        </p>
        <p className="text-xs text-muted-foreground mt-3 max-w-sm">
          Verifique sua caixa de entrada e também a pasta de spam. O link expira em 30 minutos.
        </p>

        <Button
          asChild
          className="w-full h-11 mt-7 text-primary-foreground shadow-[var(--shadow-glow)] hover:opacity-95"
          style={{ background: "var(--gradient-header)" }}
        >
          <Link to="/login">Voltar para Login</Link>
        </Button>
      </div>
    </AuthShell>
  );
}