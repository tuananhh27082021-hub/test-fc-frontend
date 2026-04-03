'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { waitForTransactionReceipt } from '@wagmi/core';
import type { PropsWithChildren } from 'react';
import { useEffect, useState } from 'react';
import type { ControllerRenderProps } from 'react-hook-form';
import { Controller, useForm } from 'react-hook-form';
import type { Abi, Address } from 'viem';
import { maxUint256, numberToHex, parseUnits } from 'viem';
import { useAccount, useReadContract, useWriteContract } from 'wagmi';
import * as z from 'zod';

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { tokenList } from '@/config/constants';
import {
  boomplayExchangeABI,
  boomplayExchangeV2ABI,
  forecastPointContractABI,
  usdcContractABI,
} from '@/config/contract';
import { wagmiConfig } from '@/config/wagmi';
import { useExchangeRatio, useTokenBalance } from '@/hooks/use-contract';
import { useToast } from '@/hooks/use-toast';
import { Env } from '@/libs/Env';
import { formatNumber } from '@/utils/number';

import { Button } from './ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from './ui/select';
import { Typography } from './ui/typography';

const TOKEN_POINT_RATIO_DECIMAL = 10 ** 6;
const TOKEN_USDT_RATIO_DECIMAL = 1000000;

type ExchangeDialogProps = {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
} & PropsWithChildren;

const swapSchema = z.object({
  fromAmount: z
    .number({ required_error: 'Amount is required' })
    .positive({ message: 'Amount must be positive' })
    .or(z.string())
    .pipe(
      z.coerce
        .number({ required_error: 'Amount is required' })
        .positive({ message: 'Amount must be positive' }),
    ),
  fromToken: z.enum(['FP', 'USDT']),
  toAmount: z
    .number({ required_error: 'Amount is required' })
    .positive({ message: 'Amount must be positive' })
    .or(z.string())
    .pipe(
      z.coerce
        .number({ required_error: 'Amount is required' })
        .positive({ message: 'Amount must be positive' }),
    ),
  toToken: z.enum(['FP', 'USDT']),
});

type TokenType = z.infer<typeof swapSchema>['fromToken'];

const tokenAddressMap: Record<TokenType, string> = {
  FP: Env.NEXT_PUBLIC_POINT_TOKEN_ADDRESS,
  USDT: Env.NEXT_PUBLIC_BETTING_TOKEN_ADDRESS,
};

const abiMap: Record<TokenType, Abi> = {
  FP: forecastPointContractABI as Abi,
  USDT: usdcContractABI as Abi,
};

export default function ExchangeDialog({
  children,
  open,
  onOpenChange,
}: ExchangeDialogProps) {
  const isControlled = open !== undefined;
  const [openState, setOpenState] = useState(false);

  useEffect(() => {
    if (isControlled) {
      return;
    }
    setOpenState(false);
  }, [isControlled]);

  const handleOpenChange = (next: boolean) => {
    if (onOpenChange) {
      onOpenChange(next);
    }
    if (!isControlled) {
      setOpenState(next);
    }
  };
  const { address } = useAccount();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { control, setValue, resetField, watch, handleSubmit } = useForm<
    z.infer<typeof swapSchema>
  >({
    resolver: zodResolver(swapSchema),
    defaultValues: {
      fromAmount: 0,
      fromToken: 'FP',
      toAmount: 0,
      toToken: 'USDT',
    },
  });

  const fromAmount = watch('fromAmount');
  const fromToken = watch('fromToken');
  const toAmount = watch('toAmount');
  const toToken = watch('toToken');

  const fromTokenAddress = tokenAddressMap[fromToken];

  const {
    decimals: fromTokenDecimal,
    uiAmount: fromTokenUI,
    getQueryKeys,
  } = useTokenBalance(fromTokenAddress);

  const { refetch } = useReadContract({
    query: {
      enabled: false,
    },
    abi: abiMap[fromToken],
    address: fromTokenAddress as Address,
    functionName: 'allowance',
    args: [
      address,
      fromToken === 'USDT' || toToken === 'USDT'
        ? Env.NEXT_PUBLIC_EXCHANGE_V2_ADDRESS
        : Env.NEXT_PUBLIC_EXCHANGE_ADDRESS,
    ],
  });

  const toTokenAddress = tokenAddressMap[toToken];

  const { uiAmount: toTokenUi } = useTokenBalance(toTokenAddress);

  const isInsufficient = fromAmount > Number(fromTokenUI ?? 0);

  const { ratio: tokenPointRatio } = useExchangeRatio('FP');

  const { ratio: tokenUSDTRatio } = useExchangeRatio('USDT');

  const { writeContractAsync } = useWriteContract({
    config: wagmiConfig,
  });

  const { mutate: callContract, isPending: isCallingContract } = useMutation({
    mutationKey: ['swap', fromToken, toToken, fromAmount, toAmount].filter(
      Boolean,
    ),
    mutationFn: async (data: z.infer<typeof swapSchema>) => {
      if (data.fromToken === data.toToken) {
        return;
      }

      if (
        (data.fromToken === 'FP' && data.toToken === 'USDT')
        || (data.fromToken === 'USDT' && data.toToken === 'FP')
      ) {
        return;
      }

      // boom <> point

      if (data.fromToken === 'FP' || data.toToken === 'FP') {
        const { data: allowance } = await refetch();
        const fAmount = parseUnits(String(data.fromAmount), fromTokenDecimal);

        if ((allowance as bigint) < fAmount) {
          const hash = await writeContractAsync({
            address: tokenAddressMap[fromToken] as Address,
            abi: abiMap[fromToken],
            functionName: 'approve',
            account: address,
            args: [Env.NEXT_PUBLIC_EXCHANGE_ADDRESS, numberToHex(maxUint256)],
          });

          await waitForTransactionReceipt(wagmiConfig, {
            hash,
          });
        }

        const isBuyPoint = data.toToken === 'FP';

        const contractParams = {
          address: Env.NEXT_PUBLIC_EXCHANGE_ADDRESS as Address,
          abi: boomplayExchangeABI,
          functionName: isBuyPoint ? 'buyPoint' : 'sellPoint',
          account: address,
          args: [fAmount],
        };

        // const gas = await publicClient.estimateContractGas(contractParams);
        // const gasPrice = await getGasPrice();

        const hash = await writeContractAsync({
          ...contractParams,
          // gasPrice,
          // gas,
        });

        const receipt = await waitForTransactionReceipt(wagmiConfig, {
          hash,
        });

        if (receipt.status !== 'success') {
          throw new Error('Oops! Something went wrong');
        }

        return true;
      }

      if (data.fromToken === 'USDT' || data.toToken === 'USDT') {
        const { data: allowance } = await refetch();
        const fAmount = parseUnits(String(data.fromAmount), fromTokenDecimal);

        if ((allowance as bigint) < fAmount) {
          const hash = await writeContractAsync({
            address: tokenAddressMap[fromToken] as Address,
            abi: abiMap[fromToken],
            functionName: 'approve',
            account: address,
            args: [
              Env.NEXT_PUBLIC_EXCHANGE_V2_ADDRESS,
              numberToHex(maxUint256),
            ],
          });

          await waitForTransactionReceipt(wagmiConfig, {
            hash,
          });
        }

        const isSellToken = data.fromToken === 'USDT';

        const contractParams = {
          address: Env.NEXT_PUBLIC_EXCHANGE_V2_ADDRESS as Address,
          abi: boomplayExchangeV2ABI,
          functionName: isSellToken ? 'sellToken' : 'buyToken',
          account: address,
          args: [fAmount],
        };

        // const gas = await publicClient.estimateContractGas(contractParams);
        // const gasPrice = await getGasPrice();

        const hash = await writeContractAsync({
          ...contractParams,
          // gasPrice,
          // gas,
        });

        const receipt = await waitForTransactionReceipt(wagmiConfig, {
          hash,
        });

        if (receipt.status !== 'success') {
          throw new Error('Oops! Something went wrong');
        }

        return true;
      }

      return false;
    },
    onSuccess: () => {
      toast({
        title: 'Swap successful',
        variant: 'success',
      });

      resetField('fromAmount');
      resetField('toAmount');

      queryClient.invalidateQueries({
        queryKey: getQueryKeys(Env.NEXT_PUBLIC_BOOM_TOKEN_ADDRESS),
      });
      queryClient.invalidateQueries({
        queryKey: getQueryKeys(Env.NEXT_PUBLIC_POINT_TOKEN_ADDRESS),
      });
      queryClient.invalidateQueries({
        queryKey: getQueryKeys(Env.NEXT_PUBLIC_BETTING_TOKEN_ADDRESS),
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

  const onSubmit = (data: z.infer<typeof swapSchema>) => {
    if (!address) {
      toast({
        title: 'Please connect your wallet first',
      });
    }

    callContract(data);
  };

  return (
    <Dialog open={isControlled ? open : openState} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="max-h-[90vh] w-[95vw] max-w-[420px] overflow-y-auto bg-[#F5F5F5] p-3 sm:w-11/12 sm:max-w-lg sm:p-6">
        <form onSubmit={handleSubmit(onSubmit)}>
          <DialogHeader className="mb-6">
            <DialogTitle>Forecast Swap</DialogTitle>
            <DialogDescription className="sr-only">
              Forecast Swap
            </DialogDescription>
          </DialogHeader>

          <div className="mb-3 rounded-2xl bg-white p-3 sm:p-5">
            <Typography level="body2" className="mb-1.5">
              Swap Amount:
            </Typography>
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1 space-y-4">
                <Controller
                  name="fromAmount"
                  control={control}
                  render={({ field }) => (
                    <input
                      inputMode="numeric"
                      {...field}
                      value={field.value || ''}
                      pattern="[0-9]*"
                      onChange={(e) => {
                        const value = e.target.value;

                        if (e.target.validity.valid) {
                          field.onChange(value);

                          let toAmount = 0;

                          if (!Number.isNaN(Number(value))) {
                            if (fromToken === 'USDT') {
                              toAmount
                                = toToken === 'FP'
                                  ? (Number(value) * tokenPointRatio)
                                  / TOKEN_POINT_RATIO_DECIMAL
                                  : (Number(value) * tokenUSDTRatio)
                                  / TOKEN_USDT_RATIO_DECIMAL;
                            } else if (fromToken === 'FP') {
                              toAmount
                                = (Number(value) * TOKEN_POINT_RATIO_DECIMAL)
                                / tokenPointRatio;
                            } else {
                              toAmount
                                = (Number(value) * TOKEN_USDT_RATIO_DECIMAL)
                                / tokenUSDTRatio;
                            }

                            setValue('toAmount', toAmount);
                          }
                        }
                      }}
                      placeholder="0"
                      className="text-2xl font-bold outline-none placeholder:text-foreground-50"
                    />
                  )}
                />
              </div>
              <div className="space-y-4 text-right">
                <Controller
                  control={control}
                  name="fromToken"
                  render={({ field }) => {
                    return (
                      <TokenSelect
                        {...field}
                        onChange={(fToken) => {
                          field.onChange(fToken);

                          let tToken: TokenType = 'USDT';
                          let toAmount = null;

                          if (fToken === 'USDT') {
                            tToken = toToken === 'USDT' ? 'FP' : toToken;

                            if (fromAmount && !Number.isNaN(fromAmount)) {
                              toAmount
                                = tToken === 'FP'
                                  ? (Number(fromAmount) * tokenPointRatio)
                                  / TOKEN_POINT_RATIO_DECIMAL
                                  : (Number(fromAmount) * tokenUSDTRatio)
                                  / TOKEN_USDT_RATIO_DECIMAL;
                            }
                          } else if (fToken === 'FP') {
                            if (fromAmount && !Number.isNaN(fromAmount)) {
                              toAmount
                                = (Number(fromAmount)
                                * TOKEN_POINT_RATIO_DECIMAL)
                                / tokenPointRatio;
                            }
                          } else {
                            if (fromAmount && !Number.isNaN(fromAmount)) {
                              toAmount
                                = (Number(fromAmount)
                                * TOKEN_USDT_RATIO_DECIMAL)
                                / tokenUSDTRatio;
                            }
                          }

                          setValue('toToken', tToken);
                          if (toAmount) {
                            setValue('toAmount', toAmount);
                          }
                        }}
                      />
                    );
                  }}
                />
                <Typography level="body2" className="text-foreground-50">
                  {formatNumber(Number(fromTokenUI ?? 0), {
                    minimumFractionDigits: 0,
                  })}
                  {' '}
                  {fromToken === 'FP' ? 'FP' : 'USDT'}
                </Typography>
              </div>
            </div>
          </div>

          <div className="mb-6 rounded-2xl bg-white p-3 sm:p-5">
            <Typography level="body2" className="mb-1.5">
              Receive Amount:
            </Typography>
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1 space-y-4">
                <Controller
                  name="toAmount"
                  control={control}
                  render={({ field }) => (
                    <input
                      inputMode="numeric"
                      {...field}
                      value={field.value || ''}
                      pattern="[0-9]*"
                      onChange={(e) => {
                        const value = e.target.value;

                        if (e.target.validity.valid) {
                          field.onChange(value);

                          let fromAmount = 0;

                          if (!Number.isNaN(Number(value))) {
                            if (toToken === 'USDT') {
                              fromAmount
                                = fromToken === 'FP'
                                  ? (Number(value) * tokenPointRatio)
                                  / TOKEN_POINT_RATIO_DECIMAL
                                  : (Number(value) * tokenUSDTRatio)
                                  / TOKEN_USDT_RATIO_DECIMAL;
                            } else if (toToken === 'FP') {
                              fromAmount
                                = (Number(value) * TOKEN_POINT_RATIO_DECIMAL)
                                / tokenPointRatio;
                            } else {
                              fromAmount
                                = (Number(value) * TOKEN_USDT_RATIO_DECIMAL)
                                / tokenUSDTRatio;
                            }

                            setValue('fromAmount', fromAmount);
                          }
                        }
                      }}
                      placeholder="0"
                      className="text-2xl font-bold outline-none placeholder:text-foreground-50"
                    />
                  )}
                />
              </div>
              <div className="space-y-4 text-right">
                <Controller
                  control={control}
                  name="toToken"
                  render={({ field }) => {
                    return (
                      <TokenSelect
                        {...field}
                        onChange={(tToken) => {
                          field.onChange(tToken);

                          let fToken: TokenType = 'USDT';
                          let fAmount = null;

                          if (tToken === 'USDT') {
                            fToken = fromToken === 'USDT' ? 'FP' : fromToken;

                            if (toAmount && !Number.isNaN(toAmount)) {
                              fAmount
                                = fToken === 'FP'
                                  ? (Number(toAmount) * tokenPointRatio)
                                  / TOKEN_POINT_RATIO_DECIMAL
                                  : (Number(toAmount) * tokenUSDTRatio)
                                  / TOKEN_USDT_RATIO_DECIMAL;
                            }
                          } else if (tToken === 'FP') {
                            if (toAmount && !Number.isNaN(toAmount)) {
                              fAmount
                                = (Number(toAmount) * TOKEN_POINT_RATIO_DECIMAL)
                                / tokenPointRatio;
                            }
                          } else {
                            if (toAmount && !Number.isNaN(toAmount)) {
                              fAmount
                                = (Number(toAmount) * TOKEN_USDT_RATIO_DECIMAL)
                                / tokenUSDTRatio;
                            }
                          }

                          setValue('fromToken', fToken);
                          if (fAmount) {
                            setValue('fromAmount', fAmount);
                          }
                        }}
                      />
                    );
                  }}
                />

                <Typography level="body2" className="text-foreground-50">
                  {formatNumber(Number(toTokenUi), {
                    minimumFractionDigits: 0,
                  })}
                  {' '}
                  {toToken === 'FP' ? 'FP' : 'USDT'}
                </Typography>
              </div>
            </div>
          </div>

          {/* <div className="divide-y rounded-2xl bg-white">
            <div className="flex items-center justify-between px-5 py-4">
              <Typography level="body2">Provider:</Typography>
              <Typography
                level="body2"
                className="font-medium text-foreground-50"
              >
                Boom Play
              </Typography>
            </div>
            <div className="flex items-center justify-between px-5 py-4">
              <Typography level="body2">Ratio to Swap:</Typography>
              <Typography
                level="body2"
                className="font-medium text-foreground-50"
              >
                {(fromToken === 'FP' || toToken === 'FP')
                && `1 BOOM ≈ ${tokenPointRatio / TOKEN_POINT_RATIO_DECIMAL} FP`}
                {(fromToken === 'USDT' || toToken === 'USDT')
                && `1 BOOM ≈ ${tokenUSDTRatio / TOKEN_USDT_RATIO_DECIMAL} USDT`}
              </Typography>
            </div>
          </div> */}

          <Button
            disabled={isInsufficient || !fromAmount || !toAmount}
            type="submit"
            className="mt-6 w-full sm:mt-10"
            variant="outline"
            loading={isCallingContract}
          >
            {isInsufficient ? 'Insufficient balance' : 'Swap Now'}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}

interface Props extends ControllerRenderProps<any, any> {}

const TokenSelect = (props: Props) => {
  return (
    <Select onValueChange={props.onChange} {...props}>
      <SelectTrigger className="h-10 rounded-lg bg-[#F5F5F5] px-2 py-1">
        <SelectValue />
      </SelectTrigger>
      <SelectContent className="max-h-60 overflow-y-auto">
        {tokenList.map(token => (
          <SelectItem key={token.key} value={token.key}>
            {token.name}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
};
