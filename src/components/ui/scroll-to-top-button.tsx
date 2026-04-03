import { ArrowUp } from 'lucide-react';

interface ScrollToTopButtonProps {
  show: boolean;
  onClick: () => void;
}

export const ScrollToTopButton = ({
  show,
  onClick,
}: ScrollToTopButtonProps) => {
  if (!show) {
    return null;
  }

  return (
    <button
      type="button"
      onClick={onClick}
      className="fixed bottom-6 right-6 z-50 flex items-center gap-2 rounded-lg bg-[#4A5568] px-4 py-2.5 shadow-lg transition-colors hover:bg-[#2D3748]"
    >
      <span className="text-sm text-white">Back to top</span>
      <ArrowUp className="size-4 text-white" />
    </button>
  );
};
