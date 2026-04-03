import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import dayjs from 'dayjs';
import { useEffect, useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import { useAccount } from 'wagmi';
import { z } from 'zod';

import { WalletOptionsDialog } from '@/components/connect-wallet';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from '@/components/ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Typography } from '@/components/ui/typography';
import { appQueryKeys } from '@/config/query';
import { useFetchQuestBettings } from '@/hooks/use-quest';
import { useToast } from '@/hooks/use-toast';
import api from '@/libs/api';
import type {
  CreateBetRequest,
  MemberBetting,
  QuestDetail,
} from '@/types/schema';
import { formatNumber } from '@/utils/number';

interface VoteFormMobileProps {
  quest: QuestDetail;
}

export const MobileVoteSection = ({ quest }: VoteFormMobileProps) => {
  const { toast } = useToast();
  const { address } = useAccount();
  const { data: betting } = useFetchQuestBettings(quest.quest_key, address);
  const [yourOpinion, setYourOpinion] = useState<MemberBetting | undefined>();

  const isEnded
    = (!!quest?.quest_finish_datetime
      && dayjs(quest.quest_finish_datetime).isBefore(dayjs()))
    || (!!quest?.quest_end_date && dayjs(quest.quest_end_date).isBefore(dayjs()));

  const queryClient = useQueryClient();

  const formSchema = useMemo(
    () =>
      z.object({
        outcome: z.string().min(1, 'Outcome is required'),
      }),
    [],
  );

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      outcome: '',
    },
  });

  useEffect(() => {
    if (betting && betting.data?.length) {
      const selectedAnswer = betting.data[0];
      if (selectedAnswer) {
        setYourOpinion(selectedAnswer);
        form.setValue('outcome', selectedAnswer.answer_key.toString());
      }
    }
  }, [betting, form]);

  const { mutate: createBet, isPending: isBetting } = useMutation({
    mutationKey: [...appQueryKeys.bettings.create],
    mutationFn: async (params: CreateBetRequest) => {
      if (isEnded) {
        throw new Error('This quest is ended');
      }

      const response = await api.createBet(params);
      if (response.success === 0 || !response.data?.betting_key) {
        throw response.error;
      }

      return true;
    },
    onSuccess: () => {
      toast({
        title: 'Vote successful',
        variant: 'success',
      });

      form.reset();

      queryClient.invalidateQueries({
        queryKey: [...appQueryKeys.quest.root, quest?.quest_key].filter(
          Boolean,
        ),
      });
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

  async function onSubmit(data: z.infer<typeof formSchema>) {
    try {
      if (!quest) {
        return;
      }

      if (!address) {
        toast({
          title: 'Please connect your wallet first',
        });
      }

      createBet({
        quest_key: quest.quest_key,
        answer_key: data.outcome,
        betting_address: address as string,
        betting_status: true,
      });
      window.location.reload();
    } catch (error: any) {
      console.error(error);
      toast({
        title: 'Oops! Something went wrong',
        description: error?.message,
        variant: 'danger',
      });
    }
  }

  return (
    <div className="space-y-2">
      <div className="mt-4 flex items-center justify-between">
        <Typography level="h6" className="font-bold">
          Poll
        </Typography>
        <div className="flex items-center gap-1 rounded-lg px-2 py-1">
          <div className="size-4 rounded-full bg-white"></div>
          Total:
          <Typography level="body2" className="font-medium text-foreground">
            {formatNumber(Number(quest.total_betting), {
              minimumFractionDigits: 0,
            })}
            {' '}
          </Typography>
        </div>
      </div>

      {address ? (
        <Form {...form}>
          <form className="space-y-2" onSubmit={form.handleSubmit(onSubmit)}>
            {/* Select Outcome */}
            <FormField
              control={form.control}
              name="outcome"
              disabled={isEnded}
              render={({ field }) => (
                <FormItem className="w-full">
                  <FormControl>
                    <Select
                      {...field}
                      onValueChange={field.onChange}
                      value={field.value}
                    >
                      <SelectTrigger className="h-12 rounded-2xl border-2 border-gray-200 bg-white text-left text-sm placeholder:text-sm">
                        <SelectValue
                          placeholder="Select a outcome"
                          className="text-sm"
                        />
                      </SelectTrigger>
                      <SelectContent>
                        {quest?.answers.map(answer => (
                          <SelectItem
                            key={answer.answer_key}
                            value={answer.answer_key}
                          >
                            {answer.answer_title}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Bet Button */}
            <Button
              type="submit"
              noShadow
              disabled={isEnded || yourOpinion !== undefined}
              loading={isBetting}
              className="h-14 w-full rounded-2xl bg-[#3B27DF] text-lg font-bold text-white"
            >
              {yourOpinion ? 'Voted' : 'Vote'}
            </Button>
          </form>
        </Form>
      ) : (
        <>
          <Typography level="body2" className="mb-2">
            Selected outcome:
          </Typography>
          <Typography level="body1" className="mb-4 font-medium">
            There are no answer selected.
          </Typography>
          <WalletOptionsDialog>
            <Button>Connect wallet</Button>
          </WalletOptionsDialog>
        </>
      )}
    </div>
  );
};
