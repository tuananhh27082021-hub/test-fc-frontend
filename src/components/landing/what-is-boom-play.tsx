import { Typography } from '@/components/ui/typography';

export const WhatIsBoomPlay = () => {
  return (
    <div
      className="w-full py-[172px]"
      style={{
        background:
          'linear-gradient(274.95deg, rgba(198, 227, 255, 0.6) 0%, rgba(244, 250, 255, 0.8) 18.5%, rgba(244, 250, 255, 0.75) 33.84%, rgba(244, 250, 255, 0.8) 55.09%, rgba(244, 250, 255, 0.85) 75.51%, rgba(244, 250, 255, 0.6) 100%)',
      }}
    >
      <div className="w-full px-8 text-center md:mx-auto md:max-w-[1090px]">
        <Typography
          level="h2"
          className="mb-5 font-clash-display font-semibold text-secondary"
        >
          What is FORECAST
        </Typography>
        <Typography className="pb-2.5 text-black/70">
          FORECAST is an innovative collective intelligence prediction platform
          where users generate and participate in predictions on various topics,
          receiving rewards based on their results. On this platform, prediction
          creators craft engaging prediction challenges, participants submit
          their best answers through analysis and discussion, and everyone
          competes and earns rewards based on actual outcomes.
        </Typography>
        <Typography className="text-black/70">
          Your contributions and decisions are rewarded, making FORECAST not
          only a prediction voting experience but a true decentralized
          ecosystem. Join us as we redefine the world of prediction challenge
          with transparency, fairness, and fun at the core.
        </Typography>
      </div>
    </div>
  );
};
