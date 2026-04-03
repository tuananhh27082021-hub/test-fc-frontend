import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { waitForTransactionReceipt } from '@wagmi/core';
import dayjs from 'dayjs';
import { useMemo } from 'react';
import { useForm } from 'react-hook-form';
import type { Address } from 'viem';
import { maxUint256, numberToHex, parseUnits } from 'viem';
import { useAccount, useReadContract, useWriteContract } from 'wagmi';
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
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Typography } from '@/components/ui/typography';
import {
  kaiaMarketContractABI,
  marketContractABI,
  usdcContractABI,
} from '@/config/contract';
import { appQueryKeys } from '@/config/query';
import { wagmiConfig } from '@/config/wagmi';
import { useBettingTokenBalance } from '@/hooks/use-contract';
import { useToast } from '@/hooks/use-toast';
import { WalletIcon } from '@/icons/icons';
import api from '@/libs/api';
import type { CreateBetRequest, QuestDetail } from '@/types/schema';
import { formatNumber } from '@/utils/number';
import { getBettingToken, getMarketContract } from '@/utils/quest';

import { WalletOptionsDialog } from '../connect-wallet';

export const VoteForm = ({ quest }: { quest?: QuestDetail }) => {
  const { toast } = useToast();
  const { address } = useAccount();

  const isEnded
    = (!!quest?.quest_finish_datetime
    && dayjs(quest.quest_finish_datetime).isBefore(dayjs()))
    || (!!quest?.quest_end_date && dayjs(quest.quest_end_date).isBefore(dayjs()));

  const queryClient = useQueryClient();

  const marketContract = getMarketContract(quest);
  const bettingToken = getBettingToken(quest);
  const {
    uiAmount,
    symbol,
    decimals,
    refetch: refreshBalance,
  } = useBettingTokenBalance(bettingToken.address, bettingToken.isNative);

  const { writeContractAsync } = useWriteContract({
    config: wagmiConfig,
  });

  const { refetch } = useReadContract({
    query: {
      enabled: false,
    },
    abi: usdcContractABI,
    address: bettingToken.address as Address,
    functionName: 'allowance',
    args: [address, marketContract],
  });

  const formSchema = useMemo(
    () =>
      z.object({
        outcome: z.string().min(1, 'Outcome is required'),
        amount: z
          .number({ required_error: 'Amount is required' })
          .positive({ message: 'Amount must be positive' })
          .max(Number(uiAmount), 'Insufficient funds for vote')
          .or(z.string())
          .pipe(
            z.coerce
              .number({ required_error: 'Amount is required' })
              .positive({ message: 'Amount must be positive' })
              .max(Number(uiAmount), 'Insufficient funds for vote'),
          ),
      }),
    [uiAmount],
  );

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      outcome: '',
      amount: undefined,
    },
  });

  const wAmount = form.watch('amount');
  const wOutcome = form.watch('outcome');

  const potentialReward = useMemo(() => {
    if (!quest || !wOutcome) {
      return 0;
    }
    const selectedAnswer = quest.answers.find(
      anw => anw.answer_key === wOutcome,
    );

    if (!selectedAnswer) {
      return 0;
    }

    const userInputAmount = Number(wAmount);

    const totalAmount = Number(quest.total_betting_amount) + userInputAmount;

    const selectedAnswerAmount = selectedAnswer.total_betting_amount;

    if (
      totalAmount === 0
      || totalAmount < selectedAnswerAmount + userInputAmount
    ) {
      return 0;
    }

    const serviceFee = (totalAmount * Number(quest.season.service_fee)) / 100;

    const creatorFee = (totalAmount * Number(quest.season.creator_fee)) / 100;

    const charityFee = (totalAmount * Number(quest.season.charity_fee)) / 100;

    const multiply
      = (totalAmount - serviceFee - creatorFee - charityFee)
      / (userInputAmount + Number(selectedAnswerAmount));

    const predictionFee = multiply * userInputAmount;

    return predictionFee;
  }, [quest, wOutcome, wAmount]);

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

      const amount = parseUnits(params.betting_amount as string, decimals);

      // Skip approve for native token (KAIA)
      if (!bettingToken.isNative) {
        const { data: allowance } = await refetch();

        if (((allowance as bigint) || 0) < amount) {
          const hash = await writeContractAsync({
            address: bettingToken.address as Address,
            abi: usdcContractABI,
            functionName: 'approve',
            account: address,
            args: [marketContract, numberToHex(maxUint256)],
          });

          await waitForTransactionReceipt(wagmiConfig, {
            hash,
          });
        }
      }

      // Select correct ABI based on token type
      const contractABI = bettingToken.isNative
        ? kaiaMarketContractABI
        : marketContractABI;

      const contractParams: any = {
        address: marketContract as Address,
        abi: contractABI,
        functionName: 'bet',
        account: address,
        args: [
          params.quest_key,
          params.answer_key,
          response.data.betting_key,
          // FIXME use utils
          Number(params.betting_amount) * 10 ** decimals,
        ],
      };

      // Add value for native token
      if (bettingToken.isNative) {
        contractParams.value = amount;
      }

      console.log('contractParams', contractParams);

      // const gas = await publicClient.estimateContractGas(contractParams);
      // const gasPrice = await getGasPrice();

      const hash = await writeContractAsync(contractParams);

      const receipt = await waitForTransactionReceipt(wagmiConfig, {
        hash,
      });

      if (receipt.status !== 'success') {
        throw new Error('Oops! Something went wrong');
      }

      await api.confirmBet(response.data.betting_key, receipt.transactionHash);

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
      refreshBalance();
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
        betting_amount: String(data.amount),
        betting_address: address as string,
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

                <div className="flex flex-col justify-between gap-4 md:flex-row">
                  <FormField
                    control={form.control}
                    name="amount"
                    disabled={isEnded}
                    render={({ field }) => (
                      <FormItem className="w-full">
                        <div className="flex items-center justify-between">
                          <FormLabel>Amount</FormLabel>

                          <div className="flex items-center gap-2">
                            <WalletIcon className="text-2xl" />
                            <Typography
                              level="body2"
                              className="font-medium text-foreground"
                            >
                              {formatNumber(Number(uiAmount), {
                                minimumFractionDigits: 0,
                              })}
                              {' '}
                              {symbol}
                            </Typography>
                          </div>
                        </div>
                        <FormControl>
                          <Input
                            placeholder="Please enter an amount"
                            {...field}
                            inputMode="decimal"
                            pattern="[0-9]*\.?[0-9]*"
                            onChange={(e) => {
                              const value = e.target.value;
                              if (/^(\d+(?:\.\d*)?|\.\d+|)$/.test(value)) {
                                field.onChange(value);
                              }
                            }}
                            endDecorator={(
                              <img
                                src={bettingToken.iconUrl}
                                className="size-6 object-cover"
                                alt="usdc"
                              />
                            )}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <Button
                    loading={isBetting}
                    className="mt-4 md:mt-11 md:px-10"
                    type="submit"
                    variant="noShadow"
                    disabled={isEnded}
                  >
                    Vote
                  </Button>
                </div>

                <Typography className="text-foreground-50" level="body2">
                  Potential rewards:
                  {' '}
                  <span className="font-bold text-[#01A340]">
                    {formatNumber(potentialReward, {
                      minimumFractionDigits: 0,
                      maximumFractionDigits: 2,
                    })}
                  </span>
                </Typography>
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
              <Typography level="body2" className="mb-2">
                Amount:
              </Typography>
              <WalletOptionsDialog>
                <Button>Connect wallet</Button>
              </WalletOptionsDialog>
            </>
          )}
    </div>
  );
};
