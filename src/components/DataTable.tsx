import React from "react";

export type Column<Row> = {
  key: string;
  header: string;
  cell: (row: Row) => React.ReactNode;
};

type Props<Row extends { id: string }> = {
  rows: Row[];
  columns: Column<Row>[];
  selectable?: boolean;
  selectedIds?: Set<string>;
  onToggleRow?: (id: string) => void;
  onToggleAll?: () => void;
};

export function DataTable<Row extends { id: string }>({
  rows,
  columns,
  selectable,
  selectedIds,
  onToggleRow,
  onToggleAll,
}: Props<Row>) {
  // ✅ defaults INSIDE component
  const isSelectable = selectable ?? true;
  const selected = selectedIds ?? new Set<string>();
  const toggleRow = onToggleRow ?? (() => {});
  const toggleAll = onToggleAll ?? (() => {});

  const allSelected = rows.length > 0 && rows.every((r) => selected.has(r.id));
  const someSelected = rows.some((r) => selected.has(r.id));

  return (
    <div className="overflow-x-auto rounded-lg border">
      <table className="min-w-full text-sm">
        <thead className="bg-gray-50">
          <tr>
            {isSelectable ? (
              <th className="w-10 p-3 text-left">
                <input
                  type="checkbox"
                  aria-label="Select all"
                  checked={allSelected}
                  ref={(el) => {
                    if (el) el.indeterminate = !allSelected && someSelected;
                  }}
                  onChange={toggleAll}
                />
              </th>
            ) : null}

            {columns.map((c) => (
              <th
                key={c.key}
                className="p-3 text-left font-semibold text-gray-700"
              >
                {c.header}
              </th>
            ))}
          </tr>
        </thead>

        <tbody>
          {rows.map((r) => {
            const checked = selected.has(r.id);

            return (
              <tr key={r.id} className="border-t">
                {isSelectable ? (
                  <td className="p-3">
                    <input
                      type="checkbox"
                      aria-label={`Select row ${r.id}`}
                      checked={checked}
                      onChange={() => toggleRow(r.id)}
                    />
                  </td>
                ) : null}

                {columns.map((c) => (
                  <td key={c.key} className="p-3 align-top">
                    {c.cell(r)}
                  </td>
                ))}
              </tr>
            );
          })}

          {rows.length === 0 ? (
            <tr>
              <td
                className="p-6 text-gray-500"
                colSpan={columns.length + (isSelectable ? 1 : 0)}
              >
                No evidence found for the current filters.
              </td>
            </tr>
          ) : null}
        </tbody>
      </table>
    </div>
  );
}
