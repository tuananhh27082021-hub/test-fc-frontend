import Link from 'next/link';
import React, { memo } from 'react';

import { Button } from '@/components/ui/button';

import type { NavItem } from './constants';

// Memoized components for better performance
export const DesktopNav = memo(
  ({ items, segment }: { items: NavItem[]; segment: string | null }) => {
    const getButtonVariant = (route: string) => {
      return segment === route.replace('/', '') ? 'highlight' : 'link';
    };

    return (
      <nav className="hidden items-center gap-2 sm:flex">
        {items.map(item => (
          <Link key={item.href} href={item.href} prefetch={false}>
            <Button
              noShadow
              variant={getButtonVariant(item.href)}
              className="font-semibold"
            >
              {item.label}
            </Button>
          </Link>
        ))}
      </nav>
    );
  },
);

DesktopNav.displayName = 'DesktopNav';
