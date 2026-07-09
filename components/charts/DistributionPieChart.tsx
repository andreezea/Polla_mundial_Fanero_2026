"use client";

import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from "recharts";

interface DistributionPieChartProps {
  title: string;
  data: { equipo: string; predicciones: number }[];
}

const COLORS = ["#0B1F3A", "#D4AF37", "#1B4F86", "#F1D97A", "#3F68A8"];

export default function DistributionPieChart({ title, data }: DistributionPieChartProps) {
  return (
    <div className="card p-4">
      <h4 className="mb-2 text-center text-sm font-semibold text-slate-200">{title}</h4>
      <ResponsiveContainer width="100%" height={260}>
        <PieChart>
          <Pie
            data={data}
            dataKey="predicciones"
            nameKey="equipo"
            innerRadius={55}
            outerRadius={90}
            paddingAngle={2}
          >
            {data.map((_, i) => (
              <Cell key={i} fill={COLORS[i % COLORS.length]} stroke="#0F2540" />
            ))}
          </Pie>
          <Tooltip
            contentStyle={{ background: "#132B49", border: "1px solid #22406A", borderRadius: 8, color: "#fff" }}
          />
          <Legend wrapperStyle={{ fontSize: 12, color: "#cbd5e1" }} />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}
