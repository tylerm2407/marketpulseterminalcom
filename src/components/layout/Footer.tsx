import { Link } from 'react-router-dom';

export function Footer() {
  return (
    <footer className="border-t border-[var(--border-subtle)] py-4 mt-8" style={{ background: 'var(--bg-surface)' }}>
      <div className="container mx-auto px-4">
        <p className="text-xs text-[var(--text-muted)] text-center leading-relaxed">
          <strong className="text-[var(--text-secondary)]">Disclaimer:</strong> MarketPulse provides information and analysis only. This is not investment advice,
          a recommendation to buy or sell, or a solicitation. Data may be delayed. Consult a licensed financial advisor
          before making investment decisions.{' '}
          <span className="underline cursor-pointer hover:text-[var(--text-secondary)] transition-colors">See Methodology</span>
        </p>
        <div className="flex items-center justify-center gap-4 mt-2">
          <Link to="/privacy" className="text-xs text-[var(--text-muted)] hover:text-[var(--accent-primary)] transition-colors underline">
            Privacy Policy
          </Link>
        </div>
      </div>
    </footer>
  );
}
