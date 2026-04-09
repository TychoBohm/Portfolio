import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import type { BloomHandle } from "./Bloom";
import { BLOOM_SIZE_REST, getAnchorPos } from "./Bloom";
import profile from "../assets/CVTychoIMG.png";

gsap.registerPlugin(ScrollTrigger);

const panels = [
  {
    number: "01 / 03",
    heading: "About Me",
    body: "I'm Tycho, an 19-year-old software developer from the Netherlands. I recently graduated from my MBO Software Development and I'm continuing to HBO where I will focus on Cloud and Security. I mainly enjoy frontend development, but I'm currently working on improving my backend skills as well. I also spend a lot of time in the gym, focusing on consistency and self-improvement.",
  },
  {
    number: "02 / 03",
    heading: "My Skills",
    body: "During my MBO internship, I gained hands-on experience working with modern tools like Vite, React, TypeScript, Tailwind CSS and GSAP, which I also use for this website. I have a foundation in HTML, CSS, and JavaScript, and I'm expanding my knowledge into backend development with technologies like Java, Python and SQL.",
  },
  {
    number: "03 / 03",
    heading: "My Goals",
    body: "My goal is to grow into a skilled software developer, with a strong focus on cloud and security. I want to deepen both my frontend and backend knowledge, work on meaningful real-world projects, and eventually build my own applications. I'm driven by continuous improvement, both in my technical career and personal life.",
  },
];

const BLOOM_ANCHOR_NAMES = [
  "about-initial",
  "about-panel-0",
  "about-panel-1",
  "about-panel-2",
] as const;

const smoothstep = (t: number) => t * t * (3 - 2 * t);
const norm = (value: number, lo: number, hi: number) =>
  Math.max(0, Math.min(1, (value - lo) / (hi - lo)));
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

// Re-usable word spans — used in both mobile and desktop panels
const WordSpans = ({
  text,
  initialOpacity,
}: {
  text: string;
  initialOpacity: number;
}) => (
  <>
    {text.split(" ").map((word, wi, arr) => (
      <span key={wi}>
        <span
          data-word
          className="inline-block origin-top-left"
          style={{ opacity: initialOpacity }}
        >
          {word}
        </span>
        {wi < arr.length - 1 ? " " : ""}
      </span>
    ))}
  </>
);

interface AboutSectionProps {
  bloomRef: React.RefObject<BloomHandle | null>;
}

const AboutSection = ({ bloomRef }: AboutSectionProps) => {
  // desktop refs
  const outerRef = useRef<HTMLDivElement>(null);
  const stickyRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const panelRefs = useRef<(HTMLDivElement | null)[]>([]);
  const imageRef = useRef<HTMLDivElement>(null);
  const textRef = useRef<HTMLDivElement>(null);
  const numberRef = useRef<HTMLSpanElement>(null);

  // mobile refs
  const mobileImageRef = useRef<HTMLDivElement>(null);
  const mobilePanelRefs = useRef<(HTMLDivElement | null)[]>([]);

  // ── Desktop animations ────────────────────────────────────────────
  useEffect(() => {
    const outer = outerRef.current;
    const sticky = stickyRef.current;
    const track = trackRef.current;
    const imageEl = imageRef.current;
    const textEl = textRef.current;
    const bloom = bloomRef.current;
    if (!outer || !sticky || !track || !imageEl || !textEl || !bloom) return;
    if (window.innerWidth < 1024) return;

    const vh = window.innerHeight;
    const delayScroll = vh * 0.4;
    const scrollPerPanel = vh * 1.4;
    const scrollDistance = delayScroll + (panels.length - 1) * scrollPerPanel;
    outer.style.height = `${vh + scrollDistance}px`;

    gsap.set(imageEl, { scale: 2, xPercent: 50, opacity: 1 });
    gsap.set(textEl, { opacity: 0 });

    const ctx = gsap.context(() => {
      // Entry
      ScrollTrigger.create({
        trigger: outer,
        start: "top bottom",
        end: "top top",
        scrub: 1,
        onUpdate: (self) => {
          const p = smoothstep(self.progress);
          gsap.set(imageEl, {
            scale: 2 - p,
            xPercent: 50 - p * 50,
            opacity: 1,
          });
          gsap.set(textEl, {
            opacity: smoothstep(norm(self.progress, 0.6, 1)),
          });
          const anchor = getAnchorPos(BLOOM_ANCHOR_NAMES[0]);
          if (anchor)
            bloom.moveTo(
              anchor.x,
              anchor.y,
              800,
              smoothstep(norm(self.progress, 0.3, 1)) * 0.7,
              0,
            );
        },
      });

      // Pinned section
      ScrollTrigger.create({
        trigger: outer,
        start: "top top",
        end: () => `+=${scrollDistance}`,
        pin: sticky,
        anticipatePin: 1,
        invalidateOnRefresh: true,
        scrub: 1,
        snap: {
          snapTo: (value) => {
            const delayFrac = delayScroll / scrollDistance;
            const adj = Math.max(0, (value - delayFrac) / (1 - delayFrac));
            const snapped =
              Math.round(adj * (panels.length - 1)) / (panels.length - 1);
            return delayFrac + snapped * (1 - delayFrac);
          },
          duration: { min: 0.3, max: 0.8 },
          delay: 0.15,
          ease: "power2.inOut",
        },
        onUpdate: (self) => {
          const delayFrac = delayScroll / scrollDistance;
          const adj = Math.max(
            0,
            (self.progress - delayFrac) / (1 - delayFrac),
          );
          const rawIndex = adj * (panels.length - 1);
          const clipWidth = track.offsetWidth / panels.length;

          gsap.set(track, { x: -rawIndex * clipWidth });
          if (numberRef.current)
            numberRef.current.textContent = panels[Math.round(rawIndex)].number;

          const delayProgress = smoothstep(norm(self.progress, 0.0, delayFrac));
          const fromAnchorIdx = Math.floor(rawIndex);
          const toAnchorIdx = Math.min(fromAnchorIdx + 1, panels.length - 1);
          const localT = smoothstep(rawIndex - fromAnchorIdx);

          const fromA =
            getAnchorPos(BLOOM_ANCHOR_NAMES[fromAnchorIdx + 1]) ??
            getAnchorPos(BLOOM_ANCHOR_NAMES[0]);
          const toA =
            getAnchorPos(BLOOM_ANCHOR_NAMES[toAnchorIdx + 1]) ?? fromA;
          const delayFromA = getAnchorPos(BLOOM_ANCHOR_NAMES[0]);
          const delayToA = getAnchorPos(BLOOM_ANCHOR_NAMES[1]);
          if (!fromA || !toA || !delayFromA || !delayToA) return;

          const finalX =
            self.progress < delayFrac
              ? lerp(delayFromA.x, delayToA.x, delayProgress)
              : lerp(fromA.x, toA.x, localT);
          const finalY =
            self.progress < delayFrac
              ? lerp(delayFromA.y, delayToA.y, delayProgress)
              : lerp(fromA.y, toA.y, localT);
          const centreProximity =
            1 - Math.abs(rawIndex - Math.round(rawIndex)) * 0.35;
          bloom.moveTo(finalX, finalY, 800, 0.8 + centreProximity * 0.25, 0);

          panelRefs.current.forEach((panel, i) => {
            if (!panel) return;
            const words = panel.querySelectorAll<HTMLElement>("[data-word]");
            if (!words.length) return;
            const signedDist = rawIndex - i;
            const dist = Math.abs(signedDist);
            const isExiting = signedDist > 0;
            panel.style.opacity = String(smoothstep(norm(dist, 0.75, 0)));
            words.forEach((word, wi) => {
              const stagger = (wi / words.length) * 0.2;
              const wordProgress = smoothstep(
                norm(dist, 0.65 - stagger, 0.28 - stagger * 0.5),
              );
              word.style.opacity = String(0.08 + wordProgress * 0.92);
              if (isExiting) {
                const e = smoothstep(
                  norm(signedDist, 0.05 + (wi / words.length) * 0.3, 0.85),
                );
                word.style.transform = `translate(${-e * 10}px, ${-e * 8}px) rotate(${-e * 5}deg)`;
              } else {
                const e = 1 - smoothstep(norm(dist, 0.65 - stagger, 0.1));
                word.style.transform = `translate(${e * 8}px, ${e * 6}px) rotate(${e * 3}deg)`;
              }
            });
          });
        },
      });

      // Exit
      ScrollTrigger.create({
        trigger: outer,
        start: "bottom bottom",
        end: () => `+=${vh * 0.8}`,
        scrub: 1,
        onUpdate: (self) => {
          const p = smoothstep(self.progress);
          const lastAnchor = getAnchorPos(
            BLOOM_ANCHOR_NAMES[BLOOM_ANCHOR_NAMES.length - 1],
          );
          if (!lastAnchor) return;
          bloom.moveTo(
            lerp(lastAnchor.x, 50, p),
            lerp(lastAnchor.y, 92, p),
            lerp(800, BLOOM_SIZE_REST, p),
            lerp(1.05, 0.5, p),
            0,
          );
        },
      });
    });

    return () => ctx.revert();
  }, []);

  // ── Mobile animations ─────────────────────────────────────────────
  useEffect(() => {
    if (window.innerWidth >= 1024) return;

    const imgEl = mobileImageRef.current;

    // initial hidden state
    if (imgEl)
      gsap.set(imgEl, { opacity: 0, scale: 0.85, y: 32, rotationZ: -2 });
    mobilePanelRefs.current.forEach((panel) => {
      if (!panel) return;
      gsap.set(panel.querySelector(".mp-num"), { opacity: 0, y: 24, x: -8 });
      // heading words — same word-by-word start as desktop
      gsap.set(panel.querySelectorAll("[data-word]"), {
        opacity: 0,
        y: 22,
        rotationZ: -0.5,
        x: -4,
      });
      gsap.set(panel.querySelector(".mp-body"), {
        opacity: 0,
        y: 20,
        x: -6,
      });
    });

    const ctx = gsap.context(() => {
      // profile image: more dynamic entry with parallax
      if (imgEl) {
        gsap.to(imgEl, {
          opacity: 1,
          scale: 1,
          y: 0,
          rotationZ: 0,
          duration: 1.2,
          ease: "power3.out",
          scrollTrigger: { trigger: imgEl, start: "top 88%", once: true },
        });

        // Add subtle parallax movement during scroll
        gsap.to(imgEl, {
          y: -40,
          ease: "none",
          scrollTrigger: {
            trigger: imgEl,
            start: "top 85%",
            end: "bottom top",
            scrub: 0.6,
            invalidateOnRefresh: true,
          },
        });
      }

      // each panel: enhanced staggered reveal with more movement
      mobilePanelRefs.current.forEach((panel) => {
        if (!panel) return;

        const num = panel.querySelector<HTMLElement>(".mp-num");
        const words = panel.querySelectorAll<HTMLElement>("[data-word]");
        const body = panel.querySelector<HTMLElement>(".mp-body");
        const trigger = { trigger: panel, start: "top 80%", once: true };

        // number — enters from top-left
        gsap.to(num, {
          opacity: 1,
          y: 0,
          x: 0,
          duration: 0.6,
          ease: "power2.out",
          scrollTrigger: trigger,
        });

        // heading — word-by-word stagger with rotation and movement
        gsap.to(words, {
          opacity: 1,
          y: 0,
          x: 0,
          rotationZ: 0,
          duration: 0.65,
          stagger: {
            amount: 0.3,
            from: "start",
            ease: "power2.inOut",
          },
          ease: "back.out(1.2)",
          delay: 0.12,
          scrollTrigger: trigger,
        });

        // body text — smooth slide-in from left
        gsap.to(body, {
          opacity: 1,
          y: 0,
          x: 0,
          duration: 0.7,
          ease: "power2.out",
          delay: 0.35,
          scrollTrigger: trigger,
        });

        // Optional: add a subtle highlight effect to panel containers
        const panelContainer = panel;
        gsap.to(panelContainer, {
          backgroundColor: "rgba(255, 255, 255, 0.01)",
          duration: 0.3,
          repeat: 1,
          yoyo: true,
          scrollTrigger: trigger,
          clearProps: "backgroundColor",
        });
      });

      // Parallax effect on body text as page scrolls
      mobilePanelRefs.current.forEach((panel) => {
        if (!panel) return;
        const body = panel.querySelector<HTMLElement>(".mp-body");
        if (body) {
          gsap.to(body, {
            y: -30,
            ease: "none",
            scrollTrigger: {
              trigger: panel,
              start: "top 80%",
              end: "bottom top",
              scrub: 0.5,
              invalidateOnRefresh: true,
            },
          });
        }
      });
    });

    return () => ctx.revert();
  }, []);

  return (
    <section className="relative w-full bg-[#121212]">
      {/* top border */}
      <div className="flex items-center px-5 lg:px-12 pt-10">
        <div className="flex-1 h-px bg-[#2a2a2a]" />
      </div>

      {/* ── MOBILE layout ────────────────────────────────────────── */}
      <div className="lg:hidden px-5 pb-16">
        {/* profile image */}
        <div className="flex justify-center mt-10 mb-14">
          <div
            ref={mobileImageRef}
            className="relative overflow-hidden w-[70%] max-w-xs aspect-3/4"
          >
            <img
              src={profile}
              alt="Profile"
              className="w-full h-full object-cover object-center block"
            />
          </div>
        </div>

        {/* panels — stacked, each animates in on scroll */}
        <div className="flex flex-col gap-16 font-mono">
          {panels.map((panel, i) => (
            <div
              key={i}
              ref={(el) => {
                mobilePanelRefs.current[i] = el;
              }}
            >
              <span className="mp-num text-xs tracking-widest uppercase mb-4 block text-gray-500">
                {panel.number}
              </span>

              <h2
                className="font-black leading-none mb-5 text-[#f0ede8] tracking-[-0.03em] uppercase"
                style={{ fontSize: "clamp(2.2rem, 8vw, 3.5rem)" }}
              >
                {/* word spans so we can stagger per word, same as desktop */}
                <WordSpans text={panel.heading} initialOpacity={1} />
              </h2>

              <p className="mp-body text-sm text-gray-300 leading-[1.85]">
                {panel.body}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* ── DESKTOP layout ───────────────────────────────────────── */}
      <div ref={outerRef} className="hidden lg:block relative w-full">
        <div
          ref={stickyRef}
          className="relative h-screen w-full bg-[#121212] overflow-hidden"
        >
          {/* bloom anchors */}
          <div
            data-bloom-anchor="about-initial"
            className="absolute pointer-events-none"
            style={{ left: "8%", top: "72%" }}
          />
          <div
            data-bloom-anchor="about-panel-0"
            className="absolute pointer-events-none"
            style={{ left: "49%", top: "46%" }}
          />
          <div
            data-bloom-anchor="about-panel-1"
            className="absolute pointer-events-none"
            style={{ left: "74%", top: "70%" }}
          />
          <div
            data-bloom-anchor="about-panel-2"
            className="absolute pointer-events-none"
            style={{ left: "80%", top: "36%" }}
          />

          <div className="flow-root h-full">
            {/* LEFT — image */}
            <div
              ref={imageRef}
              className="flex items-center justify-center px-8 xl:px-12 float-left relative z-20 h-screen w-[45%]"
            >
              <div className="relative overflow-hidden w-[75%] max-h-[55vh] aspect-3/4">
                <img
                  src={profile}
                  alt="Profile"
                  className="w-full h-full object-cover block object-center"
                />
              </div>
            </div>

            {/* RIGHT — sliding panels */}
            <div
              ref={textRef}
              className="flex flex-col justify-center px-8 xl:px-12 overflow-hidden ml-[45%] z-10 h-screen w-[55%] font-mono"
            >
              <div
                ref={trackRef}
                className="flex will-change-transform"
                style={{ width: `${panels.length * 100}%` }}
              >
                {panels.map((panel, i) => (
                  <div
                    key={i}
                    ref={(el) => {
                      panelRefs.current[i] = el;
                    }}
                    className="shrink-0 flex flex-col"
                    style={{
                      width: `${100 / panels.length}%`,
                      opacity: i === 0 ? 1 : 0,
                    }}
                  >
                    <span
                      ref={i === 0 ? numberRef : undefined}
                      className="text-xs tracking-widest uppercase mb-6 text-gray-500 font-mono"
                    >
                      {panel.number}
                    </span>
                    <h2
                      className="font-black leading-none mb-8 text-[#f0ede8] tracking-[-0.03em] uppercase"
                      style={{ fontSize: "clamp(3rem, 5vw, 5rem)" }}
                    >
                      <WordSpans
                        text={panel.heading}
                        initialOpacity={i === 0 ? 1 : 0.08}
                      />
                    </h2>
                    <p className="text-sm text-gray-300 max-w-xl leading-[1.85]">
                      <WordSpans
                        text={panel.body}
                        initialOpacity={i === 0 ? 1 : 0.08}
                      />
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default AboutSection;
