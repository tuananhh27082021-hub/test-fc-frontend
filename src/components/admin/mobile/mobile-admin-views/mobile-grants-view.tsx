'use client';

import { Skeleton } from '../../../ui/skeleton';

interface MobileGrantsViewProps {
  grantsData: any;
  isLoadingGrants: boolean;
}

export const MobileGrantsView = ({ grantsData, isLoadingGrants }: MobileGrantsViewProps) => {
  return (
    <>
      <div className="mb-2 flex gap-x-2 px-1 text-[10px] font-medium text-black/50">
        <span className="w-8 pl-2">No</span>
        <span className="w-32 pl-2">Wallet Address</span>
        <span className="w-16 text-center">Status</span>
      </div>

      {isLoadingGrants
        ? (
            <div className="space-y-2">
              {['a', 'b', 'c', 'd', 'e'].map(key => (
                <div key={key}>
                  <Skeleton className="h-4 w-full" />
                </div>
              ))}
            </div>
          )
        : (
            <div className="space-y-2">
              {grantsData?.data?.map((grant: any) => (
                <div key={grant.no} className="flex items-center gap-x-2 text-[10px]">
                  <span className="w-8 pl-2 text-black">{grant.no}</span>
                  <span className="w-32 truncate pl-2 text-black">{grant.walletAddress}</span>
                  <span
                    className={`w-16 rounded-full px-2 py-1 text-center text-[8px] font-medium ${
                      grant.finishStatus === 'Active'
                        ? 'bg-green-100 text-green-700'
                        : 'bg-red-100 text-red-700'
                    }`}
                  >
                    {grant.finishStatus}
                  </span>
                </div>
              )) || (
                <div className="py-4 text-center">
                  <span className="font-baloo-2 text-[12px] text-black/50">No grants data available</span>
                </div>
              )}
            </div>
          )}
    </>
  );
};
