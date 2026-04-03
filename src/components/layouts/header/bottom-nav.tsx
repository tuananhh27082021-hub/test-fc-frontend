import Link from 'next/link';
import React, { memo } from 'react';

import { ROUTES } from '@/config/routes';
import HomeIcon from '@/icons/home-icon';
import QuestIcon from '@/icons/quest-icon';
import ResultIcon from '@/icons/result-icon';
import { cn } from '@/utils/cn';

import { BOTTOM_NAV_ITEMS } from './constants';
import { useScrollDirection } from './use-scroll-direction';

export const BottomNav = memo(({ segment }: { segment: string | null }) => {
  const direction = useScrollDirection();

  // Memoize navigation items with icons for mobile
  const mobileNavItemsWithIcons = React.useMemo(() =>
    BOTTOM_NAV_ITEMS.map((item) => {
      if (item.href === ROUTES.HOME) {
        return {
          ...item,
          icon: <HomeIcon isActive={!segment} />,
        };
      }
      if (item.href === ROUTES.QUESTS) {
        return {
          ...item,
          icon: <QuestIcon isActive={segment === ROUTES.QUESTS.replace('/', '')} />,
        };
      }
      if (item.href === ROUTES.RESULTS) {
        return {
          ...item,
          icon: <ResultIcon isActive={segment === ROUTES.RESULTS.replace('/', '')} />,
        };
      }
      return item;
    }), [segment]);

  const isActiveRoute = (href: string) => {
    if (href === ROUTES.HOME) {
      return !segment;
    }
    return segment === href.replace('/', '');
  };

  return (
    <div
      className={cn(
        'fixed inset-x-0 bottom-0 z-[100] flex items-center justify-around border-t border-gray-200 bg-white px-4 py-3 opacity-100 transition-all duration-250 ease-in-out lg:hidden',
        { 'translate-y-[100px] opacity-0': direction === 'down' },
      )}
    >
      {mobileNavItemsWithIcons.map((item) => {
        const isActive = isActiveRoute(item.href);
        return (
          <Link
            key={item.href}
            href={item.href}
            className="flex min-w-0 flex-1 flex-col items-center justify-center"
          >
            {item.icon && (
              <div
                className={cn(
                  'mb-1 flex h-6 w-6 items-center justify-center',
                  isActive ? 'text-[#3B27DF]' : 'text-[#9C9C9C]',
                )}
              >
                {item.icon}
              </div>
            )}
            <span
              className={cn(
                'text-xs font-medium',
                isActive ? 'text-[#3B27DF]' : 'text-[#9C9C9C]',
              )}
            >
              {item.label}
            </span>
          </Link>
        );
      })}
    </div>
  );
});

BottomNav.displayName = 'BottomNav';
