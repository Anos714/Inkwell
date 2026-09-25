import { Link } from 'react-router'
import { LegalPage } from './legal-page'
import { useSeo } from '../../../../hooks/use-seo'
import { SITE_NAME } from '../../../../lib/seo'

export function TermsAndConditions() {
  useSeo({
    title: `Terms & Conditions — ${SITE_NAME}`,
    description:
      'The rules that govern use of Inkwell — accounts, content, conduct, and responsibilities.',
    path: '/terms',
  })

  return (
    <LegalPage eyebrow="Legal" title="Terms &amp; Conditions" updatedAt="25 September 2026">
      <p>
        Welcome to Inkwell. These terms govern your use of the site and its features. By creating an
        account or browsing the journal, you agree to what follows. Please read them — they are
        written to be readable, not to be a trap.
      </p>

      <h2>1. Using Inkwell</h2>
      <p>
        Inkwell is a platform for reading and writing. Readers can browse posts, like them, and
        comment on them. Admins can additionally create, edit, and publish posts through the
        dashboard. Some features require an account; browsing the journal does not.
      </p>
      <p>
        You agree to use Inkwell lawfully and to respect the rights of others. In particular, you
        will not:
      </p>
      <ul>
        <li>Publish content that is unlawful, defamatory, hateful, or harassing.</li>
        <li>Infringe another person&rsquo;s copyright, trademark, or privacy.</li>
        <li>Upload malware, scripts, or anything designed to exploit the site or its readers.</li>
        <li>Spam comments, manipulate view or like counts, or otherwise abuse the platform.</li>
        <li>Attempt to access another account, the underlying infrastructure, or source systems.</li>
      </ul>

      <h2>2. Your account</h2>
      <p>
        Accounts are created through Google Sign-In. You are responsible for keeping your Google
        account secure and for everything done under your identity. If you suspect unauthorised
        activity, sign out (which revokes your session) and change your Google password. Notify us
        at <a href="mailto:sainrahul374@gmail.com">sainrahul374@gmail.com</a> if the problem persists.
      </p>

      <h2>3. Your content</h2>
      <p>
        <strong>You own what you write.</strong> Publishing a post on Inkwell does not transfer its
        copyright to us. By posting, you grant Inkwell a limited licence to host, display, and
        distribute that content as needed to run the service — for example, rendering your article
        for a reader, or showing your comment beneath a post.
      </p>
      <p>
        Comments and likes are part of the public conversation around an article and may remain even
        if you later edit or remove the parent post. Deleting your account removes the content you
        own, as described in our <Link to="/privacy">Privacy Policy</Link>.
      </p>

      <h2>4. Moderation</h2>
      <p>
        We do not review every post before it goes live, but we may remove or restrict content that
        violates these terms, that is illegal, or that we believe harms the community or the
        service. We may also suspend or terminate accounts that abuse the platform. Reporting
        concerns is always welcome at{' '}
        <a href="mailto:sainrahul374@gmail.com">sainrahul374@gmail.com</a>.
      </p>

      <h2>5. Admins and publishing</h2>
      <p>
        Posting is limited to accounts with the admin role. Admins are responsible for the accuracy
        of what they publish and for the rights to any cover images they upload. Views and likes are
        recorded once per visit per article to keep the counters honest; gaming them is a violation
        of these terms.
      </p>

      <h2>6. Third-party services</h2>
      <p>
        Inkwell relies on Google for sign-in and Cloudinary for image hosting, and each is governed
        by its own terms. We are not responsible for their availability, policies, or conduct, and
        their use of your data is subject to their respective privacy policies.
      </p>

      <h2>7. Service availability</h2>
      <p>
        We work to keep Inkwell reliable, but the service is provided &ldquo;as is&rdquo; and
        &ldquo;as available&rdquo;. Maintenance, updates, and outages may cause temporary
        interruptions, and features may change or be retired as the platform grows. Where the law
        allows, we exclude warranties and representations about uninterrupted or error-free
        operation.
      </p>

      <h2>8. Limitation of liability</h2>
      <p>
        Inkwell is a small, free platform. To the maximum extent permitted by law, neither Inkwell
        nor its contributors are liable for indirect, incidental, or consequential damages arising
        from your use of the site — including loss of data, content, profits, or reputation — even
        if we were advised of the possibility. Nothing here limits liability that cannot be limited
        under applicable law.
      </p>

      <h2>9. Indemnification</h2>
      <p>
        You agree to hold Inkwell harmless from claims, damages, and expenses arising from content
        you publish or from your violation of these terms.
      </p>

      <h2>10. Changes to these terms</h2>
      <p>
        These terms may change as Inkwell grows. Updates will be posted on this page with a new date,
        and continuing to use Inkwell afterwards means you accept them. When a change is significant,
        we will do our best to surface it rather than bury it in fine print.
      </p>

      <h2>11. Termination</h2>
      <p>
        You may delete your account at any time from your profile page. We may suspend or terminate
        access if these terms are violated or to protect the platform. Sections that by their nature
        should survive — ownership, liability, indemnification — remain in force after termination.
      </p>

      <h2>12. Governing law</h2>
      <p>
        These terms are interpreted under the laws applicable where Inkwell operates, without regard
        to conflict-of-law principles. Disputes will be resolved in the competent courts of that
        jurisdiction.
      </p>

      <h2>13. Contact</h2>
      <p>
        Questions about these terms? Email{' '}
        <a href="mailto:sainrahul374@gmail.com">sainrahul374@gmail.com</a>. For how we handle your
        data, see the <Link to="/privacy">Privacy Policy</Link>. To keep reading, head back{' '}
        <Link to="/">home</Link>.
      </p>
    </LegalPage>
  )
}
