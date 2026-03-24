import { NavItem } from "../NavSection/NavSection.Model";
import {
  LayoutDashboard,
  Users,
  Briefcase,
  GitBranch,
  Calendar,
  MessageSquare,
  BarChart3,
  Settings,
} from "lucide-react";

export const mainNav: NavItem[] = [
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { name: "Candidates", href: "/candidates", icon: Users, badge: 24 },
  { name: "Job Openings", href: "/jobs", icon: Briefcase, badge: 12 },
  { name: "Pipeline", href: "/pipeline", icon: GitBranch },
  { name: "Interviews", href: "/interviews", icon: Calendar },
];

export const toolsNav: NavItem[] = [
  { name: "Messages", href: "/messages", icon: MessageSquare, badge: 5 },
  { name: "Reports", href: "/reports", icon: BarChart3 },
  { name: "Settings", href: "/settings", icon: Settings },
];
