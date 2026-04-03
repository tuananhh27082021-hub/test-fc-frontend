'use client';

import {
  Toast,
  ToastClose,
  ToastDescription,
  ToastProvider,
  ToastTitle,
  ToastViewport,
} from '@/components/ui/toast';
import { useToast } from '@/hooks/use-toast';
import {
  DangerIcon,
  InfoCircleIcon,
  SuccessIcon,
  WarningIcon,
} from '@/icons/icons';

export function Toaster() {
  const { toasts } = useToast();

  return (
    <ToastProvider>
      {toasts.map(({ id, title, description, action, ...props }) => {
        return (
          <Toast key={id} {...props}>
            <div className="flex items-center space-x-3 pr-8">
              {props.variant === 'success' && (
                <SuccessIcon className="size-5 shrink-0 text-white" />
              )}
              {props.variant === 'warning' && (
                <WarningIcon className="size-5 shrink-0 text-white" />
              )}
              {props.variant === 'danger' && (
                <DangerIcon className="size-5 shrink-0 text-white" />
              )}
              {(!props.variant || props.variant === 'default') && (
                <InfoCircleIcon className="size-5 shrink-0 text-white" />
              )}

              <div className="flex-1">
                {title && (
                  <ToastTitle className="font-medium text-white">
                    {title}
                  </ToastTitle>
                )}
                {description && (
                  <ToastDescription className="text-white/90">
                    {description}
                  </ToastDescription>
                )}
              </div>
            </div>
            {action}
            <ToastClose />
          </Toast>
        );
      })}
      <ToastViewport />
    </ToastProvider>
  );
}
