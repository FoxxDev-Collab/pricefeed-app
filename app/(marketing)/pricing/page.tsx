import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Check } from "lucide-react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Pricing",
};

const tiers = [
  {
    name: "Free",
    price: "$0",
    description: "Get started with community price tracking",
    features: [
      "Track up to 50 items",
      "5 stores",
      "3 active shopping lists",
      "50 price submissions/month",
      "3 receipt scans/month",
      "25 inventory items",
      "Single-store shopping plans",
      "30 days price history",
      "Compare up to 3 stores",
    ],
    cta: "Get Started Free",
    href: "/register",
    highlighted: false,
  },
  {
    name: "Pro",
    price: "$9",
    period: "/month",
    description: "For serious bargain hunters",
    features: [
      "Unlimited items",
      "25 stores",
      "20 active shopping lists",
      "500 price submissions/month",
      "30 receipt scans/month",
      "200 inventory items",
      "Multi-store shopping optimization",
      "1 year price history",
      "Compare up to 10 stores",
      "Email list sharing",
      "CSV data export",
    ],
    cta: "Start Pro Trial",
    href: "/register",
    highlighted: true,
  },
  {
    name: "Business",
    price: "$29",
    period: "/month",
    description: "For families and power users",
    features: [
      "Everything in Pro, plus:",
      "Unlimited stores",
      "Unlimited shopping lists",
      "Unlimited price submissions",
      "Unlimited receipt scans",
      "Unlimited inventory items",
      "Unlimited price history",
      "Unlimited store comparisons",
      "Team list sharing",
      "CSV + JSON data export",
      "Priority support",
    ],
    cta: "Start Business Trial",
    href: "/register",
    highlighted: false,
  },
];

export default function PricingPage() {
  return (
    <div className="container mx-auto px-4 py-24">
      <div className="text-center">
        <h1 className="text-4xl font-bold">Simple, Transparent Pricing</h1>
        <p className="mx-auto mt-4 max-w-xl text-lg text-muted-foreground">
          Start free, upgrade when you need more. No hidden fees.
        </p>
      </div>

      <div className="mx-auto mt-16 grid max-w-5xl gap-8 lg:grid-cols-3">
        {tiers.map((tier) => (
          <Card
            key={tier.name}
            className={
              tier.highlighted
                ? "border-primary shadow-lg relative"
                : "relative"
            }
          >
            {tier.highlighted && (
              <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                <span className="rounded-full bg-primary px-3 py-1 text-xs font-semibold text-primary-foreground">
                  Most Popular
                </span>
              </div>
            )}
            <CardHeader>
              <CardTitle>{tier.name}</CardTitle>
              <CardDescription>{tier.description}</CardDescription>
              <div className="mt-4">
                <span className="text-4xl font-bold">{tier.price}</span>
                {tier.period && (
                  <span className="text-muted-foreground">{tier.period}</span>
                )}
              </div>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3">
                {tier.features.map((feature) => (
                  <li key={feature} className="flex items-start gap-2">
                    <Check className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                    <span className="text-sm">{feature}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
            <CardFooter>
              <Button
                className="w-full"
                variant={tier.highlighted ? "default" : "outline"}
                asChild
              >
                <Link href={tier.href}>{tier.cta}</Link>
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  );
}
