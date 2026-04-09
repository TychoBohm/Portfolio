import AnimatedText from "../components/AnimatedText";
import LightRays from "../components/LightRays";
import { ChevronDown } from "lucide-react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useEffect, useRef } from "react";
import AboutSection from "../components/AboutSection";
import ProjectsSection from "../components/ProjectsSection";
import GetConnectedSection from "../components/GetConnectedSection";
import Bloom from "../components/Bloom";
import type { BloomHandle } from "../components/Bloom";

gsap.registerPlugin(ScrollTrigger);

const Landing = () => {
  const sectionRef = useRef<HTMLElement>(null);
  const titleWrapperRef = useRef<HTMLDivElement>(null);
  const fadeInRef1 = useRef<HTMLSpanElement>(null);
  const fadeInRef2 = useRef<HTMLSpanElement>(null);
  const chevronRef = useRef<SVGSVGElement>(null);
  const mobileWarningRef = useRef<HTMLDivElement>(null);
  const fadeInBG = useRef<HTMLDivElement>(null);
  const lightRaysWrapperRef = useRef<HTMLDivElement>(null);
  const textContentRef = useRef<HTMLHeadingElement>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const bloomRef = useRef<BloomHandle>(null);

  // Unlock scroll when scrolling past landing section
  useEffect(() => {
    const handleScroll = () => {
      const htmlEl = document.documentElement;
      const bodyEl = document.body;

      // If we've scrolled past the first viewport, ensure scroll is unlocked
      if (window.scrollY > window.innerHeight * 0.5) {
        htmlEl.style.overflow = "";
        bodyEl.style.overflow = "";
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Entrance animation
  useEffect(() => {
    const sectionEl = sectionRef.current;
    const titleWrapperEl = titleWrapperRef.current;
    const bgEl = fadeInBG.current;
    const subtitleEl = fadeInRef1.current;
    const welcomeEl = fadeInRef2.current;
    const chevronEl = chevronRef.current;
    const warningEl = mobileWarningRef.current;
    const htmlEl = document.documentElement;
    const bodyEl = document.body;

    if (!sectionEl || !titleWrapperEl) return;

    // Check if we're already scrolled past the landing section (first viewport height)
    const isScrolledPast = window.scrollY > window.innerHeight * 0.8;
    if (isScrolledPast) return;

    const previousHtmlOverflow = htmlEl.style.overflow;
    const previousBodyOverflow = bodyEl.style.overflow;
    let isScrollUnlocked = false;

    htmlEl.style.overflow = "hidden";
    bodyEl.style.overflow = "hidden";

    const unlockScroll = () => {
      if (isScrollUnlocked) return;
      htmlEl.style.overflow = previousHtmlOverflow;
      bodyEl.style.overflow = previousBodyOverflow;
      isScrollUnlocked = true;
      ScrollTrigger.refresh();
    };

    const ctx = gsap.context(() => {
      const isMobile = window.innerWidth < 768;
      const tl = gsap.timeline({ onComplete: unlockScroll });

      tl.call(unlockScroll, undefined, isMobile ? 2.8 : 3.2);

      tl.fromTo(
        titleWrapperEl,
        {
          opacity: 0,
          y: isMobile ? 35 : 50,
          x: isMobile ? 25 : 50,
          rotationZ: isMobile ? -1 : 0,
          scale: isMobile ? 0.95 : 1,
        },
        {
          opacity: 1,
          duration: isMobile ? 0.7 : 0.5,
          ease: isMobile ? "back.out(1.2)" : "power2.out",
        },
        0,
      ).to(
        titleWrapperEl,
        {
          y: 0,
          x: 0,
          rotationZ: 0,
          scale: 1,
          duration: isMobile ? 0.9 : 0.8,
          ease: "power2.out",
        },
        isMobile ? 1.2 : 1.5,
      );

      if (bgEl) {
        tl.fromTo(
          bgEl,
          { opacity: 0 },
          {
            opacity: isMobile ? 0.3 : 0.5,
            duration: isMobile ? 1.5 : 1.8,
            ease: "power2.out",
          },
          isMobile ? 0.9 : 1.3,
        );
      }
      if (subtitleEl) {
        tl.fromTo(
          subtitleEl,
          { opacity: 0, y: isMobile ? 8 : 10, x: -10 },
          {
            opacity: 1,
            y: 0,
            x: 0,
            duration: isMobile ? 1 : 1.2,
            ease: "power2.out",
          },
          isMobile ? 1.5 : 2,
        );
      }
      if (welcomeEl) {
        tl.fromTo(
          welcomeEl,
          { opacity: 0, y: isMobile ? 8 : 10, x: -10 },
          {
            opacity: 1,
            y: 0,
            x: 0,
            duration: isMobile ? 1 : 1.2,
            ease: "power2.out",
          },
          isMobile ? 1.7 : 2.3,
        );
      }
      if (chevronEl) {
        tl.fromTo(
          chevronEl,
          { opacity: 0, y: -20 },
          { opacity: 1, y: 0, duration: 0.5, ease: "power2.out" },
          isMobile ? 1.9 : 2.6,
        );
      }
      if (warningEl) {
        tl.fromTo(
          warningEl,
          { opacity: 0, y: -10 },
          { opacity: 1, y: 0, duration: 0.5, ease: "power2.out" },
          isMobile ? 1.9 : 2.6,
        );
      }
    }, sectionEl);

    return () => {
      unlockScroll();
      ctx.revert();
    };
  }, []);

  // Hero scroll-out animation
  useEffect(() => {
    const sectionEl = sectionRef.current;
    const wrapperEl = wrapperRef.current;
    const titleEl = titleWrapperRef.current;
    const roleEl = fadeInRef1.current;
    const welcomeEl = fadeInRef2.current;
    const chevronEl = chevronRef.current;
    const warningEl = mobileWarningRef.current;
    const lightRaysEl = lightRaysWrapperRef.current;

    if (!sectionEl || !wrapperEl) return;

    const ctx = gsap.context(() => {
      const isMobile = window.innerWidth < 768;

      ScrollTrigger.create({
        trigger: sectionEl,
        start: "top top",
        end: isMobile ? "bottom 80%" : "bottom top",
        scrub: true,
        onUpdate: (self) => {
          const p = self.progress;

          const getStaggeredProgress = (progress: number, delay: number) =>
            Math.max(0, Math.min(1, (progress - delay) / (1 - delay)));

          if (titleEl) {
            const tp = getStaggeredProgress(p, 0);
            const moveDistance = isMobile ? 200 : 300;
            gsap.set(titleEl, {
              y: `${-tp * moveDistance}px`,
              scale: isMobile ? 1 - tp * 0.18 : 1 - tp * 0.25,
              opacity: 1 - tp,
              transformOrigin: "center center",
            });
          }
          if (roleEl) {
            const rp = getStaggeredProgress(p, isMobile ? 0.05 : 0.03);
            const moveDistance = isMobile ? 180 : 300;
            gsap.set(roleEl, {
              y: `${-rp * moveDistance}px`,
              scale: 1 - rp * 0.15,
              opacity: 1 - rp,
              transformOrigin: "center center",
            });
          }
          if (welcomeEl) {
            const wp = getStaggeredProgress(p, isMobile ? 0.08 : 0.06);
            const moveDistance = isMobile ? 160 : 300;
            gsap.set(welcomeEl, {
              y: `${-wp * moveDistance}px`,
              scale: 1 - wp * 0.13,
              opacity: 1 - wp,
              transformOrigin: "center center",
            });
          }
          if (chevronEl) {
            gsap.set(chevronEl, {
              opacity: Math.max(0, 1 - p * (isMobile ? 3 : 4)),
            });
          }
          if (warningEl) {
            gsap.set(warningEl, {
              opacity: Math.max(0, 1 - p * (isMobile ? 3 : 4)),
            });
          }
          if (lightRaysEl) {
            if (p >= 1) {
              gsap.set(lightRaysEl, {
                opacity: 0,
                display: "none",
              });
            } else {
              gsap.set(lightRaysEl, {
                scale: 1 + p * (isMobile ? 1 : 1.5),
                opacity: 1 - p * (isMobile ? 0.15 : 0.1),
                transformOrigin: "center top",
                display: "block",
              });
            }
          }
        },
      });
    });

    return () => ctx.revert();
  }, []);

  return (
    <div ref={wrapperRef} className="relative bg-[#121212]">
      {/* ── Section 1 ── */}
      <section
        ref={sectionRef}
        className="bg-[#121212] h-screen flex items-center justify-center overflow-hidden sticky top-0"
      >
        {/* LightRays */}
        <div
          className="absolute h-full w-full top-0 left-0 overflow-hidden z-10"
          ref={fadeInBG}
        >
          <div ref={lightRaysWrapperRef} className="w-full h-full">
            <LightRays />
          </div>
        </div>

        <h1
          ref={textContentRef}
          className="text-white text-5xl font-black font-sans uppercase z-20 relative"
        >
          <div className="flex flex-col">
            <div ref={titleWrapperRef} className="flex flex-col">
              <a className="[text-shadow:0px_0px_20px_#FFFFFF]" href="#">
                <AnimatedText texts={["Hi, I'm Tycho"]} />
              </a>
            </div>
            <div className="flex flex-col">
              <span className="text-4xl" ref={fadeInRef1}>
                Software Developer
              </span>
              <span className="text-3xl text-gray-300" ref={fadeInRef2}>
                Welcome to my portfolio!
              </span>
            </div>
          </div>
        </h1>

        <div
          ref={mobileWarningRef}
          className="absolute bottom-20 text-white text-[12px] text-center md:hidden z-20 px-4 animate-bounce"
        >
          For the best experience, please view on desktop
        </div>

        <ChevronDown
          ref={chevronRef}
          className="absolute bottom-10 text-white animate-bounce scale-125 z-20"
        />
      </section>
      <Bloom
        ref={bloomRef}
        initialX={18}
        initialY={78}
        initialSize={680}
        initialOpacity={0}
      />
      {/* ── Section 2 ── */}
      <AboutSection bloomRef={bloomRef} />
      {/* ── Section 3 ── */}
      <ProjectsSection bloomRef={bloomRef} />
      {/* ── Section 4 ── */}
      <GetConnectedSection bloomRef={bloomRef} />
    </div>
  );
};

export default Landing;
