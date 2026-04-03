'use client';

import '@livekit/components-styles';

import {
  Chat,
  ControlBar,
  LiveKitRoom,
  ParticipantTile,
  useLocalParticipant,
  useTracks,
} from '@livekit/components-react';
import { Track } from 'livekit-client';
import { useEffect, useState } from 'react';
import { useAccount } from 'wagmi';

import { Button } from '@/components/ui/button';
import { Typography } from '@/components/ui/typography';
import { useAuth } from '@/hooks/use-auth';
import type { QuestDetail } from '@/types/schema';
import {
  formatAddress,
  generateRoomName,
  isQuestCreator,
  liveKitAPI,
} from '@/utils/livestream';

// Custom component to display only creators (participants with publish permissions)
function CreatorOnlyView() {
  // Get local participant to control audio/video
  const { localParticipant } = useLocalParticipant();

  // Get camera, microphone, and screen share tracks
  const tracks = useTracks([
    { source: Track.Source.Camera, withPlaceholder: true },
    { source: Track.Source.Microphone, withPlaceholder: false },
    { source: Track.Source.ScreenShare, withPlaceholder: true },
  ]);
  const [isMobile, setIsMobile] = useState(false);
  const [mediaInitialized, setMediaInitialized] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768);
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);

    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Disable audio and video by default on first mount, but allow manual control
  useEffect(() => {
    if (localParticipant && !mediaInitialized) {
      const disableMediaTracks = async () => {
        try {
          // Disable audio
          await localParticipant.setMicrophoneEnabled(false);
          // Disable video
          await localParticipant.setCameraEnabled(false);
          setMediaInitialized(true);
          console.log('Audio and video disabled by default');
        } catch (error) {
          console.warn('Error disabling media tracks:', error);
          // Even if there are no devices, mark as initialized so we don't try again
          setMediaInitialized(true);
        }
      };

      // Disable immediately without delay
      disableMediaTracks();
    }
    return undefined;
  }, [localParticipant, mediaInitialized]);

  // Separate video tracks (camera and screen share - only show creators) and audio tracks (play all)
  const videoTracks = tracks.filter(
    track =>
      (track.source === Track.Source.Camera || track.source === Track.Source.ScreenShare)
      && track.participant.permissions?.canPublish,
  );

  // Audio tracks from all participants (especially creators) should be played
  const audioTracks = tracks.filter(
    track => track.source === Track.Source.Microphone,
  );

  // Group video tracks by participant and source (only creators)
  // Prioritize screen share over camera - only show one at a time
  const displayTracks: Array<{
    participantId: string;
    track: typeof tracks[number];
    isScreenShare: boolean;
  }> = [];

  // Group by participant first to manage camera and screen share
  const participantTracks = videoTracks.reduce(
    (acc, track) => {
      const participantId = track.participant.identity;
      if (!acc[participantId]) {
        acc[participantId] = { camera: null, screenShare: null };
      }
      if (track.source === Track.Source.Camera) {
        acc[participantId].camera = track;
      } else if (track.source === Track.Source.ScreenShare) {
        acc[participantId].screenShare = track;
      }
      return acc;
    },
    {} as Record<string, { camera: typeof tracks[number] | null; screenShare: typeof tracks[number] | null }>,
  );

  // Create display tracks: prioritize screen share over camera (only show one)
  Object.entries(participantTracks).forEach(([participantId, { camera, screenShare }]) => {
    // Only show screen share if it's actively publishing (not just a placeholder)
    const isScreenShareActive = screenShare?.publication?.track !== undefined;

    if (screenShare && isScreenShareActive) {
      // Only show screen share when actively sharing, hide camera
      displayTracks.push({
        participantId,
        track: screenShare,
        isScreenShare: true,
      });
    } else if (camera) {
      // Show camera when not sharing screen or when screen share is just a placeholder
      displayTracks.push({
        participantId,
        track: camera,
        isScreenShare: false,
      });
    }
  });

  // Group audio tracks by participant for audio indicators
  const participantAudioTracks = tracks.reduce(
    (acc, track) => {
      const participantId = track.participant.identity;
      if (!acc[participantId]) {
        acc[participantId] = [];
      }
      acc[participantId].push(track);
      return acc;
    },
    {} as Record<string, typeof tracks>,
  );

  return (
    <div
      style={{
        height: isMobile ? '700px' : '600px',
        display: 'flex',
        flexDirection: isMobile ? 'column' : 'row',
        backgroundColor: '#000',
        width: '100%',
        maxWidth: '100%',
      }}
    >
      {/* Video area - chỉ hiển thị creator */}
      <div
        style={{
          flex: isMobile ? '1' : 1,
          display: 'flex',
          flexDirection: 'column',
          width: '100%',
          maxWidth: '100%',
          minHeight: 0,
        }}
      >
        <div
          style={{
            flex: isMobile ? '1' : 'none',
            height: isMobile ? 'auto' : '540px',
            display: 'grid',
            gridTemplateColumns:
              displayTracks.length <= 1
                ? '1fr'
                : displayTracks.length === 2
                  ? '1fr 1fr'
                  : 'repeat(auto-fit, minmax(300px, 1fr))',
            gap: '8px',
            padding: '8px',
            overflow: 'hidden',
          }}
        >
          {displayTracks.map((item, index) => {
            const { participantId, track, isScreenShare } = item;

            // Get the microphone track for audio indicator from the audio tracks
            const micTrack = participantAudioTracks[participantId]?.find(
              (t: any) => t.source === Track.Source.Microphone,
            );

            return (
              <div
                key={`${participantId}-${track.source}-${index}`}
                style={{
                  backgroundColor: '#333',
                  borderRadius: '8px',
                  position: 'relative',
                  overflow: 'hidden',
                  height: '100%',
                  minHeight: isMobile ? '200px' : '250px',
                }}
              >
                <ParticipantTile
                  trackRef={track}
                  style={{ height: '100%' }}
                />
                <div
                  style={{
                    position: 'absolute',
                    bottom: '8px',
                    left: '8px',
                    background: 'rgba(0,0,0,0.7)',
                    padding: '4px 8px',
                    borderRadius: '4px',
                    fontSize: '12px',
                    color: 'white',
                    zIndex: 10,
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                  }}
                >
                  <span>{participantId}</span>
                  {isScreenShare && (
                    <span
                      style={{
                        fontSize: '10px',
                        backgroundColor: '#3b82f6',
                        padding: '2px 6px',
                        borderRadius: '3px',
                      }}
                    >
                      Screen
                    </span>
                  )}
                  {micTrack && (
                    <div
                      style={{
                        width: '8px',
                        height: '8px',
                        borderRadius: '50%',
                        backgroundColor: micTrack.publication?.isMuted
                          ? '#ef4444'
                          : '#22c55e',
                      }}
                      title={
                        micTrack.publication?.isMuted
                          ? 'Microphone muted'
                          : 'Microphone active'
                      }
                    />
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Hidden audio elements to ensure audio playback for all participants */}
        <div style={{ display: 'none' }}>
          {audioTracks.map((track, index) => (
            <ParticipantTile
              key={`audio-${track.participant.identity}-${index}`}
              trackRef={track}
            />
          ))}
        </div>

        {/* Control Bar */}
        <div
          style={{
            height: '60px',
            flexShrink: 0,
            padding: '12px',
            background: '#ffffff',
            borderTop: '1px solid #e0e0e0',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
          }}
        >
          <ControlBar />
        </div>
      </div>

      {/* Chat area */}
      <div
        style={{
          width: isMobile ? '100%' : '25%',
          height: isMobile ? '50%' : '100%',
          flex: isMobile ? '0 0 380px' : 'none',
          flexShrink: 0,
          backgroundColor: '#ffffff',
          borderLeft: isMobile ? 'none' : '1px solid #e0e0e0',
          borderTop: isMobile ? '1px solid #e0e0e0' : 'none',
          display: 'flex',
          flexDirection: 'column',
          boxShadow: isMobile
            ? '0 -2px 8px rgba(0,0,0,0.1)'
            : '-2px 0 8px rgba(0,0,0,0.1)',
          overflow: 'hidden',
          maxWidth: '100%',
        }}
      >
        {/* Chat Header */}
        <div
          style={{
            padding: isMobile ? '12px 16px' : '16px 20px',
            backgroundColor: '#f8f9fa',
            borderBottom: '1px solid #e0e0e0',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
          }}
        >
          <div
            style={{
              width: '8px',
              height: '8px',
              backgroundColor: '#22c55e',
              borderRadius: '50%',
              animation: 'pulse 2s infinite',
            }}
          />
          <span
            style={{
              fontSize: '14px',
              fontWeight: '600',
              color: '#374151',
              letterSpacing: '0.025em',
            }}
          >
            Live Chat
          </span>
        </div>

        {/* Chat Component */}
        <div
          style={{
            flex: 1,
            overflow: 'hidden',
            width: '100%',
            maxWidth: '100%',
            minHeight: 0,
            height: '100%',
          }}
        >
          <Chat
            style={{
              height: '100%',
              width: '100%',
              padding: '3px',
              maxWidth: '100%',
              border: 'none',
              borderRadius: '0',
              backgroundColor: 'transparent',
              boxSizing: 'border-box',
              maxHeight: '100%',
            }}
          />
        </div>
      </div>
    </div>
  );
}

interface LiveStreamProps {
  quest: QuestDetail;
}

interface LiveStreamState {
  token: string | null;
  isStreaming: boolean;
  isJoining: boolean;
  error: string | null;
  persistedRoomName?: string; // To track which room we're in
}

export function LiveStream({ quest }: LiveStreamProps) {
  const { address } = useAccount();
  const { getAuthHeaders, isLoading: authLoading } = useAuth();
  const [state, setState] = useState<LiveStreamState>({
    token: null,
    isStreaming: false,
    isJoining: false,
    error: null,
  });

  // Check if current user is the quest creator
  const isCreator = isQuestCreator(quest, address);

  // LiveKit configuration
  const serverUrl
    = process.env.NEXT_PUBLIC_LIVEKIT_URL || 'wss://your-livekit-server.com';
  const roomName = generateRoomName(quest.quest_key);

  useEffect(() => {
    // Check if there's an active stream for this quest
    checkActiveStream();

    // Check for persisted livestream state only for creator with address
    if (isCreator && address) {
      checkPersistedLivestream();
    }
  }, [quest.quest_key, isCreator, address]);

  const checkPersistedLivestream = async () => {
    try {
      const persistedState = localStorage.getItem(`livestream_${roomName}`);

      if (persistedState) {
        const parsed = JSON.parse(persistedState);

        // Check if the room is still active on the server
        const status = await liveKitAPI.isRoomActive(roomName);

        if (status.isActive) {
          // Attempt to reconnect with persisted token
          if (parsed.token) {
            // Show reconnecting message
            setState(prev => ({
              ...prev,
              error: 'Reconnecting to your livestream...',
            }));

            // Small delay to show reconnecting message
            setTimeout(() => {
              setState(prev => ({
                ...prev,
                token: parsed.token,
                isStreaming: true,
                persistedRoomName: roomName,
                error: null, // Clear the reconnecting message
              }));
            }, 1000);
          }
        } else {
          // Room is no longer active, clear persisted state
          localStorage.removeItem(`livestream_${roomName}`);
        }
      }
    } catch (error) {
      console.error('Error checking persisted livestream:', error);
      localStorage.removeItem(`livestream_${roomName}`);
    }
  };

  const checkActiveStream = async () => {
    try {
      const status = await liveKitAPI.isRoomActive(roomName);
      setState(prev => ({
        ...prev,
        isStreaming: status.isActive,
      }));
    } catch (error) {
      console.log('Error checking stream status:', error);
      // Error checking stream status
    }
  };

  const startStream = async () => {
    if (!isCreator) {
      setState(prev => ({
        ...prev,
        error: 'Only quest creator can start livestream',
      }));
      return;
    }

    try {
      setState(prev => ({ ...prev, error: null }));

      // Lấy auth headers (sẽ trigger authentication nếu chưa có)
      const authHeaders = await getAuthHeaders();
      if (!authHeaders) {
        throw new Error(
          'Authentication required. Please sign the message to continue.',
        );
      }

      // Tạo room trước với creatorAuth headers
      await liveKitAPI.createRoom(roomName, quest.quest_title, authHeaders);

      // Tạo token cho creator với quyền publish
      const tokenData = await liveKitAPI.generateToken(
        {
          roomName,
          username: formatAddress(address!),
          canPublish: true,
          canSubscribe: true,
          canPublishAudio: true,
          canPublishVideo: true,
        },
        authHeaders,
      );

      // Set default preJoinChoices for creator
      setState(prev => ({
        ...prev,
        token: tokenData.token,
        isStreaming: true,
        persistedRoomName: roomName,
      }));

      // Persist livestream state to localStorage
      localStorage.setItem(
        `livestream_${roomName}`,
        JSON.stringify({
          token: tokenData.token,
          roomName,
          timestamp: Date.now(),
          questKey: quest.quest_key,
        }),
      );
    } catch (error) {
      const errorMessage
        = error instanceof Error ? error.message : 'Failed to start stream';
      setState(prev => ({
        ...prev,
        error: errorMessage,
      }));
    }
  };

  const endStream = async () => {
    if (!isCreator) {
      return;
    }

    try {
      // Clear persisted state
      localStorage.removeItem(`livestream_${roomName}`);

      // Với backend API, chúng ta chỉ cần disconnect khỏi room
      // Room sẽ tự động bị xóa khi không còn participants
      setState(prev => ({
        ...prev,
        token: null,
        isStreaming: false,
        persistedRoomName: undefined,
      }));
    } catch (error) {
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Failed to end stream',
      }));
    }
  };

  const joinStream = async () => {
    if (!address) {
      setState(prev => ({
        ...prev,
        error: 'Please connect your wallet first',
      }));
      return;
    }

    try {
      setState(prev => ({ ...prev, error: null, isJoining: true }));

      // Check for microphone permission for viewers who might want to participate
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          audio: true,
        });
        console.log('Viewer audio permission granted');
        // Stop the test stream
        stream.getTracks().forEach(track => track.stop());
      } catch (permissionError) {
        console.warn(
          'Audio permission denied for viewer, joining as audio-only viewer',
          permissionError,
        );
        // Still allow joining even without mic permission
      }

      // Lấy auth headers (sẽ trigger authentication nếu chưa có)
      const authHeaders = await getAuthHeaders();
      if (!authHeaders) {
        throw new Error(
          'Authentication required. Please sign the message to continue.',
        );
      }

      // Tạo token cho viewer với quyền subscribe only
      const tokenData = await liveKitAPI.generateToken(
        {
          roomName,
          username: formatAddress(address),
          canPublish: false,
          canSubscribe: true,
          canPublishAudio: false,
          canPublishVideo: false,
        },
        authHeaders,
      );

      setState(prev => ({
        ...prev,
        token: tokenData.token,
        isJoining: false,
      }));
    } catch (error) {
      const errorMessage
        = error instanceof Error ? error.message : 'Failed to join stream';
      setState(prev => ({
        ...prev,
        error: errorMessage,
        isJoining: false,
      }));
    }
  };

  const leaveStream = () => {
    // Clear persisted state when leaving
    if (state.persistedRoomName) {
      localStorage.removeItem(`livestream_${state.persistedRoomName}`);
    }

    setState(prev => ({
      ...prev,
      token: null,
      persistedRoomName: undefined,
    }));
  };

  if (!address) {
    return (
      <div className="rounded-lg border border-border bg-white p-6">
        <Typography level="h4" className="mb-2">
          LiveStream
        </Typography>
        <Typography level="body2" className="text-muted-foreground">
          Please connect your wallet to access livestream features.
        </Typography>
      </div>
    );
  }

  if (state.token) {
    return (
      <div className="overflow-hidden rounded-lg border border-border bg-white">
        <div className="flex items-center justify-between border-b border-border p-4">
          <Typography level="h4">
            LiveStream -
            {quest.quest_title}
          </Typography>
          <div className="flex items-center gap-4">
            <Button variant="outline" onClick={leaveStream}>
              Leave Stream
            </Button>
          </div>
        </div>
        <div style={{ width: '100%' }}>
          <div
            onClick={() => {
              // Handle click to enable audio playback (autoplay policy)
              const enableAudioContext = () => {
                try {
                  const audioContext = new AudioContext();
                  if (audioContext.state === 'suspended') {
                    audioContext.resume();
                    console.log('Audio context resumed');
                  }
                } catch (error) {
                  console.warn('AudioContext activation failed:', error);
                }
              };

              enableAudioContext();
            }}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                // Handle keyboard activation to enable audio playback
                const enableAudioContext = () => {
                  try {
                    const audioContext = new AudioContext();
                    if (audioContext.state === 'suspended') {
                      audioContext.resume();
                      console.log('Audio context resumed');
                    }
                  } catch (error) {
                    console.warn('AudioContext activation failed:', error);
                  }
                };

                enableAudioContext();
              }
            }}
            role="button"
            tabIndex={0}
            style={{ cursor: 'pointer' }}
            title="Click or press Enter/Space to enable audio if needed"
            aria-label="Enable audio playback"
          >
            <LiveKitRoom
              token={state.token}
              serverUrl={serverUrl}
              connectOptions={{
                autoSubscribe: true,
              }}
              options={{
                adaptiveStream: true,
                dynacast: true,
                disconnectOnPageLeave: true,
              }}
              audio={false}
              video={false}
              onConnected={() => {
                console.log('Connected to LiveKit room');
                // Try to enable audio context after connection
                try {
                  const audioContext = new AudioContext();
                  if (audioContext.state === 'suspended') {
                    audioContext.resume().catch(console.warn);
                  }
                } catch (error) {
                  console.warn('AudioContext not available:', error);
                }
              }}
              onDisconnected={leaveStream}
              onError={(error) => {
                console.error('LiveKit error:', error);
                let errorMessage = `LiveKit error: ${error.message}`;

                if (error.message.includes('autoplay')) {
                  errorMessage
                    = 'Audio autoplay was blocked. Please click anywhere on the page to enable audio.';
                } else if (error.message.includes('permission')) {
                  errorMessage
                    = 'Camera or microphone permission denied. Please allow access and refresh the page.';
                } else if (error.message.includes('NotFoundError')) {
                  errorMessage
                    = 'Camera or microphone not found. Please check your devices and try again.';
                }

                setState(prev => ({
                  ...prev,
                  error: errorMessage,
                }));
              }}
            >
              <style jsx global>
                {`
                  .lk-chat-header {
                    display: none !important;
                  }
                  .lk-chat {
                    width: 100% !important;
                    max-width: 100% !important;
                    box-sizing: border-box !important;
                    display: flex !important;
                    flex-direction: column !important;
                    height: 100% !important;
                    max-height: 100% !important;
                    overflow: hidden !important;
                    position: relative !important;
                  }
                  .lk-chat * {
                    box-sizing: border-box !important;
                  }
                  .lk-chat-form {
                    width: 100% !important;
                    max-width: 100% !important;
                    display: flex !important;
                    padding: 8px !important;
                    border-top: 1px solid #e0e0e0 !important;
                    background: #ffffff !important;
                    flex-shrink: 0 !important;
                  }
                  .lk-chat-form input {
                    width: 100% !important;
                    max-width: calc(100% - 60px) !important;
                    padding: 8px 12px !important;
                    border: 1px solid #d1d5db !important;
                    border-radius: 6px !important;
                    outline: none !important;
                    font-size: 14px !important;
                  }
                  .lk-chat-form input:focus {
                    border-color: #3b82f6 !important;
                    box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.1) !important;
                  }
                  .lk-chat-form button {
                    margin-left: 8px !important;
                    padding: 8px 16px !important;
                    background: #3b82f6 !important;
                    color: white !important;
                    border: none !important;
                    border-radius: 6px !important;
                    cursor: pointer !important;
                    font-size: 14px !important;
                    font-weight: 500 !important;
                    flex-shrink: 0 !important;
                  }
                  .lk-chat-form button:hover {
                    background: #2563eb !important;
                  }
                  .lk-chat-form button:disabled {
                    background: #9ca3af !important;
                    cursor: not-allowed !important;
                  }
                  .lk-chat-messages {
                    flex: 1 !important;
                    overflow-y: auto !important;
                    padding: 8px !important;
                  }
                `}
              </style>
              <CreatorOnlyView />
            </LiveKitRoom>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white md:rounded-lg md:border md:border-border md:p-6">
      <div className="mb-4 flex items-center justify-between">
        <Typography level="h4" className=" text-base font-bold text-black">
          LiveStream
        </Typography>
        {state.isStreaming && (
          <div className="flex items-center gap-2">
            <div className="size-2 animate-pulse rounded-full bg-red-500"></div>
            <Typography
              level="body2"
              className=" text-xs font-semibold text-red-500 md:text-sm"
            >
              LIVE
            </Typography>
          </div>
        )}
      </div>

      {state.error && (
        <div className="mb-4 rounded-lg border border-red-200 bg-red-50 p-3">
          <Typography level="body2" className=" text-sm text-red-700">
            {state.error}
          </Typography>
        </div>
      )}

      {isCreator
        ? (
            <div className="space-y-3 md:space-y-4">
              <Typography
                level="body2"
                className=" text-sm text-black md:text-base"
              >
                You are the creator of this quest. You can start or end the
                livestream.
              </Typography>

              {authLoading && (
                <div className=" text-sm text-[#3B27DF]">Authenticating...</div>
              )}

              <div className="flex flex-col gap-2 md:flex-row md:gap-3">
                {!state.isStreaming
                  ? (
                      <Button
                        onClick={startStream}
                        size="sm"
                        noShadow
                        className="w-full rounded-xl bg-[#3B27DF] py-2 text-center  text-xs font-semibold text-white md:flex-1"
                        disabled={authLoading}
                      >
                        {authLoading ? 'Authenticating...' : 'Start LiveStream'}
                      </Button>
                    )
                  : (
                      <Button
                        onClick={endStream}
                        variant="outline"
                        size="sm"
                        noShadow
                        className="md:noShadow-none w-full border-red-500  text-sm font-medium text-red-500 hover:bg-red-50 md:flex-1"
                      >
                        End LiveStream
                      </Button>
                    )}
              </div>
            </div>
          )
        : (
            <div className="space-y-3 md:space-y-4">
              {state.isStreaming
                ? (
                    <>
                      <Typography
                        level="body2"
                        className=" text-sm text-black md:text-base"
                      >
                        The creator is currently livestreaming. Join to watch and
                        participate!
                      </Typography>

                      {authLoading && (
                        <div className=" text-sm text-[#3B27DF]">Authenticating...</div>
                      )}

                      {!state.token
                        ? (
                            <Button
                              onClick={joinStream}
                              size="sm"
                              noShadow
                              disabled={state.isJoining || authLoading}
                              className="w-full rounded-xl bg-[#3B27DF] py-2 text-center font-['SF_Pro_Text'] text-xs font-semibold text-white"
                            >
                              {state.isJoining
                                ? 'Joining...'
                                : authLoading
                                  ? 'Authenticating...'
                                  : 'Join LiveStream'}
                            </Button>
                          )
                        : null}
                    </>
                  )
                : (
                    <Typography
                      level="body2"
                      className=" text-sm text-black md:text-base"
                    >
                      No active livestream for this quest. The creator can start one
                      anytime.
                    </Typography>
                  )}
            </div>
          )}
    </div>
  );
}
