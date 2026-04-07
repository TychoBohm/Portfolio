import gsap from "gsap";
import TextPlugin from "gsap/TextPlugin";
import {
  useEffect,
  useRef,
  useImperativeHandle,
  forwardRef,
  type ForwardedRef,
} from "react";

gsap.registerPlugin(TextPlugin);

export interface AnimatedTextRef {
  deleteText: (onComplete?: () => void) => void;
  setText: (text: string, onComplete?: () => void) => void;
}

interface AnimatedTextProps {
  texts: string[];
  typingSpeed?: number;
  showCursor?: boolean;
  cursorCharacter?: string;
  cursorBlinkDuration?: number;
  variableSpeedEnabled?: boolean;
  variableSpeedMin?: number;
  variableSpeedMax?: number;
  className?: string;
  onTypeComplete?: () => void;
}

const AnimatedText = forwardRef(
  (
    {
      texts,
      typingSpeed = 100,
      showCursor = false,
      cursorCharacter = "|",
      cursorBlinkDuration = 0.5,
      variableSpeedEnabled = true,
      variableSpeedMin = 60,
      variableSpeedMax = 120,
      className = "",
      onTypeComplete,
    }: AnimatedTextProps,
    ref: ForwardedRef<AnimatedTextRef>,
  ) => {
    const textRef = useRef<HTMLSpanElement>(null);
    const cursorRef = useRef<HTMLSpanElement>(null);
    const currentTextRef = useRef<string>("");

    useImperativeHandle(ref, () => ({
      deleteText: (onComplete?: () => void) => {
        if (!textRef.current) return;
        const currentText = currentTextRef.current;
        gsap.to(textRef.current, {
          duration: currentText.length * 0.035,
          text: "",
          ease: "none",
          onComplete: () => {
            currentTextRef.current = "";
            onComplete?.();
          },
        });
      },
      setText: (text: string, onComplete?: () => void) => {
        if (!textRef.current) return;
        gsap.to(textRef.current, {
          duration: text.length * 0.05,
          text: text,
          ease: "none",
          onComplete: () => {
            currentTextRef.current = text;
            onComplete?.();
          },
        });
      },
    }));

    useEffect(() => {
      if (!textRef.current) return;

      const timeline = gsap.timeline();
      let cursorTween: gsap.core.Tween | null = null;

      texts.forEach((text, index) => {
        const currentSpeed = variableSpeedEnabled
          ? Math.random() * (variableSpeedMax - variableSpeedMin) +
            variableSpeedMin
          : typingSpeed;

        timeline.to(
          textRef.current,
          {
            duration: text.length / (1000 / currentSpeed),
            text: text,
            ease: "none",
            onComplete: () => {
              currentTextRef.current = text;
              if (index === texts.length - 1) {
                onTypeComplete?.();
              }
            },
          },
          index === 0 ? 0 : undefined,
        );
      });

      if (showCursor && cursorRef.current) {
        cursorTween = gsap.to(cursorRef.current, {
          opacity: 0,
          duration: cursorBlinkDuration,
          repeat: -1,
          yoyo: true,
          ease: "power2.inOut",
        });
      }

      return () => {
        timeline.kill();
        cursorTween?.kill();
      };
    }, [
      texts,
      typingSpeed,
      showCursor,
      cursorBlinkDuration,
      variableSpeedEnabled,
      variableSpeedMin,
      variableSpeedMax,
      onTypeComplete,
    ]);

    return (
      <span className={className}>
        <span ref={textRef} />
        {showCursor && (
          <span
            ref={cursorRef}
            className="inline-block ml-1"
            style={{ animation: "none" }}
          >
            {cursorCharacter}
          </span>
        )}
      </span>
    );
  },
);

AnimatedText.displayName = "AnimatedText";

export default AnimatedText;
