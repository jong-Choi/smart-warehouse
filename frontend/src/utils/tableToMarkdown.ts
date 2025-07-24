import { flexRender, type Table } from "@tanstack/react-table";
import { formatNumber } from "@utils/formatString";
import { STATUS_MAP } from "@utils/stautsMap";
import { renderToStaticMarkup } from "react-dom/server";

function ISOtoKST(isoString: string): string {
  const date = new Date(isoString);
  return date.toLocaleString("ko-KR");
}

// HTML 태그를 제거하고 순수 텍스트만 추출하는 함수
function stripHtmlTags(html: string): string {
  // HTML 태그 제거
  let text = html.replace(/<[^>]*>/g, "");

  // HTML 엔티티 디코딩
  text = text
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&nbsp;/g, " ");

  // 연속된 공백을 하나로 치환하고 앞뒤 공백 제거
  text = text.replace(/\s+/g, " ").trim();

  // 빈 문자열이거나 공백만 있는 경우 처리
  if (!text || text === "") {
    return "-";
  }

  return text;
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

  // HTML 태그가 포함된 경우 제거
  if (typeof stringValue === "string" && stringValue.includes("<")) {
    stringValue = stripHtmlTags(stringValue);
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
