import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  DollarSign,
  ShoppingCart,
  Receipt,
  Warehouse,
  TrendingUp,
  Users,
  MapPin,
  BarChart3,
} from "lucide-react";

const features = [
  {
    icon: DollarSign,
    title: "Community Price Tracking",
    description:
      "Submit and verify grocery prices at local stores. Crowdsourced data you can trust.",
  },
  {
    icon: ShoppingCart,
    title: "Smart Shopping Lists",
    description:
      "Create lists and get optimized shopping plans that minimize your total spend across stores.",
  },
  {
    icon: Receipt,
    title: "Receipt Scanning",
    description:
      "Upload receipt photos for automatic price extraction using AI-powered OCR.",
  },
  {
    icon: Warehouse,
    title: "Inventory Management",
    description:
      "Track your pantry items, get low-stock alerts, and expiration date warnings.",
  },
  {
    icon: BarChart3,
    title: "Price Comparison",
    description:
      "Side-by-side price comparison across stores. Find the best deals at a glance.",
  },
  {
    icon: TrendingUp,
    title: "Spending Analytics",
    description:
      "Track monthly spending with detailed breakdowns by store and category.",
  },
  {
    icon: MapPin,
    title: "Store Discovery",
    description:
      "Find nearby stores on a map and import them directly into your price tracking.",
  },
  {
    icon: Users,
    title: "Community Driven",
    description:
      "Earn reputation points for contributions. Verified data from real shoppers.",
  },
];

export default function HomePage() {
  return (
    <div>
      {/* Hero Section */}
      <section className="container mx-auto px-4 py-24 text-center">
        <h1 className="text-4xl font-bold tracking-tight sm:text-6xl">
          Save Money on{" "}
          <span className="text-primary">Every Grocery Trip</span>
        </h1>
        <p className="mx-auto mt-6 max-w-2xl text-lg text-muted-foreground">
          PriceFeed is a community-driven platform for tracking grocery prices,
          comparing stores, and optimizing your shopping to spend less.
        </p>
        <div className="mt-10 flex items-center justify-center gap-4">
          <Button size="lg" asChild>
            <Link href="/register">Start Saving Free</Link>
          </Button>
          <Button variant="outline" size="lg" asChild>
            <Link href="/pricing">View Pricing</Link>
          </Button>
        </div>
      </section>

      {/* Features Grid */}
      <section className="container mx-auto px-4 pb-24">
        <h2 className="mb-12 text-center text-3xl font-bold">
          Everything You Need to Shop Smarter
        </h2>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {features.map((feature) => (
            <Card key={feature.title}>
              <CardHeader>
                <feature.icon className="h-10 w-10 text-primary" />
                <CardTitle className="mt-4">{feature.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>{feature.description}</CardDescription>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* CTA Section */}
      <section className="border-t bg-muted/50">
        <div className="container mx-auto px-4 py-24 text-center">
          <h2 className="text-3xl font-bold">Ready to Start Saving?</h2>
          <p className="mx-auto mt-4 max-w-xl text-muted-foreground">
            Join the PriceFeed community and start tracking prices today. Free
            to get started, upgrade anytime.
          </p>
          <Button size="lg" className="mt-8" asChild>
            <Link href="/register">Create Free Account</Link>
          </Button>
        </div>
      </section>
    </div>
  );
}
