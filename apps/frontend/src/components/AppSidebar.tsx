import { NavLink, useLocation } from "react-router-dom";
import {
  Home, Upload, BarChart2, ChevronLeft, ChevronRight,
  Activity, CreditCard, ClipboardList, LineChart, AlertTriangle, Bot,
} from "lucide-react";
import { cn } from "@/lib/utils";

const NAV_ITEMS = [
  { label: "Home", href: "/", icon: Home, exact: true },
  { label: "Upload Invoice", href: "/upload", icon: Upload },
  { label: "Pipeline Monitor", href: "/dashboard", icon: BarChart2 },
  { label: "Decisions", href: "/policy", icon: ClipboardList },
  { label: "Payments", href: "/payments", icon: CreditCard },
  { label: "Audit Trail", href: "/audit", icon: Activity },
  { label: "System Analytics", href: "/analytics", icon: LineChart },
  { label: "Error Review", href: "/errors", icon: AlertTriangle },
  { label: "CFO AI", href: "/cfo-ai", icon: Bot },
];

interface AppSidebarProps {
  collapsed: boolean;
  onToggle: () => void;
}

export function AppSidebar({ collapsed, onToggle }: AppSidebarProps) {
  const location = useLocation();

  const isActive = (href: string, exact?: boolean) => {
    if (exact) return location.pathname === href;
    if (href === "/") return location.pathname === "/";
    return location.pathname.startsWith(href);
  };

  return (
    <aside className={cn(
      "fixed top-0 left-0 h-screen sidebar-gradient flex flex-col z-50 transition-all duration-300",
      collapsed ? "w-[72px]" : "w-[240px]"
    )}>
      <div className={cn("flex items-center h-14 px-4 border-b border-white/10", collapsed ? "justify-center" : "justify-between")}>
        {!collapsed && <span className="text-sm font-bold text-white tracking-wide">AutoFlow AI</span>}
        <button onClick={onToggle} className="text-white/60 hover:text-white p-1 rounded-md hover:bg-white/10 transition">
          {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
        </button>
      </div>

      <nav className="flex-1 py-3 px-2 space-y-0.5 overflow-y-auto">
        {NAV_ITEMS.map((item) => {
          const active = isActive(item.href, item.exact);
          return (
            <NavLink
              key={item.href}
              to={item.href}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all duration-150",
                active
                  ? "bg-white/15 text-white font-medium shadow-sm"
                  : "text-white/65 hover:bg-white/8 hover:text-white"
              )}
              title={collapsed ? item.label : undefined}
            >
              <item.icon className={cn("w-[18px] h-[18px] shrink-0", active ? "text-white" : "text-white/65")} />
              {!collapsed && <span className="truncate">{item.label}</span>}
            </NavLink>
          );
        })}
      </nav>
    </aside>
  );
}
