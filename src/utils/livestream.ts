import { Env } from '@/libs/Env';
import fetcher from '@/libs/fetcher';
import type { AuthHeaderRequest, QuestDetail } from '@/types/schema';

/**
 * Kiểm tra xem địa chỉ ví có phải là creator của quest không
 */
export function isQuestCreator(quest: QuestDetail, address?: string): boolean {
  if (!address || !quest.quest_creator) {
    return false;
  }

  return address.toLowerCase() === quest.quest_creator.toLowerCase();
}

/**
 * Tạo room name cho LiveKit từ quest key
 */
export function generateRoomName(questKey: string): string {
  return `quest-${questKey}`;
}

/**
 * Format địa chỉ ví để hiển thị (6 ký tự đầu + ... + 4 ký tự cuối)
 */
export function formatAddress(address: string): string {
  if (!address || address.length < 10) {
    return address;
  }

  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

/**
 * LiveKit API interfaces
 */
export interface LiveKitTokenRequest {
  roomName: string;
  username: string;
  canPublish?: boolean;
  canSubscribe?: boolean;
  canPublishAudio?: boolean;
  canPublishVideo?: boolean;
}

export interface LiveKitTokenResponse {
  token: string;
  serverUrl: string;
}

export interface LiveKitRoom {
  name: string;
  numParticipants: number;
  creationTime: number;
  maxParticipants: number;
}

/**
 * API helpers for LiveKit backend
 */
const API_BASE_URL = Env.NEXT_PUBLIC_API_BASE_URL;

export class LiveKitAPI {
  private headers: HeadersInit = {
    'Content-Type': 'application/json',
  };

  /**
   * Tạo access token cho LiveKit
   * Yêu cầu authentication với creatorAuth middleware qua headers
   */
  public generateToken(
    request: LiveKitTokenRequest,
    authHeaders: AuthHeaderRequest,
  ): Promise<LiveKitTokenResponse> {
    return fetcher<{ data: LiveKitTokenResponse }>(
      `${API_BASE_URL}/livestream/token`,
      {
        method: 'POST',
        headers: {
          'x-auth-message': authHeaders.message,
          'x-auth-signature': authHeaders.signature,
          ...this.headers,
        },
        body: JSON.stringify(request),
      },
    ).then(({ data }) => ({
      token: data.token,
      serverUrl: process.env.NEXT_PUBLIC_LIVEKIT_URL || data.serverUrl,
    }));
  }

  /**
   * Lấy danh sách rooms
   * API public, không cần authentication
   */
  public getRooms(): Promise<{ rooms: LiveKitRoom[] }> {
    return fetcher<{ data: { rooms: LiveKitRoom[] } }>(
      `${API_BASE_URL}/livestream/rooms`,
      {
        method: 'GET',
        headers: this.headers,
      },
    ).then(({ data }) => data);
  }

  /**
   * Tạo room mới
   * Yêu cầu authentication với creatorAuth middleware qua headers
   */
  public createRoom(
    roomName: string,
    title: string,
    authHeaders: AuthHeaderRequest,
    maxParticipants = 100,
  ): Promise<void> {
    return fetcher<void>(
      `${API_BASE_URL}/livestream/rooms/${encodeURIComponent(roomName)}`,
      {
        method: 'POST',
        headers: {
          'x-auth-message': authHeaders.message,
          'x-auth-signature': authHeaders.signature,
          ...this.headers,
        },
        body: JSON.stringify({
          title,
          maxParticipants,
        }),
      },
    );
  }

  /**
   * Kiểm tra xem room có đang hoạt động không
   */
  public async isRoomActive(
    roomName: string,
  ): Promise<{ isActive: boolean; participantCount: number }> {
    try {
      const data = await this.getRooms();
      const room = data.rooms.find(r => r.name === roomName);

      return {
        isActive: !!room && room.numParticipants > 0,
        participantCount: room?.numParticipants || 0,
      };
    } catch (error) {
      console.error('Error checking room status:', error);
      return { isActive: false, participantCount: 0 };
    }
  }
}

// Export instance for use like the main API
export const liveKitAPI = new LiveKitAPI();
