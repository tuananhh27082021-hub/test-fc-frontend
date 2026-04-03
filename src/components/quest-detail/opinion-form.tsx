import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import dayjs from 'dayjs';
import { useEffect, useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import { useAccount } from 'wagmi';
import { z } from 'zod';

import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
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

import { WalletOptionsDialog } from '../connect-wallet';

export const OpinionForm = ({ quest }: { quest: QuestDetail }) => {
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
    <div className="rounded-8 border border-border p-6">
      {address
        ? (
            <Form {...form}>
              <form className="space-y-4" onSubmit={form.handleSubmit(onSubmit)}>
                <FormField
                  control={form.control}
                  name="outcome"
                  disabled={isEnded}
                  render={({ field }) => (
                    <FormItem className="w-full">
                      <FormLabel>Selected outcome</FormLabel>
                      <Select
                        {...field}
                        onValueChange={field.onChange}
                        value={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select an outcome" />
                          </SelectTrigger>
                        </FormControl>
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
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <Button
                  loading={isBetting}
                  className="mt-4 md:mt-11 md:px-10"
                  type="submit"
                  variant="noShadow"
                  disabled={isEnded || yourOpinion !== undefined}
                >
                  {yourOpinion ? 'Voted' : 'Vote'}
                </Button>
              </form>
            </Form>
          )
        : (
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
