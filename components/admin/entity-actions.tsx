"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
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
import { MoreHorizontal, Trash2 } from "lucide-react";
import { toast } from "sonner";
import type { LucideIcon } from "lucide-react";

interface Action {
  label: string;
  icon: LucideIcon;
  onClick: () => Promise<void>;
  destructive?: boolean;
}

interface EntityActionsProps {
  entityName: string;
  actions: Action[];
  onDelete?: () => Promise<void>;
}

export function EntityActions({ entityName, actions, onDelete }: EntityActionsProps) {
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleAction(action: Action) {
    try {
      await action.onClick();
      toast.success(`${action.label} successful`);
    } catch {
      toast.error(`Failed: ${action.label}`);
    }
  }

  async function handleDelete() {
    if (!onDelete) return;
    setLoading(true);
    try {
      await onDelete();
      toast.success(`${entityName} deleted`);
      setDeleteDialogOpen(false);
    } catch {
      toast.error(`Failed to delete ${entityName.toLowerCase()}`);
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
          {actions.map((action) => (
            <DropdownMenuItem
              key={action.label}
              onClick={() => handleAction(action)}
              className={action.destructive ? "text-destructive" : ""}
            >
              <action.icon className="mr-2 h-4 w-4" />
              {action.label}
            </DropdownMenuItem>
          ))}
          {onDelete && (
            <>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                className="text-destructive"
                onClick={() => setDeleteDialogOpen(true)}
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Delete
              </DropdownMenuItem>
            </>
          )}
        </DropdownMenuContent>
      </DropdownMenu>

      {onDelete && (
        <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Delete {entityName}</DialogTitle>
              <DialogDescription>
                This will permanently delete this {entityName.toLowerCase()} and
                all related data. This cannot be undone.
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
      )}
    </>
  );
}
