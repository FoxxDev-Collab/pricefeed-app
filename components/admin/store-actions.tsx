"use client";

import { EntityActions } from "@/components/admin/entity-actions";
import { verifyStore, toggleStorePrivacy, deleteStore } from "@/actions/admin-actions";
import { ShieldCheck, Eye } from "lucide-react";

interface StoreActionsProps {
  storeId: number;
  isVerified: boolean;
  isPrivate: boolean;
}

export function StoreActions({ storeId, isVerified, isPrivate }: StoreActionsProps) {
  return (
    <EntityActions
      entityName="Store"
      actions={[
        {
          label: isVerified ? "Already Verified" : "Verify Store",
          icon: ShieldCheck,
          onClick: async () => { await verifyStore(storeId); },
        },
        {
          label: isPrivate ? "Make Public" : "Make Private",
          icon: Eye,
          onClick: async () => { await toggleStorePrivacy(storeId); },
        },
      ]}
      onDelete={async () => { await deleteStore(storeId); }}
    />
  );
}
