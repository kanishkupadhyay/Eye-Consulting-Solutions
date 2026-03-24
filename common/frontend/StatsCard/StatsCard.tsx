import { IStatsCardProps, StatsCardType } from "./StatsCard.Model";

const StatsCard = ({
  title,
  value,
  icon,
  trendText,
  trendType = "neutral",
  type = StatsCardType.DEFAULT,
}: IStatsCardProps) => {
  const trendColor =
    trendType === "up"
      ? "text-green-600"
      : trendType === "down"
        ? "text-red-500"
        : "text-gray-400";

  const borderColorMap = {
    [StatsCardType.ORANGE]: "border-orange-500",
    [StatsCardType.BLUE]: "border-blue-500",
    [StatsCardType.GREEN]: "border-green-500",
    [StatsCardType.PURPLE]: "border-purple-500",
    [StatsCardType.DEFAULT]: "border-gray-200",
  };

  return (
    <div
      className={`bg-white rounded-xl p-5 shadow-sm border-t-4 ${
        borderColorMap[type]
      } 
  transition-all duration-300 ease-in-out
  hover:-translate-y-1 hover:shadow-lg hover:scale-[1.02]`}
    >
      {/* Icon */}
      <div className="mb-4">{icon}</div>

      {/* Value */}
      <h2 className="text-3xl font-bold text-gray-900">{value}</h2>

      {/* Title */}
      <p className="text-sm text-gray-500 mt-1">{title}</p>

      {/* Trend */}
      {trendText && <p className={`text-sm mt-2 ${trendColor}`}>{trendText}</p>}
    </div>
  );
};

export default StatsCard;
