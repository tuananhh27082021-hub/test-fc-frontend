import type { ColumnDef } from '@tanstack/react-table';
import dayjs from 'dayjs';
import { useState } from 'react';

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import type {
  AdminQuest,
  AdminQuestStatus,
  BaseAdminQuest,
} from '@/types/schema';
import { formatNumber } from '@/utils/number';
import { getBettingToken } from '@/utils/quest';

import { Checkbox } from '../ui/checkbox';

// Answer Selection Component
const AnswerSelection = ({
  quest,
  onAnswerChange,
}: {
  quest: AdminQuest<'answer'>;
  onAnswerChange?: (questKey: string, answerKey: string) => void;
}) => {
  const [answer, setAnswer] = useState('');

  const handleAnswerChange = (value: string) => {
    setAnswer(value);
    onAnswerChange?.(quest.quest_key, value);
  };

  return (
    <div className="flex-1 space-y-2">
      <Select value={answer} onValueChange={handleAnswerChange}>
        <SelectTrigger>
          <SelectValue placeholder="Please choose your answer" />
        </SelectTrigger>
        <SelectContent>
          {quest.answers.map(ans => (
            <SelectItem key={ans.answer_key} value={ans.answer_key}>
              {ans.answer_title}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
};

const baseColumns: ColumnDef<BaseAdminQuest>[] = [
  {
    id: 'select',
    cell: ({ row }) => (
      <div className="mr-2 flex items-center justify-center">
        <Checkbox
          checked={row.getIsSelected()}
          onCheckedChange={value => row.toggleSelected(!!value)}
          aria-label="Select row"
        />
      </div>
    ),
    enableSorting: false,
    enableHiding: false,
    size: 64,
  },
  {
    header: 'No',
    id: 'id',
    cell: ({ row }) => {
      return row.index + 1;
    },
    size: 64,
  },
  {
    accessorKey: 'quest_category',
    header: 'Category',
  },
  {
    accessorKey: 'quest_title',
    header: 'Title',
  },
  {
    id: 'quest_end_date',
    accessorKey: 'quest_end_date',
    header: 'Quest End Date',
    cell: ({ row }) => {
      return dayjs(row.getValue('quest_end_date')).format('YYYY/MM/DD');
    },
  },
];

function insertArrayAt<T>(
  targetArray: Array<T>,
  insertArray: Array<T>,
  index: number,
) {
  return [
    ...targetArray.slice(0, index),
    ...insertArray,
    ...targetArray.slice(index),
  ];
}

export const getColumns = (
  status: AdminQuestStatus,
  onAnswerChange?: (questKey: string, answerKey: string) => void,
): ColumnDef<any>[] => {
  if (status === 'ongoing') {
    return insertArrayAt(
      baseColumns,
      [
        {
          accessorKey: 'quest_hot',
          header: 'Hot',
          size: 64,
          cell: ({ row }) => {
            const hot = row.getValue('quest_hot');
            return <p className="text-center">{hot ? 'T' : 'F'}</p>;
          },
          meta: {
            style: {
              textAlign: 'center',
            },
          },
        },
      ],
      5,
    );
  } else if (status === 'draft') {
    return [
      ...baseColumns
        .slice(0, 5)
        .filter(column => column.id !== 'quest_end_date'),
      {
        accessorKey: 'quest_end_date',
        header: 'Quest End Date',
        cell: ({ row }) => {
          return dayjs(row.getValue('quest_end_date')).format('YYYY/MM/DD');
        },
      },
      {
        accessorKey: 'total_vote',
        header: 'Total Vote',
        meta: {
          style: {
            textAlign: 'center',
          },
        },
        cell: ({ row }) => (
          <p className="text-center">{row.original.total_vote}</p>
        ),
      },
      ...baseColumns.slice(5),
      {
        accessorKey: 'total_approve_power',
        header: 'Approval Vote',
        meta: {
          style: {
            textAlign: 'center',
          },
        },
        cell: ({ row }) => (
          <p className="text-center">{row.original.total_approve_power}</p>
        ),
      },
      {
        accessorKey: 'total_reject_power',
        header: 'Reject Vote',
        meta: {
          style: {
            textAlign: 'center',
          },
        },
        cell: ({ row }) => (
          <p className="text-center">{row.original.total_reject_power}</p>
        ),
      },
    ];
  } else if (status === 'publish') {
    return [
      ...baseColumns.slice(0, 5),
      {
        accessorKey: 'total_betting_amount',
        header: 'Total Amount of Vote',
        meta: {
          style: {
            textAlign: 'center',
          },
        },
        cell: ({ row }) => (
          <p className="text-center">
            {formatNumber(row.original.total_betting_amount, {
              minimumFractionDigits: 0,
              maximumFractionDigits: 2,
            })}
          </p>
        ),
      },
      ...baseColumns.slice(5),
    ];
  } else if (status === 'decision') {
    return [
      ...baseColumns.slice(0, 4),
      {
        accessorKey: 'dao_success_end_at',
        header: 'DAO-Success End Date',
        cell: ({ row }) => {
          return dayjs(row.getValue('dao_success_end_at')).format('YYYY/MM/DD');
        },
        size: 180,
      },
      {
        accessorKey: 'total_vote',
        header: 'Total Vote',
        meta: {
          style: {
            textAlign: 'center',
          },
        },
        cell: ({ row }) => (
          <p className="text-center">{row.original.total_vote}</p>
        ),
      },
      ...baseColumns.slice(5),
      {
        accessorKey: 'total_success_power',
        header: 'Success Vote',
        meta: {
          style: {
            textAlign: 'center',
          },
        },
        cell: ({ row }) => (
          <p className="text-center">{row.original.total_success_power}</p>
        ),
      },
      {
        accessorKey: 'total_adjourn_power',
        header: 'Adjourn Vote',
        meta: {
          style: {
            textAlign: 'center',
          },
        },
        cell: ({ row }) => (
          <p className="text-center">{row.original.total_adjourn_power}</p>
        ),
      },
    ];
  } else if (status === 'answer') {
    return [
      ...baseColumns.slice(0, 4),
      ...baseColumns.slice(5),
      {
        accessorKey: 'answer_selected',
        header: 'Selected Answer',
        cell: ({ row }) => {
          const quest = row.original as AdminQuest<'answer'>;
          return (
            <AnswerSelection quest={quest} onAnswerChange={onAnswerChange} />
          );
        },
      },
    ];
  } else if (status === 'success') {
    return [
      ...baseColumns.slice(0, 5),
      {
        accessorKey: 'total_betting_amount',
        header: 'Total Amount of Vote',
        meta: {
          style: {
            textAlign: 'center',
          },
        },
        cell: ({ row }) => (
          <p className="text-center">
            {formatNumber(row.original.total_betting_amount, {
              minimumFractionDigits: 0,
              maximumFractionDigits: 2,
            })}
            {' '}
            {getBettingToken(row.original).symbol}
          </p>
        ),
      },
      ...baseColumns.slice(5),
      {
        accessorKey: 'total_vote',
        header: 'Total Vote',
        meta: {
          style: {
            textAlign: 'center',
          },
        },
        cell: ({ row }) => (
          <p className="text-center">{row.original.total_vote}</p>
        ),
      },
    ];
  } else if (status === 'adjourn') {
    return [
      ...baseColumns.slice(0, 5),
      {
        accessorKey: 'total_betting_amount',
        header: 'Voting Amount',
        meta: {
          style: {
            textAlign: 'center',
          },
        },
        cell: ({ row }) => (
          <p className="text-center">
            {formatNumber(row.original.total_betting_amount, {
              minimumFractionDigits: 0,
              maximumFractionDigits: 2,
            })}
          </p>
        ),
      },
      ...baseColumns.slice(5),
    ];
  }

  return baseColumns;
};
