import { Link } from 'react-router'
import { LegalPage } from './legal-page'
import { useSeo } from '../../../../hooks/use-seo'
import { SITE_NAME } from '../../../../lib/seo'

export function PrivacyPolicy() {
  useSeo({
    title: `Privacy Policy — ${SITE_NAME}`,
    description:
      'How Inkwell handles account data, authentication cookies, analytics and your privacy choices.',
    path: '/privacy',
  })

  return (
    <LegalPage eyebrow="Legal" title="Privacy Policy" updatedAt="25 September 2026">
      <p>
        Inkwell (&ldquo;we&rdquo;, &ldquo;us&rdquo;) is a blogging platform where readers explore
        published stories and admins write richly formatted posts. This policy explains, in plain
        language, what information we collect, why we collect it, and the control you have over it.
      </p>

      <h2>1. Information we collect</h2>
      <h3>Information you provide</h3>
      <ul>
        <li>
          <strong>Account details.</strong> Inkwell uses Google Sign-In as its sole identity
          provider. When you sign in, Google shares the name, email address, and profile picture
          associated with your Google account.
        </li>
        <li>
          <strong>Profile details.</strong> The username and avatar you choose, which you can change
          at any time from your profile page.
        </li>
        <li>
          <strong>Content you publish.</strong> The posts, cover images, comments, and tags you
          create on Inkwell.
        </li>
      </ul>
      <h3>Information collected automatically</h3>
      <ul>
        <li>
          <strong>Usage data.</strong> Broad, aggregate metrics such as view counts and like totals.
          Views are recorded once per visit per article so the counter stays meaningful without
          tracking your every move.
        </li>
        <li>
          <strong>Technical data.</strong> Standard request information (IP address, browser type)
          needed to serve the site and keep it secure. We do not build an advertising profile from
          this.
        </li>
        <li>
          <strong>Local preferences.</strong> Your theme choice (dark or light) is stored in your
          browser&rsquo;s local storage so it survives a reload. It never reaches our servers.
        </li>
      </ul>

      <h2>2. Authentication tokens</h2>
      <p>
        When you sign in we issue two tokens. A short-lived <strong>access token</strong> (about 15
        minutes) kept in memory while you browse, and a long-lived <strong>refresh token</strong>
        (7 days) stored in an <code>httpOnly</code>, <code>secure</code>, <code>sameSite</code>
        cookie that JavaScript on the page cannot read. The refresh token is stored on our side only
        as an irreversibly hashed value, so a database leak cannot replay your session. Signing out
        revokes it immediately.
      </p>

      <h2>3. How we use your information</h2>
      <ul>
        <li>To create and secure your account, and to keep you signed in safely.</li>
        <li>To display your name and avatar next to content you publish.</li>
        <li>To power the features you use: comments, likes, and view counts.</li>
        <li>To operate, monitor, and protect the service against abuse.</li>
      </ul>
      <p>
        We do <strong>not</strong> sell your personal information, rent it, or share it for
        cross-context behavioural advertising.
      </p>

      <h2>4. How we share your information</h2>
      <p>We share data only with the providers that keep Inkwell running:</p>
      <ul>
        <li>
          <strong>Google</strong> — to authenticate your sign-in. Their use of your data is governed
          by Google&rsquo;s own privacy policy.
        </li>
        <li>
          <strong>Cloudinary</strong> — to host cover images and avatars you upload. Uploaded files
          are sent directly to Cloudinary and never touch our servers.
        </li>
        <li>
          <strong>Neon Postgres &amp; Redis</strong> — our database and token store. Redis holds only
          the hash of your refresh token.
        </li>
      </ul>
      <p>
        We may disclose information when required by law, or to protect the rights, property, or
        safety of Inkwell and its readers.
      </p>

      <h2>5. Content sanitisation</h2>
      <p>
        Post HTML is sanitised with DOMPurify before it is stored, and images are disabled inside
        inline content, so a malicious script or payload cannot reach another reader&rsquo;s browser
        through an article body.
      </p>

      <h2>6. Data retention</h2>
      <p>
        Your content stays for as long as your account exists. Deleting your account removes your
        profile and cascades to your comments, likes, and posts. Aggregated, non-identifying counts
        (such as total views on an article) may remain.
      </p>

      <h2>7. Your rights</h2>
      <ul>
        <li><strong>Access</strong> — ask what data we hold about you.</li>
        <li><strong>Correction</strong> — fix your username or avatar at any time.</li>
        <li><strong>Deletion</strong> — erase your account and its content.</li>
        <li><strong>Withdrawal</strong> — sign out to revoke the refresh token immediately.</li>
      </ul>
      <p>
        To exercise any of these, email{' '}
        <a href="mailto:sainrahul374@gmail.com">sainrahul374@gmail.com</a>. Depending on where you
        live, you may have additional rights under local law (for example the GDPR or CCPA).
      </p>

      <h2>8. Children&rsquo;s privacy</h2>
      <p>
        Inkwell is a general-audience publishing platform and is not directed at children under 13.
        We do not knowingly collect their data. If you believe a minor has registered, contact us and
        we will remove the account.
      </p>

      <h2>9. Changes to this policy</h2>
      <p>
        As Inkwell evolves, this policy may change. Material changes will be reflected on this page
        with an updated date; continued use after that means you accept the revised terms.
      </p>

      <h2>10. Contact</h2>
      <p>
        Questions about this policy? Write to{' '}
        <a href="mailto:sainrahul374@gmail.com">sainrahul374@gmail.com</a>, or head back to the{' '}
        <Link to="/">home page</Link>.
      </p>
    </LegalPage>
  )
}
