'use client';

import { motion, type Transition, useAnimation } from 'framer-motion';
import { forwardRef, type HTMLAttributes, useCallback, useImperativeHandle, useRef } from 'react';

import { Button } from '@/components/ui/button';
import { useSidebar } from '@/hooks/use-sidebar-toggle';
import { cn } from '@/lib/utils';

export function SidebarSwitcher() {
  const { open, isHovered, toggle } = useSidebar();

  const getIconData = () => {
    if (open) return MaximizeIcon;
    if (isHovered) return MinimizeIcon;
    return Maximize2Icon;
  };

  const Icon = getIconData();

  return (
    <Button size="icon" variant="ghost" onClick={toggle} aria-label="Toggle Sidebar">
      <Icon className="flex h-full w-full items-center justify-center" />
      <span className="sr-only">Toggle Sidebar</span>
    </Button>
  );
}

// --- Icons ---

const DEFAULT_TRANSITION: Transition = {
  type: 'spring',
  stiffness: 250,
  damping: 25,
};

const Maximize2Icon = forwardRef<Maximize2IconHandle, HTMLAttributes<HTMLDivElement>>(({ onMouseEnter, onMouseLeave, className, ...props }, ref) => {
  const controls = useAnimation();
  const isControlledRef = useRef(false);

  useImperativeHandle(ref, () => {
    isControlledRef.current = true;

    return {
      startAnimation: () => controls.start('animate'),
      stopAnimation: () => controls.start('normal'),
    };
  });

  const handleMouseEnter = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      if (isControlledRef.current) {
        onMouseEnter?.(e);
      } else {
        controls.start('animate');
      }
    },
    [controls, onMouseEnter],
  );

  const handleMouseLeave = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      if (isControlledRef.current) {
        onMouseLeave?.(e);
      } else {
        controls.start('normal');
      }
    },
    [controls, onMouseLeave],
  );

  return (
    <div role="presentation" className={cn(className)} onMouseEnter={handleMouseEnter} onMouseLeave={handleMouseLeave} {...props}>
      <svg
        fill="none"
        height="28"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="2"
        viewBox="0 0 24 24"
        width="28"
        xmlns="http://www.w3.org/2000/svg"
      >
        <motion.path
          animate={controls}
          d="M3 16.2V21m0 0h4.8M3 21l6-6"
          transition={DEFAULT_TRANSITION}
          variants={{
            normal: { translateX: '0%', translateY: '0%' },
            animate: { translateX: '-2px', translateY: '2px' },
          }}
        />
        <motion.path
          animate={controls}
          d="M21 7.8V3m0 0h-4.8M21 3l-6 6"
          transition={DEFAULT_TRANSITION}
          variants={{
            normal: { translateX: '0%', translateY: '0%' },
            animate: { translateX: '2px', translateY: '-2px' },
          }}
        />
        <title>Maximize2Icon</title>
      </svg>
    </div>
  );
});

Maximize2Icon.displayName = 'Maximize2Icon';

const MaximizeIcon = forwardRef<MaximizeIconHandle, HTMLAttributes<HTMLDivElement>>(({ onMouseEnter, onMouseLeave, className, ...props }, ref) => {
  const controls = useAnimation();
  const isControlledRef = useRef(false);

  useImperativeHandle(ref, () => {
    isControlledRef.current = true;
    return {
      startAnimation: () => controls.start('animate'),
      stopAnimation: () => controls.start('normal'),
    };
  });

  const handleMouseEnter = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      if (isControlledRef.current) {
        onMouseEnter?.(e);
      } else {
        controls.start('animate');
      }
    },
    [controls, onMouseEnter],
  );

  const handleMouseLeave = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      if (isControlledRef.current) {
        onMouseLeave?.(e);
      } else {
        controls.start('normal');
      }
    },
    [controls, onMouseLeave],
  );

  return (
    <div role="presentation" className={cn(className)} onMouseEnter={handleMouseEnter} onMouseLeave={handleMouseLeave} {...props}>
      <svg fill="none" height="28" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" width="28" xmlns="http://www.w3.org/2000/svg">
        <motion.path
          animate={controls}
          d="M8 3H5a2 2 0 0 0-2 2v3"
          transition={DEFAULT_TRANSITION}
          variants={{
            normal: { translateX: '0%', translateY: '0%' },
            animate: { translateX: '-2px', translateY: '-2px' },
          }}
        />
        <motion.path
          animate={controls}
          d="M21 8V5a2 2 0 0 0-2-2h-3"
          transition={DEFAULT_TRANSITION}
          variants={{
            normal: { translateX: '0%', translateY: '0%' },
            animate: { translateX: '2px', translateY: '-2px' },
          }}
        />
        <motion.path
          animate={controls}
          d="M3 16v3a2 2 0 0 0 2 2h3"
          transition={DEFAULT_TRANSITION}
          variants={{
            normal: { translateX: '0%', translateY: '0%' },
            animate: { translateX: '-2px', translateY: '2px' },
          }}
        />
        <motion.path
          animate={controls}
          d="M16 21h3a2 2 0 0 0 2-2v-3"
          transition={DEFAULT_TRANSITION}
          variants={{
            normal: { translateX: '0%', translateY: '0%' },
            animate: { translateX: '2px', translateY: '2px' },
          }}
        />
        <title>MaximizeIcon</title>
      </svg>
    </div>
  );
});

MaximizeIcon.displayName = 'MaximizeIcon';

const MinimizeIcon = forwardRef<MinimizeIconHandle, HTMLAttributes<HTMLDivElement>>(({ onMouseEnter, onMouseLeave, className, ...props }, ref) => {
  const controls = useAnimation();
  const isControlledRef = useRef(false);

  useImperativeHandle(ref, () => {
    isControlledRef.current = true;

    return {
      startAnimation: () => controls.start('animate'),
      stopAnimation: () => controls.start('normal'),
    };
  });

  const handleMouseEnter = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      if (isControlledRef.current) {
        onMouseEnter?.(e);
      } else {
        controls.start('animate');
      }
    },
    [controls, onMouseEnter],
  );

  const handleMouseLeave = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      if (isControlledRef.current) {
        onMouseLeave?.(e);
      } else {
        controls.start('normal');
      }
    },
    [controls, onMouseLeave],
  );

  return (
    <div role="presentation" className={cn(className)} onMouseEnter={handleMouseEnter} onMouseLeave={handleMouseLeave} {...props}>
      <svg
        fill="none"
        height="28"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="2"
        viewBox="0 0 24 24"
        width="28"
        xmlns="http://www.w3.org/2000/svg"
      >
        <motion.path
          animate={controls}
          d="M8 3v3a2 2 0 0 1-2 2H3"
          transition={DEFAULT_TRANSITION}
          variants={{
            normal: { translateX: '0%', translateY: '0%' },
            animate: { translateX: '2px', translateY: '2px' },
          }}
        />
        <motion.path
          animate={controls}
          d="M21 8h-3a2 2 0 0 1-2-2V3"
          transition={DEFAULT_TRANSITION}
          variants={{
            normal: { translateX: '0%', translateY: '0%' },
            animate: { translateX: '-2px', translateY: '2px' },
          }}
        />
        <motion.path
          animate={controls}
          d="M3 16h3a2 2 0 0 1 2 2v3"
          transition={DEFAULT_TRANSITION}
          variants={{
            normal: { translateX: '0%', translateY: '0%' },
            animate: { translateX: '2px', translateY: '-2px' },
          }}
        />
        <motion.path
          animate={controls}
          d="M16 21v-3a2 2 0 0 1 2-2h3"
          transition={DEFAULT_TRANSITION}
          variants={{
            normal: { translateX: '0%', translateY: '0%' },
            animate: { translateX: '-2px', translateY: '-2px' },
          }}
        />
        <title>MinimizeIcon</title>
      </svg>
    </div>
  );
});

MinimizeIcon.displayName = 'MinimizeIcon';

export interface Maximize2IconHandle {
  startAnimation: () => void;
  stopAnimation: () => void;
}

export interface MaximizeIconHandle {
  startAnimation: () => void;
  stopAnimation: () => void;
}

export interface MinimizeIconHandle {
  startAnimation: () => void;
  stopAnimation: () => void;
}
