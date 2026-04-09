import { useCallback, useEffect, useRef, useState } from "react";
import { ArrowUpRight } from "lucide-react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import type { BloomHandle } from "./Bloom";
import { BLOOM_SIZE_HOVER } from "./Bloom";

gsap.registerPlugin(ScrollTrigger);

interface Project {
  number: string;
  title: string;
  desc: string;
  tags: string[];
  year: string;
  type: string;
  url?: string;
}

const projects: Project[] = [
  {
    number: "01 / 06",
    title: "Calorie Tracker",
    desc: "A full-stack calorie tracking application where users can manage their daily nutrition and calorie intake. Built with a Java Spring Boot backend and a Vue 3 frontend using the Composition API.",
    tags: ["Vue 3", "Spring Boot", "Java", "Full Stack"],
    year: "2024",
    type: "School Project",
    url: "https://github.com/LaNcETechno/Project-HIC",
  },
  {
    number: "02 / 06",
    title: "Frontend Final Assignment (Quiz)",
    desc: "An interactive quiz application built as a frontend final assignment. Uses JSON-based questions, dynamic UI updates, and score tracking across multiple categories.",
    tags: ["JavaScript", "JSON", "DOM", "Frontend"],
    year: "2025",
    type: "School Project",
    url: "https://tychobohm.github.io/QuizExamenFrontend/",
  },
  {
    number: "03 / 06",
    title: "Blog & Login System",
    desc: "A comprehensive blog platform with integrated user authentication system. Built entirely with PHP and MySQL backend, featuring user registration, login functionality, and blog post management with a clean CSS interface.",
    tags: ["PHP", "MySQL", "CSS", "Backend"],
    year: "2025",
    type: "School Project",
    url: "https://github.com/TychoBohm/blogEnInlogSysteemPHP",
  },
  {
    number: "04 / 06",
    title: "Coralynn Final Project",
    desc: "A complete final MBO project developed for a client scenario. Focused on building a functional and user-friendly application while applying real-world development practices.",
    tags: ["Vite", "React", "TypeScript", "Tailwind CSS"],
    year: "2026",
    type: "School Project",
    url: "https://github.com/TychoBohm/Coralynn",
  },
  {
    number: "05 / 06",
    title: "Linden-IT Internship Project",
    desc: "A team-based final internship project where we developed an AI-powered training advisor. It uses the OpenAI API to recommend courses based on job vacancies and employee CVs, along with an AI chatbot built on a FAQ database to assist new employees.",
    tags: ["Team Project", "OpenAI API", "Backend", "Frontend"],
    year: "2026",
    type: "Internship",
    url: "https://linden-it.com/",
  },
  {
    number: "06 / 06",
    title: "Portfolio Website",
    desc: "My personal portfolio website built with Vite, React, TypeScript, and Tailwind CSS, enhanced with GSAP animations to create a modern and interactive user experience.",
    tags: ["Vite", "React", "TypeScript", "Tailwind CSS", "GSAP"],
    year: "2026",
    type: "Portfolio",
    url: "https://tychobohm.github.io/Portfolio/",
  },
];

const mockGradients = [
  "linear-gradient(135deg, #b8001c 0%, #ff4d4d 100%)",
  "linear-gradient(135deg, #142850 0%, #3a7bd5 100%)",
  "linear-gradient(135deg, #6a4c93 0%, #1982c4 100%)",
  "linear-gradient(135deg, #ff6b4a 0%, #74c7f0 100%)",
  "linear-gradient(135deg, #fd7829 0%, #ffe8d6 100%)",
  "linear-gradient(135deg, #1c1c24 0%, #0a0a0a 100%)",
];

interface ProjectsSectionProps {
  bloomRef: React.RefObject<BloomHandle | null>;
}

export default function ProjectsSection({ bloomRef }: ProjectsSectionProps) {
  const [current, setCurrent] = useState(0);
  const currentRef = useRef(0);
  const panelsRef = useRef<(HTMLDivElement | null)[]>([]);

  // desktop refs
  const numRef = useRef<HTMLSpanElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const descRef = useRef<HTMLParagraphElement>(null);
  const tagsRef = useRef<HTMLDivElement>(null);
  const linkRef = useRef<HTMLAnchorElement>(null);
  const sectionRef = useRef<HTMLElement>(null);

  // mobile: one ref per card
  const mobileCardRefs = useRef<(HTMLDivElement | null)[]>([]);

  const getEls = () => [
    numRef.current,
    titleRef.current,
    descRef.current,
    tagsRef.current,
    linkRef.current,
  ];

  const animateIn = (dir: number) => {
    const yFrom = dir > 0 ? 28 : -28;
    gsap.fromTo(
      getEls(),
      { y: yFrom, opacity: 0 },
      { y: 0, opacity: 1, duration: 0.45, stagger: 0.06, ease: "power2.out" },
    );
  };

  const setProject = useCallback((i: number, dir: number) => {
    if (i === currentRef.current) return;
    const yOut = dir > 0 ? -28 : 28;
    gsap.to(getEls(), {
      y: yOut,
      opacity: 0,
      duration: 0.22,
      stagger: 0.04,
      ease: "power2.in",
      onComplete: () => {
        currentRef.current = i;
        setCurrent(i);
        animateIn(dir);
      },
    });
  }, []);

  // ── Desktop: entrance ─────────────────────────────────────────────
  useEffect(() => {
    if (window.innerWidth < 1024) return;
    gsap.fromTo(
      getEls(),
      { y: 30, opacity: 0 },
      {
        y: 0,
        opacity: 1,
        duration: 0.8,
        stagger: 0.1,
        ease: "power3.out",
        delay: 0.2,
      },
    );
  }, []);

  // ── Desktop: scroll triggers ──────────────────────────────────────
  useEffect(() => {
    if (window.innerWidth < 1024) return;
    const triggers = panelsRef.current.map((panel, i) => {
      if (!panel) return null;
      return ScrollTrigger.create({
        trigger: panel,
        start: "top center",
        end: "bottom center",
        onEnter: () => setProject(i, 1),
        onEnterBack: () => setProject(i, -1),
      });
    });
    return () => triggers.forEach((t) => t?.kill());
  }, [setProject]);

  // ── Desktop: snap ─────────────────────────────────────────────────
  useEffect(() => {
    if (window.innerWidth < 1024) return;
    const st = ScrollTrigger.create({
      trigger: sectionRef.current,
      start: "top top",
      end: "bottom bottom",
      snap: {
        snapTo: (value) => {
          const segmentSize = 1 / (projects.length - 1);
          const threshold = 0.45;
          const clamped = Math.max(0, Math.min(1, value));
          const currentSegment = Math.min(
            Math.floor(clamped / segmentSize),
            projects.length - 2,
          );
          const segmentStart = currentSegment * segmentSize;
          const progressInSegment = (clamped - segmentStart) / segmentSize;
          let snappedIndex =
            progressInSegment > threshold ? currentSegment + 1 : currentSegment;
          snappedIndex = Math.max(
            0,
            Math.min(projects.length - 1, snappedIndex),
          );
          return snappedIndex * segmentSize;
        },
        duration: { min: 0.3, max: 0.8 },
        delay: 0.15,
        ease: "power2.inOut",
      },
    });
    return () => st.kill();
  }, []);

  // ── Mobile: scroll-triggered card animations ──────────────────────
  useEffect(() => {
    if (window.innerWidth >= 1024) return;

    // set all mobile elements invisible on mount with more complex transforms
    mobileCardRefs.current.forEach((card) => {
      if (!card) return;
      gsap.set(card.querySelector(".mc-image"), {
        opacity: 0,
        scale: 0.88,
        rotationZ: -1.5,
        y: 20,
      });
      gsap.set(card.querySelector(".mc-num"), {
        opacity: 0,
        y: 28,
        x: -12,
      });
      gsap.set(card.querySelector(".mc-title"), {
        opacity: 0,
        y: 36,
        x: -8,
        rotationZ: -0.8,
      });
      gsap.set(card.querySelector(".mc-desc"), {
        opacity: 0,
        y: 24,
        x: -6,
      });
      gsap.set(card.querySelectorAll(".mc-tag"), {
        opacity: 0,
        y: 16,
        x: -4,
      });
      gsap.set(card.querySelector(".mc-link"), {
        opacity: 0,
        y: 12,
        x: -3,
      });
    });

    const ctx = gsap.context(() => {
      mobileCardRefs.current.forEach((card) => {
        if (!card) return;

        const image = card.querySelector<HTMLElement>(".mc-image");
        const num = card.querySelector<HTMLElement>(".mc-num");
        const title = card.querySelector<HTMLElement>(".mc-title");
        const desc = card.querySelector<HTMLElement>(".mc-desc");
        const tags = card.querySelectorAll<HTMLElement>(".mc-tag");
        const link = card.querySelector<HTMLElement>(".mc-link");

        const trigger = { trigger: card, start: "top 84%", once: true };

        // gradient card: enhanced entrance with rotation + scale
        gsap.to(image, {
          scale: 1,
          opacity: 1,
          rotationZ: 0,
          y: 0,
          duration: 0.95,
          ease: "back.out(1.3)",
          scrollTrigger: trigger,
        });

        // Add subtle parallax to card image
        gsap.to(image, {
          y: -50,
          ease: "none",
          scrollTrigger: {
            trigger: card,
            start: "top 84%",
            end: "bottom top",
            scrub: 0.7,
            invalidateOnRefresh: true,
          },
        });

        // number: slide in from left
        gsap.to(num, {
          x: 0,
          y: 0,
          opacity: 1,
          duration: 0.68,
          ease: "power2.out",
          scrollTrigger: trigger,
        });

        // title: enhanced with rotation and stagger
        gsap.to(title, {
          x: 0,
          y: 0,
          rotationZ: 0,
          opacity: 1,
          duration: 0.75,
          ease: "back.out(1.1)",
          delay: 0.08,
          scrollTrigger: trigger,
        });

        // description: smooth slide-in
        gsap.to(desc, {
          x: 0,
          y: 0,
          opacity: 1,
          duration: 0.68,
          ease: "power2.out",
          delay: 0.22,
          scrollTrigger: trigger,
        });

        // tags: staggered with more movement
        gsap.to(tags, {
          x: 0,
          y: 0,
          opacity: 1,
          duration: 0.55,
          stagger: {
            amount: 0.18,
            from: "start",
            ease: "power2.inOut",
          },
          ease: "back.out(0.8)",
          delay: 0.32,
          scrollTrigger: trigger,
        });

        // link: final element with slight delay
        gsap.to(link, {
          x: 0,
          y: 0,
          opacity: 1,
          duration: 0.55,
          ease: "power2.out",
          delay: 0.48,
          scrollTrigger: trigger,
        });

        // Optional: card container background highlight
        gsap.to(card, {
          backgroundColor: "rgba(255, 255, 255, 0.015)",
          duration: 0.3,
          repeat: 1,
          yoyo: true,
          scrollTrigger: trigger,
          clearProps: "backgroundColor",
        });
      });
    });

    return () => ctx.revert();
  }, []);

  const p = projects[current];

  return (
    <section ref={sectionRef} className="relative bg-[#121212]">
      {/* ── MOBILE layout ────────────────────────────────────────── */}
      <div className="lg:hidden">
        {projects.map((proj, i) => (
          <div
            key={proj.title}
            ref={(el) => {
              mobileCardRefs.current[i] = el;
            }}
            className="relative px-5 py-14 border-t border-[#2a2a2a]"
          >
            {/* gradient card */}
            <div
              className="mc-image relative overflow-hidden w-full aspect-[3/4] max-h-[65vw] mb-8"
              style={{ background: mockGradients[i] }}
            >
              <div className="absolute inset-0 pointer-events-none bg-black/20" />
              <div className="relative z-10 w-full h-full flex items-center justify-center font-black text-[rgba(255,255,255,0.14)] text-[2.5rem] font-mono uppercase leading-none px-4 text-center">
                {proj.title}
              </div>
              <div
                className="absolute inset-0 pointer-events-none"
                style={{
                  background:
                    "radial-gradient(ellipse at 25% 25%, rgba(255,255,255,0.08) 0%, transparent 55%)",
                }}
              />
              <span className="absolute z-10 bottom-3 left-3 text-xs tracking-widest uppercase text-[rgba(255,255,255,0.78)] font-mono">
                {proj.type} — {proj.year}
              </span>
              <span className="absolute z-10 top-3 right-3 text-xs text-[rgba(255,255,255,0.7)] font-mono uppercase">
                0{i + 1}
              </span>
            </div>

            {/* info */}
            <div className="font-mono">
              <span className="mc-num text-xs tracking-widest uppercase text-gray-300 mb-4 block">
                {proj.number}
              </span>
              <h2 className="mc-title font-black leading-none mb-5 text-[#f0ede8] tracking-[-0.03em] uppercase text-2xl sm:text-3xl">
                {proj.title}
              </h2>
              <p className="mc-desc text-sm mb-5 text-gray-300 leading-[1.85]">
                {proj.desc}
              </p>
              <div className="flex flex-wrap gap-2 mb-6">
                {proj.tags.map((tag) => (
                  <span
                    key={tag}
                    className="mc-tag text-xs tracking-widest uppercase px-3 py-1.5 border border-[#2a2a2a] text-gray-300"
                  >
                    {tag}
                  </span>
                ))}
              </div>
              <a
                href={proj.url || "https://github.com/TychoBohm"}
                className="mc-link inline-flex items-center gap-2 text-xs tracking-widest uppercase w-fit text-[#f0ede8] border-b border-[#f0ede8] pb-0.5 hover:opacity-40 transition-opacity duration-100"
              >
                View project
                <ArrowUpRight size={13} strokeWidth={2} />
              </a>
            </div>
          </div>
        ))}
        <div className="px-5">
          <div className="h-px bg-[#2a2a2a]" />
        </div>
      </div>

      {/* ── DESKTOP layout ───────────────────────────────────────── */}
      <div className="hidden lg:block flow-root">
        {/* sticky left panel */}
        <div className="sticky top-0 h-screen float-left flex flex-col justify-center px-8 xl:px-12 w-[55%] font-mono">
          <div className="flex flex-col">
            <span
              ref={numRef}
              className="text-xs tracking-widest uppercase mb-6 text-gray-300"
            >
              {p.number}
            </span>
            <h2
              ref={titleRef}
              className="font-black leading-none mb-8 text-[#f0ede8] tracking-[-0.03em] uppercase text-3xl xl:text-5xl 2xl:text-7xl 2xl:max-w-160"
            >
              {p.title}
            </h2>
            <p
              ref={descRef}
              className="text-sm mb-8 text-gray-300 max-w-120 leading-[1.85]"
            >
              {p.desc}
            </p>
            <div ref={tagsRef} className="flex flex-wrap gap-2 mb-8">
              {p.tags.map((tag) => (
                <span
                  key={tag}
                  className="text-xs tracking-widest uppercase px-3 py-1.5 border border-[#2a2a2a] text-gray-300"
                >
                  {tag}
                </span>
              ))}
            </div>
            <a
              ref={linkRef}
              href={p.url || "https://github.com/TychoBohm"}
              className="inline-flex items-center gap-2 text-xs tracking-widest uppercase w-fit text-[#f0ede8] border-b border-[#f0ede8] pb-0.5 hover:opacity-40 transition-opacity duration-100"
              onMouseEnter={(e) => {
                const rect = e.currentTarget.getBoundingClientRect();
                const x =
                  ((rect.left + rect.width / 2) / window.innerWidth) * 100;
                const y =
                  ((rect.top + rect.height / 2) / window.innerHeight) * 100;
                bloomRef.current?.moveTo(x, y, BLOOM_SIZE_HOVER, 0.7, 0.45);
              }}
              onMouseLeave={() => bloomRef.current?.moveToRest()}
            >
              View project
              <ArrowUpRight size={13} strokeWidth={2} />
            </a>
          </div>
        </div>

        {/* right scroll panels */}
        <div style={{ marginLeft: "55%", width: "45%" }}>
          {projects.map((proj, i) => (
            <div
              key={proj.title}
              ref={(el) => {
                panelsRef.current[i] = el;
              }}
              className="relative flex items-center justify-center h-screen px-8 xl:px-12"
            >
              {i === 0 && (
                <div className="absolute top-0 left-0 right-0 px-8 xl:px-12">
                  <div className="h-px bg-[#2a2a2a]" />
                </div>
              )}
              {i === projects.length - 1 && (
                <div className="absolute bottom-0 left-0 right-0 px-8 xl:px-12">
                  <div className="h-px bg-[#2a2a2a]" />
                </div>
              )}
              <div
                className="relative overflow-hidden w-full max-h-[70vh] aspect-3/4"
                style={{ background: mockGradients[i] }}
              >
                <div className="absolute inset-0 pointer-events-none bg-black/20" />
                <div className="relative z-10 w-full h-full flex items-center justify-center font-black text-[rgba(255,255,255,0.14)] text-[5rem] letter-spacing-[-0.04em] font-mono uppercase">
                  {proj.title}
                </div>
                <div
                  className="absolute inset-0 pointer-events-none"
                  style={{
                    background:
                      "radial-gradient(ellipse at 25% 25%, rgba(255,255,255,0.08) 0%, transparent 55%)",
                  }}
                />
                <span className="absolute z-10 bottom-4 left-4 text-xs tracking-widest uppercase text-[rgba(255,255,255,0.78)] font-mono">
                  {proj.type} — {proj.year}
                </span>
                <span
                  className="absolute z-10 top-4 right-4 text-xs text-[rgba(255,255,255,0.7)] font-mono uppercase"
                  style={{ fontFamily: "'Geist Mono', monospace" }}
                >
                  0{i + 1}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
