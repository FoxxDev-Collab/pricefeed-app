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
import { StoreActions } from "@/components/admin/store-actions";
import { formatDistanceToNow } from "date-fns";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Manage Stores" };

const PAGE_SIZE = 20;

export default async function AdminStoresPage({
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
          { name: { contains: query, mode: "insensitive" as const } },
          { city: { contains: query, mode: "insensitive" as const } },
          { chain: { contains: query, mode: "insensitive" as const } },
        ],
      }
    : {};

  const [stores, totalCount] = await Promise.all([
    prisma.store.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
      include: {
        region: { select: { name: true, state: true } },
        creator: { select: { username: true, email: true } },
        _count: { select: { storePrices: true } },
      },
    }),
    prisma.store.count({ where }),
  ]);

  const totalPages = Math.ceil(totalCount / PAGE_SIZE);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Stores</h1>
        <p className="text-muted-foreground">{totalCount} total stores</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Store Management</CardTitle>
          <CardDescription>View and manage all stores</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Suspense>
            <AdminSearch placeholder="Search by name, city, or chain..." />
          </Suspense>

          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-16">ID</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Location</TableHead>
                  <TableHead>Region</TableHead>
                  <TableHead>Chain</TableHead>
                  <TableHead>Prices</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Creator</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead className="w-16" />
                </TableRow>
              </TableHeader>
              <TableBody>
                {stores.map((store) => (
                  <TableRow key={store.id}>
                    <TableCell className="font-mono text-xs">{store.id}</TableCell>
                    <TableCell className="font-medium">{store.name}</TableCell>
                    <TableCell className="text-sm">
                      {store.city}, {store.state} {store.zipCode}
                    </TableCell>
                    <TableCell className="text-sm">
                      {store.region ? `${store.region.name}, ${store.region.state}` : "—"}
                    </TableCell>
                    <TableCell>{store.chain || "—"}</TableCell>
                    <TableCell>{store._count.storePrices}</TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        <Badge variant={store.verified ? "default" : "secondary"}>
                          {store.verified ? "Verified" : "Unverified"}
                        </Badge>
                        <Badge variant={store.isPrivate ? "outline" : "secondary"}>
                          {store.isPrivate ? "Private" : "Public"}
                        </Badge>
                      </div>
                    </TableCell>
                    <TableCell className="text-sm">
                      {store.creator?.username || store.creator?.email || "—"}
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground">
                      {formatDistanceToNow(store.createdAt, { addSuffix: true })}
                    </TableCell>
                    <TableCell>
                      <StoreActions
                        storeId={store.id}
                        isVerified={store.verified}
                        isPrivate={store.isPrivate}
                      />
                    </TableCell>
                  </TableRow>
                ))}
                {stores.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={10} className="text-center text-muted-foreground py-8">
                      No stores found.
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
