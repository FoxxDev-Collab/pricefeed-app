"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { MoreHorizontal, Shield, Mail, CreditCard, Trash2 } from "lucide-react";
import {
  updateUserRole,
  toggleUserEmailVerified,
  updateUserSubscription,
  deleteUser,
} from "@/actions/admin-actions";
import { toast } from "sonner";

interface UserActionsProps {
  userId: number;
  currentRole: string;
  isEmailVerified: boolean;
}

export function UserActions({ userId, currentRole, isEmailVerified }: UserActionsProps) {
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleRoleChange(role: "user" | "admin" | "moderator") {
    try {
      await updateUserRole(userId, role);
      toast.success(`Role updated to ${role}`);
    } catch {
      toast.error("Failed to update role");
    }
  }

  async function handleToggleEmail() {
    try {
      await toggleUserEmailVerified(userId);
      toast.success(`Email verification ${isEmailVerified ? "revoked" : "granted"}`);
    } catch {
      toast.error("Failed to toggle email verification");
    }
  }

  async function handleSubscription(tier: "free" | "pro" | "business") {
    try {
      await updateUserSubscription(userId, tier);
      toast.success(`Subscription updated to ${tier}`);
    } catch {
      toast.error("Failed to update subscription");
    }
  }

  async function handleDelete() {
    setLoading(true);
    try {
      await deleteUser(userId);
      toast.success("User deleted");
      setDeleteDialogOpen(false);
    } catch {
      toast.error("Failed to delete user");
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon" className="h-8 w-8">
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuLabel>Actions</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuSub>
            <DropdownMenuSubTrigger>
              <Shield className="mr-2 h-4 w-4" />
              Set Role
            </DropdownMenuSubTrigger>
            <DropdownMenuSubContent>
              {(["user", "moderator", "admin"] as const).map((role) => (
                <DropdownMenuItem
                  key={role}
                  onClick={() => handleRoleChange(role)}
                  disabled={role === currentRole}
                >
                  {role}
                  {role === currentRole && " (current)"}
                </DropdownMenuItem>
              ))}
            </DropdownMenuSubContent>
          </DropdownMenuSub>
          <DropdownMenuSub>
            <DropdownMenuSubTrigger>
              <CreditCard className="mr-2 h-4 w-4" />
              Set Subscription
            </DropdownMenuSubTrigger>
            <DropdownMenuSubContent>
              {(["free", "pro", "business"] as const).map((tier) => (
                <DropdownMenuItem
                  key={tier}
                  onClick={() => handleSubscription(tier)}
                >
                  {tier}
                </DropdownMenuItem>
              ))}
            </DropdownMenuSubContent>
          </DropdownMenuSub>
          <DropdownMenuItem onClick={handleToggleEmail}>
            <Mail className="mr-2 h-4 w-4" />
            {isEmailVerified ? "Revoke Email Verification" : "Verify Email"}
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            className="text-destructive"
            onClick={() => setDeleteDialogOpen(true)}
          >
            <Trash2 className="mr-2 h-4 w-4" />
            Delete User
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete User</DialogTitle>
            <DialogDescription>
              This will permanently delete this user and all their data. This
              action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDelete} disabled={loading}>
              {loading ? "Deleting..." : "Delete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
