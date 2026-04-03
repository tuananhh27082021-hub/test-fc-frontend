import { Slot } from '@radix-ui/react-slot';
import Link from 'next/link';
import * as React from 'react';

import { useIsMobile } from '@/hooks/use-is-mobile';
import { BreadcrumbSeparatorIcon } from '@/icons/icons';
import { cn } from '@/utils/cn';

const Breadcrumb = React.forwardRef<
  HTMLElement,
  React.ComponentPropsWithoutRef<'nav'> & {
    separator?: React.ReactNode;
  }
>(({ ...props }, ref) => <nav ref={ref} aria-label="breadcrumb" {...props} />);
Breadcrumb.displayName = 'Breadcrumb';

const BreadcrumbList = React.forwardRef<
  HTMLOListElement,
  React.ComponentPropsWithoutRef<'ol'>
>(({ className, ...props }, ref) => (
  <ol
    ref={ref}
    className={cn(
      'flex flex-wrap items-center break-words text-xl text-foreground-70 gap-2',
      className,
    )}
    {...props}
  />
));
BreadcrumbList.displayName = 'BreadcrumbList';

const BreadcrumbItem = React.forwardRef<
  HTMLLIElement,
  React.ComponentPropsWithoutRef<'li'>
>(({ className, ...props }, ref) => (
  <li
    ref={ref}
    className={cn('inline-flex items-center gap-2', className)}
    {...props}
  />
));
BreadcrumbItem.displayName = 'BreadcrumbItem';

const BreadcrumbLink = React.forwardRef<
  HTMLAnchorElement,
  React.ComponentPropsWithoutRef<'a'> & {
    asChild?: boolean;
  }
>(({ asChild, className, ...props }, ref) => {
  const Comp = asChild ? Slot : 'a';

  return (
    <Comp
      ref={ref}
      className={cn('transition-colors hover:text-foreground', className)}
      {...props}
    />
  );
});
BreadcrumbLink.displayName = 'BreadcrumbLink';

const BreadcrumbPage = React.forwardRef<
  HTMLSpanElement,
  React.ComponentPropsWithoutRef<'span'>
>(({ className, ...props }, ref) => (
  <span
    ref={ref}
    role="link"
    aria-disabled="true"
    aria-current="page"
    className={cn('font-normal text-foreground', className)}
    {...props}
  />
));
BreadcrumbPage.displayName = 'BreadcrumbPage';

const BreadcrumbSeparator = ({
  children,
  className,
  ...props
}: React.ComponentProps<'li'>) => (
  <li
    role="presentation"
    aria-hidden="true"
    className={cn('[&>svg]:size-3.5', className)}
    {...props}
  >
    {children ?? <BreadcrumbSeparatorIcon />}
  </li>
);
BreadcrumbSeparator.displayName = 'BreadcrumbSeparator';

const BreadcrumbEllipsis = ({
  className,
  ...props
}: React.ComponentProps<'span'>) => (
  <span
    role="presentation"
    aria-hidden="true"
    className={cn('flex h-9 w-9 items-center justify-center', className)}
    {...props}
  >
    {/* <DotsHorizontalIcon className="h-4 w-4" /> */}
    ...
    <span className="sr-only">More</span>
  </span>
);
BreadcrumbEllipsis.displayName = 'BreadcrumbElipssis';

type BreadcrumbItemType = {
  label: string;
  href?: string;
  icon?: React.ReactNode;
};

type CustomBreadcrumbProps = {
  items: BreadcrumbItemType[];
  currentPage: string;
  className?: string;
};

const CustomBreadcrumb: React.FC<CustomBreadcrumbProps> = ({
  items,
  currentPage,
  className = '',
}) => {
  const isMobile = useIsMobile();
  return (
    <Breadcrumb className={className}>
      <BreadcrumbList>
        {items.map((item, index) => (
          <React.Fragment key={index}>
            <BreadcrumbItem>
              {item.href
                ? (
                    <BreadcrumbLink
                      asChild
                      className={`inline-flex items-center gap-2 ${isMobile && 'font-baloo-2 text-[14px]'}`}
                    >
                      <Link href={item.href}>
                        {item.icon}
                        {item.label}
                      </Link>
                    </BreadcrumbLink>
                  )
                : (
                    <span
                      className={`inline-flex items-center gap-2 ${isMobile && 'font-baloo-2 text-[14px]'}`}
                    >
                      {item.icon}
                      {item.label}
                    </span>
                  )}
            </BreadcrumbItem>
            {index < items.length - 1 && <BreadcrumbSeparator />}
          </React.Fragment>
        ))}
        <BreadcrumbSeparator />
        <BreadcrumbItem>
          <span
            className={`inline-flex items-center gap-2 ${isMobile && 'font-baloo-2 text-[14px]'}`}
          >
            {currentPage}
          </span>
        </BreadcrumbItem>
      </BreadcrumbList>
    </Breadcrumb>
  );
};

export {
  Breadcrumb,
  BreadcrumbEllipsis,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
  CustomBreadcrumb,
};
