import { useQuery } from '@tanstack/react-query';

import { appQueryKeys } from '@/config/query';

export type Grant = {
  no: string;
  walletAddress: string;
  finishStatus: 'Active' | 'Inactive';
};

export const useFetchGrants = () => {
  return useQuery({
    queryKey: [...appQueryKeys.dao.root, 'grants'],
    queryFn: async () => {
      const mockGrants: Grant[] = [
        {
          no: '01',
          walletAddress: 'CL367Jo8mHhLrXn9NxQi9kwAhpTCyCAPggLQymaagEme',
          finishStatus: 'Active',
        },
        {
          no: '02',
          walletAddress: 'CL367Jo8mHhLrXn9NxQi9kwAhpTCyCAPggLQymaagEme',
          finishStatus: 'Inactive',
        },
        {
          no: '03',
          walletAddress: 'CL367Jo8mHhLrXn9NxQi9kwAhpTCyCAPggLQymaagEme',
          finishStatus: 'Active',
        },
        {
          no: '04',
          walletAddress: 'CL367Jo8mHhLrXn9NxQi9kwAhpTCyCAPggLQymaagEme',
          finishStatus: 'Inactive',
        },
        {
          no: '05',
          walletAddress: 'CL367Jo8mHhLrXn9NxQi9kwAhpTCyCAPggLQymaagEme',
          finishStatus: 'Active',
        },
      ];

      return {
        data: mockGrants,
        total: mockGrants.length,
      };
    },
    staleTime: 0,
    gcTime: 10 * 60 * 1000, // 10 minutes
    refetchOnMount: 'always',
  });
};
