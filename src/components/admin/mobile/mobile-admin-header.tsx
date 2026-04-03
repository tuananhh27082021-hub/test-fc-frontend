'use client';

import { useMemo, useState } from 'react';

import { Typography } from '../../ui/typography';

interface MobileAdminHeaderProps {
  currentView: string;
  onViewChange: (view: string) => void;
  isSuperAdmin?: boolean;
}

export const MobileAdminHeader = ({
  currentView,
  onViewChange,
  isSuperAdmin = false,
}: MobileAdminHeaderProps) => {
  const [showFilterMenu, setShowFilterMenu] = useState(false);

  const toggleFilterMenu = () => {
    setShowFilterMenu(!showFilterMenu);
  };

  const handleViewChange = (view: string) => {
    onViewChange(view);
    setShowFilterMenu(false);
  };

  const menuItems = useMemo(() => {
    const baseItems = [
      'In Progress',
      'Draft',
      'Publish',
      'Answer',
      'Success',
      'Archived',
      'Distribution',
    ];

    if (isSuperAdmin) {
      return [...baseItems, 'Grants Admin'];
    }

    return baseItems;
  }, [isSuperAdmin]);

  return (
    <div className="flex items-center justify-between">
      <Typography
        level="body2"
        className="font-baloo-2 text-base font-bold text-black"
      >
        Admin Panel
      </Typography>
      <div className="relative">
        <button
          type="button"
          className="size-6"
          aria-label="Admin filters"
          onClick={toggleFilterMenu}
        >
          <div className="relative size-6">
            <div className="absolute left-[3px] top-[4.3px] h-[6.86px] w-[18px]">
              <div className="absolute left-0 top-[3.21px] h-px w-[18px] bg-black" />
              <div className="absolute left-[9px] top-0 size-[6.86px] rounded-full border border-black bg-white" />
            </div>
            <div className="absolute left-[3px] top-[12.86px] h-[6.86px] w-[18px]">
              <div className="absolute left-0 top-[3.64px] h-px w-[18px] bg-black" />
              <div className="absolute left-[2.14px] top-0 size-[6.86px] rounded-full border border-black bg-white" />
            </div>
          </div>
        </button>

        {/* Filter Dropdown Menu */}
        {showFilterMenu && (
          <div className="absolute right-0 top-8 z-50 w-40 rounded-lg border border-black/10 bg-white p-4 shadow-lg">
            <div className="space-y-2">
              {menuItems.map(view => (
                <button
                  key={view}
                  type="button"
                  onClick={() => handleViewChange(view)}
                  className={`w-full text-left font-baloo-2 text-xs text-black hover:bg-gray-50 ${
                    currentView === view ? 'font-bold text-[#3B27DF]' : ''
                  }`}
                >
                  {view}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
