import { Typography } from '@/components/ui/typography';

export const AboutUs = () => {
  return (
    <div className="app-container pb-20 pt-12 md:pt-16 lg:pt-[120px]">
      <div className="mx-auto w-full md:max-w-4xl">
        <Typography
          className="mb-4 text-center font-clash-display font-semibold"
          level="h2"
        >
          About Us
        </Typography>
        <Typography className="text-center text-foreground-70">
          “Welcome to FORECAST, the ultimate decentralized Web3 prediction
          challenge platform powered by Kaia! At FORECAST, we are transforming
          the collective intelligence prediction experience by integrating
          real-time <b>decentralized exchange (DEX)</b> swaps and innovative{' '}
          <b>DAO (Decentralized Autonomous Organization)</b> functionalities.“
        </Typography>
      </div>
      <div className="flex flex-col items-center justify-between lg:flex-row">
        <Typography className="order-2 w-full shrink-0 text-center text-foreground-70 md:max-w-4xl lg:order-1 lg:max-w-sm lg:text-left">
          Our platform is built for the community, by the community. FORECAST
          isn't just a place to play and win; it’s a space where your voice
          matters. Through our unique <b>DAO-driven model</b>, our community
          members actively participate in voting for quests, determining
          outcomes, and shaping the future of the platform. Your contributions
          and decisions are rewarded, making FORECAST not only a gaming
          experience but a true decentralized ecosystem.
        </Typography>
        <div className="relative order-1 h-[340px] w-[400px] shrink-0 md:h-[442px] md:w-[524px] lg:order-2">
          <img
            alt="about-us-cover"
            src="/assets/images/about-us-bg.png"
            className="absolute inset-0 z-[-1] size-full object-cover"
          />
          <img
            alt="about-us"
            src="/assets/images/about-us.png"
            className="size-full object-cover"
          />
        </div>

        <Typography className="order-3 hidden max-w-sm shrink-0 text-left text-foreground-70 lg:block">
          Whether you're here to predict outcomes, engage in quests, or simply
          be part of an evolving community,{' '}
          <b>FORECAST offers you the tools, rewards, and freedom</b> to play on
          your terms. Join us as we redefine the world of prediction gaming with
          transparency, fairness, and fun at the core.
        </Typography>
      </div>
      <Typography
        level="h4"
        className="mt-6 text-center text-sm md:text-base lg:text-xl xl:text-2xl"
      >
        Welcome to the future of social challenges.
        <br className="md:hidden" /> Welcome to FORECAST!
      </Typography>
    </div>
  );
};
