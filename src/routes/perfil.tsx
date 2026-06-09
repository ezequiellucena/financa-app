import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState, useRef, type ChangeEvent } from "react";
import { z } from "zod";
import {
  User as UserIcon,
  Camera,
  Trash2,
  Lock,
  Eye,
  EyeOff,
  Mail,
  ArrowLeft,
} from "lucide-react";
import { toast } from "sonner";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export const Route = createFileRoute("/perfil")({
  component: PerfilPage,
});

const passwordSchema = z
  .object({
    current: z.string().min(1, "Informe sua senha atual"),
    next: z
      .string()
      .min(8, "Mínimo de 8 caracteres")
      .regex(/[A-Z]/, "Inclua uma letra maiúscula")
      .regex(/[0-9]/, "Inclua um número"),
    confirm: z.string(),
  })
  .refine((d) => d.next === d.confirm, {
    path: ["confirm"],
    message: "As senhas não coincidem",
  });

function strengthScore(pwd: string) {
  let s = 0;
  if (pwd.length >= 8) s++;
  if (/[A-Z]/.test(pwd)) s++;
  if (/[0-9]/.test(pwd)) s++;
  if (/[^A-Za-z0-9]/.test(pwd)) s++;
  return s;
}

function PerfilPage() {
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [name, setName] = useState("Usuário");
  const [nickname, setNickname] = useState("");
  const [email] = useState("usuario@exemplo.com");
  const [avatarUrl, setAvatarUrl] = useState<string | undefined>(undefined);

  const [current, setCurrent] = useState("");
  const [next, setNext] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNext, setShowNext] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);

  const score = strengthScore(next);
  const strengthLabel =
    next.length === 0
      ? ""
      : score <= 1
        ? "Fraca"
        : score === 2
          ? "Média"
          : score === 3
            ? "Boa"
            : "Forte";

  const handleAvatarChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const url = URL.createObjectURL(file);
    setAvatarUrl(url);
  };

  const handleRemoveAvatar = () => setAvatarUrl(undefined);

  const handleSave = async () => {
    setErrors({});
    if (!name.trim()) {
      setErrors({ name: "Informe seu nome" });
      return;
    }

    // Only validate password block if user typed anything
    if (current || next || confirm) {
      const r = passwordSchema.safeParse({ current, next, confirm });
      if (!r.success) {
        const fe: Record<string, string> = {};
        for (const issue of r.error.issues) {
          fe[issue.path[0] as string] = issue.message;
        }
        setErrors(fe);
        return;
      }
    }

    setSaving(true);
    await new Promise((r) => setTimeout(r, 600));
    setSaving(false);
    toast.success("Alterações salvas com sucesso!");
    setCurrent("");
    setNext("");
    setConfirm("");
  };

  const initials = name
    .split(" ")
    .map((p) => p[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <button
          onClick={() => navigate({ to: "/" })}
          aria-label="Voltar"
          className="p-2 -ml-2 rounded-xl hover:bg-accent transition-colors"
        >
          <ArrowLeft size={20} />
        </button>
        <div>
          <h1 className="text-xl font-semibold tracking-tight">Editar Perfil</h1>
          <p className="text-sm text-muted-foreground">
            Gerencie seus dados e segurança
          </p>
        </div>
      </div>

      {/* Avatar card */}
      <section className="bg-card border border-border rounded-2xl p-5">
        <div className="flex items-center gap-4">
          <Avatar className="h-20 w-20 ring-2 ring-border">
            {avatarUrl && <AvatarImage src={avatarUrl} alt={name} />}
            <AvatarFallback className="bg-muted text-foreground font-semibold text-lg">
              {initials || <UserIcon size={28} />}
            </AvatarFallback>
          </Avatar>
          <div className="flex flex-col gap-2">
            <button
              onClick={() => fileInputRef.current?.click()}
              className="inline-flex items-center gap-2 px-3 py-2 text-sm rounded-xl bg-primary text-primary-foreground hover:opacity-90 transition-opacity"
            >
              <Camera size={16} />
              Alterar foto
            </button>
            {avatarUrl && (
              <button
                onClick={handleRemoveAvatar}
                className="inline-flex items-center gap-2 px-3 py-2 text-sm rounded-xl text-destructive hover:bg-destructive/10 transition-colors"
              >
                <Trash2 size={16} />
                Remover foto
              </button>
            )}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleAvatarChange}
            />
          </div>
        </div>
      </section>

      {/* Personal data */}
      <section className="bg-card border border-border rounded-2xl p-5 space-y-4">
        <h2 className="text-sm font-semibold text-foreground">Informações pessoais</h2>

        <div className="space-y-1.5">
          <Label htmlFor="name">Nome</Label>
          <Input
            id="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Seu nome completo"
          />
          {errors.name && (
            <p className="text-xs text-destructive">{errors.name}</p>
          )}
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="nickname">
            Apelido <span className="text-muted-foreground">(opcional)</span>
          </Label>
          <Input
            id="nickname"
            value={nickname}
            onChange={(e) => setNickname(e.target.value)}
            placeholder="Como prefere ser chamado"
          />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="email">E-mail</Label>
          <div className="relative">
            <Mail
              size={16}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
            />
            <Input
              id="email"
              value={email}
              readOnly
              disabled
              className="pl-9 bg-muted/40 cursor-not-allowed"
            />
          </div>
          <p className="text-xs text-muted-foreground">
            O e-mail cadastrado não pode ser alterado.
          </p>
        </div>
      </section>

      {/* Security */}
      <section className="bg-card border border-border rounded-2xl p-5 space-y-4">
        <div className="flex items-center gap-2">
          <Lock size={16} className="text-primary" />
          <h2 className="text-sm font-semibold text-foreground">Alterar Senha</h2>
        </div>

        <PasswordField
          id="current"
          label="Senha atual"
          value={current}
          onChange={setCurrent}
          show={showCurrent}
          toggle={() => setShowCurrent((v) => !v)}
          error={errors.current}
        />
        <div className="space-y-1.5">
          <PasswordField
            id="next"
            label="Nova senha"
            value={next}
            onChange={setNext}
            show={showNext}
            toggle={() => setShowNext((v) => !v)}
            error={errors.next}
          />
          {next && (
            <div className="flex items-center gap-2">
              <div className="flex-1 h-1.5 bg-muted rounded-full overflow-hidden">
                <div
                  className={`h-full transition-all ${
                    score <= 1
                      ? "w-1/4 bg-destructive"
                      : score === 2
                        ? "w-2/4 bg-warning"
                        : score === 3
                          ? "w-3/4 bg-info"
                          : "w-full bg-success"
                  }`}
                />
              </div>
              <span className="text-xs text-muted-foreground">{strengthLabel}</span>
            </div>
          )}
        </div>
        <PasswordField
          id="confirm"
          label="Confirmar nova senha"
          value={confirm}
          onChange={setConfirm}
          show={showConfirm}
          toggle={() => setShowConfirm((v) => !v)}
          error={errors.confirm}
        />
      </section>

      {/* Actions */}
      <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-2 pb-6">
        <button
          onClick={() => navigate({ to: "/" })}
          className="px-4 py-2.5 rounded-xl text-sm font-medium bg-secondary text-secondary-foreground hover:bg-secondary/80 transition-colors"
        >
          Cancelar
        </button>
        <button
          onClick={handleSave}
          disabled={saving}
          className="px-4 py-2.5 rounded-xl text-sm font-medium text-primary-foreground shadow-[var(--shadow-glow)] hover:opacity-90 transition-opacity disabled:opacity-60"
          style={{ background: "var(--gradient-header)" }}
        >
          {saving ? "Salvando..." : "Salvar Alterações"}
        </button>
      </div>
    </div>
  );
}

interface PasswordFieldProps {
  id: string;
  label: string;
  value: string;
  onChange: (v: string) => void;
  show: boolean;
  toggle: () => void;
  error?: string;
}

function PasswordField({
  id,
  label,
  value,
  onChange,
  show,
  toggle,
  error,
}: PasswordFieldProps) {
  return (
    <div className="space-y-1.5">
      <Label htmlFor={id}>{label}</Label>
      <div className="relative">
        <Input
          id={id}
          type={show ? "text" : "password"}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="pr-10"
        />
        <button
          type="button"
          onClick={toggle}
          aria-label={show ? "Ocultar senha" : "Exibir senha"}
          className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 rounded-md text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
        >
          {show ? <EyeOff size={16} /> : <Eye size={16} />}
        </button>
      </div>
      {error && <p className="text-xs text-destructive">{error}</p>}
    </div>
  );
}