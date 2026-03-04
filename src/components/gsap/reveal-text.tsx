import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import { SplitText } from 'gsap/SplitText';
import type { ComponentProps } from 'react';
import { useMemo, useRef } from 'react';

type SplitType = 'chars' | 'words' | 'lines';

type RevealTextProps = {
  type?: SplitType;
  gsapVars?: gsap.TweenVars;
  splitTextVars?: Partial<SplitText.Vars>;
} & ComponentProps<'div'>;

const defaultGsapVars: Record<SplitType, gsap.TweenVars> = {
  chars: {
    x: 150,
    opacity: 0,
    duration: 0.7,
    ease: 'power3',
    stagger: 0.05,
  },
  words: {
    x: 150,
    opacity: 0,
    ease: 'power3',
    duration: 1,
    stagger: 0.2,
    y: -100,
    rotation: 'random(-80, 80)',
  },
  lines: {
    duration: 1,
    yPercent: 100,
    opacity: 0,
    stagger: 0.4,
    ease: 'expo.out',
  },
};

export const RevealText = ({ type = 'chars', gsapVars = {}, splitTextVars = {}, ...props }: RevealTextProps) => {
  const wrapperRef = useRef<HTMLDivElement | null>(null);

  const splitType = useMemo(
    () =>
      ({
        chars: 'chars,words,lines',
        words: 'words,lines',
        lines: 'lines',
      })[type],
    [type],
  );

  useGSAP(
    () => {
      const element = wrapperRef.current;
      if (!element) return;

      const splitText = SplitText.create(element, { type: splitType, ...splitTextVars });
      gsap.from(splitText[type], {
        ...defaultGsapVars[type],
        ...gsapVars,
      });
    },
    { scope: wrapperRef },
  );

  return <div {...props} ref={wrapperRef} />;
};

type RevealImageProps = ComponentProps<'img'> & {
  gsapVars?: gsap.TweenVars;
};

export const RevealImage = ({ gsapVars = {}, className, ...props }: RevealImageProps) => {
  const ref = useRef<HTMLImageElement>(null);

  useGSAP(
    () => {
      const element = ref.current;
      if (!element) return;

      const { delay, duration, ease, ...fromVars } = gsapVars;

      gsap.from(element, {
        opacity: 0,
        y: 50,
        scale: 1.05,
        ...fromVars,
        delay: delay ?? 0,
        duration: duration ?? 1.5,
        ease: ease ?? 'power3.out',
        force3D: true,
      });
    },
    { scope: ref },
  );

  return <img ref={ref} className={className} {...props} />;
};
