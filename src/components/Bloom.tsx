import {
  useEffect,
  useRef,
  forwardRef,
  useImperativeHandle,
  type RefObject,
} from "react";
import { createPortal } from "react-dom";
import gsap from "gsap";

export const BLOOM_REST = { x: 50, y: 92 };
export const BLOOM_SIZE_REST = 1200;
export const BLOOM_SIZE_HOVER = 480;

// ─── helpers ──────────────────────────────────────────────────────────────────

/**
 * Bereken het midden van een element als viewport-percentage.
 * Geëxporteerd zodat andere componenten live posities kunnen opvragen
 * zonder hardcoded coördinaten.
 */
export function elementToViewportPercent(el: HTMLElement): {
  x: number;
  y: number;
} {
  const rect = el.getBoundingClientRect();
  return {
    x: ((rect.left + rect.width / 2) / window.innerWidth) * 100,
    y: ((rect.top + rect.height / 2) / window.innerHeight) * 100,
  };
}

/**
 * Zoek een element via data-bloom-anchor en geef zijn viewport-percentage terug.
 * Geeft null als het element niet gevonden wordt.
 */
export function getAnchorPos(name: string): { x: number; y: number } | null {
  const el = document.querySelector<HTMLElement>(
    `[data-bloom-anchor="${name}"]`,
  );
  if (!el) {
    console.warn(`[Bloom] geen element met data-bloom-anchor="${name}"`);
    return null;
  }
  return elementToViewportPercent(el);
}

// ─── BloomHandle ──────────────────────────────────────────────────────────────

export interface BloomHandle {
  /** Verplaats naar vaste viewport-percentages. */
  moveTo: (
    x: number,
    y: number,
    size?: number,
    opacity?: number,
    duration?: number,
  ) => void;
  /**
   * Verplaats naar het element met `data-bloom-anchor="<naam>"`.
   * Positie wordt realtime uit de DOM gelezen — responsive by default.
   *
   * @example
   * <h2 data-bloom-anchor="about-panel-0">Titel</h2>
   * bloomRef.current?.moveToAnchor("about-panel-0");
   */
  moveToAnchor: (
    name: string,
    size?: number,
    opacity?: number,
    duration?: number,
  ) => void;
  /** Verplaats naar een React ref of HTMLElement. */
  moveToElement: (
    target: RefObject<HTMLElement | null> | HTMLElement,
    size?: number,
    opacity?: number,
    duration?: number,
  ) => void;
  moveToRest: (duration?: number) => void;
  setOpacity: (opacity: number, duration?: number) => void;
}

// ─── BloomProps ───────────────────────────────────────────────────────────────

interface BloomProps {
  initialX?: number;
  initialY?: number;
  initialSize?: number;
  initialOpacity?: number;
  blur?: number;
  color?: string;
  zIndex?: number;
}

// ─── component ────────────────────────────────────────────────────────────────

const Bloom = forwardRef<BloomHandle, BloomProps>(
  (
    {
      initialX = BLOOM_REST.x,
      initialY = BLOOM_REST.y,
      initialSize = BLOOM_SIZE_REST,
      initialOpacity = 0,
      blur = 40,
      color = "255,255,255",
      zIndex = 9999,
    },
    ref,
  ) => {
    const elRef = useRef<HTMLDivElement>(null);

    function animateTo(
      x: number,
      y: number,
      size = BLOOM_SIZE_REST,
      opacity: number | undefined,
      duration = 0.6,
    ) {
      const el = elRef.current;
      if (!el) return;
      gsap.to(el, {
        left: `${x}%`,
        top: `${y}%`,
        width: size,
        height: size,
        ...(opacity !== undefined && { opacity }),
        duration,
        ease: "power2.out",
        overwrite: "auto",
      });
    }

    useImperativeHandle(ref, () => ({
      moveTo(x, y, size, opacity, duration) {
        animateTo(x, y, size, opacity, duration);
      },

      moveToAnchor(name, size = BLOOM_SIZE_REST, opacity, duration = 0.6) {
        const pos = getAnchorPos(name);
        if (!pos) return;
        animateTo(pos.x, pos.y, size, opacity, duration);
      },

      moveToElement(target, size = BLOOM_SIZE_REST, opacity, duration = 0.6) {
        const domEl = target instanceof HTMLElement ? target : target.current;
        if (!domEl) return;
        const { x, y } = elementToViewportPercent(domEl);
        animateTo(x, y, size, opacity, duration);
      },

      moveToRest(duration = 0.7) {
        const el = elRef.current;
        if (!el) return;
        gsap.to(el, {
          left: `${BLOOM_REST.x}%`,
          top: `${BLOOM_REST.y}%`,
          width: BLOOM_SIZE_REST,
          height: BLOOM_SIZE_REST,
          opacity: 0.5,
          duration,
          ease: "power2.out",
          overwrite: "auto",
        });
      },

      setOpacity(opacity, duration = 0.4) {
        const el = elRef.current;
        if (!el) return;
        gsap.to(el, {
          opacity,
          duration,
          ease: "power2.out",
          overwrite: "auto",
        });
      },
    }));

    useEffect(() => {
      const el = elRef.current;
      if (!el) return;
      gsap.set(el, {
        position: "fixed",
        left: `${initialX}%`,
        top: `${initialY}%`,
        xPercent: -50,
        yPercent: -50,
        width: initialSize,
        height: initialSize,
        opacity: initialOpacity,
      });
    }, []);

    if (typeof document === "undefined") return null;

    return createPortal(
      <div
        ref={elRef}
        className="pointer-events-none"
        style={{
          position: "fixed",
          borderRadius: "50%",
          background: `radial-gradient(circle, rgba(${color},0.28) 0%, rgba(${color},0.16) 30%, rgba(${color},0.06) 60%, transparent 75%)`,
          filter: `blur(${blur}px)`,
          zIndex,
          willChange: "left, top, width, height, opacity",
          transform: "translate(-50%, -50%)",
        }}
      />,
      document.body,
    );
  },
);

Bloom.displayName = "Bloom";
export default Bloom;
