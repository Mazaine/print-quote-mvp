// frontend/src/features/admin/components/AnchorTable.tsx
import { useMemo, useState } from "react";
import type { AnchorRead } from "../../../types/admin";

type Props = {
  items: AnchorRead[];
  savingIds: Set<number>;
  deletingIds: Set<number>;
  onSavePrice: (id: number, newPrice: number) => void;
  onDelete: (id: number) => void;
};

export function AnchorTable({ items, savingIds, deletingIds, onSavePrice, onDelete }: Props) {
  const [draftPrices, setDraftPrices] = useState<Record<number, string>>({});

  const rows = useMemo(() => items, [items]);

  function getDraft(id: number, current: number): string {
    return draftPrices[id] ?? String(current);
  }

  function setDraft(id: number, value: string) {
    setDraftPrices((d) => ({ ...d, [id]: value }));
  }

  return (
    <div style={{ overflowX: "auto" }}>
      <table style={{ width: "100%", borderCollapse: "collapse" }}>
        <thead>
          <tr>
            <Th>ID</Th>
            <Th>Termék</Th>
            <Th>Papír</Th>
            <Th>Méret</Th>
            <Th>Mennyiség</Th>
            <Th>Ár (Ft)</Th>
            <Th>Pénznem</Th>
            <Th>Műveletek</Th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => {
            const saving = savingIds.has(r.id);
            const deleting = deletingIds.has(r.id);
            const draft = getDraft(r.id, r.anchor_price);

            const draftNum = Number(draft);
            const canSave = Number.isFinite(draftNum) && draft.trim() !== "" && draftNum >= 0 && draftNum !== r.anchor_price;

            return (
              <tr key={r.id} style={{ borderTop: "1px solid #ddd" }}>
                <Td>{r.id}</Td>
                <Td>{r.product_code}</Td>
                <Td>{r.material_code}</Td>
                <Td>{r.size_key}</Td>
                <Td>{r.anchor_qty}</Td>
                <Td>
                  <input
                    style={{ width: 120 }}
                    inputMode="decimal"
                    value={draft}
                    disabled={saving || deleting}
                    onChange={(e) => setDraft(r.id, e.target.value)}
                  />
                </Td>
                <Td>{r.currency}</Td>
                <Td>
                  <div style={{ display: "flex", gap: 8 }}>
                    <button
                      disabled={!canSave || saving || deleting}
                      onClick={() => onSavePrice(r.id, draftNum)}
                    >
                      {saving ? "Betöltés..." : "Mentés"}
                    </button>
                    <button
                      disabled={saving || deleting}
                      onClick={() => onDelete(r.id)}
                    >
                      {deleting ? "Betöltés..." : "Törlés"}
                    </button>
                  </div>
                </Td>
              </tr>
            );
          })}

          {rows.length === 0 && (
            <tr>
              <Td colSpan={8}>
                <em>Nincs találat</em>
              </Td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}

function Th({ children }: { children: React.ReactNode }) {
  return (
    <th style={{ textAlign: "left", padding: "8px 6px", borderBottom: "2px solid #ddd" }}>
      {children}
    </th>
  );
}

function Td({ children, colSpan }: { children: React.ReactNode; colSpan?: number }) {
  return (
    <td style={{ padding: "8px 6px" }} colSpan={colSpan}>
      {children}
    </td>
  );
}
