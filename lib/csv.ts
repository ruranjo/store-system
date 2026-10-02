export interface CsvColumn<T> {
  header: string
  value: (row: T) => string | number | undefined | null
}

function escapeCell(value: string | number | undefined | null) {
  const text = value == null ? "" : String(value)
  // Neutralize spreadsheet formula injection from user-entered text.
  const safe = /^[=+\-@\t\r]/.test(text) && Number.isNaN(Number(text)) ? `'${text}` : text
  return /[",;\n\r]/.test(safe) ? `"${safe.replace(/"/g, '""')}"` : safe
}

export function toCsv<T>(rows: T[], columns: CsvColumn<T>[]) {
  const header = columns.map((c) => escapeCell(c.header)).join(",")
  const body = rows.map((row) => columns.map((c) => escapeCell(c.value(row))).join(","))
  return [header, ...body].join("\r\n")
}

/** The BOM makes Excel open accented characters correctly. */
export function downloadCsv(filename: string, csv: string) {
  const blob = new Blob(["\uFEFF", csv], { type: "text/csv;charset=utf-8" })
  const url = URL.createObjectURL(blob)
  const link = document.createElement("a")
  link.href = url
  link.download = filename.endsWith(".csv") ? filename : `${filename}.csv`
  document.body.appendChild(link)
  link.click()
  link.remove()
  URL.revokeObjectURL(url)
}

export function csvDateStamp(now = new Date()) {
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`
}
