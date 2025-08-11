type SummaryCardCertificateProps = {
  title: string;
  value: number;
  icon: JSX.Element;
  onClick?: () => void;
};

export default function SummaryCardCertificate({ title, value, icon, onClick }: SummaryCardCertificateProps) {
  return (
    <div
      onClick={onClick}
      className="cursor-pointer hover:shadow-lg transition-all flex justify-between items-center p-3 bg-white shadow-md rounded-lg w-[370px] h-[100px]"
    >
      <div>
        <p className="text-sm text-gray-500">{title}</p>
        <p className="text-xl font-bold">{value}</p>
      </div>
      <div className="text-3xl text-gray-400">{icon}</div>
    </div>
  );
}
