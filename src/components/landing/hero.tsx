'use client';

import Autoplay from 'embla-carousel-autoplay';
import Image from 'next/image';
import type { ComponentPropsWithRef } from 'react';
import React from 'react';

import {
  Carousel,
  type CarouselApi,
  CarouselContent,
  CarouselItem,
} from '@/components/ui/carousel';
import { useDotButton } from '@/hooks/use-dot-button';
import { cn } from '@/utils/cn';

const heroImages = [
  '/assets/banners/1_welcome.jpg',
  '/assets/banners/2_daily_reward_open.jpg',
  '/assets/banners/3_creator.jpg',
  '/assets/banners/4_swap_open.jpg',
];

export const Hero = () => {
  const [api, setApi] = React.useState<CarouselApi>();

  const { selectedIndex, scrollSnaps, onDotButtonClick } = useDotButton(api);

  return (
    <div className="relative">
      <div className="size-full">
        <Carousel
          setApi={setApi}
          plugins={[
            Autoplay({
              delay: 4000,
            }),
          ]}
          opts={{
            loop: true,
          }}
          className="size-full [&>div]:h-full"
        >
          <CarouselContent noSpace className="relative h-full">
            {heroImages.map((url, index) => (
              <CarouselItem key={index} noSpace>
                <div className="relative size-full">
                  <Image
                    src={url}
                    alt="hero"
                    width={0}
                    height={0}
                    sizes="100vw"
                    style={{ width: '100%', height: 'auto' }}
                  />
                </div>
              </CarouselItem>
            ))}
          </CarouselContent>
        </Carousel>
      </div>

      <div className="absolute bottom-0.5 left-1/2 z-10 flex -translate-x-1/2 items-center gap-1 sm:gap-2">
        {scrollSnaps.map((_, index) => (
          <DotButton
            key={index}
            onClick={() => onDotButtonClick(index)}
            selected={index === selectedIndex}
          >
            {index}
          </DotButton>
        ))}
      </div>
    </div>
  );
};

type PropType = ComponentPropsWithRef<'button'> & {
  selected?: boolean;
};

export const DotButton: React.FC<PropType> = (props) => {
  const { children, className, selected = false, ...restProps } = props;

  return (
    <button
      className={cn(
        'rounded-full transition-all duration-300 ease-in-out',
        {
          'h-2 w-6 sm:h-4 sm:w-12 bg-black': selected,
          'h-2 w-2 sm:h-4 sm:w-4 bg-gray-400': !selected,
        },
        className,
      )}
      type="button"
      {...restProps}
    >
      <span className="sr-only">{children}</span>
    </button>
  );
};
