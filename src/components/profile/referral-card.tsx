import * as Tooltip from '@radix-ui/react-tooltip';
import { ArrowRight, CheckIcon, CopyIcon, InfoIcon } from 'lucide-react';

import { useCopyToClipboard } from '@/hooks/use-copy-to-clipboard';
import { useGetMember } from '@/hooks/use-member';
import { useReferral } from '@/hooks/use-referral';
import { formatNumber } from '@/utils/number';

import { Skeleton } from '../ui/skeleton';
import { Typography } from '../ui/typography';

const ReferralCard = ({ walletAddress }: { walletAddress: string }) => {
  const { referralCode } = useReferral();
  const { data, isLoading } = useGetMember(walletAddress, referralCode);
  const [copiedText, copy, setCopiedText] = useCopyToClipboard();

  const user = data?.data;

  if (isLoading || !user) {
    return (
      <div className="w-full max-w-[520px] rounded-3xl border border-border bg-background p-8 shadow-light md:w-[30%]">
        <div className="p-6">
          <div className="mb-4 space-y-2">
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-8 w-40" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2 rounded-lg bg-blue-50 p-4">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-6 w-20" />
            </div>
            <div className="space-y-2 rounded-lg bg-green-50 p-4">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-6 w-20" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex w-full max-w-[520px] flex-col items-center justify-between gap-3 rounded-3xl border border-border bg-background p-8 shadow-light md:w-[30%]">
      <div className="flex items-center gap-2">
        <Typography level="h5">Referral</Typography>
        <Tooltip.Provider>
          <Tooltip.Root delayDuration={0}>
            <Tooltip.Trigger asChild>
              <InfoIcon />
            </Tooltip.Trigger>
            <Tooltip.Portal>
              <Tooltip.Content
                className="text-violet11 max-w-[300px] select-none rounded-lg border border-black bg-white px-[15px] py-2.5 text-[15px] leading-none shadow-[hsl(206_22%_7%_/_35%)_0px_10px_38px_-10px,_hsl(206_22%_7%_/_20%)_0px_10px_20px_-15px] will-change-[transform,opacity]"
                sideOffset={5}
                side="bottom"
              >
                <div className="flex w-full flex-col gap-5">
                  <div className="flex items-center gap-2">
                    <div>
                      <ArrowRight size={20} />
                    </div>
                    <p>
                      Earn
                      {' '}
                      <strong>100 FP</strong>
                      {' '}
                      when you create account.
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <div>
                      <ArrowRight size={20} />
                    </div>
                    <p>
                      Earn
                      {' '}
                      <strong>100 FP</strong>
                      {' '}
                      on your first voting, and
                      the referrer receives
                      {' '}
                      <strong>50 FP</strong>
                      .
                    </p>
                  </div>
                </div>
              </Tooltip.Content>
            </Tooltip.Portal>
          </Tooltip.Root>
        </Tooltip.Provider>
      </div>
      <div className="flex w-full flex-col items-center gap-3 rounded-2xl bg-[#E9F4FF] p-4">
        <Typography className="font-bold md:text-[40px]" level="h4">
          {formatNumber(Number(user.points), {
            minimumFractionDigits: 0,
          })}
        </Typography>
        <Typography level="body2" className="font-medium md:text-base">
          Forecast Points (
          <strong>FP</strong>
          )
        </Typography>
      </div>
      <div className="flex flex-wrap items-baseline gap-2">
        <Typography level="body1" className="text-left font-medium">
          Referral Link:
        </Typography>
        <div className="flex items-center justify-between gap-2">
          <Typography level="body2">
            {`${window.location.origin}/?ref=`}
            <strong
              style={{ color: 'rgb(30 144 255 / var(--tw-text-opacity, 1))' }}
            >
              {user.referralCode}
            </strong>
          </Typography>
          <button
            onClick={() => {
              if (walletAddress) {
                copy(
                  `${window.location.origin}/?ref=${user.referralCode}`,
                ).then(() =>
                  setTimeout(() => {
                    setCopiedText('');
                  }, 1000),
                );
              }
            }}
            className="flex size-6 items-center justify-center"
          >
            {copiedText
              ? (
                  <CheckIcon />
                )
              : (
                  <CopyIcon className="size-6 text-foreground-50" />
                )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ReferralCard;
