import { flexRender, type Table } from "@tanstack/react-table";
import { formatNumber } from "@utils/formatString";
import { STATUS_MAP } from "@utils/stautsMap";
import { renderToStaticMarkup } from "react-dom/server";

function ISOtoKST(isoString: string): string {
  const date = new Date(isoString);
  return date.toLocaleString("ko-KR");
}

function renderToText(value: unknown): string {
  let stringValue = "-";

  if (value === null || value === undefined) return stringValue;

  if (typeof value === "number") {
    stringValue = formatNumber(value);
  } else if (typeof value === "string") {
    stringValue = value;
  } else {
    try {
      stringValue = renderToStaticMarkup(value as React.ReactElement)
        .replace(/\n/g, "")
        .trim();
    } catch {
      stringValue = String(value);
    }
  }

  if (
    typeof stringValue === "string" &&
    /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d+)?(Z|([+-]\d{2}:\d{2}))?$/.test(
      stringValue
    )
  ) {
    stringValue = ISOtoKST(stringValue);
  }

  if (stringValue in STATUS_MAP) {
    stringValue = STATUS_MAP[stringValue as keyof typeof STATUS_MAP].text;
  }

  return stringValue;
}

export function generateMarkdownTable<T>(table: Table<T>): string {
  const headers = table
    .getHeaderGroups()[0]
    ?.headers.map((header) =>
      renderToText(
        flexRender(header.column.columnDef.header, header.getContext())
      )
    );

  const rows = table
    .getRowModel()
    .rows.map((row) =>
      row
        .getVisibleCells()
        .map((cell) =>
          renderToText(
            flexRender(cell.column.columnDef.cell, cell.getContext())
          )
        )
    );

  const mdHeader = `| ${headers.join(" | ")} |`;
  const mdDivider = `| ${headers.map(() => "---").join(" | ")} |`;
  const mdRows = rows.map((cells) => `| ${cells.join(" | ")} |`).join("\n");

  return [mdHeader, mdDivider, mdRows].join("\n");
}
