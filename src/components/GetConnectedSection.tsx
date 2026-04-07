import { useEffect, useRef, useState } from "react";
import { ArrowUpRight, Download } from "lucide-react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import type { BloomHandle } from "./Bloom";
import { BLOOM_SIZE_HOVER } from "./Bloom";

gsap.registerPlugin(ScrollTrigger);

const SCRAMBLE_CHARS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789@#$%&";

function useScrambleText(
  target: string,
  trigger: boolean,
  duration = 1400,
  frameRate = 40,
) {
  const [display, setDisplay] = useState(target.replace(/\S/g, "_"));

  useEffect(() => {
    if (!trigger) return;

    let frame = 0;
    const totalFrames = Math.floor(duration / frameRate);
    const nonSpaceChars = target.replace(/ /g, "").length;

    const interval = setInterval(() => {
      frame++;
      const progress = frame / totalFrames;

      let nonSpaceIndex = 0;
      const next = target
        .split("")
        .map((char) => {
          if (char === " ") return " ";
          const revealAt = nonSpaceIndex / nonSpaceChars;
          nonSpaceIndex++;
          if (progress >= revealAt + 1 / nonSpaceChars) return char;
          return SCRAMBLE_CHARS[
            Math.floor(Math.random() * SCRAMBLE_CHARS.length)
          ];
        })
        .join("");

      setDisplay(next);
      if (frame >= totalFrames) {
        clearInterval(interval);
        setDisplay(target);
      }
    }, frameRate);

    return () => clearInterval(interval);
  }, [trigger, target, duration, frameRate]);

  return display;
}

const links = [
  {
    label: "GitHub",
    sublabel: "Browse my repositories",
    href: "https://github.com/TychoBohm",
    ariaLabel: "GitHub profile",
  },
  {
    label: "LinkedIn",
    sublabel: "Let's connect professionally",
    href: "https://www.linkedin.com/in/tycho-b%C3%B6hm-7b886129a/",
    ariaLabel: "LinkedIn profile",
  },
  {
    label: "Email",
    sublabel: "tycho.mees0@gmail.com",
    href: "mailto:tycho.mees0@gmail.com",
    ariaLabel: "Send an email",
  },
];

const ArrowIcon = () => (
  <ArrowUpRight size={18} strokeWidth={1.5} className="shrink-0" />
);

interface GetConnectedSectionProps {
  bloomRef: React.RefObject<BloomHandle | null>;
}

export default function GetConnectedSection({
  bloomRef,
}: GetConnectedSectionProps) {
  const sectionRef = useRef<HTMLElement>(null);
  const headingRef = useRef<HTMLDivElement>(null);
  const rulesRef = useRef<HTMLDivElement>(null);
  const linksContainerRef = useRef<HTMLDivElement>(null);
  const cvRef = useRef<HTMLDivElement>(null);
  const taglineRef = useRef<HTMLParagraphElement>(null);
  const [scrambleTrigger, setScrambleTrigger] = useState(false);

  const scrambled = useScrambleText("GET CONNECTED", scrambleTrigger, 900, 20);
  const hasAnimated = useRef(false);

  // Returns the centre of an element in viewport
  const getElCenter = (el: HTMLElement) => {
    const rect = el.getBoundingClientRect();
    const x = ((rect.left + rect.width / 2) / window.innerWidth) * 100;
    const y = ((rect.top + rect.height / 2) / window.innerHeight) * 100;
    return { x, y };
  };

  const handleLinkEnter = (e: React.MouseEvent<HTMLAnchorElement>) => {
    const { x, y } = getElCenter(e.currentTarget);
    bloomRef.current?.moveTo(x, y, BLOOM_SIZE_HOVER, 0.6, 0.45);
  };

  const handleLinkLeave = () => {
    bloomRef.current?.moveToRest();
  };

  const handleCvEnter = (e: React.MouseEvent<HTMLAnchorElement>) => {
    const { x, y } = getElCenter(e.currentTarget);
    bloomRef.current?.moveTo(x, y, BLOOM_SIZE_HOVER, 0.6, 0.4);
  };

  const handleCvLeave = () => {
    bloomRef.current?.moveToRest();
  };

  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;

    const ctx = gsap.context(() => {
      gsap.set([headingRef.current, taglineRef.current], { y: 60, opacity: 0 });
      gsap.set(linksContainerRef.current?.children ?? [], {
        x: 40,
        opacity: 0,
      });
      gsap.set(cvRef.current, { y: 30, opacity: 0 });
      gsap.set(rulesRef.current, { scaleX: 0, transformOrigin: "left center" });

      ScrollTrigger.create({
        trigger: section,
        start: "top 70%",
        once: true,
        onEnter: () => {
          if (hasAnimated.current) return;
          hasAnimated.current = true;

          setScrambleTrigger(true);
          bloomRef.current?.moveToRest(1.0);

          const tl = gsap.timeline();
          tl.to(rulesRef.current, {
            scaleX: 1,
            duration: 0.5,
            ease: "power3.out",
          })
            .to(
              headingRef.current,
              { y: 0, opacity: 1, duration: 0.5, ease: "power3.out" },
              "-=0.3",
            )
            .to(
              taglineRef.current,
              { y: 0, opacity: 1, duration: 0.4, ease: "power2.out" },
              "-=0.3",
            )
            .to(
              linksContainerRef.current?.children ?? [],
              {
                x: 0,
                opacity: 1,
                duration: 0.4,
                stagger: 0.06,
                ease: "power2.out",
              },
              "-=0.2",
            )
            .to(
              cvRef.current,
              { y: 0, opacity: 1, duration: 0.4, ease: "power2.out" },
              "-=0.1",
            );
        },
      });
    }, section);

    return () => ctx.revert();
  }, []);

  return (
    <>
      <section
        ref={sectionRef}
        className="relative bg-[#121212] min-h-screen flex flex-col font-mono"
      >
        {/* Main content */}
        <div className="flex-1 flex flex-col justify-center px-12 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-24 items-start max-w-350">
            {/* Left */}
            <div>
              <div ref={headingRef}>
                <h2
                  className="font-black leading-none text-[#f0ede8] tracking-[-0.03em] uppercase "
                  style={{
                    fontSize: "clamp(3rem, 8vw, 7rem)",
                    letterSpacing: "-0.04em",
                  }}
                >
                  {scrambled}
                </h2>
              </div>

              <p
                ref={taglineRef}
                className="mt-8 text-sm text-gray-400 leading-[1.85] max-w-xs"
              >
                I'm always open to new opportunities, collaborations, or just a
                good conversation. Feel free to reach out.
              </p>

              {/* CV Download */}
              <div ref={cvRef} className="mt-12">
                <span className="text-xs tracking-widest uppercase text-gray-500 mb-4 block">
                  Resume
                </span>
                <a
                  href="/cv-tycho-bohm.pdf"
                  download
                  className="group inline-flex items-center gap-4 border px-6 py-4 text-[#f0ede8] text-xs tracking-widest uppercase transition-all duration-300 hover:bg-[#1a4a73] hover:gap-6 w-fit"
                  onMouseEnter={(e) => {
                    (e.currentTarget as HTMLAnchorElement).style.boxShadow =
                      "0px 0px 05px #FFFFFF, 0px 0px 60px rgba(255,255,255,0.4)";
                    handleCvEnter(e);
                  }}
                  onMouseLeave={(e) => {
                    (e.currentTarget as HTMLAnchorElement).style.boxShadow = "";
                    handleCvLeave();
                  }}
                >
                  <span>Download CV</span>
                  <Download
                    size={14}
                    strokeWidth={2}
                    className="transition-transform duration-300 group-hover:translate-x-0.3"
                  />
                </a>
              </div>
            </div>

            {/* Right */}
            <div className="lg:pt-14">
              <div ref={linksContainerRef} className="flex flex-col">
                {links.map((link) => (
                  <a
                    key={link.label}
                    href={link.href}
                    target={
                      link.href.startsWith("mailto") ? undefined : "_blank"
                    }
                    rel="noopener noreferrer"
                    aria-label={link.ariaLabel}
                    className="group flex items-center justify-between py-6 border-b border-[#2a2a2a] hover:border-[#2d6fa8] transition-all duration-300"
                    onMouseEnter={handleLinkEnter}
                    onMouseLeave={handleLinkLeave}
                  >
                    <div className="flex flex-col gap-1">
                      <span className="text-xl font-black uppercase tracking-tight text-[#f0ede8] group-hover:text-[#5ba3d9] transition-colors duration-300">
                        {link.label}
                      </span>
                      <span className="text-xs text-gray-500 tracking-widest uppercase group-hover:text-gray-400 transition-colors duration-300">
                        {link.sublabel}
                      </span>
                    </div>

                    <div className="w-10 h-10 border border-[#2a2a2a] flex items-center justify-center text-gray-500 group-hover:border-[#2d6fa8] group-hover:text-[#5ba3d9] group-hover:translate-x-1 group-hover:-translate-y-1 transition-all duration-300">
                      <ArrowIcon />
                    </div>
                  </a>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Bottom rule + footer */}
        <div className="px-12 pb-12 relative z-10">
          <div ref={rulesRef} className="h-px bg-[#2a2a2a] mb-8" />
          <div className="flex items-center justify-between">
            <span className="text-xs tracking-widest uppercase text-gray-600">
              Tycho Böhm — Portfolio 2026
            </span>
            <span className="text-xs tracking-widest uppercase text-gray-600">
              Built with React + GSAP
            </span>
          </div>
        </div>
      </section>
    </>
  );
}
