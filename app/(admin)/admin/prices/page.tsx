import { Suspense } from "react";
import { prisma } from "@/lib/db";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { AdminSearch } from "@/components/admin/admin-search";
import { AdminPagination } from "@/components/admin/admin-pagination";
import { PriceActions } from "@/components/admin/price-actions";
import { formatDistanceToNow } from "date-fns";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Manage Prices" };

const PAGE_SIZE = 20;

export default async function AdminPricesPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; page?: string }>;
}) {
  const params = await searchParams;
  const query = params.q || "";
  const page = Math.max(1, parseInt(params.page || "1"));

  const where = query
    ? {
        OR: [
          { item: { name: { contains: query, mode: "insensitive" as const } } },
          { store: { name: { contains: query, mode: "insensitive" as const } } },
        ],
      }
    : {};

  const [prices, totalCount] = await Promise.all([
    prisma.storePrice.findMany({
      where,
      orderBy: { updatedAt: "desc" },
      skip: (page - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
      include: {
        item: { select: { name: true, brand: true } },
        store: { select: { name: true, city: true, state: true } },
        user: { select: { username: true, email: true } },
      },
    }),
    prisma.storePrice.count({ where }),
  ]);

  const totalPages = Math.ceil(totalCount / PAGE_SIZE);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Prices</h1>
        <p className="text-muted-foreground">{totalCount} total price records</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Price Management</CardTitle>
          <CardDescription>View and manage all submitted prices</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Suspense>
            <AdminSearch placeholder="Search by item or store name..." />
          </Suspense>

          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-16">ID</TableHead>
                  <TableHead>Item</TableHead>
                  <TableHead>Store</TableHead>
                  <TableHead>Price</TableHead>
                  <TableHead>Shared</TableHead>
                  <TableHead>Verifications</TableHead>
                  <TableHead>Submitter</TableHead>
                  <TableHead>Updated</TableHead>
                  <TableHead className="w-16" />
                </TableRow>
              </TableHeader>
              <TableBody>
                {prices.map((price) => (
                  <TableRow key={price.id}>
                    <TableCell className="font-mono text-xs">{price.id}</TableCell>
                    <TableCell className="font-medium">
                      {price.item.name}
                      {price.item.brand && (
                        <span className="text-muted-foreground text-xs ml-1">
                          ({price.item.brand})
                        </span>
                      )}
                    </TableCell>
                    <TableCell>
                      {price.store.name}
                      <span className="text-muted-foreground text-xs block">
                        {price.store.city}, {price.store.state}
                      </span>
                    </TableCell>
                    <TableCell className="font-semibold">
                      ${Number(price.price).toFixed(2)}
                    </TableCell>
                    <TableCell>
                      <Badge variant={price.isShared ? "default" : "outline"}>
                        {price.isShared ? "Shared" : "Private"}
                      </Badge>
                    </TableCell>
                    <TableCell>{price.verifiedCount}</TableCell>
                    <TableCell className="text-sm">
                      {price.user?.username || price.user?.email || "—"}
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground">
                      {formatDistanceToNow(price.updatedAt, { addSuffix: true })}
                    </TableCell>
                    <TableCell>
                      <PriceActions priceId={price.id} />
                    </TableCell>
                  </TableRow>
                ))}
                {prices.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={9} className="text-center text-muted-foreground py-8">
                      No prices found.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>

          <Suspense>
            <AdminPagination totalPages={totalPages} currentPage={page} />
          </Suspense>
        </CardContent>
      </Card>
    </div>
  );
}
