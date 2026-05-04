// components/StatsCard.tsx

interface StatsCardProps {
  title: string;
  value: number | string;
  color: string;
}

export function StatsCard({ title, value, color }: StatsCardProps) {
  return (
    <div className={`p-6 bg-white rounded-xl border border-slate-200 shadow-sm border-l-4 ${color} transition-all hover:shadow-md`}>
      <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">
        {title}
      </p>
      <div className="flex items-baseline mt-2 gap-2">
        <h3 className="text-3xl font-extrabold text-slate-700">
          {value}
        </h3>
        <span className="text-xs text-slate-400 font-medium italic">Data</span>
      </div>
    </div>
  );
}