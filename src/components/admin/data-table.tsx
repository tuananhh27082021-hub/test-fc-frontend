import { parseAsInteger, useQueryState } from 'nuqs';
import { useCallback, useMemo, useState } from 'react';

import { DEFAULT_PAGE_SIZE } from '@/config/constants';
import { useFetchDAOQuests } from '@/hooks/use-dao-quests';
import { useDataTable } from '@/hooks/use-data-table';
import type { AdminQuestStatus, BaseAdminQuest } from '@/types/schema';

import { DataTable } from '../ui/data-table';
import { PaginationContainer } from '../ui/pagination';
import { Skeleton } from '../ui/skeleton';
import { getColumns } from './columns';
import { TableActions } from './table-actions';

export const AdminTable = ({ status }: { status: AdminQuestStatus }) => {
  const [currentPage, setCurrentPage] = useQueryState('page', parseAsInteger);
  const [selectedAnswers, setSelectedAnswers] = useState<
    Record<string, string>
  >({});

  const { data, isLoading } = useFetchDAOQuests({
    status,
    page: currentPage ?? 1,
  });

  const handleAnswerChange = useCallback(
    (questKey: string, answerKey: string) => {
      setSelectedAnswers(prev => ({
        ...prev,
        [questKey]: answerKey,
      }));
    },
    [],
  );

  const quests = useMemo(
    () =>
      (isLoading
        ? Array(10).fill({})
        : (data?.data?.quests ?? [])) as BaseAdminQuest[],
    [isLoading, data],
  );

  const columns = useMemo(() => {
    const baseColumns = getColumns(status, handleAnswerChange);

    return isLoading
      ? baseColumns.map(column => ({
        ...column,
        cell: () => <Skeleton className="h-4 w-16" />,
      }))
      : baseColumns;
  }, [isLoading, status, handleAnswerChange]);

  const { table, rowSelection } = useDataTable<BaseAdminQuest>({
    data: quests,
    // @ts-expect-error ignore
    columns,
    enableRowSelection: true,
    pageCount: 1,
    enableMultiRowSelection: false,
    initialState: {
      sorting: [{ id: 'quest_title', desc: true }],
      columnPinning: { right: ['actions'] },
    },
    getRowId: (originalRow: BaseAdminQuest) => originalRow.quest_key,
  });

  return (
    <>
      <TableActions
        table={table}
        status={status}
        rowSelection={rowSelection}
        selectedAnswers={selectedAnswers}
      />
      <DataTable
        className="pb-10"
        table={table}
        footer={(
          <div className="mt-10 flex w-full items-center justify-between">
            {data?.data?.total && (
              <PaginationContainer
                currentPage={currentPage ?? 1}
                totalPages={Math.ceil(data?.data?.total / DEFAULT_PAGE_SIZE)}
                onPageChange={setCurrentPage}
              />
            )}
          </div>
        )}
      />
    </>
  );
};
