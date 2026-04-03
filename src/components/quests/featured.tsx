'use client';

import dayjs from 'dayjs';
import Autoplay from 'embla-carousel-autoplay';
import Image from 'next/image';
import Link from 'next/link';
import React from 'react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import type { CarouselApi } from '@/components/ui/carousel';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
} from '@/components/ui/carousel';
import { Typography } from '@/components/ui/typography';
import { ROUTES } from '@/config/routes';
// import { useDotButton } from "@/hooks/use-dot-button";
import { useFetchFeaturedQuests } from '@/hooks/use-fetch-quests';

// import { DotButton } from "../landing/hero";
import { Skeleton } from '../ui/skeleton';

export const FearturedQuests = () => {
  const [_api, setApi] = React.useState<CarouselApi>();
  // const { selectedIndex, scrollSnaps, onDotButtonClick } = useDotButton(api);

  const { data, isLoading } = useFetchFeaturedQuests();

  if (isLoading) {
    return <FearturedQuestsSkeleton />;
  }

  if (data?.data?.length === 0) {
    return null;
  }

  return (
    <div className="relative mb-10 mt-6 lg:mb-14 xl:mb-16">
      <Carousel
        plugins={[
          Autoplay({
            delay: 2000,
          }),
        ]}
        className="w-full overflow-hidden rounded-2xl md:rounded-8 lg:rounded-14"
        setApi={setApi}
      >
        <CarouselContent className="">
          {data?.data?.map(quest => (
            <CarouselItem key={quest.quest_key}>
              <div className="relative">
                <div className="relative aspect-video overflow-hidden lg:aspect-[unset] lg:h-[500px]">
                  <Image
                    src={quest.quest_image_url}
                    alt={quest.quest_title}
                    width={0}
                    height={0}
                    className="brightness-50"
                    sizes="100vw"
                    style={{
                      width: '100%',
                      height: '100%',
                      objectFit: 'cover',
                      objectPosition: 'center',
                      boxShadow: '12px 13px 8px 0px #00000026 inset',
                      background:
                        'linear-gradient(68.22deg, rgba(0, 0, 0, 0.4) 26.99%, rgba(0, 0, 0, 0) 73.01%)',
                    }}
                  />
                </div>
                <div className="mt-3 md:absolute md:bottom-6 md:left-6">
                  <div className="mb-2 flex items-center gap-2">
                    <Badge
                      className="md:border-white md:text-white"
                      variant="outline"
                    >
                      {quest.quest_status === 'FINISH'
                        ? 'Ended'
                        : 'In Progress'}
                    </Badge>
                    <Typography className="text-sm md:text-white">
                      {dayjs(quest.quest_end_date).format(
                        'YYYY/MM/DD - hh:mm:ss',
                      )}
                    </Typography>
                  </div>
                  <Typography
                    level="h4"
                    className="mb-4 font-clash-display text-sm font-semibold md:text-xl md:text-white"
                  >
                    {quest.quest_title}
                  </Typography>
                  {quest.quest_status !== 'FINISH' && (
                    <Link
                      className="hidden md:inline"
                      href={ROUTES.QUEST_DETAIL(quest.quest_key)}
                    >
                      <Button>Vote Now</Button>
                    </Link>
                  )}
                </div>
              </div>
            </CarouselItem>
          ))}
        </CarouselContent>
      </Carousel>
      {/* <div className="absolute bottom-24 left-3 flex items-center justify-center gap-4 md:static md:mt-6">
        {scrollSnaps.map((_, index) => (
          <DotButton
            key={index}
            onClick={() => onDotButtonClick(index)}
            selected={index === selectedIndex}
            className="border-border/50"
          >
            {index}
          </DotButton>
        ))}
      </div> */}
    </div>
  );
};

const FearturedQuestsSkeleton = () => {
  return (
    <div className="mb-10 mt-6 h-[500px] rounded-14 border border-border p-10 lg:mb-14 xl:mb-16">
      <Skeleton className="mb-4 h-5 w-32" />
      <Skeleton className="mb-4 h-8 w-60" />
      <Skeleton className="mb-4 h-8 w-80" />
    </div>
  );
};
