import { Footer } from '@/components/layout/Footer';

export default function PrivacyPolicy() {
  return (
    <div className="min-h-screen bg-background pb-16 sm:pb-0">
      <section className="container mx-auto px-4 py-12 max-w-3xl">
        <h1 className="text-3xl font-bold text-foreground mb-2">Privacy Policy</h1>
        <p className="text-sm text-muted-foreground mb-8">Last updated: February 2026</p>

        <div className="prose prose-sm max-w-none space-y-8 text-foreground">

          <section>
            <h2 className="text-lg font-semibold text-foreground mb-2">1. Overview</h2>
            <p className="text-muted-foreground leading-relaxed">
              MarketPulseTerminal ("we", "us", "our") is operated by NovaWealth. This policy explains
              what data we collect, how we use it, and your rights. We are committed to your privacy
              and will never sell your personal data.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground mb-2">2. Data We Collect</h2>
            <ul className="list-disc pl-5 space-y-1 text-muted-foreground">
              <li><strong className="text-foreground">Account data:</strong> Email address and authentication credentials when you sign up.</li>
              <li><strong className="text-foreground">Usage data:</strong> Pages visited, features used, and AI query counts to manage service limits.</li>
              <li><strong className="text-foreground">Watchlist & Portfolio:</strong> Stocks you save, portfolio holdings, and price alerts you set.</li>
              <li><strong className="text-foreground">Device & technical data:</strong> IP address, device type, OS version, and crash logs for debugging.</li>
              <li><strong className="text-foreground">Push notification tokens:</strong> Device tokens to deliver price alerts and market notifications (native app only).</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground mb-2">3. How We Use Your Data</h2>
            <ul className="list-disc pl-5 space-y-1 text-muted-foreground">
              <li>Provide and improve the MarketPulseTerminal service.</li>
              <li>Authenticate your account and protect against fraud.</li>
              <li>Send price alerts and notifications you have opted into.</li>
              <li>Monitor and enforce AI usage limits to keep the service sustainable.</li>
              <li>Comply with legal obligations.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground mb-2">4. Data Sharing</h2>
            <p className="text-muted-foreground leading-relaxed">
              We do <strong className="text-foreground">not</strong> sell or rent your personal data.
              We share data only with:
            </p>
            <ul className="list-disc pl-5 space-y-1 text-muted-foreground mt-2">
              <li><strong className="text-foreground">Infrastructure providers</strong> (cloud hosting, database) under strict data processing agreements.</li>
              <li><strong className="text-foreground">Payment processors</strong> (Stripe) for subscription billing — we never see your full card details.</li>
              <li><strong className="text-foreground">Analytics providers</strong> for aggregate, anonymised usage data.</li>
              <li><strong className="text-foreground">Law enforcement</strong> where required by law.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground mb-2">5. Push Notifications</h2>
            <p className="text-muted-foreground leading-relaxed">
              The native iOS/Android app may request permission to send push notifications for price alerts
              and market updates. You can revoke this permission at any time in your device Settings.
              Revoking notifications does not affect your account.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground mb-2">6. Data Retention</h2>
            <p className="text-muted-foreground leading-relaxed">
              We retain your account data for as long as your account is active. Deleting your account
              removes all personal data within 30 days, except where retention is required by law.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground mb-2">7. Your Rights</h2>
            <p className="text-muted-foreground leading-relaxed">
              Depending on your location, you may have the right to access, correct, delete, or export
              your data. To exercise any right, contact us at{' '}
              <a href="mailto:privacy@novawealth.com" className="text-accent underline">
                privacy@novawealth.com
              </a>.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground mb-2">8. Investment Disclaimer</h2>
            <p className="text-muted-foreground leading-relaxed">
              MarketPulseTerminal provides information and analysis only. Nothing in this app constitutes
              investment advice, a recommendation to buy or sell any security, or a solicitation.
              Always consult a licensed financial advisor before making investment decisions.
              Data may be delayed.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground mb-2">9. Contact</h2>
            <p className="text-muted-foreground leading-relaxed">
              NovaWealth — MarketPulseTerminal<br />
              Email:{' '}
              <a href="mailto:privacy@novawealth.com" className="text-accent underline">
                privacy@novawealth.com
              </a>
            </p>
          </section>
        </div>
      </section>
      <Footer />
    </div>
  );
}
