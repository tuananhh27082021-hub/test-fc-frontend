'use client';

import { useState } from 'react';

import { useAuth } from '@/app/auth-provider';
import NewPredictionDialog from '@/components/new-prediction-dialog';
import { TopicsHeader } from '@/components/quests/topics-header';
import SeasonDialog from '@/components/season-info-dialog';
import { CustomBreadcrumb } from '@/components/ui/breadcrumb';
import { Button } from '@/components/ui/button';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { Typography } from '@/components/ui/typography';
import { useFetchCategories } from '@/hooks/use-categories';
import { useNFTConfig } from '@/hooks/use-contract';
import { useQuestsFilters } from '@/hooks/use-fetch-quests';
import { useMediaQuery } from '@/hooks/use-media-query';
import { useToast } from '@/hooks/use-toast';
import { useFetchTopics } from '@/hooks/use-topics';
import {
  AddCircleIcon,
  ClockIcon,
  FilterIcon,
  HomeSolidIcon,
} from '@/icons/icons';
import { isAdmin } from '@/utils/member';

const breadcrumbItems = [{ label: 'Home', href: '/', icon: <HomeSolidIcon /> }];

export const QuestHeader = () => {
  const [open, setOpen] = useState(false);
  const [showFilter, setShowFilter] = useState(false);
  const { category, setCategory, topicSlug, setTopicSlug } = useQuestsFilters();
  const { nftBalance, user } = useAuth();
  const { toast } = useToast();
  const { mintRequiredNFT } = useNFTConfig();
  const isUserAdmin = isAdmin(user);

  const md = useMediaQuery('(min-width: 768px)');

  const { data } = useFetchCategories();
  const { data: topicsData } = useFetchTopics();
  const topics = topicsData?.data ?? [];

  const handleTopicSelect = (selectedTopicSlug: string | null) => {
    setTopicSlug(selectedTopicSlug);
  };

  return (
    <div className="mb-6 mt-2 lg:mb-8 xl:mb-10">
      <div className="mb-2 flex items-center justify-between gap-6">
        <Typography
          asChild
          className="font-clash-display text-2xl font-semibold"
        >
          <h2>QUEST</h2>
        </Typography>
        <TopicsHeader
          topics={topics}
          selectedTopicSlug={topicSlug}
          onTopicSelect={handleTopicSelect}
        />
      </div>

      <div className="mb-5 flex items-center justify-between">
        <CustomBreadcrumb items={breadcrumbItems} currentPage="Quest" />

        <div className="flex items-center gap-4">
          {isUserAdmin && (
            <NewPredictionDialog open={open} onOpenChange={setOpen}>
              {md
                ? (
                    <Button
                      onClick={(e) => {
                        if (nftBalance < mintRequiredNFT) {
                          e.preventDefault();
                          toast({
                            title: 'You don\'t have enough NFTs to create a quest',
                            variant: 'danger',
                          });
                        }
                      }}
                      startDecorator={<AddCircleIcon />}
                      variant="outline"
                    >
                      Create New Prediction
                    </Button>
                  )
                : (
                    <Button
                      onClick={(e) => {
                        if (nftBalance < mintRequiredNFT) {
                          e.preventDefault();
                          toast({
                            title: 'You don\'t have enough NFTs to create a quest',
                            variant: 'danger',
                          });
                        }
                      }}
                      variant="outline"
                      size="icon"
                    >
                      <AddCircleIcon />
                      <span className="sr-only">Create New Prediction</span>
                    </Button>
                  )}
            </NewPredictionDialog>
          )}
          <SeasonDialog>
            {md
              ? (
                  <Button
                    startDecorator={<ClockIcon className="text-[32px]" />}
                    variant="outline"
                  >
                    Season Info
                  </Button>
                )
              : (
                  <Button variant="outline" size="icon">
                    <ClockIcon className="text-[32px]" />
                    <span className="sr-only">Season</span>
                  </Button>
                )}
          </SeasonDialog>
          <Button
            onClick={() => setShowFilter(s => !s)}
            size="icon"
            variant="outline"
            className={showFilter ? 'text-primary' : ''}
          >
            <FilterIcon />
          </Button>
        </div>
      </div>

      {showFilter && (
        <div className="flex max-w-fit items-center overflow-y-auto rounded-xl border border-border p-2.5 shadow-light">
          <ToggleGroup
            value={category}
            type="single"
            className="gap-4 lg:gap-6"
          >
            <ToggleGroupItem
              key="all"
              value="all"
              variant="outline"
              className="h-10 w-12 rounded-lg"
              onClick={() => setCategory('all')}
            >
              All
            </ToggleGroupItem>
            {data?.data?.map(cate => (
              <ToggleGroupItem
                key={cate.id}
                value={cate.title.toLowerCase()}
                variant="outline"
                className="h-10 min-w-[48px] rounded-lg"
                onClick={() => setCategory(cate.title.toLowerCase())}
              >
                {cate.title}
              </ToggleGroupItem>
            ))}
          </ToggleGroup>
        </div>
      )}
    </div>
  );
};
