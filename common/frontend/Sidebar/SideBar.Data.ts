import { NavItem } from "../NavSection/NavSection.Model";
import {
  LayoutDashboard,
  Users,
  Briefcase,
  GitBranch,
  Calendar,
  UsersRound,
  MessageSquare,
  BarChart3,
  Settings,
} from "lucide-react";

export const mainNav: NavItem[] = [
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { name: "Clients", href: "/clients", icon: UsersRound },
  { name: "Candidates", href: "/candidates", icon: Users },
  { name: "Job Openings", href: "/jobs", icon: Briefcase },
  { name: "Pipeline", href: "/pipeline", icon: GitBranch },
  { name: "Interviews", href: "/interviews", icon: Calendar },
];

export const toolsNav: NavItem[] = [
  { name: "Messages", href: "/messages", icon: MessageSquare },
  { name: "Reports", href: "/reports", icon: BarChart3 },
  { name: "Settings", href: "/settings", icon: Settings },
];
