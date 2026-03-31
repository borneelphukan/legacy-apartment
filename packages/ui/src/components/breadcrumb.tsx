import Link from "next/link";
import { Icon } from "./icon";
import React from "react";

export interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface BreadcrumbProps {
  items: BreadcrumbItem[];
  containerClasses?: string;
  olClasses?: string;
  linkClasses?: string;
  activeClasses?: string;
  svgClasses?: string;
}

const Breadcrumb: React.FC<BreadcrumbProps> = ({ 
  items, 
  containerClasses = "flex", 
  olClasses = "container flex items-center space-x-1 md:space-x-2 m-4 md:pl-20 pl-4",
  linkClasses = "flex items-center text-sm font-normal text-gray-700 hover:text-orange-500 transition-colors uppercase tracking-[0.05em]",
  activeClasses = "text-sm font-bold text-gray-900 uppercase tracking-[0.05em]",
  svgClasses = "text-gray-400 mx-2"
}) => {
  return (
    <nav className={containerClasses} aria-label="Breadcrumb">
      <ol className={olClasses}>
        {items.map((item, index) => {
          const isFirst = index === 0;
          return (
            <li key={index} className="flex items-center">
              {!isFirst && (
                <Icon type="keyboard_arrow_right" className={svgClasses} size="xs" />
              )}
              {item.href ? (
                <Link href={item.href} className={isFirst ? linkClasses : activeClasses}>
                  {item.label}
                </Link>
              ) : (
                <span className={isFirst ? linkClasses : activeClasses}>
                  {item.label}
                </span>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
};

export default Breadcrumb;
