import { Footer } from '@/components/layout/Footer';

export default function TermsOfService() {
  return (
    <div className="min-h-screen bg-background pb-16 sm:pb-0">
      <section className="container mx-auto px-4 py-12 max-w-3xl">
        <h1 className="text-3xl font-bold text-foreground mb-6">Terms of Service</h1>
        <p className="text-sm text-muted-foreground mb-4">Last updated: March 8, 2026</p>

        <div className="prose prose-invert prose-sm max-w-none space-y-6 text-muted-foreground">
          <section>
            <h2 className="text-lg font-semibold text-foreground">1. Acceptance of Terms</h2>
            <p>By accessing or using MarketPulse ("the Service"), you agree to be bound by these Terms of Service. If you do not agree, you may not use the Service.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground">2. Description of Service</h2>
            <p>MarketPulse provides AI-powered stock analysis, market data, price alerts, portfolio tracking, and related financial information tools. The Service is offered in free and paid tiers.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground">3. Not Financial Advice</h2>
            <p>MarketPulse is for informational and educational purposes only. Nothing on this platform constitutes investment advice, a recommendation to buy or sell securities, or a solicitation of any kind. Always consult a licensed financial advisor before making investment decisions. Market data may be delayed.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground">4. User Accounts</h2>
            <p>You are responsible for maintaining the confidentiality of your account credentials and for all activities under your account. You must provide accurate information when creating an account.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground">5. Subscriptions & Billing</h2>
            <p>Paid subscriptions are billed through Stripe. You may cancel at any time; cancellation takes effect at the end of the current billing period. Refunds are handled on a case-by-case basis. Free trials, if offered, convert to paid subscriptions unless cancelled before the trial ends.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground">6. Referral Program</h2>
            <p>Referral rewards are subject to the NovaWealth referral program terms. MarketPulse reserves the right to modify or terminate the referral program at any time. Abuse of the referral system may result in account suspension.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground">7. Acceptable Use</h2>
            <p>You agree not to: (a) use the Service for any unlawful purpose; (b) attempt to gain unauthorized access to any part of the Service; (c) scrape, crawl, or automated-harvest data from the Service; (d) interfere with the Service's operation or security.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground">8. Intellectual Property</h2>
            <p>All content, branding, and technology on MarketPulse are owned by NovaWealth or its licensors. You may not reproduce, distribute, or create derivative works without written permission.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground">9. Data Accuracy & Limitation of Liability</h2>
            <p>While we strive for accuracy, MarketPulse does not guarantee the completeness or reliability of any data, analysis, or AI-generated content. The Service is provided "as is" without warranties of any kind. In no event shall MarketPulse or NovaWealth be liable for any damages arising from your use of the Service.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground">10. Termination</h2>
            <p>We reserve the right to suspend or terminate your access at any time for violation of these terms or for any other reason at our sole discretion.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground">11. Changes to Terms</h2>
            <p>We may update these Terms from time to time. Continued use of the Service after changes constitutes acceptance of the updated Terms.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground">12. Contact</h2>
            <p>For questions about these Terms, contact us at support@novawealthhq.com.</p>
          </section>
        </div>
      </section>
      <Footer />
    </div>
  );
}
