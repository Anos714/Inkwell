import { SiteHeader } from '../../../components/site-header'
import { Hero } from './landing/hero'
import { ReadingTicker } from './landing/ticker'
import { HeroPlate } from './landing/hero-plate'
import { TopicsStrip } from './landing/topics-strip'
import { ReadingRoom } from './landing/reading-room'
import { RecentPosts } from './landing/recent-posts'
import { CommentsMarquee } from './landing/comments-marquee'
import { CallToAction } from './landing/cta'
import { SiteFooter } from './landing/site-footer'
import { useSeo } from '../../../hooks/use-seo'
import {
  SITE_NAME,
  SITE_TAGLINE,
  SITE_DESCRIPTION,
  organizationJsonLd,
  websiteJsonLd,
} from '../../../lib/seo'

export function BlogHome() {
  useSeo({
    title: `${SITE_NAME} — ${SITE_TAGLINE}`,
    description: SITE_DESCRIPTION,
    path: '/',
    jsonLd: [organizationJsonLd(), websiteJsonLd()],
  })

  return (
    <div className="relative min-h-screen bg-inkwell-950">
      <div aria-hidden="true" className="paper-grain" />
      <SiteHeader />
      <main>
        <Hero />
        <ReadingTicker />
        <HeroPlate />
        <TopicsStrip />
        <RecentPosts />
        <ReadingRoom />
        <CommentsMarquee />
        <CallToAction />
      </main>
      <SiteFooter />
    </div>
  )
}
