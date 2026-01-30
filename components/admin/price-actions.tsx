"use client";

import { EntityActions } from "@/components/admin/entity-actions";
import { deletePrice } from "@/actions/admin-actions";

export function PriceActions({ priceId }: { priceId: number }) {
  return (
    <EntityActions
      entityName="Price"
      actions={[]}
      onDelete={async () => { await deletePrice(priceId); }}
    />
  );
}
