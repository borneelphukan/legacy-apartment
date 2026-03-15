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
  olClasses = "container inline-flex items-center space-x-1 md:space-x-3 m-4 md:pl-20 pl-4",
  linkClasses = "inline-flex items-center text-sm font-normal text-gray-700 hover:text-orange-500",
  activeClasses = "ml-1 text-sm font-normal text-gray-700 md:ml-2",
  svgClasses = "w-3 h-3 text-gray-400 mx-1"
}) => {
  return (
    <nav className={containerClasses} aria-label="Breadcrumb">
      <ol className={olClasses}>
        {items.map((item, index) => {
          const isFirst = index === 0;
          return (
            <li key={index} className={isFirst ? "inline-flex items-center" : ""}>
              {isFirst ? (
                item.href ? (
                  <Link href={item.href} className={linkClasses}>
                    {item.label}
                  </Link>
                ) : (
                  <span className={linkClasses}>{item.label}</span>
                )
              ) : (
                <div className="flex items-center">
                  <Icon type="keyboard_arrow_right" className={svgClasses} />
                  {item.href ? (
                    <Link href={item.href} className={activeClasses}>
                      {item.label}
                    </Link>
                  ) : (
                    <p className={activeClasses}>{item.label}</p>
                  )}
                </div>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
};

export default Breadcrumb;
