export type BaseResponse<T> = {
  success: number; // 1 success, 0 error
  data?: T;
  message?: string;
  error?: string;
};

export type PaginationRequet = {
  page?: number;
  size?: number;
};

export type PopularQuestRequest = PaginationRequet & {
  keyword?: string;
};

export type AuthHeaderRequest = {
  message: string;
  signature: string;
};

export type BaseListResponse<T> = BaseResponse<{
  count: number;
  num_pages: number;
  data: Array<T>;
}>;

export type QuestStatus =
  | 'DRAFT'
  | 'APPROVE'
  | 'ADJOURN'
  | 'PUBLISH'
  | 'FINISH'
  | 'DAO_SUCCESS'
  | 'MARKET_SUCCESS'
  | 'REJECT';

export type GetQuestsParams = {
  category?: 'all' | string;
  status?: 'all' | QuestStatus[];
  keyword?: string;
  topic?: string;
} & PaginationRequet;

export type GetMembersParams = {
  query?: string;
} & PaginationRequet;

export type UpdateMemberRoleParams = {
  role: 'ADMIN' | 'USER';
  wallet_address: string;
};

export type MemberResponse = {
  id: number;
  walletAddress: string;
  role: 'ADMIN' | 'USER';
  email: string | null;
  name: string | null;
  avatar: string | null;
  emailVerified: string;
  lockedAt: string | null;
  lockedTx: string | null;
  delegatedTx: string | null;
  createdAt: string;
  updatedAt: string;
  archivedAt: string | null;
  referralCode: string;
  invitedBy: string | null;
  points: number;
  lastCheckin: string | null;
};

export type Quest = {
  quest_key: string;
  quest_title: string;
  quest_end_date: string;
  quest_image_url: string;
  quest_status: QuestStatus;
  total_betting_amount: number;
  quest_finish_datetime?: string;
  answers: Array<{
    answer_key: string;
    answer_title: string;
    total_betting_amount: number;
    answer_selected?: boolean;
  }>;
  quest_category?: {
    quest_category_title: string;
  };
  extra_data?: any;
};

export type QuestDetail = {
  quest_key: string;
  quest_title: string;
  quest_description: string;
  season_id: string;
  quest_category_id: string;
  quest_creator: string;
  quest_image_url: string;
  quest_image_link: string;
  quest_end_date: string;
  quest_end_date_utc: string;
  quest_hot: boolean;
  quest_status: string;
  quest_publish_tx: string;
  quest_publish_datetime: string;
  quest_finish_tx: any;
  quest_finish_datetime: any;
  quest_adjourn_tx: any;
  quest_adjourn_datetime: any;
  quest_success_tx: any;
  quest_success_datetime: any;
  quest_created_at: string;
  quest_updated_at: string;
  quest_archived_at: any;
  dao_created_tx: any;
  dao_draft_start_at: any;
  dao_draft_end_at: string;
  dao_success_start_at: any;
  dao_success_end_at: any;
  dao_answer_start_at: any;
  dao_answer_end_at: any;
  quest_reward_calculated: boolean;
  total_betting_amount: number;
  total_betting: number;
  youtube_url?: string;
  answers: Array<{
    answer_key: string;
    answer_title: string;
    answer_selected: boolean;
    quest_key: number;
    answer_created_at: string;
    total_betting_amount: number;
    total_betting: number;
  }>;
  quest_category: {
    quest_category_id: string;
    quest_category_title: string;
    quest_category_order: number;
    quest_category_created_at: string;
    quest_category_archived_at: any;
  };
  season: {
    season_id: string;
    season_title: string;
    season_description: string;
    service_fee: number;
    charity_fee: number;
    creator_fee: number;
    season_min_pay: number;
    season_max_pay: number;
    season_active: boolean;
    season_start_date: string;
    season_end_date: string;
    season_created_at: string;
    season_archived_at: any;
  };
  extra_data?: {
    points?: number;
    market_address?: string;
  };
};

export type FeaturedQuest = {
  quest_key: string;
  quest_title: string;
  quest_end_date: string;
  quest_image_url: string;
  quest_status: string;
};

export type BaseDAOQuest = {
  quest_key: string;
  quest_category: string;
  quest_title: string;
  quest_description: string;
  quest_status: string;
  quest_image_url: string;
  quest_created_at: string;
  quest_end_date: string;
  quest_start_block: number;
};

export type DAOQuestDraft = {
  dao_draft_start_at: string;
  dao_draft_end_at: string;
  total_approve_power: number;
  total_reject_power: number;
  total_vote: number;
  answers: Array<{
    answer_key: string;
    answer_title: string;
  }>;
} & BaseDAOQuest;

export type DAOQuestSuccess = {
  dao_success_start_at: string;
  dao_success_end_at: string;
  total_success_power: number;
  total_adjourn_power: number;
  total_vote: number;
  answers: Array<{
    answer_key: string;
    answer_title: string;
    answer_selected: boolean;
    total_betting_amount: number;
  }>;
} & BaseDAOQuest;

export type DAOQuestAnswer = {
  dao_answer_start_at: string;
  dao_answer_end_at: string;
  answers: Array<{
    answer_key: string;
    answer_title: string;
    total_betting_amount: number;
    total_answer_vote_power: number;
  }>;
} & BaseDAOQuest;

export type DAOQuestCategory = 'draft' | 'success' | 'answer';

export type DAOQuest = DAOQuestDraft | DAOQuestSuccess | DAOQuestAnswer;

export type QuestCategory = {
  id: string;
  title: string;
  order: number;
  createdAt: string;
  archivedAt: any;
};

export type Topic = {
  id: string;
  name: string;
  slug: string;
  order: number;
  createdAt: string;
  archivedAt: string | null;
};

export type AddQuestRequest = {
  quest_title: string;
  quest_description: string;
  quest_end_date: string;
  quest_category_id: string;
  season_id: string;
  quest_creator: string;
  quest_image_link?: string;
  quest_image_url?: string;
  answers: string[];
  file?: File;
  extra_data?: any;
  youtube_url?: string;
  topic_ids?: string[];
};

export type DraftQuestRequest = {
  quest_key: string;
  start_at: string;
  end_at: string;
  tx: string;
  start_block: number;
};

export type AddQuestResponse = {
  quest_key: string;
  quest_title: string;
  quest_description: string;
  season_id: string;
  quest_category_id: string;
  quest_creator: string;
  quest_image_url: string;
  quest_image_link: string;
  quest_end_date: string;
  quest_end_date_utc: string;
  quest_hot: boolean;
  quest_status: string;
  quest_publish_tx: any;
  quest_publish_datetime: any;
  quest_finish_tx: any;
  quest_finish_datetime: any;
  quest_adjourn_tx: any;
  quest_adjourn_datetime: any;
  quest_success_tx: any;
  quest_success_datetime: any;
  quest_created_at: string;
  quest_updated_at: string;
  quest_archived_at: string;
  dao_created_tx: any;
  dao_draft_start_at: any;
  dao_draft_end_at: any;
  dao_success_start_at: any;
  dao_success_end_at: any;
  dao_answer_start_at: any;
  dao_answer_end_at: any;
  total_betting_amount: number;
  answers: Array<{
    answer_key: string;
    answer_title: string;
    answer_selected: boolean;
    quest_key: number;
    answer_created_at: string;
    total_betting_amount: number;
  }>;
  quest_category: {
    quest_category_id: string;
    quest_category_title: string;
    quest_category_order: number;
    quest_category_created_at: string;
    quest_category_archived_at: any;
  };
};

export type DraftQuest = {
  quest_title: string;
  quest_description: string;
  quest_end_date: string;
  quest_category_id: string;
  season_id: string;
  quest_creator: string;
  quest_image_link: string;
  answers: string[];
  file: File;
};

export type Season = {
  id: string;
  title: string;
  description: string;
  startDate: string;
  endDate: string;
  serviceFee: number;
  charityFee: number;
  creatorFee: number;
  minPay: number;
  maxPay: number;
  active: boolean;
};

export type GetDAOQuestsRequest = {
  status: string;
} & PaginationRequet;

export type VoteDraftOption = 'approve' | 'reject';

export type VoteQuestBody = {
  quest_key: string;
  voter: string;
  tx: string;
  power: number;
  option: VoteDraftOption;
};

export type VoteSuccessOption = 'success' | 'adjourn';

export type VoteSuccessBody = {
  quest_key: string;
  voter: string;
  tx: string;
  option: VoteSuccessOption;
};

export type VoteAnswerBody = {
  quest_key: string;
  voter: string;
  tx: string;
  answer_key: string;
};

export type User = {
  id: number;
  walletAddress: string;
  role: string;
  email: string;
  name: string;
  avatar: string;
  emailVerified: string;
  lockedAt: any;
  lockedTx: any;
  delegatedTx: string;
  referral_code?: string;
  createdAt: string;
  updatedAt: string;
  archivedAt: any;
  points: number;
  referralCode?: string;
  invitedBy?: string;
  lastCheckin?: string;
};

export type Member = {
  member_id: number;
  wallet_address: string;
  member_role: string;
  member_email?: string;
  member_name?: string;
  member_avatar?: string;
  member_email_verified: string;
  member_locked_at?: string;
  member_locked_tx?: string;
  member_delegated_tx?: string;
  referral_code?: string;
  invited_by?: number;
  points: number;
  last_checkin?: string;
  member_created_at: string;
  member_updated_at: string;
  member_archived_at?: string;
};

export type GetMemberVotingsRequest = {
  wallet: string;
} & PaginationRequet;

export type GetMemberBettingsRequest = GetMemberVotingsRequest;

export type MemberVoting = {
  vote_id: string;
  vote_voter: string;
  vote_power: number;
  vote_success_option: string;
  vote_created_at: string;
  vote_draft_option: string;
  quest_answer_key?: number;
  vote_reward: any;
  quest_key: string;
  quest_title: string;
  quest_status: string;
  quest_category: string;
  dao_draft_tx: any;
  dao_success_tx: string;
  dao_answer_tx?: string;
  quest_success_tx: any;
  quest_answer_title?: string;
  selected?: {
    answer_title: string;
    answer_key: number;
  };
};

export type MemberBetting = {
  betting_key: string;
  betting_amount: number;
  betting_tx?: string;
  answer_key: number;
  quest_key: number;
  betting_address: string;
  reward_amount: number;
  betting_status: boolean;
  reward_claimed: boolean;
  betting_created_at: string;
  reward_tx?: string;
  reward_created_at?: string;
  total_betting_amount: number;
  selected_betting_amount: number;
  quest: {
    quest_title: string;
    quest_status: string;
    season: {
      season_id: string;
      season_title: string;
      season_description: string;
      service_fee: number;
      charity_fee: number;
      creator_fee: number;
      season_min_pay: number;
      season_max_pay: number;
      season_max_vote: number;
      season_dao_reward: number;
      season_active: boolean;
      season_start_date: string;
      season_end_date: string;
      season_created_at: string;
      season_archived_at: any;
    };
    quest_category: {
      quest_category_id: string;
      quest_category_title: string;
      quest_category_order: number;
      quest_category_created_at: string;
      quest_category_archived_at: any;
    };
  };
  answer: {
    answer_key: string;
    answer_title: string;
    answer_selected: boolean;
    quest_key: number;
    answer_created_at: string;
    answer_tx?: string;
    answer_pending: boolean;
  };
};

export type UpdateMemberDelegateRequest = {
  wallet: string;
  delegated_tx: string;
};

export type AdminQuestStatus =
  | 'draft'
  | 'publish'
  | 'decision'
  | 'answer'
  | 'success'
  | 'adjourn'
  | 'ongoing'
  | 'archived';

export type GetAdminQuestsRequest = {
  status: AdminQuestStatus;
} & PaginationRequet
& AuthHeaderRequest;

export type BaseAdminQuest = {
  quest_key: string;
  quest_category: string;
  quest_hot: boolean;
  quest_title: string;
  quest_end_date: string;
  quest_status: string;
  total_betting_amount: number;
  total_vote: number;
};

export type AdminOngoingQuest = {
  quest_hot: boolean;
  quest_end_date: string;
  quest_status: string;
} & BaseAdminQuest;

export type AdminDraftQuest = {
  dao_draft_end_at?: string;
  quest_status: string;
  total_approve_power: number;
  total_reject_power: number;
  total_vote: number;
} & BaseAdminQuest;

export type AdminPubishQuest = {
  total_betting_amount: number;
  quest_status: string;
} & BaseAdminQuest;

export type AdminDecisionQuest = {
  quest_status: string;
  dao_success_end_at: string;
  total_success_power: number;
  total_adjourn_power: number;
  total_vote: number;
} & BaseAdminQuest;

export type AdminAnswerQuest = {
  quest_status: string;
  dao_answer_end_at?: string;
  answer_selected: any;
  total_vote: number;
  answers: Array<{
    answer_title: string;
    vote_power: number;
    answer_key: string;
  }>;
} & BaseAdminQuest;

export type AdminSuccessQuest = {
  // quest_end_date: string;
  total_vote: number;
  total_betting: number;
  quest_status: string;
} & BaseAdminQuest;

export type AdminAdjournQuest = {
  // quest_end_date: string;
  total_betting: number;
  quest_status: string;
} & BaseAdminQuest;

export type AdminQuest<T extends AdminQuestStatus> = T extends 'draft'
  ? AdminDraftQuest
  : T extends 'publish'
    ? AdminPubishQuest
    : T extends 'decision'
      ? AdminDecisionQuest
      : T extends 'answer'
        ? AdminAnswerQuest
        : T extends 'success'
          ? AdminSuccessQuest
          : T extends 'adjourn'
            ? AdminAdjournQuest
            : T extends 'ongoing'
              ? AdminOngoingQuest
              : never;

export type AdminQuestResponse<T extends AdminQuestStatus> = AdminQuest<T>;

export type CreateBetRequest = {
  quest_key: string;
  answer_key: string;
  betting_amount?: string;
  betting_address: string;
  betting_status?: boolean;
};

export type CreatePetResponse = {
  betting_key: string;
  betting_tx?: string;
  reward_amount: number;
  reward_claimed: boolean;
  betting_created_at: {
    fn: string;
    args: Array<any>;
  };
  reward_tx?: string;
  quest_key: string;
  answer_key: string;
  betting_amount: string;
  betting_address: string;
  betting_status: boolean;
};

export type ClaimVoteReward = {
  quest_key: string;
  voter: string;
  reward: string | number;
};

export type ClaimBettingRewardParams = {
  betting_key: string;
  reward_tx: string;
};

export type VoteDetail = {
  vote_id: string;
  quest_key: number;
  vote_voter: string;
  vote_power: number;
  vote_draft_option: string;
  vote_draft_tx: string;
  vote_success_option: any;
  vote_success_tx: any;
  quest_answer_key: any;
  vote_answer_tx: any;
  vote_reward: any;
  vote_archived_at: string;
  vote_created_at: string;
};

export type ClaimDailyRewardParams = {
  walletAddress: string;
  claimed_at: string;
} & AuthHeaderRequest;

export type DailyReward = {
  daily_reward_id: number;
  wallet_address: string;
  daily_reward_amount: number;
  claimed_at: string;
  daily_reward_tx: string;
  daily_reward_pending: boolean;
  daily_created_at: string;
};

export type Referral = {
  total_points: number;
  invitee: { wallet_address: string };
};

export type ClaimBountyReward = {
  quest_key: string;
  answer_key: string;
  address: string;
};

export type Distribution = {
  id: number;
  sender: string;
  receiver: string;
  amount: string;
  unlockAt: string | null;
  createdAt: string;
  txHash: string;
};

export type CreateDistributionRequest = {
  sender: string;
  receiver: string;
  amount: string;
  unlock_at: string | null;
  tx_hash: string;
} & AuthHeaderRequest;

export type GetDistributionsRequest = {
  page?: number;
  limit?: number;
} & AuthHeaderRequest;

export type GetDistributionsResponse = {
  distributions: Distribution[];
  totalPages: number;
  currentPage: number;
  totalItems: number;
};
