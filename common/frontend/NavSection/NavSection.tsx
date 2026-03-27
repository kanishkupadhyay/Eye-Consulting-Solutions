import { usePathname } from "next/navigation";
import { INavSectionProps } from "./NavSection.Model";
import Link from "next/link";

const NavSection = ({ title, items }: INavSectionProps) => {
  const pathname = usePathname();

  return (
    <div className="mt-6 mx-2">
      <p className="text-xs text-gray-400 uppercase px-4 mb-2">{title}</p>

      <div className="flex flex-col gap-1">
        {items.map((item) => {
          // Check if the current pathname starts with the item's href (for nested route matching)
          const isActive = pathname?.startsWith(item.href);
          const Icon = item.icon;

          return (
            <Link
              key={item.name}
              href={item.href}
              className={`flex items-center justify-between px-4 py-3 rounded-lg text-sm transition
                ${isActive
                  ? "bg-orange-500 text-white"
                  : "text-gray-300 hover:bg-gray-800"
                }`}
            >
              <div className="flex items-center gap-3">
                <Icon size={18} />
                {item.name}
              </div>

              {item.badge && (
                <span className="bg-orange-500 text-white text-xs px-2 py-0.5 rounded-full">
                  {item.badge}
                </span>
              )}
            </Link>
          );
        })}
      </div>
    </div>
  );
};

export default NavSection;