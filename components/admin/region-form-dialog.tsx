"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Plus, Pencil } from "lucide-react";
import { createRegion, updateRegion } from "@/actions/admin-actions";
import { toast } from "sonner";

interface RegionFormDialogProps {
  mode: "create" | "edit";
  region?: { id: number; name: string; state: string; zipCodes: string[] };
}

export function RegionFormDialog({ mode, region }: RegionFormDialogProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    const name = formData.get("name") as string;
    const state = (formData.get("state") as string).toUpperCase();
    const zipCodesRaw = formData.get("zipCodes") as string;
    const zipCodes = zipCodesRaw
      .split(/[,\n\s]+/)
      .map((z) => z.trim())
      .filter(Boolean);

    try {
      if (mode === "create") {
        await createRegion({ name, state, zipCodes });
        toast.success("Region created");
      } else if (region) {
        await updateRegion(region.id, { name, state, zipCodes });
        toast.success("Region updated");
      }
      setOpen(false);
    } catch {
      toast.error(`Failed to ${mode} region`);
    } finally {
      setLoading(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {mode === "create" ? (
          <Button size="sm">
            <Plus className="mr-2 h-4 w-4" />
            Add Region
          </Button>
        ) : (
          <Button variant="ghost" size="icon" className="h-8 w-8">
            <Pencil className="h-4 w-4" />
          </Button>
        )}
      </DialogTrigger>
      <DialogContent>
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>{mode === "create" ? "Add Region" : "Edit Region"}</DialogTitle>
            <DialogDescription>
              {mode === "create"
                ? "Create a new geographic region."
                : "Update region details."}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="name">Region Name</Label>
              <Input
                id="name"
                name="name"
                required
                defaultValue={region?.name || ""}
                placeholder="e.g. San Diego Metro"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="state">State (2-letter code)</Label>
              <Input
                id="state"
                name="state"
                required
                maxLength={2}
                defaultValue={region?.state || ""}
                placeholder="e.g. CA"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="zipCodes">Zip Codes (comma or newline separated)</Label>
              <Textarea
                id="zipCodes"
                name="zipCodes"
                rows={4}
                defaultValue={region?.zipCodes?.join(", ") || ""}
                placeholder="92101, 92102, 92103..."
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Saving..." : mode === "create" ? "Create" : "Update"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
