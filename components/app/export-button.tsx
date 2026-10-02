"use client"

import { Download } from "lucide-react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { csvDateStamp, downloadCsv, toCsv, type CsvColumn } from "@/lib/csv"

interface ExportButtonProps<T> {
  rows: T[]
  columns: CsvColumn<T>[]
  filename: string
  label?: string
}

export function ExportButton<T>({ rows, columns, filename, label = "Exportar CSV" }: ExportButtonProps<T>) {
  function handleExport() {
    if (rows.length === 0) {
      toast.info("No hay datos para exportar.")
      return
    }
    downloadCsv(`${filename}-${csvDateStamp()}`, toCsv(rows, columns))
    toast.success(`${rows.length} ${rows.length === 1 ? "fila exportada" : "filas exportadas"}.`)
  }

  return (
    <Button variant="outline" onClick={handleExport}>
      <Download aria-hidden="true" />
      {label}
    </Button>
  )
}
