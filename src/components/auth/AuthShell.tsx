import { type ReactNode } from "react";
import { Wallet } from "lucide-react";

interface AuthShellProps {
  children: ReactNode;
  title?: string;
  subtitle?: string;
}

export function AuthShell({ children, title, subtitle }: AuthShellProps) {
  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-10 relative overflow-hidden">
      {/* Decorative gradient blobs */}
      <div
        aria-hidden="true"
        className="absolute -top-32 -left-20 w-80 h-80 rounded-full opacity-40 blur-3xl"
        style={{ background: "var(--gradient-header)" }}
      />
      <div
        aria-hidden="true"
        className="absolute -bottom-32 -right-20 w-96 h-96 rounded-full opacity-30 blur-3xl"
        style={{ background: "var(--gradient-header)" }}
      />

      <div className="relative w-full max-w-md">
        {/* Logo */}
        <div className="flex flex-col items-center mb-8">
          <div
            className="w-16 h-16 rounded-2xl flex items-center justify-center text-primary-foreground shadow-[var(--shadow-glow)] mb-4"
            style={{ background: "var(--gradient-header)" }}
          >
            <Wallet size={30} strokeWidth={2.2} />
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">
            Finanças<span className="text-primary">App</span>
          </h1>
        </div>

        {/* Card */}
        <div className="bg-card/60 backdrop-blur-xl border border-white/10 rounded-3xl shadow-2xl p-6 sm:p-8">
          {(title || subtitle) && (
            <div className="mb-6 text-center">
              {title && (
                <h2 className="text-xl font-semibold text-foreground">{title}</h2>
              )}
              {subtitle && (
                <p className="text-sm text-muted-foreground mt-2">{subtitle}</p>
              )}
            </div>
          )}
          {children}
        </div>
      </div>
    </div>
  );
}