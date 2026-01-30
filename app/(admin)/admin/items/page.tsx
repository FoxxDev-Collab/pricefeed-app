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
import { ItemActions } from "@/components/admin/item-actions";
import { formatDistanceToNow } from "date-fns";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Manage Items" };

const PAGE_SIZE = 20;

export default async function AdminItemsPage({
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
          { brand: { contains: query, mode: "insensitive" as const } },
        ],
      }
    : {};

  const [items, totalCount] = await Promise.all([
    prisma.item.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
      include: {
        creator: { select: { username: true, email: true } },
        _count: { select: { storePrices: true, itemTags: true } },
      },
    }),
    prisma.item.count({ where }),
  ]);

  const totalPages = Math.ceil(totalCount / PAGE_SIZE);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Items</h1>
        <p className="text-muted-foreground">{totalCount} total items</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Item Management</CardTitle>
          <CardDescription>View and manage all catalog items</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Suspense>
            <AdminSearch placeholder="Search by name or brand..." />
          </Suspense>

          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-16">ID</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Brand</TableHead>
                  <TableHead>Size</TableHead>
                  <TableHead>Prices</TableHead>
                  <TableHead>Tags</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Creator</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead className="w-16" />
                </TableRow>
              </TableHeader>
              <TableBody>
                {items.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell className="font-mono text-xs">{item.id}</TableCell>
                    <TableCell className="font-medium">{item.name}</TableCell>
                    <TableCell>{item.brand || "—"}</TableCell>
                    <TableCell>
                      {item.size ? `${Number(item.size)} ${item.unit || ""}`.trim() : "—"}
                    </TableCell>
                    <TableCell>{item._count.storePrices}</TableCell>
                    <TableCell>{item._count.itemTags}</TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        <Badge variant={item.verified ? "default" : "secondary"}>
                          {item.verified ? "Verified" : "Unverified"}
                        </Badge>
                        <Badge variant={item.isPrivate ? "outline" : "secondary"}>
                          {item.isPrivate ? "Private" : "Public"}
                        </Badge>
                      </div>
                    </TableCell>
                    <TableCell className="text-sm">
                      {item.creator?.username || item.creator?.email || "—"}
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground">
                      {formatDistanceToNow(item.createdAt, { addSuffix: true })}
                    </TableCell>
                    <TableCell>
                      <ItemActions
                        itemId={item.id}
                        isVerified={item.verified}
                        isPrivate={item.isPrivate}
                      />
                    </TableCell>
                  </TableRow>
                ))}
                {items.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={10} className="text-center text-muted-foreground py-8">
                      No items found.
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
