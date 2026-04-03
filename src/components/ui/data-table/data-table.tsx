import { flexRender, type Table as TanstackTable } from '@tanstack/react-table';
import * as React from 'react';

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { cn } from '@/utils/cn';
import { getCommonPinningStyles } from '@/utils/data-table';

import { ScrollArea } from '../scroll-area';

interface DataTableProps<TData> extends React.HTMLAttributes<HTMLDivElement> {
  table: TanstackTable<TData>;
  footer?: React.ReactNode | null;
  scrollable?: boolean;
  scrollAreaClassName?: string;
}

export function DataTable<TData>({
  table,
  footer = null,
  children,
  className,
  scrollable = false,
  scrollAreaClassName = '',
  ...props
}: DataTableProps<TData>) {
  let tableContent = (
    <div className="overflow-hidden rounded-md">
      <Table>
        <TableHeader>
          {table.getHeaderGroups().map(headerGroup => (
            <TableRow key={headerGroup.id}>
              {headerGroup.headers.map((header) => {
                return (
                  <TableHead
                    key={header.id}
                    colSpan={header.colSpan}
                    style={{
                      ...getCommonPinningStyles({ column: header.column }),
                      // @ts-expect-error ignore
                      ...(header.column.columnDef.meta?.style ?? {}),
                    }}
                  >
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                        header.column.columnDef.header,
                        header.getContext(),
                      )}
                  </TableHead>
                );
              })}
            </TableRow>
          ))}
        </TableHeader>
        <TableBody>
          {table.getRowModel().rows?.length
            ? (
                table.getRowModel().rows.map(row => (
                  <TableRow
                    key={row.id}
                    data-state={row.getIsSelected() && 'selected'}
                  >
                    {row.getVisibleCells().map(cell => (
                      <TableCell
                        key={cell.id}
                        style={{
                          ...getCommonPinningStyles({ column: cell.column }),
                        }}
                      >
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              )
            : (
                <TableRow>
                  <TableCell
                    colSpan={table.getAllColumns().length}
                    className="h-24 text-center"
                  >
                    No results.
                  </TableCell>
                </TableRow>
              )}
        </TableBody>
      </Table>
    </div>
  );

  if (scrollable) {
    tableContent = (
      <ScrollArea className={scrollAreaClassName}>{tableContent}</ScrollArea>
    );
  }

  return (
    <div
      className={cn('w-full space-y-2.5 overflow-auto', className)}
      {...props}
    >
      {children}
      {tableContent}
      {footer}
    </div>
  );
}
