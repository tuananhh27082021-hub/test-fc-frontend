import { useQuery } from '@tanstack/react-query';

import { appQueryKeys } from '@/config/query';
import { liveKitAPI } from '@/utils/livestream';

/**
 * Hook to fetch live streaming rooms and determine which quests are currently live
 */
export const useLiveQuests = () => {
  return useQuery({
    queryKey: [...appQueryKeys.quests.root, 'live-rooms'],
    queryFn: async () => {
      try {
        const { rooms } = await liveKitAPI.getRooms();

        // Extract quest keys from room names and filter active rooms
        const liveQuestKeys = rooms
          .filter(room => room.numParticipants > 0)
          .map((room) => {
            // Room name format: "quest-{questKey}"
            if (room.name.startsWith('quest-')) {
              return room.name.replace('quest-', '');
            }
            return null;
          })
          .filter(Boolean) as string[];

        return {
          rooms,
          liveQuestKeys,
        };
      } catch (error) {
        console.error('Error fetching live rooms:', error);
        return {
          rooms: [],
          liveQuestKeys: [],
        };
      }
    },
    refetchInterval: 30000, // Refetch every 30 seconds to keep live status updated
    refetchIntervalInBackground: false,
    refetchOnMount: 'always',
    staleTime: 0,
  });
};

/**
 * Helper function to check if a specific quest is currently live
 */
export const useIsQuestLive = (questKey: string) => {
  const { data } = useLiveQuests();
  return data?.liveQuestKeys.includes(questKey) ?? false;
};
