import { LucideIcon } from "lucide-react";

interface KpiCardProps {
  icon: LucideIcon;
  label: string;
  value: string | number;
  hint?: string;
}

export default function KpiCard({ icon: Icon, label, value, hint }: KpiCardProps) {
  return (
    <div className="kpi-card">
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">{label}</span>
        <Icon size={18} className="text-gold" />
      </div>
      <span className="text-3xl font-extrabold text-white">{value}</span>
      {hint && <span className="text-xs text-slate-400">{hint}</span>}
    </div>
  );
}
