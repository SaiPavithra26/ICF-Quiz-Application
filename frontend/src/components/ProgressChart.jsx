import { PieChart, Pie, Tooltip, Cell } from "recharts";

const COLORS = ["#4caf50", "#f44336"];

const ProgressChart = ({ correct, wrong }) => {
  const data = [
    { name: "Correct", value: correct },
    { name: "Wrong", value: wrong },
  ];

  return (
    <PieChart width={300} height={300}>
      <Pie
        data={data}
        dataKey="value"
        nameKey="name"
        outerRadius={120}
        label
      >
        {data.map((entry, i) => (
          <Cell key={`cell-${i}`} fill={COLORS[i % COLORS.length]} />
        ))}
      </Pie>
      <Tooltip />
    </PieChart>
  );
};

export default ProgressChart;
