import { PieChart, Pie, Cell, Tooltip } from "recharts";

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

interface TooltipPayload {
  name: string;
  value: number;
  color: string;
}

const CustomTooltip = ({
  active,
  payload,
}: {
  active?: boolean;
  payload?: TooltipPayload[];
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
    <PieChart width={width} height={height}>
      <Pie
        data={data}
        cx="50%"
        cy="50%"
        innerRadius={0}
        outerRadius={85}
        paddingAngle={0}
        dataKey="value"
        isAnimationActive={false}
      >
        {data.map((entry, index) => (
          <Cell key={`cell-${index}`} fill={entry.color} />
        ))}
      </Pie>
      <Tooltip
        content={<CustomTooltip />}
        animationDuration={0}
        animationEasing="linear"
        isAnimationActive={false}
      />
    </PieChart>
  );
};
