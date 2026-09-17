import { SiteHeader } from '../../../components/site-header'
import { Hero } from './landing/hero'
import { BentoFeatures } from './landing/bento-features'
import { RecentPosts } from './landing/recent-posts'
import { CommentsMarquee } from './landing/comments-marquee'
import { CallToAction } from './landing/cta'
import { SiteFooter } from './landing/site-footer'

export function BlogHome() {
  return (
    <div className="min-h-screen bg-inkwell-950">
      <SiteHeader />
      <Hero />
      <BentoFeatures />
      <RecentPosts />
      <CommentsMarquee />
      <CallToAction />
      <SiteFooter />
    </div>
  )
}
