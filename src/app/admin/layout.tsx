'use client';

import { ReceiptTextIcon } from 'lucide-react';
import Link from 'next/link';
import { useSelectedLayoutSegment } from 'next/navigation';

import TabButton from '@/components/admin/tab-button';
import { Typography } from '@/components/ui/typography';
import { ROUTES } from '@/config/routes';
import { MenuBoardIcon } from '@/icons/icons';
import { isSuperAdmin } from '@/utils/member';

import { useAuth } from '../auth-provider';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const segment = useSelectedLayoutSegment();
  const { user } = useAuth();

  return (
    <main className="bg-secondary">
      <div className="rounded-b-6 border-b border-border bg-white">
        <div className="app-container py-[60px]">
          <Typography level="h3" className="font-clash-display">
            Admin Panel
          </Typography>
        </div>
      </div>

      <div className="app-container relative py-24">
        <div className="absolute top-0 flex items-center gap-6">
          <Link href={ROUTES.ADMIN_PLAY_GAME}>
            <TabButton active={!segment}>
              <MenuBoardIcon />
              FORECAST Votes
            </TabButton>
          </Link>

          {isSuperAdmin(user) && (
            <Link href={ROUTES.ADMIN_GRANTS}>
              <TabButton active={segment === 'grant-admin'}>
                <ReceiptTextIcon />
                Grants Admin
              </TabButton>
            </Link>
          )}

          <Link href={ROUTES.ADMIN_DISTRIBUTE}>
            <TabButton active={segment === 'distribute'}>
              <ReceiptTextIcon />
              Distribute
            </TabButton>
          </Link>
        </div>
        {children}
      </div>
    </main>
  );
}
