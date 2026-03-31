"use client";

import Link from "next/link";
import { ChevronRight } from "lucide-react";

interface BreadcrumbItem {
  name: string;
  href?: string;
}

interface BreadcrumbProps {
  items: BreadcrumbItem[];
  cssClasses?: string;
}

const Breadcrumb: React.FC<BreadcrumbProps> = ({ items, cssClasses = '' }) => {
  if (!items || items.length === 0) return null;

  return (
    <nav
      className={`flex items-center text-gray-500 text-sm ${cssClasses}`}
      aria-label="breadcrumb"
    >
      {items.map((item, index) => {
        const isLast = index === items.length - 1;
        return (
          <div key={index} className="flex items-center">
            {item.href && !isLast ? (
              <Link href={item.href} className="hover:text-blue-600 transition">
                {item.name}
              </Link>
            ) : (
              <span className="text-gray-700 font-semibold">{item.name}</span>
            )}
            {!isLast && <ChevronRight className="w-4 h-4 mx-2" />}
          </div>
        );
      })}
    </nav>
  );
};

export default Breadcrumb;
