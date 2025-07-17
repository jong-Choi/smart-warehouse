import React from "react";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";

interface DonutChartData {
  name: string;
  value: number;
  color: string;
}

interface DonutChartProps {
  data: DonutChartData[];
  width?: number;
  height?: number;
}

const CustomTooltip = ({
  active,
  payload,
}: {
  active?: boolean;
  payload?: any[];
}) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white p-2 border rounded shadow-lg text-sm">
        <p className="font-medium">{payload[0].name}</p>
        <p className="text-gray-600">{payload[0].value}개</p>
      </div>
    );
  }
  return null;
};

export const DonutChart: React.FC<DonutChartProps> = ({
  data,
  width = 200,
  height = 200,
}) => {
  return (
    <ResponsiveContainer width={width} height={height}>
      <PieChart>
        <Pie
          data={data}
          cx="50%"
          cy="50%"
          innerRadius={60}
          outerRadius={80}
          paddingAngle={5}
          dataKey="value"
        >
          {data.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={entry.color} />
          ))}
        </Pie>
        <Tooltip
          content={<CustomTooltip />}
          animationDuration={0}
          animationEasing="linear"
        />
      </PieChart>
    </ResponsiveContainer>
  );
};
