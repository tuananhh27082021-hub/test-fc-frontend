'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import dayjs from 'dayjs';
import type { PropsWithChildren } from 'react';
import React, { useEffect, useState } from 'react';
import { useFieldArray, useForm } from 'react-hook-form';
import type { Address } from 'viem';
import { useAccount, useWatchContractEvent, useWriteContract } from 'wagmi';
import { z } from 'zod';

import { useAuth } from '@/app/auth-provider';
import { Button } from '@/components/ui/button';
import { DateTimePicker } from '@/components/ui/calendar';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input, Textarea } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { MARKET_MAP_TOKEN, OPINION_BOUNTY_CATEGORY } from '@/config/constants';
import { governanceContractABI } from '@/config/contract';
import { appQueryKeys } from '@/config/query';
import { wagmiConfig } from '@/config/wagmi';
import { useFetchCategories } from '@/hooks/use-categories';
import { useAddQuestMutation, useDraftQuestMutation } from '@/hooks/use-quest';
import { useFetchActiveSeason } from '@/hooks/use-seasons';
import { useToast } from '@/hooks/use-toast';
import { useFetchTopics } from '@/hooks/use-topics';
import { StapleIcon } from '@/icons/icons';
import { Env } from '@/libs/Env';
import type { AddQuestResponse } from '@/types/schema';
import { isAdmin } from '@/utils/member';
import {
  getSocialMediaCheck,
  uploadUrlThumbnail,
  uploadYouTubeThumbnail,
} from '@/utils/sns';

type NewPredictionDialogProps = {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
} & PropsWithChildren;

const imageSource = [
  {
    key: 'image',
    name: 'Image',
  },
  {
    key: 'sns-url',
    name: 'SNS url',
  },
];

const BaseSchema = z.object({
  title: z
    .string()
    .min(3, 'Title must be at least 3 characters long')
    .max(256, 'Title must be at most 256 characters long'),

  description: z
    .string()
    .min(3, 'Description must be at least 3 characters long')
    .max(500, 'Description must be at most 500 characters long'),

  category: z.string().min(1, 'Category is required'),

  topic: z.string().optional(),

  endTime: z.date({
    required_error: 'End time is required',
  }),

  answers: z
    .string()
    .trim()
    .min(1, 'Option is required')
    .array()
    .min(2, 'There must be at least two options'),

  youtube_url: z
    .string()
    .url({ message: 'Invalid YouTube URL' })
    .refine(
      (url) => {
        if (!url) {
          return true;
        }
        const youtubeRegex = /^(https?:\/\/)?(www\.)?(youtube\.com\/(watch\?v=|embed\/|shorts\/)|youtu\.be\/)[\w-]+/;
        return youtubeRegex.test(url);
      },
      { message: 'Please enter a valid YouTube URL' },
    )
    .optional()
    .or(z.literal('')),

  extra_data: z
    .object({
      points: z
        .string()
        .optional()
        .refine(val => !val || !Number.isNaN(Number(val)), {
          message: 'Points must be a number',
        }),
      market_address: z.string().optional(),
    })
    .optional(),
});

const FormSchema = z.discriminatedUnion('imageType', [
  z
    .object({
      imageType: z.literal('image'),
      image: z
        .instanceof(File, { message: 'Image is required' })
        .refine(file => file instanceof File, {
          message: 'Expected a file upload',
        }),
    })
    .merge(BaseSchema),
  z
    .object({
      imageType: z.literal('sns-url'),
      image: z.string().url({ message: 'Invalid URL format' }),
    })
    .merge(BaseSchema),
]);

export default function NewPredictionDialog({
  children,
  open,
  onOpenChange,
}: NewPredictionDialogProps) {
  const { toast } = useToast();

  const { address } = useAccount();
  const { writeContractAsync } = useWriteContract({
    config: wagmiConfig,
  });

  const [listenEvent, setListenEvent] = useState(false);

  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      title: '',
      description: '',
      imageType: 'image',
      answers: ['Option 1', 'Option 2'],
      youtube_url: '',
      topic: '',
    },
  });

  const {
    watch,
    control,
    resetField,
    formState: { errors, isSubmitting },
  } = form;

  const wImageType = watch('imageType', 'image');

  const { fields, append, remove } = useFieldArray({
    control,
    // @ts-expect-error ignore
    name: 'answers',
  });

  const { data } = useFetchCategories();
  const { data: topicsData } = useFetchTopics();
  const { user } = useAuth();

  // Filter categories: hide OPINION_BOUNTY_CATEGORY if user is not admin
  const allCategories = data?.data ?? [];
  const categories = isAdmin(user)
    ? allCategories
    : allCategories.filter(cat => cat.title !== OPINION_BOUNTY_CATEGORY);

  const topics = topicsData?.data ?? [];

  const { data: activeSeason } = useFetchActiveSeason();

  const queryClient = useQueryClient();

  const { mutate: addQuest, isPending: isAddingQuest } = useAddQuestMutation({
    onSuccess: async (quest) => {
      if (!quest?.data) {
        return;
      }

      console.log('create Quest', quest);

      if (
        quest.data.quest_category.quest_category_title
        === OPINION_BOUNTY_CATEGORY
      ) {
        form.reset();
        onOpenChange?.(false);

        // Invalidate queries to refetch quest data
        queryClient.invalidateQueries({
          queryKey: appQueryKeys.quests.root,
        });

        toast({
          title: 'Quest created successfully',
          variant: 'success',
        });

        return;
      }

      callContract(quest.data);
    },
    onError: (error) => {
      toast({
        title: 'Oops! Something went wrong',
        description: error?.message,
        variant: 'danger',
      });
    },
  });

  const { mutate: draftQuest, isPending: isDrafting } = useDraftQuestMutation({
    onSuccess: async () => {
      toast({
        title: 'Quest created successfully',
        variant: 'success',
      });
      form.reset();
      onOpenChange?.(false);

      // Invalidate queries to refetch quest data
      queryClient.invalidateQueries({
        queryKey: [...appQueryKeys.quests.dao, 'draft'],
      });
      queryClient.invalidateQueries({
        queryKey: appQueryKeys.quests.root,
      });
      // router.push(ROUTES.DAO);
    },
    onError: (error) => {
      console.error(error);
      toast({
        title: 'Oops! Something went wrong',
        description: error?.message,
        variant: 'danger',
      });
    },
  });

  const { mutate: callContract, isPending: isCallingContract } = useMutation({
    mutationKey: [],
    mutationFn: async (quest: AddQuestResponse) => {
      const questKey = quest.quest_key!;
      const args = [questKey, quest.quest_title, address];

      // const gas = await publicClient.estimateContractGas({
      //   address: Env.NEXT_PUBLIC_GOVERNANCE_ADDRESS as Address,
      //   abi: governanceContractABI,
      //   functionName: 'createGovernanceItem',
      //   account: address,
      //   args,
      // });

      // const gasPrice = await getGasPrice();

      // console.log('governance Address', Env.NEXT_PUBLIC_GOVERNANCE_ADDRESS)
      // console.log('gasPrice', gasPrice.toString());
      // console.log('gas', gas.toString())
      // console.log('args', args)

      try {
        await writeContractAsync({
          abi: governanceContractABI,
          address: Env.NEXT_PUBLIC_GOVERNANCE_ADDRESS as Address,
          functionName: 'createGovernanceItem',
          args,
          // gasPrice,
          // gas,
        });
        setListenEvent(true);
      } catch (e) {
        setListenEvent(false);
        toast({
          title: 'Oops! Something went wrong',
          description: 'Unable to create quest. Please try again!',
          variant: 'danger',
        });
        console.error(e);
      }
    },
  });

  useWatchContractEvent({
    address: Env.NEXT_PUBLIC_GOVERNANCE_ADDRESS as Address,
    abi: governanceContractABI,
    eventName: 'GovernanceItemCreated',
    poll: true,
    pollingInterval: 1_000,
    enabled: listenEvent,
    onLogs(logs) {
      console.log(logs);
      const log = logs[0] as any;
      if (log && log.args) {
        const startQuest = Number(log.args.createdAt) * 1000;
        const endQuest = Number(log.args.endAt) * 1000;
        const startBlock = Number(log.args.startBlock);
        const hash = log.transactionHash;
        const questKey = log.args.questKey.toString();

        draftQuest({
          quest_key: questKey,
          start_at: dayjs(startQuest).format('YYYY-MM-DD hh:mm:ss'),
          end_at: dayjs(endQuest).format('YYYY-MM-DD hh:mm:ss'),
          tx: hash,
          start_block: startBlock,
        });

        setListenEvent(false);
      } else {
        setListenEvent(false);
        toast({
          title: 'Oops! Something went wrong',
          description: 'Transaction might be taking too long!',
          variant: 'danger',
        });
      }
    },
    onError: (error: any) => {
      setListenEvent(false);
      // Ignore "filter not found" errors from RPC polling
      if (error?.message?.includes('filter not found')) {
        return;
      }
      toast({
        title: 'Oops! Something went wrong',
        description: error?.message,
        variant: 'danger',
      });
    },
  });

  async function onSubmit(data: z.infer<typeof FormSchema>) {
    try {
      if (!address) {
        toast({
          title: 'Please connect your wallet first',
        });
      }
      const season = activeSeason?.data;
      if (!season) {
        toast({
          title: 'No active season found',
        });
        return;
      }

      if (data.imageType === 'sns-url') {
        const snsInfo = await getSocialMediaCheck(data.image);

        if (snsInfo.check) {
          let thumbnail;

          // youtube 일 경우, 썸네일 저장
          if (snsInfo.snsType === 'Y' && !!snsInfo.snsId) {
            thumbnail = await uploadYouTubeThumbnail(snsInfo.snsId);

            if (thumbnail.thumbnail) {
              data.image = thumbnail;
            } else {
              data.image = `https://img.youtube.com/vi/${snsInfo.snsId}/maxresdefault.jpg`;
            }
          } else if (snsInfo.imageUrl && snsInfo.imageUrl !== '') {
            thumbnail = await uploadUrlThumbnail(data.image);

            if (thumbnail.thumbnail) {
              data.image = thumbnail;
            }
          }
        } else {
          toast({
            title: 'Oops! Something went wrong',
            description: 'Invalid SNS URL',
            variant: 'danger',
          });
          return;
        }
      }

      // Check if selected market is native token
      const selectedMarketAddress = data.extra_data?.market_address;
      const isNativeToken = selectedMarketAddress
        ? MARKET_MAP_TOKEN[selectedMarketAddress]?.isNative
        : false;

      addQuest({
        quest_title: data.title,
        quest_description: data.description,
        quest_end_date: data.endTime.toISOString(),
        quest_category_id: data.category,
        season_id: season.id,
        answers: data.answers,
        file: data.imageType === 'image' ? data.image : undefined,
        quest_creator: address as string,
        quest_image_link: data.imageType === 'sns-url' ? data.image : '',
        quest_image_url:
          data.imageType === 'sns-url' ? data.image : 'https://example.com',
        youtube_url: data.youtube_url || undefined,
        extra_data: {
          ...data.extra_data,
          is_native: isNativeToken,
        },
        topic_ids: data.topic ? [data.topic] : undefined,
      });
    } catch (error: any) {
      console.error(error);
      toast({
        title: 'Oops! Something went wrong',
        description: error?.message,
        variant: 'danger',
      });
    }
  }

  useEffect(() => {
    if (wImageType) {
      setTimeout(() => {
        resetField('image');
      }, 100);
    }
  }, [wImageType]);

  const [isOpinionBounty, setOpinionBounty] = useState(false);

  const onCategoryChange = (value: string) => {
    const seleted = categories.find(categ => categ.id === value);
    setOpinionBounty(seleted?.title === OPINION_BOUNTY_CATEGORY);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="max-h-[calc(100dvh-48px)] w-11/12 overflow-y-scroll py-6 md:max-w-3xl">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <DialogHeader>
              <DialogTitle className="text-xl">
                Create New Prediction / Poll
              </DialogTitle>
              <DialogDescription className="sr-only">
                Create New Prediction
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-5 py-6">
              {/* title */}
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-base">Tittle</FormLabel>
                    <FormControl>
                      <Input
                        className="h-12 placeholder:text-sm"
                        placeholder="Please enter a tittle"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              {/* Quest details: */}
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-base">
                      Additional context
                    </FormLabel>
                    <FormControl>
                      <Textarea
                        className="placeholder:text-sm"
                        rows={5}
                        placeholder="Please enter an additional context"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Category: */}
              <FormField
                control={form.control}
                name="category"
                render={({ field }) => (
                  <FormItem className="w-full">
                    <FormLabel className="text-base">Type</FormLabel>
                    <Select
                      onValueChange={(value) => {
                        field.onChange(value);
                        onCategoryChange(value);
                      }}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger className="h-12 text-sm">
                          <SelectValue placeholder="Type name" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {categories.map(cate => (
                          <SelectItem key={cate.id} value={cate.id}>
                            {cate.title}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="topic"
                render={({ field }) => (
                  <FormItem className="w-full">
                    <FormLabel className="text-base">Category</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger className="h-12 text-sm">
                          <SelectValue placeholder="Select a category" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {topics.map(topic => (
                          <SelectItem key={topic.id} value={topic.id}>
                            {topic.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* title */}
              {isOpinionBounty
                ? (
                    <FormField
                      control={form.control}
                      name="extra_data.points"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-base">Input point</FormLabel>
                          <FormControl>
                            <Input
                              className="h-12 placeholder:text-sm"
                              placeholder="Please enter number"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  )
                : (
                    <FormField
                      control={form.control}
                      name="extra_data.market_address"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-base">Voting Token</FormLabel>
                          <Select
                            onValueChange={(value) => {
                              field.onChange(value);
                              onCategoryChange(value);
                            }}
                            defaultValue={field.value}
                          >
                            <FormControl>
                              <SelectTrigger className="h-12 text-sm">
                                <SelectValue placeholder="Please select a voting token" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {Object.entries(MARKET_MAP_TOKEN).map(
                                ([market_address, token]) => (
                                  <SelectItem
                                    key={market_address}
                                    value={market_address}
                                  >
                                    <div className="flex gap-2">
                                      <img
                                        src={token.iconUrl}
                                        className="size-6 object-cover"
                                        alt="betting_token"
                                      />
                                      <span>{token.symbol}</span>
                                    </div>
                                  </SelectItem>
                                ),
                              )}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  )}

              <FormField
                control={form.control}
                name="endTime"
                render={({ field }) => (
                  <FormItem className="flex w-full flex-col">
                    <FormLabel className="text-base">End time</FormLabel>
                    <DateTimePicker
                      className="text-sm placeholder:text-sm"
                      value={field.value}
                      onChange={field.onChange}
                      placeholder="Choose ending time"
                      disabled={date =>
                        dayjs(date).isBefore(dayjs().subtract(1, 'day'))}
                    />

                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* YouTube URL */}
              <FormField
                control={form.control}
                name="youtube_url"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-base">
                      YouTube Link
                      {' '}
                      <span className="text-sm font-normal text-foreground-50">(Optional)</span>
                    </FormLabel>
                    <FormControl>
                      <Input
                        className="h-12 placeholder:text-sm"
                        placeholder="https://www.youtube.com/watch?v=..."
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="flex flex-col gap-4 md:flex-row md:gap-5 lg:gap-6">
                {/* image */}
                <FormField
                  control={form.control}
                  name="imageType"
                  render={({ field }) => (
                    <FormItem className="w-full shrink-0 md:w-[180px]">
                      <FormLabel className="text-base">Image</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        value={field.value}
                      >
                        <FormControl>
                          <SelectTrigger className="h-12">
                            <SelectValue
                              className="text-sm"
                              placeholder="Please choose a type"
                            />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent className="text-sm">
                          {imageSource.map(cate => (
                            <SelectItem
                              className="text-sm"
                              key={cate.key}
                              value={cate.key}
                            >
                              {cate.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* image: */}
                {wImageType === 'image' && (
                  <FormField
                    control={form.control}
                    name="image"
                    render={({ field: { value, onChange, ...fieldProps } }) => (
                      <FormItem className="w-full">
                        <FormControl className="md:mt-10">
                          <div className="flex w-full items-center space-x-2">
                            <div className="relative grow overflow-hidden rounded-xl">
                              <Input
                                type="text"
                                id="image-input"
                                placeholder="Attach an image"
                                className="h-12 pr-20 placeholder:text-sm"
                                readOnly
                              />
                              <Label
                                htmlFor="file-upload"
                                className="absolute inset-y-2 right-4 flex cursor-pointer items-center rounded-xl bg-[#D8D8D8] px-4 text-sm font-medium text-black hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                              >
                                <StapleIcon className="size-4" />
                                File Attach
                              </Label>
                              <Input
                                id="file-upload"
                                type="file"
                                className="hidden"
                                accept="image/*"
                                {...fieldProps}
                                onChange={(e: any) => {
                                  const files = e.target.files;
                                  if (files && files.length > 0) {
                                    const file = files[0]!;

                                    onChange(file);

                                    const fileName = file?.name;

                                    // @ts-expect-error just ignore
                                    document.getElementById(
                                      'image-input',
                                      // @ts-expect-error just ignore
                                    ).value = fileName;
                                  }
                                }}
                              />
                            </div>
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}

                {wImageType === 'sns-url' && (
                  <FormField
                    control={form.control}
                    name="image"
                    render={({ field }) => {
                      return (
                        <FormItem className="w-full">
                          <FormControl className="md:mt-10">
                            {/* @ts-expect-error ignore */}
                            <Input
                              className="h-12 placeholder:text-sm"
                              placeholder="Please enter an URL"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      );
                    }}
                  />
                )}
              </div>

              {/* answer: */}
              <div className="space-y-3">
                <div className="flex w-full items-center justify-between">
                  <Label className="text-base">Outcomes Options</Label>
                </div>

                <div className="space-y-3">
                  {fields.map((field, index) => {
                    const errorForField = errors?.answers?.[index];

                    return (
                      <FormField
                        key={field.id}
                        control={form.control}
                        name={`answers.${index}` as const}
                        render={({ field }) => (
                          <FormItem>
                            <FormControl>
                              <div className="flex items-center gap-3">
                                <div className="flex-1 rounded-2xl border border-gray-200 bg-gray-50 px-4">
                                  <Input
                                    placeholder={`Option ${index + 1}`}
                                    {...field}
                                    className="border-none bg-transparent p-0 text-base font-medium placeholder:text-sm placeholder:text-gray-500 focus-visible:ring-0"
                                  />
                                </div>
                                <button
                                  type="button"
                                  onClick={(event) => {
                                    event.preventDefault();
                                    remove(index);
                                  }}
                                  className="flex size-8 items-center justify-center rounded-full bg-[#F62C40] font-bold text-white"
                                >
                                  −
                                </button>
                              </div>
                            </FormControl>
                            {errorForField && <FormMessage />}
                          </FormItem>
                        )}
                      />
                    );
                  })}

                  {/* Add button */}
                  <div className="flex justify-start">
                    <button
                      type="button"
                      onClick={(event) => {
                        event.preventDefault();
                        append(`Option ${fields.length + 1}`);
                      }}
                      className="flex items-center justify-center gap-2 rounded-full bg-white py-2 font-bold text-white"
                    >
                      <span className="flex size-6 items-center justify-center rounded-full bg-[#3B27DF] text-white">
                        +
                      </span>
                      <span className="text-sm font-medium text-[#3B27DF]">
                        Add option
                      </span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button
                loading={
                  isAddingQuest
                  || isCallingContract
                  || listenEvent
                  || isDrafting
                  || isSubmitting
                }
                className="w-full border-0 bg-[#3B27DF] font-bold text-white"
                noShadow
                type="submit"
              >
                Complete
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
