import Image from 'next/image';

import type { QuestDetail } from '@/types/schema';

export const MobileIntroCard = ({ quest }: { quest: QuestDetail }) => {
  return (
    <div className="flex w-full items-center gap-2 font-baloo-2">
      <Image
        className="size-[48px] rounded object-cover"
        src={quest.quest_image_url}
        alt={quest.quest_title}
        width={48}
        height={48}
      />
      <p className="line-clamp-2 text-[16px] font-bold">{quest.quest_title}</p>
    </div>
  );
};
