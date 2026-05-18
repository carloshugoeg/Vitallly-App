'use client';

interface TabNavigationProps<T extends string | number> {
  tabs: string[];
  activeTab: T;
  onChange: (tab: T) => void;
}

export default function TabNavigation<T extends string | number>({ tabs, activeTab, onChange }: TabNavigationProps<T>) {
  return (
    <div className="flex gap-1 border-b border-gray-200 overflow-x-auto">
      {tabs.map((tab, i) => {
        const value = (typeof activeTab === 'number' ? i : tab) as T;
        return (
          <button
            key={tab}
            onClick={() => onChange(value)}
            className={`whitespace-nowrap flex-shrink-0 px-4 py-2.5 text-sm font-medium transition-colors border-b-2 -mb-px ${
              activeTab === value
                ? 'border-primary text-primary'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            {tab}
          </button>
        );
      })}
    </div>
  );
}
