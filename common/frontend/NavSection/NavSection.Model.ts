export interface NavItem {
  name: string;
  href: string;
  icon: any;
  badge?: number;
}

export interface INavSectionProps {
  title: string;
  items: NavItem[];
}
