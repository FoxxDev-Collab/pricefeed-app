import Link from "next/link";
import { DollarSign } from "lucide-react";

export function MarketingFooter() {
  return (
    <footer className="border-t bg-muted/50">
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col items-center justify-between gap-4 md:flex-row">
          <div className="flex items-center gap-2">
            <DollarSign className="h-5 w-5 text-primary" />
            <span className="font-semibold">PriceFeed</span>
          </div>
          <nav className="flex gap-6 text-sm text-muted-foreground">
            <Link href="/pricing" className="hover:text-foreground transition-colors">
              Pricing
            </Link>
          </nav>
          <p className="text-sm text-muted-foreground">
            &copy; {new Date().getFullYear()} PriceFeed. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
