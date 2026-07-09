"use client";

import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, CartesianGrid } from "recharts";

interface RankingBarChartProps {
  data: { usuario: string; puntaje: number }[];
}

const COLORS = ["#D4AF37", "#E8C555", "#1B4F86", "#3F68A8", "#688DCA"];

export default function RankingBarChart({ data }: RankingBarChartProps) {
  return (
    <ResponsiveContainer width="100%" height={Math.max(260, data.length * 48)}>
      <BarChart data={data} layout="vertical" margin={{ left: 8, right: 24 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#22406A" horizontal={false} />
        <XAxis type="number" stroke="#8CA3C7" fontSize={12} allowDecimals={false} />
        <YAxis type="category" dataKey="usuario" stroke="#8CA3C7" fontSize={12} width={90} />
        <Tooltip
          contentStyle={{ background: "#132B49", border: "1px solid #22406A", borderRadius: 8, color: "#fff" }}
          cursor={{ fill: "rgba(212,175,55,0.08)" }}
        />
        <Bar dataKey="puntaje" radius={[0, 6, 6, 0]}>
          {data.map((_, i) => (
            <Cell key={i} fill={COLORS[i % COLORS.length]} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}
