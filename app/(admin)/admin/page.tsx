import { prisma } from "@/lib/db";
import { StatsCards } from "@/components/admin/stats-cards";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Users,
  Store,
  Package,
  DollarSign,
  Receipt,
  ShoppingCart,
  Warehouse,
  Activity,
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Admin Dashboard",
};

export default async function AdminDashboardPage() {
  const [
    userCount,
    storeCount,
    itemCount,
    priceCount,
    receiptCount,
    activeListCount,
    inventoryCount,
    todayUsers,
    recentUsers,
    recentActivity,
  ] = await Promise.all([
    prisma.user.count(),
    prisma.store.count(),
    prisma.item.count(),
    prisma.storePrice.count(),
    prisma.receipt.count(),
    prisma.shoppingList.count({ where: { status: "active" } }),
    prisma.inventoryItem.count(),
    prisma.user.count({
      where: {
        createdAt: { gte: new Date(new Date().setHours(0, 0, 0, 0)) },
      },
    }),
    prisma.user.findMany({
      orderBy: { createdAt: "desc" },
      take: 8,
      select: {
        id: true,
        username: true,
        email: true,
        role: true,
        subscriptionTier: true,
        createdAt: true,
      },
    }),
    prisma.priceFeed.findMany({
      orderBy: { createdAt: "desc" },
      take: 10,
      include: {
        user: { select: { username: true, email: true } },
        item: { select: { name: true } },
        store: { select: { name: true } },
      },
    }),
  ]);

  const stats = [
    { label: "Total Users", value: userCount, icon: Users, description: `${todayUsers} new today` },
    { label: "Stores", value: storeCount, icon: Store },
    { label: "Items", value: itemCount, icon: Package },
    { label: "Prices", value: priceCount, icon: DollarSign },
    { label: "Receipts", value: receiptCount, icon: Receipt },
    { label: "Active Lists", value: activeListCount, icon: ShoppingCart },
    { label: "Inventory Items", value: inventoryCount, icon: Warehouse },
    { label: "Activity Feed", value: recentActivity.length, icon: Activity, description: "Recent entries" },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Admin Dashboard</h1>
        <p className="text-muted-foreground">System overview and recent activity</p>
      </div>

      <StatsCards stats={stats} />

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Recent Users */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Signups</CardTitle>
            <CardDescription>Newest user registrations</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {recentUsers.map((user) => (
                <div
                  key={user.id}
                  className="flex items-center justify-between rounded-md border p-3"
                >
                  <div>
                    <p className="text-sm font-medium">
                      {user.username || user.email}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {user.email}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="text-xs">
                      {user.subscriptionTier}
                    </Badge>
                    <span className="text-xs text-muted-foreground">
                      {formatDistanceToNow(user.createdAt, { addSuffix: true })}
                    </span>
                  </div>
                </div>
              ))}
              {recentUsers.length === 0 && (
                <p className="text-sm text-muted-foreground">No users yet.</p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>Latest price feed entries</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {recentActivity.map((entry) => (
                <div
                  key={entry.id}
                  className="flex items-center justify-between rounded-md border p-3"
                >
                  <div>
                    <p className="text-sm font-medium">
                      {entry.action}
                      {entry.item?.name && (
                        <span className="text-muted-foreground">
                          {" "}&mdash; {entry.item.name}
                        </span>
                      )}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      by {entry.user?.username || entry.user?.email || "System"}
                      {entry.store && ` at ${entry.store.name}`}
                    </p>
                  </div>
                  <div className="text-right">
                    {entry.price && (
                      <p className="text-sm font-semibold">
                        ${Number(entry.price).toFixed(2)}
                      </p>
                    )}
                    <p className="text-xs text-muted-foreground">
                      {formatDistanceToNow(entry.createdAt, { addSuffix: true })}
                    </p>
                  </div>
                </div>
              ))}
              {recentActivity.length === 0 && (
                <p className="text-sm text-muted-foreground">No activity yet.</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
