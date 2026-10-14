'use client';

import * as React from 'react';
import { Maximize, Minimize } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export function FullscreenToggle({ className }: { className?: string }) {
  const [isFullscreen, setIsFullscreen] = React.useState(false);
  const [isSupported, setIsSupported] = React.useState(true);

  React.useEffect(() => {
    // Check fullscreen support in current browser environment
    const doc = document as Document & {
      webkitFullscreenEnabled?: boolean;
      mozFullScreenEnabled?: boolean;
      msFullscreenEnabled?: boolean;
    };

    const supported = Boolean(
      doc.fullscreenEnabled ||
        doc.webkitFullscreenEnabled ||
        doc.mozFullScreenEnabled ||
        doc.msFullscreenEnabled
    );

    setIsSupported(supported);

    const updateFullscreenState = () => {
      const docWithPrefixes = document as Document & {
        webkitFullscreenElement?: Element;
        mozFullScreenElement?: Element;
        msFullscreenElement?: Element;
      };

      const activeElement =
        document.fullscreenElement ||
        docWithPrefixes.webkitFullscreenElement ||
        docWithPrefixes.mozFullScreenElement ||
        docWithPrefixes.msFullscreenElement;

      setIsFullscreen(Boolean(activeElement));
    };

    updateFullscreenState();

    document.addEventListener('fullscreenchange', updateFullscreenState);
    document.addEventListener('webkitfullscreenchange', updateFullscreenState);
    document.addEventListener('mozfullscreenchange', updateFullscreenState);
    document.addEventListener('MSFullscreenChange', updateFullscreenState);

    return () => {
      document.removeEventListener('fullscreenchange', updateFullscreenState);
      document.removeEventListener('webkitfullscreenchange', updateFullscreenState);
      document.removeEventListener('mozfullscreenchange', updateFullscreenState);
      document.removeEventListener('MSFullscreenChange', updateFullscreenState);
    };
  }, []);

  const toggleFullscreen = React.useCallback(async () => {
    try {
      const doc = document as Document & {
        webkitFullscreenElement?: Element;
        mozFullScreenElement?: Element;
        msFullscreenElement?: Element;
        webkitExitFullscreen?: () => Promise<void>;
        mozCancelFullScreen?: () => Promise<void>;
        msExitFullscreen?: () => Promise<void>;
      };

      const docEl = document.documentElement as HTMLElement & {
        webkitRequestFullscreen?: () => Promise<void>;
        mozRequestFullScreen?: () => Promise<void>;
        msRequestFullscreen?: () => Promise<void>;
      };

      const isCurrentlyFullscreen = Boolean(
        document.fullscreenElement ||
          doc.webkitFullscreenElement ||
          doc.mozFullScreenElement ||
          doc.msFullscreenElement
      );

      if (!isCurrentlyFullscreen) {
        if (docEl.requestFullscreen) {
          await docEl.requestFullscreen();
        } else if (docEl.webkitRequestFullscreen) {
          await docEl.webkitRequestFullscreen();
        } else if (docEl.mozRequestFullScreen) {
          await docEl.mozRequestFullScreen();
        } else if (docEl.msRequestFullscreen) {
          await docEl.msRequestFullscreen();
        }
      } else {
        if (document.exitFullscreen) {
          await document.exitFullscreen();
        } else if (doc.webkitExitFullscreen) {
          await doc.webkitExitFullscreen();
        } else if (doc.mozCancelFullScreen) {
          await doc.mozCancelFullScreen();
        } else if (doc.msExitFullscreen) {
          await doc.msExitFullscreen();
        }
      }
    } catch (error) {
      console.error('Failed to toggle fullscreen mode:', error);
    }
  }, []);

  if (!isSupported) {
    return null;
  }

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={toggleFullscreen}
      className={cn(
        'text-text-subtle hover:text-text hover:bg-surface-2 h-9 w-9 cursor-pointer',
        className
      )}
      title={isFullscreen ? 'Exit full screen' : 'Full screen'}
      aria-label={isFullscreen ? 'Exit full screen' : 'Full screen'}
    >
      {isFullscreen ? (
        <Minimize className="h-4 w-4 stroke-[1.75]" />
      ) : (
        <Maximize className="h-4 w-4 stroke-[1.75]" />
      )}
      <span className="sr-only">
        {isFullscreen ? 'Exit full screen' : 'Full screen'}
      </span>
    </Button>
  );
}
