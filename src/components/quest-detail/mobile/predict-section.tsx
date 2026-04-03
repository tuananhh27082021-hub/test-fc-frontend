import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { waitForTransactionReceipt } from '@wagmi/core';
import dayjs from 'dayjs';
import Image from 'next/image';
import { useMemo } from 'react';
import { useForm } from 'react-hook-form';
import type { Address } from 'viem';
import { maxUint256, numberToHex, parseUnits } from 'viem';
import { useAccount, useReadContract, useWriteContract } from 'wagmi';
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

interface VoteFormMobileProps {
  quest?: QuestDetail;
}

export const MobilePredictSection = ({ quest }: VoteFormMobileProps) => {
  const { toast } = useToast();
  const { address } = useAccount();
  const queryClient = useQueryClient();

  const isEnded
    = (!!quest?.quest_finish_datetime
    && dayjs(quest.quest_finish_datetime).isBefore(dayjs()))
    || (!!quest?.quest_end_date && dayjs(quest.quest_end_date).isBefore(dayjs()));

  const marketContract = getMarketContract(quest);
  const bettingToken = getBettingToken(quest);
  const {
    uiAmount,
    decimals,
    symbol,
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

      const amountBigInt = parseUnits(
        params.betting_amount as string,
        decimals,
      );

      // Skip approve for native token (KAIA)
      if (!bettingToken.isNative) {
        const { data: allowance } = await refetch();

        if (((allowance as bigint) || 0) < amountBigInt) {
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
          Number(params.betting_amount) * 10 ** decimals,
        ],
      };

      // Add value for native token
      if (bettingToken.isNative) {
        contractParams.value = amountBigInt;
      }

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

  const onSubmit = async (data: z.infer<typeof formSchema>) => {
    try {
      if (!quest) {
        return;
      }

      if (!address) {
        toast({
          title: 'Please connect your wallet first',
          variant: 'warning',
        });
        return;
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
  };

  return (
    <div className="space-y-2">
      <div className="mt-4 flex items-center justify-between">
        <Typography level="h6" className="font-bold">
          Predict
        </Typography>
        <div className="flex items-center gap-1 rounded-lg px-2 py-1">
          <div className="size-4 rounded-full bg-white"></div>
          <WalletIcon />
          <Typography level="body2" className="font-medium text-foreground">
            {formatNumber(Number(uiAmount), {
              minimumFractionDigits: 0,
            })}
            {' '}
            {symbol}
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

            {/* Amount Input */}
            <FormField
              control={form.control}
              name="amount"
              disabled={isEnded}
              render={({ field }) => (
                <FormItem className="w-full">
                  <div className="relative w-full">
                    <FormControl>
                      <Input
                        placeholder="Please enter amount"
                        {...field}
                        className="h-12 rounded-2xl border-2 border-gray-200 bg-white text-sm placeholder:text-sm"
                        inputMode="decimal"
                        pattern="[0-9]*\.?[0-9]*"
                        onChange={(e) => {
                          const value = e.target.value;
                          if (/^(\d+(?:\.\d*)?|\.\d+)?$/.test(value)) {
                            field.onChange(value);
                          }
                        }}
                      />
                    </FormControl>
                    <div className="absolute right-4 top-1/2 -translate-y-1/2">
                      <div className="flex size-10 items-center justify-center rounded-full">
                        <Image
                          src={bettingToken.iconUrl}
                          width={24}
                          height={24}
                          className="size-6 object-cover"
                          alt={bettingToken.symbol}
                        />
                      </div>
                    </div>
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Bet Button */}
            <Button
              type="submit"
              noShadow
              disabled={isEnded || isBetting}
              loading={isBetting}
              className="h-14 w-full rounded-2xl bg-[#3B27DF] text-lg font-bold text-white"
            >
              Vote
            </Button>
          </form>
        </Form>
      ) : (
        <>
          {/* Select Outcome */}
          <div className="w-full">
            <Select disabled={isEnded}>
              <SelectTrigger className="h-12 rounded-2xl border-2 border-gray-200 bg-white text-left text-sm placeholder:text-sm">
                <SelectValue
                  placeholder="Select a outcome"
                  className="text-sm"
                />
              </SelectTrigger>
              <SelectContent>
                {quest?.answers.map(answer => (
                  <SelectItem key={answer.answer_key} value={answer.answer_key}>
                    {answer.answer_title}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Amount Input */}
          <div className="relative w-full">
            <Input
              placeholder="Please enter amount"
              disabled={isEnded}
              className="h-12 rounded-2xl border-2 border-gray-200 bg-white text-sm placeholder:text-sm"
              inputMode="decimal"
              pattern="[0-9]*\.?[0-9]*"
            />
            <div className="absolute right-4 top-1/2 -translate-y-1/2">
              <div className="flex size-10 items-center justify-center rounded-full">
                <Image
                  src={bettingToken.iconUrl}
                  width={24}
                  height={24}
                  className="size-6 object-cover"
                  alt={bettingToken.symbol}
                />
              </div>
            </div>
          </div>

          <WalletOptionsDialog>
            <Button
              noShadow
              className="h-14 w-full rounded-2xl bg-blue-600 text-lg font-medium text-white hover:bg-blue-700"
            >
              Connect Wallet
            </Button>
          </WalletOptionsDialog>
        </>
      )}

      {/* Potential Reward */}
      {potentialReward > 0 && (
        <div className="text-end">
          <Typography level="body2" className="italic text-gray-500">
            Potential reward:
            {' '}
            <span className="font-bold text-blue-600">
              {formatNumber(potentialReward, {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}
              {' '}
              {getBettingToken(quest).symbol}
            </span>
          </Typography>
        </div>
      )}
    </div>
  );
};
