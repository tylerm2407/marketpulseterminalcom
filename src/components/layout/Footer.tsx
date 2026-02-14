export function Footer() {
  return (
    <footer className="border-t border-border bg-muted/50 py-4 mt-8">
      <div className="container mx-auto px-4">
        <p className="text-xs text-muted-foreground text-center leading-relaxed">
          <strong>Disclaimer:</strong> MarketPulse provides information and analysis only. This is not investment advice,
          a recommendation to buy or sell, or a solicitation. Data may be delayed. Consult a licensed financial advisor
          before making investment decisions.{' '}
          <span className="underline cursor-pointer hover:text-foreground transition-colors">See Methodology</span>
        </p>
      </div>
    </footer>
  );
}
