"use client";

import { EntityActions } from "@/components/admin/entity-actions";
import { verifyItem, toggleItemPrivacy, deleteItem } from "@/actions/admin-actions";
import { ShieldCheck, Eye } from "lucide-react";

interface ItemActionsProps {
  itemId: number;
  isVerified: boolean;
  isPrivate: boolean;
}

export function ItemActions({ itemId, isVerified, isPrivate }: ItemActionsProps) {
  return (
    <EntityActions
      entityName="Item"
      actions={[
        {
          label: isVerified ? "Already Verified" : "Verify Item",
          icon: ShieldCheck,
          onClick: async () => { await verifyItem(itemId); },
        },
        {
          label: isPrivate ? "Make Public" : "Make Private",
          icon: Eye,
          onClick: async () => { await toggleItemPrivacy(itemId); },
        },
      ]}
      onDelete={async () => { await deleteItem(itemId); }}
    />
  );
}
