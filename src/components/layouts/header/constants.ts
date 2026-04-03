import { ROUTES } from '@/config/routes';

// Navigation item type
export interface NavItem {
  href: string;
  label: string;
  icon?: React.ReactNode;
}

// Predefined navigation items to prevent recreation on each render
export const DESKTOP_NAV_ITEMS: NavItem[] = [
  {
    href: ROUTES.QUESTS,
    label: 'Quest',
  },
  {
    href: ROUTES.RESULTS,
    label: 'Result',
  },
];

export const BOTTOM_NAV_ITEMS: NavItem[] = [
  {
    href: ROUTES.HOME,
    label: 'Home',
  },
  {
    href: ROUTES.QUESTS,
    label: 'Quest',
  },
  {
    href: ROUTES.RESULTS,
    label: 'Result',
  },
];
