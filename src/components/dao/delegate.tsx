'use client';

import { useMutation } from '@tanstack/react-query';
import { waitForTransactionReceipt } from '@wagmi/core';
import { CheckIcon } from 'lucide-react';
import Link from 'next/link';
import type { Address } from 'viem';
import { useAccount, useWriteContract } from 'wagmi';

import { useAuth } from '@/app/auth-provider';
import { Button } from '@/components/ui/button';
import { Typography } from '@/components/ui/typography';
import { nftContractABI } from '@/config/contract';
import { ROUTES } from '@/config/routes';
import { wagmiConfig } from '@/config/wagmi';
import { useUpdateMemberDelegateMutation } from '@/hooks/use-member';
import { useToast } from '@/hooks/use-toast';
import api from '@/libs/api';
import { Env } from '@/libs/Env';

const welcomeList = [
  { desc: 'You can vote using your voting ticket.' },
  { desc: 'You can vote on proposals.' },
  { desc: 'You can write articles on proposals.' },
];

export const Delegate = () => {
  const { reloadUser } = useAuth();
  const { toast } = useToast();
  const { address } = useAccount();
  const { writeContractAsync } = useWriteContract({
    config: wagmiConfig,
  });

  const { mutate: delegateMember, isPending: isDelegating }
    = useUpdateMemberDelegateMutation({
      onSuccess: async () => {
        toast({
          title: 'Delegate success',
          variant: 'success',
        });
        await reloadUser();
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
    mutationFn: async (address: string) => {
      // check user existence
      try {
        const userResponse = await api.getMember(address);
        if (!userResponse.data) {
          await api.createMember(address);
        }
      } catch (error) {
        await api.createMember(address);
      }

      const args = [address];

      const params = {
        address: Env.NEXT_PUBLIC_NFT_ADDRESS as Address,
        abi: nftContractABI,
        functionName: 'delegate',
        account: address as Address,
        args,
      };

      // const gas = await publicClient.estimateContractGas(params);
      // const gasPrice = await getGasPrice();

      const hash = await writeContractAsync({
        ...params,
        // gasPrice,
        // gas,
      });

      const transactionReceipt = await waitForTransactionReceipt(wagmiConfig, {
        hash,
      });

      return transactionReceipt;
    },
    onSuccess: (transactionReceipt) => {
      if (transactionReceipt.status === 'success') {
        delegateMember({
          wallet: address as string,
          delegated_tx: transactionReceipt.transactionHash,
        });
      }
    },
    onError: (error: any) => {
      console.error(error);
      toast({
        title: 'Oops! Something went wrong',
        description: error?.message,
        variant: 'danger',
      });
    },
  });

  const handleDelegate = () => {
    try {
      if (!address) {
        toast({
          title: 'Please connect your wallet first',
        });
      }

      callContract(address as string);
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
    <div className="app-container translate-y-[-120px] rounded-14 bg-background p-16 text-center">
      <Typography level="h3">Welcome to Forecast</Typography>
      <Typography level="h6">DELEGATE MYSELF</Typography>
      <Typography level="body1" className="mt-4">
        If you delegate, you can act as a member of dao.
      </Typography>
      <ul className="mx-auto mt-4 max-w-sm rounded-2xl border border-border p-3 text-left">
        {welcomeList.map((list, idx) => (
          <li className="inline-flex gap-4" key={idx}>
            <CheckIcon />
            <p>{list.desc}</p>
          </li>
        ))}
      </ul>
      <Typography level="body1" className="mt-4">
        Would you like to participate in the dao by proceeding with the
        delegate?
      </Typography>
      <div className="mx-auto mt-10 flex max-w-sm items-center gap-4">
        <Link href={ROUTES.HOME} className="w-full">
          <Button className="w-full">No</Button>
        </Link>
        <Button
          onClick={handleDelegate}
          loading={isCallingContract || isDelegating}
          className="w-full"
        >
          Yes
        </Button>
      </div>
    </div>
  );
};
