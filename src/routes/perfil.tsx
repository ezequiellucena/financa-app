import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import {
  User as UserIcon,
  Mail,
  ArrowLeft,
  Trash2,
  Loader2,
} from "lucide-react";
import { toast } from "sonner";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useAuth } from "@/hooks/use-auth";
import { supabase } from "@/integrations/supabase/client";
import { useServerFn } from "@tanstack/react-start";
import { checkAccountDeletionScope, deleteMyAccount } from "@/lib/account.functions";

export const Route = createFileRoute("/perfil")({
  component: PerfilPage,
});

function PerfilPage() {
  const navigate = useNavigate();
  const { user, profile, refreshProfile } = useAuth();
  const checkScope = useServerFn(checkAccountDeletionScope);
  const deleteAccount = useServerFn(deleteMyAccount);

  const nome = profile?.nome ?? (user?.user_metadata?.name as string | undefined) ?? "";
  const email = profile?.email ?? user?.email ?? "";

  const [apelido, setApelido] = useState<string>("");
  const [saving, setSaving] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [sharedWithOthers, setSharedWithOthers] = useState<boolean | null>(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    setApelido(profile?.apelido ?? "");
  }, [profile?.apelido]);

  const handleSave = async () => {
    if (!user) return;
    setSaving(true);
    const { error } = await supabase
      .from("profiles")
      .update({ apelido: apelido.trim() || null })
      .eq("id", user.id);
    setSaving(false);
    if (error) {
      toast.error("Não foi possível salvar o apelido");
      return;
    }
    await refreshProfile();
    toast.success("Apelido salvo com sucesso!");
  };

  const openDeleteModal = async () => {
    setDeleteOpen(true);
    if (sharedWithOthers === null) {
      try {
        const res = await checkScope();
        setSharedWithOthers(res.sharedWithOthers);
      } catch {
        setSharedWithOthers(false);
      }
    }
  };

  const handleConfirmDelete = async () => {
    setDeleting(true);
    try {
      await deleteAccount();
      await supabase.auth.signOut();
      toast.success("Sua conta foi excluída.");
      window.location.href = "/login";
    } catch (e) {
      setDeleting(false);
      toast.error(e instanceof Error ? e.message : "Não foi possível excluir a conta");
    }
  };

  const displayName = (profile?.apelido?.trim() || nome || email.split("@")[0] || "U");
  const initials = displayName
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
            Gerencie seus dados de conta
          </p>
        </div>
      </div>

      {/* Avatar */}
      <section className="bg-card border border-border rounded-2xl p-5">
        <div className="flex items-center gap-4">
          <Avatar className="h-20 w-20 ring-2 ring-border">
            <AvatarFallback className="bg-muted text-foreground font-semibold text-lg">
              {initials || <UserIcon size={28} />}
            </AvatarFallback>
          </Avatar>
          <div className="min-w-0">
            <p className="font-semibold text-base truncate">
              {profile?.apelido?.trim() || nome || "Usuário"}
            </p>
            <p className="text-sm text-muted-foreground truncate">{email}</p>
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
            value={nome}
            readOnly
            disabled
            className="bg-muted/40 cursor-not-allowed"
          />
          <p className="text-xs text-muted-foreground">
            O nome cadastrado não pode ser alterado.
          </p>
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="apelido">
            Apelido <span className="text-muted-foreground">(opcional)</span>
          </Label>
          <Input
            id="apelido"
            value={apelido}
            onChange={(e) => setApelido(e.target.value)}
            maxLength={40}
            placeholder="Como prefere ser chamado"
          />
          <p className="text-xs text-muted-foreground">
            Ao salvar, o apelido substituirá seu nome no menu do app.
          </p>
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

      {/* Danger zone */}
      <section className="bg-card border border-destructive/30 rounded-2xl p-5 space-y-3">
        <div>
          <h2 className="text-sm font-semibold text-destructive">Zona de risco</h2>
          <p className="text-xs text-muted-foreground mt-1">
            A exclusão da conta é definitiva e não pode ser desfeita.
          </p>
        </div>
        <button
          onClick={openDeleteModal}
          className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium text-destructive bg-destructive/10 hover:bg-destructive/20 transition-colors"
        >
          <Trash2 size={16} />
          Excluir Conta
        </button>
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

      <AlertDialog open={deleteOpen} onOpenChange={(o) => !deleting && setDeleteOpen(o)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir conta</AlertDialogTitle>
            <AlertDialogDescription>
              {sharedWithOthers === null ? (
                <span className="inline-flex items-center gap-2">
                  <Loader2 size={14} className="animate-spin" /> Verificando...
                </span>
              ) : sharedWithOthers ? (
                "Tem certeza de que deseja excluir sua conta?"
              ) : (
                "Tem certeza de que deseja excluir sua conta? Ao confirmar esta ação, sua conta e todos os dados vinculados a ela serão removidos permanentemente do aplicativo. Deseja realmente continuar?"
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleting}>Não</AlertDialogCancel>
            <AlertDialogAction
              onClick={(e) => {
                e.preventDefault();
                handleConfirmDelete();
              }}
              disabled={deleting || sharedWithOthers === null}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deleting ? "Excluindo..." : "Sim"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}