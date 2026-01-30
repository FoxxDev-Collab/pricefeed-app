import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { redirect } from "next/navigation";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Package,
  Store,
  DollarSign,
  ShoppingCart,
  Receipt,
  Warehouse,
  Star,
} from "lucide-react";
import { getReputationLevel } from "@/lib/constants";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Dashboard",
};

export default async function DashboardPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const userId = parseInt(session.user.id);

  const [
    itemCount,
    storeCount,
    priceCount,
    listCount,
    receiptCount,
    inventoryCount,
    user,
    recentActivity,
  ] = await Promise.all([
    prisma.item.count({ where: { createdBy: userId } }),
    prisma.store.count({ where: { createdBy: userId } }),
    prisma.storePrice.count({ where: { userId } }),
    prisma.shoppingList.count({ where: { userId, status: "active" } }),
    prisma.receipt.count({ where: { userId } }),
    prisma.inventoryItem.count({ where: { userId } }),
    prisma.user.findUnique({
      where: { id: userId },
      select: { reputationPoints: true, subscriptionTier: true, username: true },
    }),
    prisma.priceFeed.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      take: 5,
      include: { item: true, store: true },
    }),
  ]);

  const stats = [
    { label: "Items", value: itemCount, icon: Package },
    { label: "Stores", value: storeCount, icon: Store },
    { label: "Prices Submitted", value: priceCount, icon: DollarSign },
    { label: "Active Lists", value: listCount, icon: ShoppingCart },
    { label: "Receipts", value: receiptCount, icon: Receipt },
    { label: "Inventory Items", value: inventoryCount, icon: Warehouse },
  ];

  const reputationLevel = getReputationLevel(user?.reputationPoints ?? 0);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">
          Welcome back{user?.username ? `, ${user.username}` : ""}
        </h1>
        <div className="mt-2 flex items-center gap-3">
          <Badge variant="secondary">{user?.subscriptionTier} plan</Badge>
          <div className="flex items-center gap-1 text-sm text-muted-foreground">
            <Star className="h-4 w-4 text-yellow-500" />
            {user?.reputationPoints ?? 0} points &middot; {reputationLevel}
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {stats.map((stat) => (
          <Card key={stat.label}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {stat.label}
              </CardTitle>
              <stat.icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
          <CardDescription>Your latest price feed contributions</CardDescription>
        </CardHeader>
        <CardContent>
          {recentActivity.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              No activity yet. Start by adding items and submitting prices!
            </p>
          ) : (
            <div className="space-y-3">
              {recentActivity.map((activity) => (
                <div
                  key={activity.id}
                  className="flex items-center justify-between rounded-md border p-3"
                >
                  <div>
                    <p className="text-sm font-medium">
                      {activity.action}{" "}
                      {activity.item?.name && (
                        <span className="text-muted-foreground">
                          &mdash; {activity.item.name}
                        </span>
                      )}
                    </p>
                    {activity.store && (
                      <p className="text-xs text-muted-foreground">
                        at {activity.store.name}
                      </p>
                    )}
                  </div>
                  {activity.price && (
                    <span className="text-sm font-semibold">
                      ${Number(activity.price).toFixed(2)}
                    </span>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
