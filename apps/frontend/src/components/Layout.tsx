import { ReactNode, useState } from "react";
import { AppSidebar } from "./AppSidebar";
import { SystemStatusBanner } from "./SystemStatusBanner";
import { cn } from "@/lib/utils";

interface LayoutProps {
  children: ReactNode;
}

export function Layout({ children }: LayoutProps) {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div className="flex min-h-screen w-full bg-background">
      <AppSidebar collapsed={collapsed} onToggle={() => setCollapsed((c) => !c)} />
      <div className={cn("flex-1 flex flex-col transition-all duration-300", collapsed ? "ml-[72px]" : "ml-[240px]")}>
        <SystemStatusBanner />
        <main className="flex-1">
          {children}
        </main>
      </div>
    </div>
  );
}

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  action?: ReactNode;
  stepLabel?: string;
}

export function PageHeader({ title, subtitle, action, stepLabel }: PageHeaderProps) {
  return (
    <div className="flex items-center justify-between mb-6">
      <div>
        {stepLabel && (
          <span className="inline-block text-xs font-semibold uppercase tracking-wider text-primary mb-1">
            {stepLabel}
          </span>
        )}
        <h1 className="text-2xl font-bold text-foreground">{title}</h1>
        {subtitle && <p className="text-sm text-muted-foreground mt-0.5">{subtitle}</p>}
      </div>
      {action && <div>{action}</div>}
    </div>
  );
}

export function PageContainer({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <div className={cn("p-6 page-enter max-w-[1400px] mx-auto", className)}>
      {children}
    </div>
  );
}
