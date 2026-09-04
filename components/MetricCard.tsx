interface MetricCardProps {
  label: string;
  value: string;
  detail?: string;
}

export default function MetricCard({ label, value, detail }: MetricCardProps) {
  return (
    <div className="min-w-0 rounded-3xl border border-slate-200/80 bg-white/90 p-5 shadow-sm shadow-slate-900/5">
      <div className="text-xs uppercase tracking-[0.3em] text-slate-500">{label}</div>
      <div className="mt-3 truncate text-3xl font-semibold text-slate-900">{value}</div>
      {detail ? <div className="mt-2 min-h-10 text-sm leading-5 text-slate-500">{detail}</div> : null}
    </div>
  );
}
