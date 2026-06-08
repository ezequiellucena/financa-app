import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet,
  Link,
  createRootRouteWithContext,
  useRouter,
  HeadContent,
  Scripts,
  useLocation,
} from "@tanstack/react-router";
import { useEffect, type ReactNode } from "react";

import appCss from "../styles.css?url";
import { reportLovableError } from "../lib/lovable-error-reporting";
import { FinanceProvider } from "../context/FinanceContext";
import { MonthCarousel } from "../components/MonthCarousel";
import { CadastrarGastoModal } from "../components/CadastrarGastoModal";
import { Toaster } from "sonner";
import {
  Home,
  CreditCard,
  PiggyBank,
  DollarSign,
  BarChart3,
  CalendarClock,
  Settings,
  HelpCircle,
  Menu,
  X,
  Plus,
} from "lucide-react";
import { useState } from "react";

function NotFoundComponent() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-7xl font-bold text-foreground">404</h1>
        <h2 className="mt-4 text-xl font-semibold text-foreground">Page not found</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <div className="mt-6">
          <Link
            to="/"
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Go home
          </Link>
        </div>
      </div>
    </div>
  );
}

function ErrorComponent({ error, reset }: { error: Error; reset: () => void }) {
  console.error(error);
  const router = useRouter();
  useEffect(() => {
    reportLovableError(error, { boundary: "tanstack_root_error_component" });
  }, [error]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-xl font-semibold tracking-tight text-foreground">
          This page didn't load
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Something went wrong on our end. You can try refreshing or head back home.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-2">
          <button
            onClick={() => {
              router.invalidate();
              reset();
            }}
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Try again
          </button>
          <a
            href="/"
            className="inline-flex items-center justify-center rounded-md border border-input bg-background px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-accent"
          >
            Go home
          </a>
        </div>
      </div>
    </div>
  );
}

const pageTitles: Record<string, string> = {
  '/': 'Dashboard',
  '/despesas-fixas': 'Despesas Fixas',
  '/cartoes': 'Cartões',
  '/poupanca': 'Poupança',
  '/gastos-variaveis': 'Gastos Variáveis',
  '/relatorios': 'Relatórios',
  '/vencimentos': 'Vencimentos',
  '/configuracoes': 'Configurações',
  '/ajuda': 'Ajuda',
};

function AppLayout() {
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [cadastrarOpen, setCadastrarOpen] = useState(false);

  const navItems = [
    { path: '/', icon: Home, label: 'Início' },
    { path: '/despesas-fixas', icon: CreditCard, label: 'Despesas' },
    { path: '/cartoes', icon: CreditCard, label: 'Cartões' },
    { path: '/poupanca', icon: PiggyBank, label: 'Poupança' },
    { path: '/gastos-variaveis', icon: DollarSign, label: 'Gastos' },
    { path: '/relatorios', icon: BarChart3, label: 'Relatórios' },
    { path: '/vencimentos', icon: CalendarClock, label: 'Vencimentos' },
    { path: '/configuracoes', icon: Settings, label: 'Configurações' },
    { path: '/ajuda', icon: HelpCircle, label: 'Ajuda' },
  ];

  const mainNavItems = [
    { path: '/', icon: Home, label: 'Início' },
    { path: '/despesas-fixas', icon: CreditCard, label: 'Despesas' },
    { path: '/cartoes', icon: CreditCard, label: 'Cartões' },
    { path: '/gastos-variaveis', icon: DollarSign, label: 'Gastos' },
  ];

  const leftNavItems = mainNavItems.slice(0, 2);
  const rightNavItems = mainNavItems.slice(2, 4);

  return (
    <div className="flex flex-col h-screen bg-background">
      {/* Floating Menu Button */}
      <button
        onClick={() => setMenuOpen(!menuOpen)}
        className="md:hidden fixed top-4 left-4 z-30 p-2.5 bg-white/15 backdrop-blur-md border border-white/20 rounded-2xl text-white hover:bg-white/25 transition-all duration-200"
      >
        {menuOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      {/* Desktop Sidebar */}
      <aside className="hidden md:flex fixed left-0 top-0 bottom-0 w-64 bg-sidebar border-r border-sidebar-border flex-col z-20">
        <div className="p-6">
          <h1 className="text-lg font-bold text-sidebar-foreground tracking-tight">Finanças</h1>
          <p className="text-xs text-sidebar-foreground/60 mt-1">Controle Financeiro</p>
        </div>
        <nav className="flex-1 px-3 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 text-sm ${
                  isActive
                    ? 'bg-sidebar-primary text-sidebar-primary-foreground font-medium'
                    : 'text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground'
                }`}
              >
                <Icon size={18} />
                {item.label}
              </Link>
            );
          })}
        </nav>
      </aside>

      {/* Header with Month Carousel */}
      <header className="sticky top-0 z-10 md:ml-64">
        <MonthCarousel pageTitle={pageTitles[location.pathname] || 'Controle Financeiro'} />
      </header>

      {/* Dropdown Menu Mobile */}
      {menuOpen && (
        <div className="md:hidden bg-card border-b border-border shadow-xl z-20 fixed top-16 left-4 right-4 rounded-2xl">
          <nav className="px-4 py-2">
            {navItems.map((item) => {
              const isActive = location.pathname === item.path;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setMenuOpen(false)}
                  className={`block w-full text-left px-4 py-3 rounded-xl mb-1 transition-all duration-200 ${
                    isActive
                      ? 'bg-primary text-primary-foreground font-medium'
                      : 'text-foreground hover:bg-accent'
                  }`}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </div>
      )}

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto pb-24 md:ml-64">
        <div className="p-4 max-w-5xl mx-auto">
          <Outlet />
        </div>
      </main>

      {/* Bottom Navigation Mobile */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-card/40 backdrop-blur-2xl backdrop-saturate-150 border-t border-white/10 px-4 py-3 z-10">
        <div className="relative grid grid-cols-5 items-center max-w-lg mx-auto">
          {leftNavItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex flex-col items-center gap-0.5 px-3 py-2 rounded-2xl transition-all duration-200 justify-self-center ${
                    isActive
                      ? 'text-primary-foreground bg-primary shadow-[var(--shadow-glow)]'
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  <Icon size={20} />
                  <span className="text-xs font-medium">{item.label}</span>
                </Link>
              );
            })}

          {/* Spacer for center elevated button */}
          <div aria-hidden="true" />

          {/* Center Elevated Action Button */}
          <button
            onClick={() => setCadastrarOpen(true)}
            aria-label="Cadastrar Gasto"
            className="absolute left-1/2 -translate-x-1/2 -top-7 w-16 h-16 rounded-full flex flex-col items-center justify-center text-primary-foreground shadow-[var(--shadow-glow)] hover:scale-105 transition-all duration-200"
            style={{ background: 'var(--gradient-header)' }}
          >
            <Plus size={26} strokeWidth={2.5} />
            <span className="text-[10px] font-semibold leading-none mt-0.5">Gasto</span>
          </button>

          {rightNavItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex flex-col items-center gap-0.5 px-3 py-2 rounded-2xl transition-all duration-200 justify-self-center ${
                    isActive
                      ? 'text-primary-foreground bg-primary shadow-[var(--shadow-glow)]'
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  <Icon size={20} />
                  <span className="text-xs font-medium">{item.label}</span>
                </Link>
              );
            })}
        </div>
      </nav>

      <CadastrarGastoModal isOpen={cadastrarOpen} onClose={() => setCadastrarOpen(false)} />
    </div>
  );
}

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "Finanças App" },
      { name: "description", content: "Aplicativo de controle financeiro pessoal" },
      { property: "og:title", content: "Finanças App" },
      { property: "og:description", content: "Aplicativo de controle financeiro pessoal" },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
      { name: "twitter:site", content: "@Lovable" },
    ],
    links: [
      {
        rel: "stylesheet",
        href: appCss,
      },
    ],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent,
});

function RootShell({ children }: { children: ReactNode }) {
  return (
    <html lang="pt-BR">
      <head>
        <HeadContent />
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  );
}

function RootComponent() {
  const { queryClient } = Route.useRouteContext();
  const location = useLocation();
  const isAuthRoute =
    location.pathname === "/login" ||
    location.pathname === "/cadastro" ||
    location.pathname.startsWith("/recuperar-senha");

  return (
    <QueryClientProvider client={queryClient}>
      <FinanceProvider>
        {isAuthRoute ? (
          <div className="min-h-screen bg-background">
            <Outlet />
          </div>
        ) : (
          <AppLayout />
        )}
        <Toaster position="top-center" richColors />
      </FinanceProvider>
    </QueryClientProvider>
  );
}

