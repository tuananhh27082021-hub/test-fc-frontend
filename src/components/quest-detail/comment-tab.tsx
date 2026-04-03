import dayjs from 'dayjs';

import { Typography } from '@/components/ui/typography';
import { maskWalletAddress } from '@/utils/wallet';

const commentList = [
  {
    wallet: '0xA97924b439d296fca9b1D738689B8Bee139d80c0',
    comment:
      'In publishing and graphic design, Lorem ipsum is a placeholder text commonly used to demonstrate the visual form of a document or a typeface without relying on meaningful content. Lorem ipsum may be used as a placeholder before the final copy is available.',
    createdAt: new Date().toDateString(),
  },
  {
    wallet: '0xA97924b439d296fca9b1D738689B8Bee139d80c0',
    comment:
      'In publishing and graphic design, Lorem ipsum is a placeholder text commonly used to demonstrate the visual form of a document or a typeface without relying on meaningful content. Lorem ipsum may be used as a placeholder before the final copy is available.',
    createdAt: new Date().toDateString(),
  },
  {
    wallet: '0xA97924b439d296fca9b1D738689B8Bee139d80c0',
    comment:
      'In publishing and graphic design, Lorem ipsum is a placeholder text commonly used to demonstrate the visual form of a document or a typeface without relying on meaningful content. Lorem ipsum may be used as a placeholder before the final copy is available.',
    createdAt: new Date().toDateString(),
  },
];

export const CommentTab = () => {
  return (
    <div className="w-full space-y-4">
      {commentList.map((item, index) => (
        <CommentItem
          key={index}
          wallet={item.wallet}
          comment={item.comment}
          createtAt={item.createdAt}
        />
      ))}
    </div>
  );
};

const CommentItem = ({
  wallet,
  comment,
  createtAt,
}: {
  wallet: string;
  comment: string;
  createtAt: string;
}) => {
  return (
    <div className="w-full rounded-3xl px-5 py-3 hover:bg-[#F4F9FF]">
      <Typography level="body2" className="font-medium">
        {maskWalletAddress(wallet)}
      </Typography>

      <div className="mt-1 flex items-start justify-between gap-4">
        <Typography level="body2" className="flex-1">
          {comment}
        </Typography>
        <Typography level="body2" className="font-medium">
          {dayjs(createtAt).format('hh-mm-ss | DD/MM/YYYY')}
        </Typography>
      </div>
    </div>
  );
};
