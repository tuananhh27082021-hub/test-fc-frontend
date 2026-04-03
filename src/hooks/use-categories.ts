import { useQuery } from '@tanstack/react-query';

import { appQueryKeys } from '@/config/query';
import api from '@/libs/api';

export const useFetchCategories = () => {
  return useQuery({
    queryKey: [...appQueryKeys.categories.root],
    queryFn: () => api.getCategories(),
  });
};
