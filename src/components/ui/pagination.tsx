import * as React from 'react';

import type { ButtonProps } from '@/components/ui/button';
import { buttonVariants } from '@/components/ui/button';
import { PaginationNextIcon, PaginationPreviousIcon } from '@/icons/icons';
import { cn } from '@/utils/cn';

const Pagination = ({ className, ...props }: React.ComponentProps<'nav'>) => (
  <nav
    role="navigation"
    aria-label="pagination"
    className={cn('mx-auto flex w-full justify-center', className)}
    {...props}
  />
);
Pagination.displayName = 'Pagination';

const PaginationContent = React.forwardRef<
  HTMLUListElement,
  React.ComponentProps<'ul'>
>(({ className, ...props }, ref) => (
  <ul
    ref={ref}
    className={cn('flex flex-row items-center gap-4', className)}
    {...props}
  />
));
PaginationContent.displayName = 'PaginationContent';

const PaginationItem = React.forwardRef<
  HTMLLIElement,
  React.ComponentProps<'li'>
>(({ className, ...props }, ref) => (
  <li ref={ref} className={cn('', className)} {...props} />
));
PaginationItem.displayName = 'PaginationItem';

type PaginationLinkProps = {
  isActive?: boolean;
  disabled?: boolean;
} & Pick<ButtonProps, 'size'> &
React.ComponentProps<'a'>;

const PaginationLink = ({
  className,
  isActive,
  size = 'icon',
  ...props
}: PaginationLinkProps) => (
  <a
    aria-current={isActive ? 'page' : undefined}
    className={cn(
      buttonVariants({
        className: 'w-10 h-10 rounded-xl px-2 py-2.5',
        variant: isActive ? 'default' : 'outline',
        size,
      }),
      {
        'cursor-not-allowed pointer-events-none bg-foreground-disabled':
          props.disabled,
      },
      className,
    )}
    {...props}
  />
);
PaginationLink.displayName = 'PaginationLink';

const PaginationPrevious = ({
  className,
  ...props
}: React.ComponentProps<typeof PaginationLink>) => (
  <PaginationLink
    aria-label="Go to previous page"
    size="default"
    className={cn('gap-1 px-0', className)}
    {...props}
  >
    <PaginationPreviousIcon />
    <span className="sr-only">Previous</span>
  </PaginationLink>
);
PaginationPrevious.displayName = 'PaginationPrevious';

const PaginationNext = ({
  className,
  ...props
}: React.ComponentProps<typeof PaginationLink>) => (
  <PaginationLink
    aria-label="Go to next page"
    size="default"
    className={cn('gap-1 px-0', className)}
    {...props}
  >
    <span className="sr-only">Next</span>
    <PaginationNextIcon />
  </PaginationLink>
);
PaginationNext.displayName = 'PaginationNext';

const PaginationEllipsis = ({
  className,
  ...props
}: React.ComponentProps<'span'>) => (
  <span
    aria-hidden
    className={cn('flex h-10 w-10 items-center justify-center', className)}
    {...props}
  >
    {/* <DotsHorizontalIcon className="h-4 w-4" /> */}
    ...
    <span className="sr-only">More pages</span>
  </span>
);
PaginationEllipsis.displayName = 'PaginationEllipsis';

type PaginationContainerProps = {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
} & React.ComponentProps<'nav'>;

const PaginationContainer = ({
  currentPage,
  totalPages,
  onPageChange,
  ...rest
}: PaginationContainerProps) => {
  const renderPagination = () => {
    const pages = [];
    const startPage = Math.max(1, currentPage - 1);
    const endPage = Math.min(totalPages, currentPage + 1);

    pages.push(
      <PaginationItem key="previous">
        <PaginationPrevious
          href="#"
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
        />
      </PaginationItem>,
    );

    if (startPage > 1) {
      pages.push(
        <PaginationItem key="1">
          <PaginationLink href="#" onClick={() => onPageChange(1)}>
            1
          </PaginationLink>
        </PaginationItem>,
      );
      if (startPage > 2) {
        pages.push(<PaginationEllipsis key="start-ellipsis" />);
      }
    }

    for (let i = startPage; i <= endPage; i++) {
      pages.push(
        <PaginationItem key={i}>
          <PaginationLink
            href="#"
            onClick={() => onPageChange(i)}
            isActive={i === currentPage}
          >
            {i}
          </PaginationLink>
        </PaginationItem>,
      );
    }

    if (endPage < totalPages) {
      if (endPage < totalPages - 1) {
        pages.push(<PaginationEllipsis key="end-ellipsis" />);
      }
      pages.push(
        <PaginationItem key={totalPages}>
          <PaginationLink href="#" onClick={() => onPageChange(totalPages)}>
            {totalPages}
          </PaginationLink>
        </PaginationItem>,
      );
    }

    pages.push(
      <PaginationItem key="next">
        <PaginationNext
          href="#"
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
        />
      </PaginationItem>,
    );

    return pages;
  };

  return (
    <Pagination {...rest}>
      <PaginationContent>{renderPagination()}</PaginationContent>
    </Pagination>
  );
};

export {
  Pagination,
  PaginationContainer,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
};
