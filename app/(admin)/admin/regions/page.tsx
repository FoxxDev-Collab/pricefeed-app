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
import { AdminSearch } from "@/components/admin/admin-search";
import { AdminPagination } from "@/components/admin/admin-pagination";
import { RegionFormDialog } from "@/components/admin/region-form-dialog";
import { RegionDeleteButton } from "@/components/admin/region-delete-button";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Manage Regions" };

const PAGE_SIZE = 25;

export default async function AdminRegionsPage({
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
          { state: { contains: query, mode: "insensitive" as const } },
        ],
      }
    : {};

  const [regions, totalCount] = await Promise.all([
    prisma.region.findMany({
      where,
      orderBy: [{ state: "asc" }, { name: "asc" }],
      skip: (page - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
      include: {
        _count: { select: { users: true, stores: true } },
      },
    }),
    prisma.region.count({ where }),
  ]);

  const totalPages = Math.ceil(totalCount / PAGE_SIZE);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Regions</h1>
          <p className="text-muted-foreground">{totalCount} total regions</p>
        </div>
        <RegionFormDialog mode="create" />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Region Management</CardTitle>
          <CardDescription>
            Manage geographic regions and their zip code assignments
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Suspense>
            <AdminSearch placeholder="Search by name or state..." />
          </Suspense>

          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-16">ID</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>State</TableHead>
                  <TableHead>Zip Codes</TableHead>
                  <TableHead>Users</TableHead>
                  <TableHead>Stores</TableHead>
                  <TableHead className="w-24">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {regions.map((region) => (
                  <TableRow key={region.id}>
                    <TableCell className="font-mono text-xs">{region.id}</TableCell>
                    <TableCell className="font-medium">{region.name}</TableCell>
                    <TableCell>{region.state}</TableCell>
                    <TableCell>
                      <span className="text-sm text-muted-foreground">
                        {region.zipCodes.length} zip codes
                      </span>
                    </TableCell>
                    <TableCell>{region._count.users}</TableCell>
                    <TableCell>{region._count.stores}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <RegionFormDialog
                          mode="edit"
                          region={{
                            id: region.id,
                            name: region.name,
                            state: region.state,
                            zipCodes: region.zipCodes,
                          }}
                        />
                        <RegionDeleteButton
                          regionId={region.id}
                          regionName={region.name}
                        />
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
                {regions.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center text-muted-foreground py-8">
                      No regions found.
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
