import type { User } from '@/types/schema';

export function isAdmin(user: User | undefined): boolean {
  return ['ADMIN', 'SUPER_ADMIN'].includes(user?.role?.toUpperCase() || '');
}

export function isSuperAdmin(user: User | undefined): boolean {
  return user?.role?.toUpperCase() === 'SUPER_ADMIN';
}
