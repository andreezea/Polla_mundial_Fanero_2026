"use client";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";

interface EvolutionLineChartProps {
  data: Record<string, string | number>[];
  usuarios: string[];
}

const COLORS = ["#D4AF37", "#3F68A8", "#E8C555", "#688DCA", "#B3922B", "#9AB3DC", "#8C7220", "#CBD9EE"];

export default function EvolutionLineChart({ data, usuarios }: EvolutionLineChartProps) {
  return (
    <ResponsiveContainer width="100%" height={380}>
      <LineChart data={data} margin={{ left: 4, right: 16, top: 10 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#22406A" />
        <XAxis dataKey="etapa" stroke="#8CA3C7" fontSize={12} />
        <YAxis stroke="#8CA3C7" fontSize={12} allowDecimals={false} />
        <Tooltip
          contentStyle={{ background: "#132B49", border: "1px solid #22406A", borderRadius: 8, color: "#fff" }}
        />
        <Legend wrapperStyle={{ fontSize: 12, color: "#cbd5e1" }} />
        {usuarios.map((u, i) => (
          <Line
            key={u}
            type="monotone"
            dataKey={u}
            stroke={COLORS[i % COLORS.length]}
            strokeWidth={2.5}
            dot={{ r: 3 }}
            activeDot={{ r: 5 }}
          />
        ))}
      </LineChart>
    </ResponsiveContainer>
  );
}
