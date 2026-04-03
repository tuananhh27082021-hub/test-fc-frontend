'use client';

import { parseAsStringLiteral, useQueryState } from 'nuqs';

import { useAuth } from '@/app/auth-provider';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { Typography } from '@/components/ui/typography';
import { ClockIcon, GiftIcon, MenuBoardIcon, UserIcon } from '@/icons/icons';
import { cn } from '@/utils/cn';

import { LockTokenTable } from '../admin/lock-token-table';
import { GamesTable } from './games-table';
import { HistoryTable } from './history-table';
import { ReferralTable } from './referral-table';
import { VotingTable } from './votings-table';

export const ProfileActivities = () => {
  const { user } = useAuth();

  const options
    = user && user.delegatedTx
      ? [
          {
            key: 'games',
            name: 'Votes',
            icon: <MenuBoardIcon />,
          },
          {
            key: 'votings',
            name: 'Dao',
            icon: <MenuBoardIcon />,
          },
          // {
          //   key: 'mygames',
          //   name: 'My Games',
          //   icon: <MenuBoardIcon />,
          // },
          {
            key: 'history',
            name: 'History',
            icon: <ClockIcon className="text-3xl" />,
          },
          {
            key: 'referral',
            name: 'Referrals',
            icon: <UserIcon className="text-3xl" />,
          },
          {
            key: 'lock',
            name: 'Lock Tokens',
            icon: <GiftIcon className="text-3xl" />,
          },
        ]
      : [
          {
            key: 'games',
            name: 'Votes',
            icon: <MenuBoardIcon />,
          },
          {
            key: 'history',
            name: 'History',
            icon: <ClockIcon className="text-3xl" />,
          },
          {
            key: 'referral',
            name: 'Referrals',
            icon: <UserIcon className="text-3xl" />,
          },
          {
            key: 'lock',
            name: 'Lock Tokens',
            icon: <GiftIcon className="text-3xl" />,
          },
        ];

  const filterOptions = [
    'games',
    'votings',
    'mygames',
    'history',
    'referral',
    'lock',
  ] as const;

  const [type, setType] = useQueryState(
    'type',
    parseAsStringLiteral(filterOptions).withDefault('games'),
  );

  return (
    <div className="bg-secondary py-16">
      <div className="app-container overflow-hidden bg-background shadow-light lg:rounded-12">
        <div className="flex items-center justify-between py-6 md:px-4 md:py-8 lg:p-10">
          <div className="flex items-center gap-6">
            <Typography level="h4" asChild className="md:text-[32px]">
              <h3>
                {type === 'games' && 'Votes:'}
                {type === 'history' && 'History:'}
                {type === 'referral' && 'My Referrals:'}
                {type === 'lock' && 'Locked Tokens:'}
              </h3>
            </Typography>
          </div>
          <div className="flex flex-1 items-center justify-end">
            <ToggleGroup
              value={type}
              onValueChange={val => setType(val as any)}
              type="single"
              className="gap-4 lg:gap-6"
            >
              {options.map(option => (
                <ToggleGroupItem
                  key={option.key}
                  value={option.key}
                  variant="outline"
                  className={cn(
                    'size-12 gap-2 p-3 lg:w-auto',
                    type === option.key && 'pointer-events-none',
                  )}
                >
                  {option.icon}
                  <span className="max-lg:sr-only">{option.name}</span>
                </ToggleGroupItem>
              ))}
            </ToggleGroup>
          </div>
        </div>

        <div className="pb-10 md:px-4 lg:px-10">
          <ScrollArea className="h-[550px] overflow-auto">
            {type === 'games' && <GamesTable />}
            {type === 'votings' && <VotingTable />}
            {type === 'history' && <HistoryTable />}
            {type === 'referral' && <ReferralTable />}
            {type === 'lock' && <LockTokenTable />}
            <ScrollBar orientation="horizontal" />
          </ScrollArea>
        </div>
      </div>
    </div>
  );
};
