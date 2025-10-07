// components/summary-card/youth.tsx

interface SummaryCardProps {
  title: string;
  value: number | string;
  icon: JSX.Element;
  onClick?: () => void;
}

// Summary card component for Youth
export default function SummaryCardYouth({ title, value, icon, onClick }: SummaryCardProps) {
  return (
    <div
      onClick={onClick}
      className="cursor-pointer hover:shadow-lg transition-all flex justify-between items-center p-3 bg-white shadow-md rounded-lg w-[370px] h-[100px]"
    >
      <div>
        <p className="text-sm text-gray-500">{title}</p>
        <p className="text-xl font-bold">{value}</p>
      </div>
      <div className="text-3xl text-gray-400">
        {icon}
      </div>
    </div>
  );
}
