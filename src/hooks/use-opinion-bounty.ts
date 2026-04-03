import { useEffect, useState } from 'react';

import { OPINION_BOUNTY_CATEGORY } from '@/config/constants';
import type { QuestDetail } from '@/types/schema';

export const useOpinionBounty = (quest?: QuestDetail) => {
  const [isOpinionBounty, setOpinionBounty] = useState(false);

  useEffect(() => {
    setOpinionBounty(
      quest?.quest_category?.quest_category_title === OPINION_BOUNTY_CATEGORY,
    );
  }, [quest]);

  return isOpinionBounty;
};
