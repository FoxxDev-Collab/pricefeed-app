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
import { UserActions } from "@/components/admin/user-actions";
import { formatDistanceToNow } from "date-fns";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Manage Users" };

const PAGE_SIZE = 20;

export default async function AdminUsersPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; page?: string; role?: string; tier?: string }>;
}) {
  const params = await searchParams;
  const query = params.q || "";
  const page = Math.max(1, parseInt(params.page || "1"));
  const roleFilter = params.role || "";
  const tierFilter = params.tier || "";

  const where = {
    ...(query && {
      OR: [
        { email: { contains: query, mode: "insensitive" as const } },
        { username: { contains: query, mode: "insensitive" as const } },
      ],
    }),
    ...(roleFilter && { role: roleFilter as "user" | "admin" | "moderator" }),
    ...(tierFilter && { subscriptionTier: tierFilter as "free" | "pro" | "business" }),
  };

  const [users, totalCount] = await Promise.all([
    prisma.user.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
      select: {
        id: true,
        username: true,
        email: true,
        role: true,
        subscriptionTier: true,
        reputationPoints: true,
        emailVerified: true,
        createdAt: true,
      },
    }),
    prisma.user.count({ where }),
  ]);

  const totalPages = Math.ceil(totalCount / PAGE_SIZE);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Users</h1>
        <p className="text-muted-foreground">{totalCount} total users</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>User Management</CardTitle>
          <CardDescription>View and manage all registered users</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Suspense>
            <AdminSearch placeholder="Search by email or username..." />
          </Suspense>

          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-16">ID</TableHead>
                  <TableHead>Username</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Tier</TableHead>
                  <TableHead>Reputation</TableHead>
                  <TableHead>Verified</TableHead>
                  <TableHead>Joined</TableHead>
                  <TableHead className="w-16" />
                </TableRow>
              </TableHeader>
              <TableBody>
                {users.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell className="font-mono text-xs">{user.id}</TableCell>
                    <TableCell className="font-medium">
                      {user.username || "—"}
                    </TableCell>
                    <TableCell>{user.email}</TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          user.role === "admin"
                            ? "default"
                            : user.role === "moderator"
                            ? "secondary"
                            : "outline"
                        }
                      >
                        {user.role}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{user.subscriptionTier}</Badge>
                    </TableCell>
                    <TableCell>{user.reputationPoints}</TableCell>
                    <TableCell>
                      <Badge variant={user.emailVerified ? "default" : "secondary"}>
                        {user.emailVerified ? "Yes" : "No"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground">
                      {formatDistanceToNow(user.createdAt, { addSuffix: true })}
                    </TableCell>
                    <TableCell>
                      <UserActions
                        userId={user.id}
                        currentRole={user.role}
                        isEmailVerified={user.emailVerified}
                      />
                    </TableCell>
                  </TableRow>
                ))}
                {users.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={9} className="text-center text-muted-foreground py-8">
                      No users found.
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
