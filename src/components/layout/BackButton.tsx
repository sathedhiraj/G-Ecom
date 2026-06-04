'use client';

import { useUIStore } from '@/store/ui-store';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';

interface BackButtonProps {
  /** Optional: Override the default goBack behavior with a custom navigation target */
  fallbackPage?: Parameters<ReturnType<typeof useUIStore>['navigate']>[0];
  className?: string;
}

export default function BackButton({ fallbackPage, className }: BackButtonProps) {
  const { navigationHistory, goBack, navigate } = useUIStore();

  const handleClick = () => {
    if (navigationHistory.length > 0) {
      goBack();
    } else if (fallbackPage) {
      navigate(fallbackPage);
    } else {
      navigate('home');
    }
  };

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={handleClick}
      className={`shrink-0 text-gray-600 hover:text-gray-900 hover:bg-gray-100 ${className || ''}`}
    >
      <ArrowLeft className="h-5 w-5" />
      <span className="sr-only">Go back</span>
    </Button>
  );
}
