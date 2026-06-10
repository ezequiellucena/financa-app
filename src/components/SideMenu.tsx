import { Link, useLocation } from "@tanstack/react-router";
import { useEffect } from "react";
import {
  Home,
  CreditCard,
  PiggyBank,
  DollarSign,
  BarChart3,
  CalendarClock,
  Settings,
  HelpCircle,
  LogOut,
  User,
  ChevronRight,
  X,
} from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";

interface SideMenuProps {
  open: boolean;
  onClose: () => void;
  user?: { name: string; email: string; avatarUrl?: string };
}

const navItems = [
  { path: "/", icon: Home, label: "Início" },
  { path: "/despesas-fixas", icon: CreditCard, label: "Despesas Fixas" },
  { path: "/cartoes", icon: CreditCard, label: "Cartões" },
  { path: "/poupanca", icon: PiggyBank, label: "Poupança" },
  { path: "/gastos-variaveis", icon: DollarSign, label: "Gastos Variáveis" },
  { path: "/relatorios", icon: BarChart3, label: "Relatórios" },
  { path: "/vencimentos", icon: CalendarClock, label: "Vencimentos" },
  { path: "/configuracoes", icon: Settings, label: "Configurações" },
  { path: "/ajuda", icon: HelpCircle, label: "Ajuda" },
];

export function SideMenu({ open, onClose, user }: SideMenuProps) {
  const location = useLocation();
  const { user: authUser } = useAuth();
  const displayUser = user ?? {
    name:
      (authUser?.user_metadata?.name as string | undefined) ??
      authUser?.email?.split("@")[0] ??
      "Usuário",
    email: authUser?.email ?? "",
    avatarUrl: authUser?.user_metadata?.avatar_url as string | undefined,
  };

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open, onClose]);

  const handleLogout = async () => {
    onClose();
    await supabase.auth.signOut();
    window.location.href = "/login";
  };

  const initials = displayUser.name
    .split(" ")
    .map((p) => p[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  return (
    <>
      {/* Overlay */}
      <div
        onClick={onClose}
        aria-hidden="true"
        className={`fixed inset-0 z-40 bg-black/60 backdrop-blur-sm transition-opacity duration-300 ${
          open ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        }`}
      />

      {/* Drawer */}
      <aside
        role="dialog"
        aria-modal="true"
        aria-label="Menu de navegação"
        className={`fixed top-0 left-0 z-50 h-screen w-[80%] max-w-[320px] sm:w-[55%] md:w-[300px] bg-card border-r border-border shadow-2xl flex flex-col transition-transform duration-300 ease-out ${
          open ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Header with gradient */}
        <div
          className="relative px-5 pt-5 pb-6 text-primary-foreground"
          style={{ background: "var(--gradient-header)" }}
        >
          <button
            onClick={onClose}
            aria-label="Fechar menu"
            className="absolute top-3 right-3 p-1.5 rounded-full bg-white/10 hover:bg-white/20 transition-colors"
          >
            <X size={18} />
          </button>

          <div className="flex items-start justify-between gap-3 pr-8">
            <div className="flex items-center gap-3 min-w-0">
              <Avatar className="h-12 w-12 ring-2 ring-white/30">
                {displayUser.avatarUrl && (
                  <AvatarImage src={displayUser.avatarUrl} alt={displayUser.name} />
                )}
                <AvatarFallback className="bg-white/15 text-primary-foreground font-semibold">
                  {initials || <User size={20} />}
                </AvatarFallback>
              </Avatar>
              <div className="min-w-0">
                <p className="font-semibold text-base leading-tight truncate">
                  {displayUser.name}
                </p>
                <p className="text-xs text-white/75 truncate mt-0.5">
                  {displayUser.email}
                </p>
              </div>
            </div>
          </div>

          <Link
            to="/perfil"
            onClick={onClose}
            className="mt-4 flex items-center justify-between w-full px-3 py-2 rounded-xl bg-white/10 hover:bg-white/20 transition-colors text-sm font-medium"
          >
            <span className="flex items-center gap-2">
              <User size={16} />
              Editar Perfil
            </span>
            <ChevronRight size={16} className="opacity-70" />
          </Link>
        </div>

        {/* Nav */}
        <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                onClick={onClose}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-all duration-200 outline-none focus-visible:ring-2 focus-visible:ring-ring active:scale-[0.98] ${
                  isActive
                    ? "bg-primary text-primary-foreground font-medium shadow-[var(--shadow-glow)]"
                    : "text-foreground/80 hover:bg-accent hover:text-accent-foreground"
                }`}
              >
                <Icon size={18} />
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* Footer / Logout */}
        <div className="p-4 border-t border-border">
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <button
                className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium text-destructive bg-destructive/10 hover:bg-destructive/20 transition-colors"
              >
                <LogOut size={16} />
                Sair
              </button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Encerrar sessão?</AlertDialogTitle>
                <AlertDialogDescription>
                  Você precisará entrar novamente para acessar sua conta.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                <AlertDialogAction
                  onClick={handleLogout}
                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                >
                  Sair
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </aside>
    </>
  );
}