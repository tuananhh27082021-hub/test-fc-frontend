import dayjs from 'dayjs';

import type { BettingToken } from '@/config/constants';
import { MARKET_MAP_TOKEN, OPINION_BOUNTY_CATEGORY } from '@/config/constants';
import { Env } from '@/libs/Env';
import type {
  DAOQuestAnswer,
  DAOQuestCategory,
  DAOQuestDraft,
  DAOQuestSuccess,
  Quest,
  QuestDetail,
  MemberBetting,
} from '@/types/schema';

export const extractDAOQuest = (
  quest: DAOQuestDraft | DAOQuestSuccess | DAOQuestAnswer,
  status: DAOQuestCategory,
  maxDraftVote: number,
) => {
  const startAtMapping = {
    draft: (quest as DAOQuestDraft).dao_draft_start_at,
    success: (quest as DAOQuestSuccess).dao_success_start_at,
    answer: (quest as DAOQuestAnswer).dao_answer_start_at,
  };

  const startAt = startAtMapping[status];

  const endAtMapping = {
    draft: (quest as DAOQuestDraft).dao_draft_end_at,
    success: (quest as DAOQuestSuccess).dao_success_end_at,
    answer: (quest as DAOQuestAnswer).dao_answer_end_at,
  };

  const endAt = endAtMapping[status];

  const voteCountsMapping = {
    draft: {
      posVote: (quest as DAOQuestDraft).total_approve_power,
      negVote: (quest as DAOQuestDraft).total_reject_power,
      total: (quest as DAOQuestDraft).total_vote,
    },
    success: {
      posVote: (quest as DAOQuestSuccess).total_success_power,
      negVote: (quest as DAOQuestSuccess).total_adjourn_power,
      total: (quest as DAOQuestSuccess).total_vote,
    },
    answer: {
      posVote: 0,
      negVote: 0,
      total: (quest as DAOQuestAnswer).answers.reduce(
        (prev, curr) => prev + curr.total_answer_vote_power,
        0,
      ),
    },
  };

  const { posVote, negVote, total: totalVote } = voteCountsMapping[status];

  const maxVoteMapping = {
    draft: Number(maxDraftVote ?? 0),
    success: voteCountsMapping.draft.total,
    answer: voteCountsMapping.success.total,
  };

  const maxVote = maxVoteMapping[status];

  const isDraftEnd = endAtMapping.draft
    ? dayjs(endAtMapping.draft).isBefore(dayjs())
    : false;

  const isEndTime = endAt && dayjs(endAt).isBefore(dayjs());

  const isEnded = isEndTime || (status === 'draft' && totalVote >= maxVote);

  return {
    startAt,
    endAt,
    posVote,
    negVote,
    totalVote,
    canDraftVote: totalVote < maxVote && !isEndTime,
    canSuccessVote: totalVote < maxVote && !isEndTime,
    canAnswerVote: totalVote < maxVote && !isEndTime,
    isEndTime,
    isEnded,
    isDraftEnd,
  };
};

export const getQuestUrl = (key: string) =>
  `${Env.NEXT_PUBLIC_FE_URL}/quests/${key}`;

// FIXME

export const getMarketContract = (quest?: Quest | QuestDetail | any) => {
  return (
    (quest?.extra_data?.market_address as keyof typeof MARKET_MAP_TOKEN)
    ?? Env.NEXT_PUBLIC_MARKET_ADDRESS
  ).toLowerCase();
};

export const getBettingToken = (quest?: Quest | QuestDetail | any) => {
  const token = MARKET_MAP_TOKEN[getMarketContract(quest)];

  return token as BettingToken;
};

export function calculatePotentialReward(betting: MemberBetting) {
  const {
    quest,
    betting_amount,
    total_betting_amount,
    selected_betting_amount,
    reward_amount,
  } = betting;

  if (quest.quest_category.quest_category_title === OPINION_BOUNTY_CATEGORY) {
    return reward_amount;
  }

  const totalAmount = Number(total_betting_amount);

  const serviceFee = (totalAmount * Number(quest.season.service_fee)) / 100;

  const creatorFee = (totalAmount * Number(quest.season.creator_fee)) / 100;

  const charityFee = (totalAmount * Number(quest.season.charity_fee)) / 100;

  let multiply = 1;

  if (quest.quest_status !== 'ADJOURN') {
    multiply = selected_betting_amount
      ? (totalAmount - serviceFee - creatorFee - charityFee)
      / Number(selected_betting_amount)
      : 0;
  }

  const predictionFee
    = quest.quest_status === 'ADJOURN'
      ? betting_amount
      : multiply * Number(betting_amount);

  return predictionFee;
}
