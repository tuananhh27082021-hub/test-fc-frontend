import { useQuery } from '@tanstack/react-query';
import {
  parseAsInteger,
  parseAsString,
  parseAsStringLiteral,
  useQueryState,
} from 'nuqs';

import { appQueryKeys } from '@/config/query';
import api from '@/libs/api';
import type { GetDAOQuestsRequest, GetQuestsParams } from '@/types/schema';

export const useFetchQuests = (params: GetQuestsParams = {}) => {
  return useQuery({
    queryKey: [
      ...appQueryKeys.quests.root,
      params.status,
      params.category,
      params.page,
      params.size,
      params.keyword,
      params.topic,
    ].filter(Boolean),
    queryFn: () => api.getQuests(params),
    refetchOnMount: 'always',
    staleTime: 0,
  });
};

export const useQuestsFilters = () => {
  const [category, setCategory] = useQueryState(
    'category',
    parseAsString.withDefault('all'),
  );

  const [topicSlug, setTopicSlug] = useQueryState('topic', parseAsString);

  // const questStatuses: (QuestStatus | 'all')[] = [
  //   'all',
  //   'DRAFT',
  //   'APPROVE',
  //   'ADJOURN',
  //   'PUBLISH',
  //   'FINISH',
  //   'DAO_SUCCESS',
  //   'MARKET_SUCCESS',
  //   'REJECT',
  // ];

  // const [status, setStatus] = useQueryState(
  //   'status',
  //   parseAsStringLiteral(questStatuses).withDefault('PUBLISH'),
  // );

  const [currentPage, setCurrentPage] = useQueryState(
    'page',
    parseAsInteger.withDefault(1),
  );

  return {
    currentPage,
    setCurrentPage,
    category,
    setCategory,
    topicSlug,
    setTopicSlug,
    // status,
    // setStatus,
  };
};

export const useFetchFeaturedQuests = () => {
  return useQuery({
    queryKey: [...appQueryKeys.quests.featured],
    queryFn: () => api.getFeaturedQuests(),
  });
};

export const useFetchPopularQuests = (keyword?: string) => {
  return useQuery({
    queryKey: [...appQueryKeys.quests.popular, keyword],
    queryFn: () => api.getPopularQuests({ page: 1, size: 8, keyword }),
    refetchOnMount: 'always',
    staleTime: 0,
  });
};

export const useFilterDAOQuests = () => {
  const filterOptions = ['draft', 'success', 'answer'] as const;

  const [status, setStatus] = useQueryState(
    'status',
    parseAsStringLiteral(filterOptions).withDefault('draft'),
  );

  const [currentPage, setCurrentPage] = useQueryState('page', parseAsInteger);

  return {
    currentPage,
    setCurrentPage,
    status,
    setStatus,
  };
};

export const useFetchDAOQuests = (params: GetDAOQuestsRequest) => {
  return useQuery({
    queryKey: [
      ...appQueryKeys.quests.dao,
      params.status,
      params.page,
      params.size,
    ].filter(Boolean),
    queryFn: () => api.getDAOQuests(params),
  });
};
