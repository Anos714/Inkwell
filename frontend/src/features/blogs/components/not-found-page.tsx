import { useRef } from "react";
import { Link } from "react-router";
import { motion, useMotionValue, useSpring, useTransform } from "motion/react";
import { FaArrowRight } from "react-icons/fa6";
import { BrandLogo } from "../../../components/brand-logo";
import { ThemeToggle } from "../../../components/theme-toggle";
import { useSeo } from "../../../hooks/use-seo";
import { SITE_NAME } from "../../../lib/seo";

/**
 * Real 404 page. A bare <Navigate to="/" /> for unknown paths turns every
 * invalid URL into a soft-404 that Google indexes as the homepage; serving a
 * distinct, self-canonical page keeps the sitemap honest and gives crawlers a
 * proper "not found" signal.
 *
 * The spotlight tracks the pointer via spring-smoothed motion values, and the
 * "404" glyphs parallax against the cursor so the page feels liquid rather
 * than static. All color comes from semantic tokens, so it re-skins correctly
 * in light mode.
 */
export function NotFoundPage() {
  useSeo({
    title: `Page not found — ${SITE_NAME}`,
    description: "That page doesn't exist on Inkwell. Head back to the journal.",
    noIndex: true,
  });

  const stageRef = useRef<HTMLDivElement>(null);

  // Pointer position normalised to [-0.5, 0.5] across the stage, then smoothed
  // with a spring so the light trails the cursor instead of snapping.
  const pointerX = useMotionValue(0);
  const pointerY = useMotionValue(0);
  const smoothX = useSpring(pointerX, { stiffness: 120, damping: 22, mass: 0.6 });
  const smoothY = useSpring(pointerY, { stiffness: 120, damping: 22, mass: 0.6 });

  const handlePointerMove = (event: React.PointerEvent<HTMLDivElement>) => {
    const stage = stageRef.current;
    if (!stage) return;
    const bounds = stage.getBoundingClientRect();
    pointerX.set((event.clientX - bounds.left) / bounds.width - 0.5);
    pointerY.set((event.clientY - bounds.top) / bounds.height - 0.5);
  };

  // The glow is positioned with CSS custom props driven by the same values.
  const glowX = useTransform(smoothX, (value) => `${value * 100 + 50}%`);
  const glowY = useTransform(smoothY, (value) => `${value * 100 + 50}%`);

  // Parallax depth for the glyphs — foreground moves opposite to the cursor.
  const glyphX = useTransform(smoothX, (value) => value * -28);
  const glyphY = useTransform(smoothY, (value) => value * -20);
  const orbitX = useTransform(smoothX, (value) => value * 34);
  const orbitY = useTransform(smoothY, (value) => value * 26);

  return (
    <main className="relative min-h-svh overflow-hidden bg-inkwell-950 text-inkwell-cream">
      <header className="relative z-20 border-b border-inkwell-cream/10">
        <nav className="mx-auto flex max-w-4xl items-center justify-between px-6 py-5">
          <Link to="/" className="flex items-center gap-3 font-display text-xl">
            <BrandLogo />
            Inkwell
          </Link>
          <ThemeToggle />
        </nav>
      </header>

      {/* Cursor-tracking spotlight. `motion.div` exposes the transformed
          percentages as CSS vars the radial-gradient reads. */}
      <motion.div
        ref={stageRef}
        onPointerMove={handlePointerMove}
        className="absolute inset-0 z-0"
        aria-hidden="true"
      >
        <motion.div
          className="absolute inset-0"
          style={
            {
              "--glow-x": glowX,
              "--glow-y": glowY,
              background:
                "radial-gradient(38rem 30rem at var(--glow-x) var(--glow-y), color-mix(in srgb, var(--accent) 16%, transparent), transparent 68%)",
            } as React.CSSProperties
          }
        />
        {/* Faint ink grid, masked so it fades toward the edges. */}
        <div className="absolute inset-0 opacity-[0.35] [mask-image:radial-gradient(circle_at_center,black,transparent_72%)] [background-image:linear-gradient(color-mix(in_srgb,var(--text)_6%,transparent)_1px,transparent_1px),linear-gradient(90deg,color-mix(in_srgb,var(--text)_6%,transparent)_1px,transparent_1px)] [background-size:56px_56px]" />
      </motion.div>

      <section className="relative z-10 mx-auto flex max-w-3xl flex-col items-center px-6 py-24 text-center sm:py-36">
        <motion.span
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          className="font-mono text-[10px] uppercase tracking-[.24em] text-inkwell-gold"
        >
          Error 404 · Lost in the margins
        </motion.span>

        {/* The 404 sits on its own parallax layer, the ring on a deeper one. */}
        <div className="relative mt-8">
          <motion.div
            aria-hidden="true"
            style={{ x: orbitX, y: orbitY }}
            className="absolute left-1/2 top-1/2 -z-10 size-[22rem] -translate-x-1/2 -translate-y-1/2 rounded-full border border-inkwell-gold/25 sm:size-[28rem]"
          />
          <motion.div
            aria-hidden="true"
            style={{ x: orbitX, y: orbitY }}
            className="absolute left-1/2 top-1/2 -z-10 size-[15rem] -translate-x-1/2 -translate-y-1/2 rounded-full border border-inkwell-cream/10"
          />

          <motion.h1
            style={{ x: glyphX, y: glyphY }}
            initial={{ opacity: 0, scale: 0.92, filter: "blur(14px)" }}
            animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
            transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1], delay: 0.08 }}
            className="font-display text-[7rem] leading-none tracking-tighter text-inkwell-cream sm:text-[11rem]"
          >
            4<span className="italic text-inkwell-gold">0</span>4
          </motion.h1>
        </div>

        <motion.h2
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1], delay: 0.22 }}
          className="mt-2 font-display text-3xl leading-tight sm:text-4xl"
        >
          This page is blank.
        </motion.h2>

        <motion.p
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1], delay: 0.32 }}
          className="mt-6 max-w-md text-sm leading-7 text-inkwell-muted"
        >
          The link may be broken, or the entry was never written. The journal is
          still very much open — come back to the desk.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1], delay: 0.42 }}
          className="mt-12 flex flex-wrap items-center justify-center gap-4"
        >
          <Link
            to="/"
            className="group inline-flex items-center gap-2.5 rounded-full bg-inkwell-gold px-7 py-3.5 font-mono text-[10px] uppercase tracking-[.18em] text-inkwell-950 transition hover:opacity-90"
          >
            Back to home
            <FaArrowRight
              aria-hidden="true"
              className="size-3 transition-transform duration-300 group-hover:translate-x-1"
            />
          </Link>
          <Link
            to="/blogs"
            className="rounded-full border border-inkwell-cream/15 px-7 py-3.5 font-mono text-[10px] uppercase tracking-[.18em] text-inkwell-muted transition hover:border-inkwell-gold/60 hover:text-inkwell-gold"
          >
            Browse all posts
          </Link>
        </motion.div>
      </section>
    </main>
  );
}
