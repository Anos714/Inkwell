import { motion, cubicBezier } from 'motion/react'
import { useState } from 'react'

const easeOutSoft = cubicBezier(0.22, 1, 0.36, 1)

/* ── Animated SVG icons (each draws itself in) ─────────────────────────────── */

function EyeIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="size-4" aria-hidden="true">
      <motion.path
        d="M2.5 12S6 5.8 12 5.8s9.5 6.2 9.5 6.2-3.5 6.2-9.5 6.2S2.5 12 2.5 12Z"
        stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round"
        initial={{ pathLength: 0 }} whileInView={{ pathLength: 1 }} viewport={{ once: true }}
        transition={{ duration: 1, delay: 0.5, ease: 'easeInOut' }}
      />
      <motion.circle
        cx="12" cy="12" r="2.6" stroke="currentColor" strokeWidth="1.5"
        initial={{ scale: 0 }} whileInView={{ scale: 1 }} viewport={{ once: true }}
        transition={{ duration: 0.5, delay: 1.1, ease: easeOutSoft }}
      />
    </svg>
  )
}

function HeartIcon({ filled }: { filled: boolean }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill={filled ? 'currentColor' : 'none'}
      className="size-4"
      aria-hidden="true"
    >
      <motion.path
        d="M12 20.6S3.4 15 3.4 9.1a4.7 4.7 0 0 1 8.6-2.7 4.7 4.7 0 0 1 8.6 2.7c0 5.9-8.6 11.5-8.6 11.5Z"
        stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round"
        initial={{ pathLength: 0 }} whileInView={{ pathLength: 1 }} viewport={{ once: true }}
        transition={{ duration: 1, delay: 0.65, ease: 'easeInOut' }}
      />
    </svg>
  )
}

function CommentIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="size-4" aria-hidden="true">
      <motion.path
        d="M4 6h16v10H10l-4 3.4V16H4V6Z"
        stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" strokeLinecap="round"
        initial={{ pathLength: 0 }} whileInView={{ pathLength: 1 }} viewport={{ once: true }}
        transition={{ duration: 1, delay: 0.8, ease: 'easeInOut' }}
      />
      <motion.path
        d="M8.5 10.5h7M8.5 13h4"
        stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"
        initial={{ pathLength: 0, opacity: 0 }} whileInView={{ pathLength: 1, opacity: 1 }} viewport={{ once: true }}
        transition={{ duration: 0.6, delay: 1.4 }}
      />
    </svg>
  )
}

function ShareIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="size-4" aria-hidden="true">
      <motion.path
        d="M12 3.5v10"
        stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"
        initial={{ pathLength: 0 }} whileInView={{ pathLength: 1 }} viewport={{ once: true }}
        transition={{ duration: 0.6, delay: 0.9 }}
      />
      <motion.path
        d="m8 7.5 4-4 4 4"
        stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"
        initial={{ pathLength: 0, opacity: 0 }} whileInView={{ pathLength: 1, opacity: 1 }} viewport={{ once: true }}
        transition={{ duration: 0.6, delay: 1.1 }}
      />
      <motion.path
        d="M5 13.5V18a1.5 1.5 0 0 0 1.5 1.5h11A1.5 1.5 0 0 0 19 18v-4.5"
        stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"
        initial={{ pathLength: 0, opacity: 0 }} whileInView={{ pathLength: 1, opacity: 1 }} viewport={{ once: true }}
        transition={{ duration: 0.7, delay: 1.3 }}
      />
    </svg>
  )
}

/* ── Cover art: abstract "page being written" ──────────────────────────────── */

function CoverArt() {
  return (
    <svg
      viewBox="0 0 480 270"
      className="absolute inset-0 size-full"
      preserveAspectRatio="xMidYMid slice"
      aria-hidden="true"
    >
      <defs>
        <linearGradient id="hero-cover" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#1a1c1b" />
          <stop offset="55%" stopColor="#20231f" />
          <stop offset="100%" stopColor="#26291f" />
        </linearGradient>
      </defs>
      <rect width="480" height="270" fill="url(#hero-cover)" />
      <circle cx="382" cy="62" r="92" fill="#c9a15f" opacity="0.09" />
      <circle cx="86" cy="216" r="70" fill="#c9a15f" opacity="0.05" />

      {/* text-like lines that write themselves in */}
      {[0, 1, 2, 3, 4].map((i) => (
        <motion.path
          key={i}
          d={`M44 ${118 + i * 26} h ${i === 4 ? 224 : 392}`}
          stroke="#c9a15f"
          strokeOpacity={0.28}
          strokeWidth="2.5"
          strokeLinecap="round"
          initial={{ pathLength: 0 }}
          whileInView={{ pathLength: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 1.3, delay: 0.7 + i * 0.12, ease: 'easeInOut' }}
        />
      ))}
    </svg>
  )
}

/* ── The interactive blog preview card ──────────────────────────────────────── */

export function HeroPreviewCard() {
  const [liked, setLiked] = useState(false)
  const [likes, setLikes] = useState(248)
  const [copied, setCopied] = useState(false)

  const handleLike = () => {
    if (liked) {
      setLikes((count) => count - 1)
      setLiked(false)
    } else {
      setLikes((count) => count + 1)
      setLiked(true)
    }
  }

  const handleShare = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href)
    } catch {
      /* clipboard may be unavailable — still show the feedback */
    }
    setCopied(true)
    window.setTimeout(() => setCopied(false), 1600)
  }

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.94, y: 18 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={{ duration: 0.9, delay: 0.25, ease: easeOutSoft }}
      whileHover={{ y: -6 }}
      className="relative mx-auto w-full max-w-[480px]"
    >
      <div className="absolute -inset-6 rounded-[2.25rem] border border-inkwell-gold/10" />

      <div className="float-slow relative overflow-hidden rounded-3xl border border-inkwell-cream/12 bg-inkwell-900/70 shadow-2xl shadow-black/30 backdrop-blur-sm">
        {/* Cover */}
        <div className="relative aspect-[16/9] overflow-hidden border-b border-inkwell-cream/10">
          <CoverArt />
          <span className="absolute left-4 top-4 rounded-full bg-black/50 px-3 py-1 font-mono text-[9px] uppercase tracking-wider text-inkwell-cream backdrop-blur-sm">
            Field note / 01
          </span>
          <span className="absolute bottom-4 right-4 rounded-full bg-black/50 px-3 py-1 font-mono text-[9px] uppercase tracking-wider text-inkwell-cream backdrop-blur-sm">
            4 min read
          </span>
        </div>

        {/* Body */}
        <div className="p-6 sm:p-7">
          <div className="flex gap-3">
            <span className="font-mono text-[10px] uppercase tracking-wider text-inkwell-gold">#design</span>
            <span className="font-mono text-[10px] uppercase tracking-wider text-inkwell-dim">#writing</span>
          </div>

          <h3 className="mt-3 font-display text-2xl leading-tight text-inkwell-cream sm:text-3xl">
            Notes from the long way.
          </h3>

          <p className="mt-3 line-clamp-2 text-sm leading-7 text-inkwell-muted">
            A personal blog for unfinished thoughts, useful lessons, and the small details worth remembering.
          </p>

          {/* Stats */}
          <div className="mt-6 flex items-center justify-between border-t border-inkwell-cream/10 pt-5">
            <div className="flex items-center gap-5">
              <span className="flex items-center gap-1.5 text-xs text-inkwell-muted">
                <EyeIcon />
                <span className="tabular-nums">1.2k</span>
              </span>

              <button
                type="button"
                onClick={handleLike}
                aria-pressed={liked}
                aria-label={liked ? 'Unlike this post' : 'Like this post'}
                className="relative flex items-center gap-1.5 rounded-lg text-xs transition duration-200 hover:scale-105 active:scale-95"
              >
                <motion.span
                  animate={liked ? { scale: [1, 1.32, 1] } : { scale: 1 }}
                  transition={{ duration: 0.42, ease: easeOutSoft }}
                  className={liked ? 'text-red-400' : 'text-inkwell-muted'}
                >
                  <HeartIcon filled={liked} />
                </motion.span>
                <span className={`tabular-nums ${liked ? 'text-red-300' : 'text-inkwell-muted'}`}>
                  {likes}
                </span>

                {/* particle burst */}
                {liked &&
                  [0, 1, 2, 3, 4].map((i) => (
                    <motion.span
                      key={`${likes}-${i}`}
                      className="pointer-events-none absolute left-2 top-1/2 size-1 rounded-full bg-red-400"
                      initial={{ opacity: 1, x: 0, y: 0, scale: 1 }}
                      animate={{
                        opacity: 0,
                        x: Math.cos((i / 5) * Math.PI * 2) * 20,
                        y: Math.sin((i / 5) * Math.PI * 2) * 20,
                        scale: 0.2,
                      }}
                      transition={{ duration: 0.6, ease: 'easeOut' }}
                    />
                  ))}
              </button>

              <span className="flex items-center gap-1.5 text-xs text-inkwell-muted">
                <CommentIcon />
                <span className="tabular-nums">32</span>
              </span>
            </div>

            <button
              type="button"
              onClick={handleShare}
              aria-label="Copy link to this post"
              className="relative flex items-center gap-1.5 rounded-lg text-xs text-inkwell-muted transition duration-200 hover:text-inkwell-gold"
            >
              <ShareIcon />
              <span className="tabular-nums">12</span>
              {copied && (
                <motion.span
                  initial={{ opacity: 0, y: 4 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="pointer-events-none absolute -top-7 right-0 whitespace-nowrap rounded-md bg-inkwell-gold px-2 py-1 font-mono text-[9px] font-semibold text-inkwell-950"
                >
                  Link copied
                </motion.span>
              )}
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  )
}
