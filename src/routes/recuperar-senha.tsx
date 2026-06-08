import { createFileRoute, Link, useNavigate, Outlet, useLocation } from "@tanstack/react-router";
import { useState } from "react";
import { z } from "zod";
import { ArrowLeft, Loader2, Mail } from "lucide-react";

import { AuthShell } from "@/components/auth/AuthShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const schema = z.object({
  email: z.string().trim().email("E-mail inválido").max(255),
});

export const Route = createFileRoute("/recuperar-senha")({
  head: () => ({
    meta: [{ title: "Recuperar senha — FinançasApp" }],
  }),
  component: RecuperarSenhaLayout,
});

function RecuperarSenhaLayout() {
  const location = useLocation();
  if (location.pathname !== "/recuperar-senha") {
    return <Outlet />;
  }
  return <RecuperarSenhaForm />;
}

function RecuperarSenhaForm() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | undefined>();
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const result = schema.safeParse({ email });
    if (!result.success) {
      setError(result.error.issues[0].message);
      return;
    }
    setError(undefined);
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      navigate({ to: "/recuperar-senha/enviado" });
    }, 900);
  };

  return (
    <AuthShell
      title="Esqueceu sua senha?"
      subtitle="Enviaremos um link para você redefinir a senha de forma segura."
    >
      <form onSubmit={handleSubmit} className="space-y-4" noValidate>
        <div className="space-y-2">
          <Label htmlFor="email">E-mail</Label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              id="email"
              type="email"
              placeholder="voce@email.com"
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="pl-9 h-11"
              aria-invalid={!!error}
            />
          </div>
          {error && <p className="text-xs text-destructive">{error}</p>}
        </div>

        <Button
          type="submit"
          disabled={loading}
          className="w-full h-11 text-primary-foreground shadow-[var(--shadow-glow)] hover:opacity-95"
          style={{ background: "var(--gradient-header)" }}
        >
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" /> Enviando...
            </>
          ) : (
            "Enviar Link"
          )}
        </Button>

        <div className="text-center pt-2">
          <Link
            to="/login"
            className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-primary transition-colors"
          >
            <ArrowLeft className="w-4 h-4" /> Voltar para Login
          </Link>
        </div>
      </form>
    </AuthShell>
  );
}