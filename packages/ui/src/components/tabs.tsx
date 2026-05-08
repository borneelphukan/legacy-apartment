import React, { useState, type ReactNode } from "react";
import { Icon, IconType } from "./icon";

export type TabItemValue<T extends readonly TabItem[]> = T[number]["value"];

interface TabItem {
  value: string;
  label: ReactNode;
  content: React.ReactNode;
  icon?: IconType;
}

interface TabsProps<T extends readonly TabItem[]> {
  tabs: T;
  defaultTab?: TabItemValue<T>;
  activeTab?: TabItemValue<T>;
  onTabChange?: (tab: TabItemValue<T>) => void;
}

export const Tabs = <T extends readonly TabItem[]>({
  tabs,
  defaultTab,
  activeTab: controlledActiveTab,
  onTabChange,
}: TabsProps<T>) => {
  const [internalActiveTab, setInternalActiveTab] = useState<string>(
    defaultTab || (tabs.length > 0 ? tabs[0].value : "")
  );

  const activeTab = controlledActiveTab !== undefined ? controlledActiveTab : internalActiveTab;

  const handleTabClick = (value: string) => {
    if (onTabChange) {
      onTabChange(value as TabItemValue<T>);
    }
    setInternalActiveTab(value);
  };

  const currentTab = tabs.find((t) => t.value === activeTab);

  return (
    <div className="flex flex-col gap-4 w-full">
      <div className="flex overflow-auto border-b border-gray-400 dark:border-gray-800 w-full">
        {tabs.map((tab) => {
          const isActive = tab.value === activeTab;
          return (
            <button
              key={`tab-trigger-${tab.value}`}
              type="button"
              onClick={() => handleTabClick(tab.value)}
              className={`flex items-center justify-center gap-2 pt-2 pb-4 px-3 h-9 bg-none cursor-pointer relative text-sm transition-colors flex-1 whitespace-nowrap border-b-2 focus:outline-none ${
                isActive
                  ? "border-orange-500 text-orange-500 font-bold"
                  : "border-transparent text-gray-300 hover:text-dark hover:border-dark"
              }`}
            >
              {tab.icon && <Icon type={tab.icon} />}
              {tab.label}
            </button>
          );
        })}
      </div>
      <div className="tab-content animate-in fade-in duration-200 w-full">
        {currentTab?.content}
      </div>
    </div>
  );
};
