'use client';

import dayjs from 'dayjs';
import { FaGift } from 'react-icons/fa';
import { useAccount } from 'wagmi';

import { useTokenBalance } from '@/hooks/use-contract';
import { useGetDailyReward, useGetMember } from '@/hooks/use-member';
import { useToast } from '@/hooks/use-toast';
import api from '@/libs/api';
import { Env } from '@/libs/Env';

import { Button } from '../ui/button';

export const MobileActionButtons = () => {
  const { address } = useAccount();
  const { toast } = useToast();

  const { data, refetch: refetchClaimData } = useGetDailyReward(address);
  const claimed = !!data?.data?.daily_reward_id;
  const { refetch } = useTokenBalance(Env.NEXT_PUBLIC_POINT_TOKEN_ADDRESS);

  const { data: memberData, refetch: refetchMemberData }
    = useGetMember(address);
  const member = memberData?.data;

  const hasCheckedInToday = member?.lastCheckin
    ? dayjs(member.lastCheckin).isSame(dayjs(), 'day')
    : false;

  const handleDailyCheckin = async () => {
    if (!address) {
      toast({
        title: 'Please connect your wallet first',
        variant: 'danger',
      });
      return;
    }

    try {
      const response = await api.memberCheckin(address);

      if (response.success) {
        toast({
          title: 'Daily check-in successful',
          variant: 'success',
        });

        refetch();
        refetchClaimData();
        refetchMemberData();

        // Reload the page after successful check-in
        // window.location.reload();
      } else {
        throw new Error(response.error || 'Check-in failed');
      }
    } catch (error: any) {
      console.error(error);
      toast({
        title: 'Oops! Something went wrong',
        description: error?.message,
        variant: 'danger',
      });
    }
  };

  return (
    <div className="flex items-center justify-center">
      <Button
        onClick={handleDailyCheckin}
        disabled={claimed || hasCheckedInToday}
        variant="outline"
        noShadow
        startDecorator={<FaGift className="block size-3" color="#3B27DF" />}
        startDecoratorClassName="mr-2 inline-flex items-center justify-center w-3 h-3"
        className="font-sf-pro-text h-12 border-[#3B27DF] text-xs font-semibold leading-none text-[#3B27DF]"
      >
        Daily Reward
      </Button>

      {/* <ExchangeDialog>
        <Button
          variant="default"
          noShadow
          startDecorator={
            <ArrowLeftRight className="size-3.5 bg-transparent text-white" />
          }
          className="font-sf-pro-text h-12 bg-[#3B27DF] text-xs font-semibold leading-none text-white"
        >
          Exchange
        </Button>
      </ExchangeDialog> */}
    </div>
  );
};
