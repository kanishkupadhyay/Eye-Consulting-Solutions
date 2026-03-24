export enum StatsCardType {
  ORANGE = "ORANGE",
  BLUE = "BLUE",
  GREEN = "GREEN",
  PURPLE = "PURPLE",
  DEFAULT = "DEFAULT",
}

export interface IStatsCardProps {
  title: string;
  value: number | string;
  icon: React.ReactNode;
  trendText?: string;
  trendType?: "up" | "down" | "neutral";
  type?: StatsCardType;
}