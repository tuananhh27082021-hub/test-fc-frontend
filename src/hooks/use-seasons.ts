import { useQuery } from '@tanstack/react-query';

import { appQueryKeys } from '@/config/query';
import api from '@/libs/api';

export const useFetchActiveSeason = () => {
  return useQuery({
    queryKey: [...appQueryKeys.season.active],
    queryFn: () => api.getActiveSeason(),
  });
};
