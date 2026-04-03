import qs from 'query-string';

import { DEFAULT_PAGE_SIZE } from '@/config/constants';
import type {
  AddQuestRequest,
  AddQuestResponse,
  AdminQuestResponse,
  AdminQuestStatus,
  AuthHeaderRequest,
  BaseResponse,
  ClaimBettingRewardParams,
  ClaimBountyReward,
  ClaimDailyRewardParams,
  ClaimVoteReward,
  CreateBetRequest,
  CreateDistributionRequest,
  DailyReward,
  DAOQuest,
  DraftQuestRequest,
  FeaturedQuest,
  GetAdminQuestsRequest,
  GetDAOQuestsRequest,
  GetDistributionsRequest,
  GetDistributionsResponse,
  GetMemberBettingsRequest,
  GetMembersParams,
  GetMemberVotingsRequest,
  GetQuestsParams,
  MemberBetting,
  MemberResponse,
  MemberVoting,
  PaginationRequet,
  PopularQuestRequest,
  Quest,
  QuestCategory,
  QuestDetail,
  Referral,
  Season,
  Topic,
  UpdateMemberDelegateRequest,
  UpdateMemberRoleParams,
  User,
  VoteAnswerBody,
  VoteDetail,
  VoteQuestBody,
  VoteSuccessBody,
} from '@/types/schema';

import { Env } from './Env';
import fetcher from './fetcher';

const API_BASE_URL = Env.NEXT_PUBLIC_API_BASE_URL;

class Api {
  headers: HeadersInit = {
    'Content-Type': 'application/json',
  };

  privateHeaders: HeadersInit = {
    ...this.headers,
    Authorization: `Bearer ${
      typeof window !== 'undefined'
        ? (window.localStorage
            .getItem('dynamic_authentication_token')
            ?.replaceAll('"', '') ?? '')
        : ''
    }`,
  };

  public setToken(token: string) {
    this.privateHeaders = {
      ...this.privateHeaders,
      Authorization: `Bearer ${token}`,
    };
  }

  public getQuests({
    status = 'all',
    category = 'all',
    page = 1,
    size = DEFAULT_PAGE_SIZE,
    keyword,
    topic,
  }: GetQuestsParams) {
    return fetcher<BaseResponse<{ total: number; quests: Quest[] }>>(
      `${API_BASE_URL}/quests/filter/${category}/${
        status === 'all' ? status : status.join(',')
      }?${qs.stringify({ page, size, keyword, topic })}`,
      {
        headers: this.headers,
      },
    );
  }

  public getPopularQuests({
    page = 1,
    size = 8,
    keyword,
  }: PopularQuestRequest = {}) {
    return fetcher<BaseResponse<Quest[]>>(
      `${API_BASE_URL}/quests/popular?${qs.stringify({ page, size, keyword })}`,
      {
        headers: this.headers,
      },
    );
  }

  public getFeaturedQuests({ page = 1, size = 100 }: PaginationRequet = {}) {
    return fetcher<BaseResponse<FeaturedQuest[]>>(
      `${API_BASE_URL}/quests/carousel?${qs.stringify({ page, size })}`,
      {
        headers: this.headers,
      },
    );
  }

  public getDAOQuests(params: GetDAOQuestsRequest) {
    return fetcher<BaseResponse<{ total: number; quests: DAOQuest[] }>>(
      `${API_BASE_URL}/quests/dao?${qs.stringify({
        page: 1,
        size: DEFAULT_PAGE_SIZE,
        ...params,
      })}`,
      {
        headers: this.headers,
      },
    );
  }

  public getQuest(questId: string) {
    return fetcher<BaseResponse<QuestDetail>>(
      `${API_BASE_URL}/quests/${questId}`,
      {
        headers: this.headers,
      },
    );
  }

  public getQuestBettings(questId: string, walletAddress?: string) {
    return fetcher<BaseResponse<MemberBetting[]>>(
      `${API_BASE_URL}/quests/${questId}/bettings${
        walletAddress ? `?betting_address=${walletAddress}` : ''
      }`,
      {
        headers: this.headers,
      },
    );
  }

  public getCategories() {
    return fetcher<BaseResponse<QuestCategory[]>>(
      `${API_BASE_URL}/quest-category`,
      {
        headers: this.headers,
      },
    );
  }

  public getTopics() {
    return fetcher<BaseResponse<Topic[]>>(`${API_BASE_URL}/topics`, {
      headers: this.headers,
    });
  }

  public addQuest(params: AddQuestRequest) {
    const formData = new FormData();

    for (const name in params) {
      // @ts-expect-error ignore
      const value = params[name] as any;
      if (value) {
        if (Array.isArray(value)) {
          value.forEach((val) => {
            formData.append(name, val);
          });
        } else if (typeof value === 'object' && !(value instanceof File)) {
          for (const key in value) {
            const nestedValue = value[key];
            if (nestedValue != null) {
              formData.append(`${name}[${key}]`, nestedValue);
            }
          }
        } else {
          formData.append(name, value);
        }
      }
    }

    return fetcher<BaseResponse<AddQuestResponse>>(
      `${API_BASE_URL}/quests/add`,
      {
        method: 'POST',
        body: formData,
      },
    );
  }

  public draftQuest(request: DraftQuestRequest) {
    const { quest_key, ...rest } = request;

    return fetcher<BaseResponse<string>>(
      `${API_BASE_URL}/quests/${quest_key}/draft`,
      {
        method: 'PATCH',
        headers: this.headers,
        body: JSON.stringify(rest),
      },
    );
  }

  public forceEndDraftQuest(
    questKey: string,
    message: string,
    signature: string,
  ) {
    return fetcher<BaseResponse<any>>(
      `${API_BASE_URL}/quest-dao/${questKey}/draft-end`,
      {
        method: 'PATCH',
        headers: {
          'x-auth-message': message,
          'x-auth-signature': signature,
          ...this.headers,
        },
      },
    );
  }

  public getActiveSeason() {
    return fetcher<BaseResponse<Season>>(`${API_BASE_URL}/season/active`, {
      headers: this.headers,
    });
  }

  public claimBountyReward(request: ClaimBountyReward) {
    return fetcher<BaseResponse<boolean>>(
      `${API_BASE_URL}/quests/claim-bounty-reward`,
      {
        method: 'POST',
        headers: this.headers,
        body: JSON.stringify(request),
      },
    );
  }

  // member

  public memberCheck(message: string, signature: string) {
    return fetcher<BaseResponse<any>>(`${API_BASE_URL}/member/auth-check`, {
      headers: {
        'x-auth-message': message,
        'x-auth-signature': signature,
        ...this.headers,
      },
    });
  }

  public getMember(wallet: string, refCode?: string) {
    return fetcher<BaseResponse<User>>(
      `${API_BASE_URL}/member/${wallet}?ref=${refCode ?? ''}`,
      {
        headers: this.headers,
      },
    );
  }

  public createMember(wallet: string) {
    return fetcher<BaseResponse<any>>(`${API_BASE_URL}/member`, {
      method: 'POST',
      headers: this.headers,
      body: JSON.stringify({
        wallet_address: wallet,
      }),
    });
  }

  public updateMemberDelegate(body: UpdateMemberDelegateRequest) {
    const { wallet, ...rest } = body;
    return fetcher<BaseResponse<any>>(
      `${API_BASE_URL}/member/${wallet}/delegate`,
      {
        method: 'PATCH',
        headers: this.headers,
        body: JSON.stringify(rest),
      },
    );
  }

  public getMemberVotings(request: GetMemberVotingsRequest) {
    const { wallet, ...rest } = request;
    return fetcher<
      BaseResponse<{
        total: number;
        votes: MemberVoting[];
      }>
    >(`${API_BASE_URL}/member/${wallet}/votes?${qs.stringify(rest)}`, {
      headers: this.headers,
    });
  }

  public getMemberBettings(request: GetMemberBettingsRequest) {
    const { wallet, ...rest } = request;
    return fetcher<BaseResponse<MemberBetting[]>>(
      `${API_BASE_URL}/member/${wallet}/bettings?${qs.stringify(rest)}`,
      {
        headers: this.headers,
      },
    );
  }

  public memberCheckin(walletAddress: string) {
    return fetcher<BaseResponse<any>>(
      `${API_BASE_URL}/member/${walletAddress}/checkin`,
      {
        method: 'POST',
        headers: this.headers,
      },
    );
  }

  public voteQuest(body: VoteQuestBody) {
    const { quest_key, ...rest } = body;
    return fetcher<BaseResponse<any>>(
      `${API_BASE_URL}/quests/${quest_key}/vote`,
      {
        method: 'POST',
        headers: this.headers,
        body: JSON.stringify(rest),
      },
    );
  }

  public getVoteDetail(questKey: string | number, voter: string) {
    return fetcher<BaseResponse<VoteDetail>>(
      `${API_BASE_URL}/quests/${questKey}/vote/${voter}`,
      {
        headers: this.headers,
      },
    );
  }

  public voteSuccessQuest(body: VoteSuccessBody) {
    const { quest_key, voter, ...rest } = body;
    return fetcher<BaseResponse<any>>(
      `${API_BASE_URL}/quests/${quest_key}/vote/${voter}/success`,
      {
        method: 'PATCH',
        headers: this.headers,
        body: JSON.stringify(rest),
      },
    );
  }

  public voteAnswerQuest(body: VoteAnswerBody) {
    const { quest_key, voter, ...rest } = body;
    return fetcher<BaseResponse<any>>(
      `${API_BASE_URL}/quests/${quest_key}/vote/${voter}/answer`,
      {
        method: 'PATCH',
        headers: this.headers,
        body: JSON.stringify(rest),
      },
    );
  }

  public claimVoteReward(body: ClaimVoteReward) {
    const { quest_key, voter, ...rest } = body;
    return fetcher<BaseResponse<any>>(
      `${API_BASE_URL}/quests/${quest_key}/vote/${voter}/reward`,
      {
        method: 'PATCH',
        headers: this.headers,
        body: JSON.stringify(rest),
      },
    );
  }

  public claimDailyReward(body: ClaimDailyRewardParams) {
    const { walletAddress, message, signature, ...rest } = body;
    return fetcher<BaseResponse<any>>(
      `${API_BASE_URL}/member/${walletAddress}/daily-reward`,
      {
        method: 'POST',
        headers: {
          'x-auth-message': message,
          'x-auth-signature': signature,
          ...this.headers,
        },
        body: JSON.stringify(rest),
      },
    );
  }

  public getDailyReward(wallet: string, claimAt: string) {
    return fetcher<BaseResponse<DailyReward>>(
      `${API_BASE_URL}/member/${wallet}/daily-reward/claim?claimed_at=${claimAt}`,
      {
        headers: this.headers,
      },
    );
  }

  public claimBettingReward(body: ClaimBettingRewardParams) {
    const { betting_key, ...rest } = body;
    return fetcher<BaseResponse<any>>(
      `${API_BASE_URL}/betting/claim-reward/${betting_key}`,
      {
        method: 'PUT',
        headers: this.headers,
        body: JSON.stringify(rest),
      },
    );
  }

  public getDailyRewardHistory(walletAddress: string) {
    return fetcher<BaseResponse<any>>(
      `${API_BASE_URL}/member/${walletAddress}/daily-reward`,
      {
        headers: this.headers,
      },
    );
  }

  // admin
  public getAdminQuests<T extends AdminQuestStatus>({
    status,
    message,
    signature,
    page = 1,
    size = DEFAULT_PAGE_SIZE,
  }: GetAdminQuestsRequest) {
    return fetcher<
      BaseResponse<{ total: number; quests: AdminQuestResponse<T> }>
    >(`${API_BASE_URL}/quest-dao?${qs.stringify({ status, page, size })}`, {
      headers: {
        'x-auth-message': message,
        'x-auth-signature': signature,
        ...this.headers,
      },
    });
  }

  public adminSetHotQuest(questKey: string, headers: AuthHeaderRequest) {
    return fetcher<BaseResponse<string>>(
      `${API_BASE_URL}/quest-dao/${questKey}/hot`,
      {
        method: 'PATCH',
        headers: {
          'x-auth-message': headers.message,
          'x-auth-signature': headers.signature,
          ...this.headers,
        },
      },
    );
  }

  public adminArchiveQuest(questKey: string, headers: AuthHeaderRequest) {
    return fetcher<BaseResponse<string>>(
      `${API_BASE_URL}/quest-dao/${questKey}/archive`,
      {
        method: 'PATCH',
        headers: {
          'x-auth-message': headers.message,
          'x-auth-signature': headers.signature,
          ...this.headers,
        },
      },
    );
  }

  public adminUnarchiveQuest(questKey: string, headers: AuthHeaderRequest) {
    return fetcher<BaseResponse<string>>(
      `${API_BASE_URL}/quest-dao/${questKey}/unarchive`,
      {
        method: 'PATCH',
        headers: {
          'x-auth-message': headers.message,
          'x-auth-signature': headers.signature,
          ...this.headers,
        },
      },
    );
  }

  public adminDraftSetQuest(questKey: string, headers: AuthHeaderRequest) {
    return fetcher<BaseResponse<string>>(
      `${API_BASE_URL}/quest-dao/${questKey}/draft/set`,
      {
        method: 'PATCH',
        headers: {
          'x-auth-message': headers.message,
          'x-auth-signature': headers.signature,
          ...this.headers,
        },
      },
    );
  }

  public adminDraftCancelQuest(questKey: string, headers: AuthHeaderRequest) {
    return fetcher<BaseResponse<string>>(
      `${API_BASE_URL}/quest-dao/${questKey}/cancel`,
      {
        method: 'PATCH',
        headers: {
          'x-auth-message': headers.message,
          'x-auth-signature': headers.signature,
          ...this.headers,
        },
      },
    );
  }

  public adminMakeDraftQuest(questKey: string, headers: AuthHeaderRequest) {
    return fetcher<BaseResponse<string>>(
      `${API_BASE_URL}/quest-dao/${questKey}/draft/make`,
      {
        method: 'PATCH',
        headers: {
          'x-auth-message': headers.message,
          'x-auth-signature': headers.signature,
          ...this.headers,
        },
      },
    );
  }

  public adminPublishQuest(questKey: string, headers: AuthHeaderRequest) {
    return fetcher<BaseResponse<string>>(
      `${API_BASE_URL}/quest-dao/${questKey}/publish`,
      {
        method: 'PATCH',
        headers: {
          'x-auth-message': headers.message,
          'x-auth-signature': headers.signature,
          ...this.headers,
        },
      },
    );
  }

  public adminFinishQuest(questKey: string, headers: AuthHeaderRequest) {
    return fetcher<BaseResponse<string>>(
      `${API_BASE_URL}/quest-dao/${questKey}/finish`,
      {
        method: 'PATCH',
        headers: {
          'x-auth-message': headers.message,
          'x-auth-signature': headers.signature,
          ...this.headers,
        },
      },
    );
  }

  public adminStartDAOSuccessQuest(
    questKey: string,
    headers: AuthHeaderRequest,
  ) {
    return fetcher<BaseResponse<string>>(
      `${API_BASE_URL}/quest-dao/${questKey}/dao-success`,
      {
        method: 'PATCH',
        headers: {
          'x-auth-message': headers.message,
          'x-auth-signature': headers.signature,
          ...this.headers,
        },
      },
    );
  }

  public adminSetDaoSuccess(questKey: string, headers: AuthHeaderRequest) {
    return fetcher<BaseResponse<string>>(
      `${API_BASE_URL}/quest-dao/${questKey}/dao-success/set`,
      {
        method: 'PATCH',
        headers: {
          'x-auth-message': headers.message,
          'x-auth-signature': headers.signature,
          ...this.headers,
        },
      },
    );
  }

  public adminAdjournQuest(questKey: string, headers: AuthHeaderRequest) {
    return fetcher<BaseResponse<string>>(
      `${API_BASE_URL}/quest-dao/${questKey}/adjourn`,
      {
        method: 'PATCH',
        headers: {
          'x-auth-message': headers.message,
          'x-auth-signature': headers.signature,
          ...this.headers,
        },
      },
    );
  }

  public adminMakeDaoSuccess(questKey: string, headers: AuthHeaderRequest) {
    return fetcher<BaseResponse<string>>(
      `${API_BASE_URL}/quest-dao/${questKey}/dao-success/make`,
      {
        method: 'PATCH',
        headers: {
          'x-auth-message': headers.message,
          'x-auth-signature': headers.signature,
          ...this.headers,
        },
      },
    );
  }

  public adminSetDAOAnswer(
    questKey: string,
    answerKey: string,
    headers: AuthHeaderRequest,
  ) {
    return fetcher<BaseResponse<string>>(
      `${API_BASE_URL}/quest-dao/${questKey}/answer`,
      {
        method: 'PATCH',
        headers: {
          'x-auth-message': headers.message,
          'x-auth-signature': headers.signature,
          ...this.headers,
        },
        body: JSON.stringify({ answer_key: answerKey }),
      },
    );
  }

  public adminSetQuestSuccess(questKey: string, headers: AuthHeaderRequest) {
    return fetcher<BaseResponse<string>>(
      `${API_BASE_URL}/quest-dao/${questKey}/success`,
      {
        method: 'PATCH',
        headers: {
          'x-auth-message': headers.message,
          'x-auth-signature': headers.signature,
          ...this.headers,
        },
      },
    );
  }

  public adminForceDraftEnd(questKey: string, headers: AuthHeaderRequest) {
    return fetcher<BaseResponse<string>>(
      `${API_BASE_URL}/quest-dao/${questKey}/draft-end`,
      {
        method: 'PATCH',
        headers: {
          'x-auth-message': headers.message,
          'x-auth-signature': headers.signature,
          ...this.headers,
        },
      },
    );
  }

  public adminForceSuccessEnd(questKey: string, headers: AuthHeaderRequest) {
    return fetcher<BaseResponse<string>>(
      `${API_BASE_URL}/quest-dao/${questKey}/dao-success-end`,
      {
        method: 'PATCH',
        headers: {
          'x-auth-message': headers.message,
          'x-auth-signature': headers.signature,
          ...this.headers,
        },
      },
    );
  }

  public adminForceAnswerEnd(questKey: string, headers: AuthHeaderRequest) {
    return fetcher<BaseResponse<string>>(
      `${API_BASE_URL}/quest-dao/${questKey}/answer-end`,
      {
        method: 'PATCH',
        headers: {
          'x-auth-message': headers.message,
          'x-auth-signature': headers.signature,
          ...this.headers,
        },
      },
    );
  }

  // bettings
  public createBet(params: CreateBetRequest) {
    return fetcher<BaseResponse<{ betting_key: string }>>(
      `${API_BASE_URL}/betting/add`,
      {
        method: 'POST',
        headers: this.headers,
        body: JSON.stringify(params),
      },
    );
  }

  public confirmBet(betKey: string, hash: string) {
    return fetcher<BaseResponse<any>>(
      `${API_BASE_URL}/betting/confirm/${betKey}`,
      {
        method: 'PUT',
        headers: this.headers,
        body: JSON.stringify({ betting_tx: hash }),
      },
    );
  }

  public getListReferral(walletAddress: string) {
    return fetcher<BaseResponse<{ data: Referral[] }>>(
      `${API_BASE_URL}/member/${walletAddress}/referrals`,
      {
        headers: this.headers,
      },
    );
  }

  // Admin Distribute
  public createDistribution(params: CreateDistributionRequest) {
    const { message, signature, ...rest } = params;
    return fetcher<BaseResponse<{ id: number }>>(
      `${API_BASE_URL}/admin/distribute`,
      {
        method: 'POST',
        headers: {
          'x-auth-message': message,
          'x-auth-signature': signature,
          ...this.headers,
        },
        body: JSON.stringify(rest),
      },
    );
  }

  public getDistributions(
    senderAddress: string,
    params: GetDistributionsRequest,
  ) {
    const { message, signature, ...rest } = params;
    return fetcher<BaseResponse<GetDistributionsResponse>>(
      `${API_BASE_URL}/admin/distribute/${senderAddress}?${qs.stringify(rest)}`,
      {
        headers: {
          'x-auth-message': message,
          'x-auth-signature': signature,
          ...this.headers,
        },
      },
    );
  }

  public getALlMembers(
    { page = 1, size = DEFAULT_PAGE_SIZE, query }: GetMembersParams,
    headers: AuthHeaderRequest,
  ) {
    return fetcher<
      BaseResponse<{
        total: number;
        page: number;
        pageSize: number;
        members: MemberResponse[];
      }>
    >(`${API_BASE_URL}/member/?${qs.stringify({ page, size, query })}`, {
      headers: {
        'x-auth-message': headers.message,
        'x-auth-signature': headers.signature,
        ...this.headers,
      },
    });
  }

  public updateMemberRole(
    body: UpdateMemberRoleParams,
    headers: AuthHeaderRequest,
  ) {
    return fetcher<BaseResponse<{ total: number; quests: Quest[] }>>(
      `${API_BASE_URL}/member/role`,
      {
        method: 'PATCH',
        headers: {
          'x-auth-message': headers.message,
          'x-auth-signature': headers.signature,
          ...this.headers,
        },
        body: JSON.stringify(body),
      },
    );
  }
}

export default new Api();
