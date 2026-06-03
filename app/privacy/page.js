import LegalLayout, { H2 } from '@/app/LegalLayout';

export const metadata = {
  title: 'Privacy Policy | Source of Truths',
  description: 'How Source of Truths collects and uses information.',
};

export default function PrivacyPage() {
  return (
    <LegalLayout
      kicker="Legal"
      title="Privacy"
      italic="policy"
      updated="May 2026"
    >
      <p>
        This Privacy Policy describes how Source of Truths ("we", "us", "the site") collects and uses information when you visit. We aim to keep things simple and to collect only what we need to operate the site.
      </p>

      <H2>What we collect</H2>
      <p>
        <strong>Votes and submissions.</strong> When you upvote, downvote, add an entry to a list, or submit a new list, we store that action in our database. Submissions are tied to no personal identifier other than the IP address recorded in our server logs.
      </p>
      <p>
        <strong>Local storage in your browser.</strong> We use your browser's local storage to remember which items you have already voted on, so you can change your mind but not vote twice on the same item from the same browser. This data never leaves your device.
      </p>
      <p>
        <strong>Server logs.</strong> Our hosting provider (Vercel) records standard request logs including IP addresses, timestamps, requested URLs, and user agents. These logs are used for debugging and abuse prevention. They are retained according to Vercel's policy.
      </p>
      <p>
        <strong>Cookies.</strong> We do not use tracking cookies. The only cookie we set is an authentication cookie for site administrators, which is not relevant to ordinary visitors.
      </p>

      <H2>Third parties</H2>
      <p>
        <strong>Supabase</strong> hosts our database. Vote and submission data is stored there. See their privacy policy at supabase.com/privacy.
      </p>
      <p>
        <strong>Vercel</strong> hosts the site. See vercel.com/legal/privacy-policy.
      </p>
      <p>
        <strong>Google Fonts</strong> serves our typography. Requests to fonts.googleapis.com include standard request metadata. See policies.google.com/privacy.
      </p>
      <p>
        <strong>Amazon Associates and other affiliate networks.</strong> Outbound links to merchants may include affiliate identifiers that allow us to receive a commission on qualifying purchases. When you click such a link, the merchant may set its own cookies and collect its own data per its own privacy policy. We do not share any of your data with these networks beyond the click itself.
      </p>

      <H2>What we don't do</H2>
      <p>
        We do not sell your data. We do not run advertising trackers. We do not build profiles of individual visitors. We do not require an account to read the site or vote.
      </p>

      <H2>Your rights</H2>
      <p>
        If you submitted a list and want it removed, or you would like to know what we have stored that relates to you, contact us at the email address below. We will respond within a reasonable time.
      </p>

      <H2>Children</H2>
      <p>
        Source of Truths is not directed at children under 13. We do not knowingly collect information from children. If you believe a child has submitted content, please contact us and we will remove it.
      </p>

      <H2>Changes to this policy</H2>
      <p>
        We may update this policy from time to time. The date at the top reflects the most recent change. Substantial changes will be announced on the home page.
      </p>

      <H2>Contact</H2>
      <p>
        Questions about this policy can be sent to <strong>consensusgurus@gmail.com</strong>.
      </p>
    </LegalLayout>
  );
}
