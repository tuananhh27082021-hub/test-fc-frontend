import { useQuery } from '@tanstack/react-query';

import { appQueryKeys } from '@/config/query';
import api from '@/libs/api';

export const useFetchTopics = () => {
  return useQuery({
    queryKey: [...appQueryKeys.topics.root],
    queryFn: () => api.getTopics(),
  });
};
