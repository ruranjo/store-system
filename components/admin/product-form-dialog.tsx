"use client"

import { useState } from "react"
import Image from "next/image"
import { ImageUp } from "lucide-react"
import { toast } from "sonner"
import type { Product, Settings } from "@/lib/types"
import { createProduct, updateProduct, type ProductInput } from "@/lib/products"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { NativeSelect } from "@/components/app/native-select"

const PRESET_IMAGES = [
  "/products/audifonos.png",
  "/products/smartwatch.png",
  "/products/zapatos.png",
  "/products/camiseta.png",
  "/products/mochila.png",
  "/products/perfume.png",
  "/products/parlante.png",
  "/products/teclado.png",
]

const MAX_IMAGE_SIDE = 640

function resizeImage(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onerror = () => reject(new Error("No se pudo leer la imagen."))
    reader.onload = () => {
      const img = new window.Image()
      img.crossOrigin = "anonymous"
      img.onerror = () => reject(new Error("Formato de imagen no válido."))
      img.onload = () => {
        const scale = Math.min(1, MAX_IMAGE_SIDE / Math.max(img.width, img.height))
        const canvas = document.createElement("canvas")
        canvas.width = Math.round(img.width * scale)
        canvas.height = Math.round(img.height * scale)
        canvas.getContext("2d")?.drawImage(img, 0, 0, canvas.width, canvas.height)
        resolve(canvas.toDataURL("image/jpeg", 0.82))
      }
      img.src = reader.result as string
    }
    reader.readAsDataURL(file)
  })
}

interface FormState {
  name: string
  description: string
  image: string
  price: string
  compareAtPrice: string
  category: string
  sku: string
  active: boolean
}

function initialState(product: Product | undefined, settings: Settings): FormState {
  return {
    name: product?.name ?? "",
    description: product?.description ?? "",
    image: product?.image ?? PRESET_IMAGES[0],
    price: product ? String(product.price) : "",
    compareAtPrice: product?.compareAtPrice ? String(product.compareAtPrice) : "",
    category: product?.category ?? settings.categories[0] ?? "",
    sku: product?.sku ?? "",
    active: product ? product.status === "active" : true,
  }
}

export function ProductFormDialog({
  open,
  onOpenChange,
  product,
  settings,
  actor,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  product?: Product
  settings: Settings
  actor: string
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90dvh] overflow-y-auto sm:max-w-lg">
        {open && (
          <ProductForm
            key={product?.id ?? "new"}
            product={product}
            settings={settings}
            actor={actor}
            onDone={() => onOpenChange(false)}
          />
        )}
      </DialogContent>
    </Dialog>
  )
}

function ProductForm({
  product,
  settings,
  actor,
  onDone,
}: {
  product?: Product
  settings: Settings
  actor: string
  onDone: () => void
}) {
  const [form, setForm] = useState(() => initialState(product, settings))
  const [error, setError] = useState<string | null>(null)
  const set = <K extends keyof FormState>(key: K, value: FormState[K]) => {
    setForm((f) => ({ ...f, [key]: value }))
    setError(null)
  }
  const categories = settings.categories.includes(form.category)
    ? settings.categories
    : [form.category, ...settings.categories].filter(Boolean)

  async function onFile(file: File | undefined) {
    if (!file) return
    if (!file.type.startsWith("image/")) return setError("El archivo debe ser una imagen.")
    try {
      set("image", await resizeImage(file))
    } catch (e) {
      setError((e as Error).message)
    }
  }

  function submit(e: React.FormEvent) {
    e.preventDefault()
    const input: ProductInput = {
      name: form.name.trim(),
      description: form.description.trim(),
      image: form.image,
      price: Number(form.price),
      compareAtPrice: form.compareAtPrice ? Number(form.compareAtPrice) : undefined,
      category: form.category,
      sku: form.sku,
      status: form.active ? "active" : "inactive",
    }
    try {
      if (product) updateProduct(product.id, input, actor)
      else createProduct(input, actor)
      toast.success(product ? "Producto actualizado" : "Producto creado")
      onDone()
    } catch (err) {
      setError((err as Error).message)
    }
  }

  return (
    <form onSubmit={submit} className="flex flex-col gap-5" noValidate>
      <DialogHeader>
        <DialogTitle>{product ? "Editar producto" : "Nuevo producto"}</DialogTitle>
        <DialogDescription>Los cambios se reflejan de inmediato en el catálogo.</DialogDescription>
      </DialogHeader>

      <fieldset className="flex flex-col gap-2">
        <legend className="mb-2 text-sm font-medium">Imagen</legend>
        <div className="flex gap-3">
          <div className="relative size-20 shrink-0 overflow-hidden rounded-lg border bg-muted">
            {form.image && (
              <Image src={form.image || "/placeholder.svg"} alt="Vista previa" fill sizes="80px" className="object-cover" unoptimized={form.image.startsWith("data:")} />
            )}
          </div>
          <div className="flex min-w-0 flex-1 flex-col gap-2">
            <div className="flex flex-wrap gap-1.5" role="radiogroup" aria-label="Imágenes predefinidas">
              {PRESET_IMAGES.map((src) => (
                <button
                  key={src}
                  type="button"
                  role="radio"
                  aria-checked={form.image === src}
                  aria-label={src.split("/").pop()?.replace(".png", "")}
                  onClick={() => set("image", src)}
                  className="relative size-9 overflow-hidden rounded-md border outline-none aria-checked:ring-2 aria-checked:ring-primary focus-visible:ring-2 focus-visible:ring-ring"
                >
                  <Image src={src || "/placeholder.svg"} alt="" fill sizes="36px" className="object-cover" />
                </button>
              ))}
            </div>
            <label className="flex w-fit cursor-pointer items-center gap-1.5 text-sm text-primary underline-offset-4 hover:underline">
              <ImageUp className="size-4" aria-hidden="true" />
              Subir imagen
              <input type="file" accept="image/*" className="sr-only" onChange={(e) => onFile(e.target.files?.[0])} />
            </label>
          </div>
        </div>
      </fieldset>

      <div className="flex flex-col gap-2">
        <Label htmlFor="p-name">Nombre</Label>
        <Input id="p-name" value={form.name} onChange={(e) => set("name", e.target.value)} required maxLength={80} />
      </div>
      <div className="flex flex-col gap-2">
        <Label htmlFor="p-desc">Descripción</Label>
        <Textarea
          id="p-desc"
          value={form.description}
          onChange={(e) => set("description", e.target.value)}
          rows={3}
          maxLength={400}
        />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div className="flex flex-col gap-2">
          <Label htmlFor="p-price">Precio ({settings.currency})</Label>
          <Input
            id="p-price"
            type="number"
            inputMode="decimal"
            min="0"
            step="0.01"
            value={form.price}
            onChange={(e) => set("price", e.target.value)}
            required
          />
        </div>
        <div className="flex flex-col gap-2">
          <Label htmlFor="p-compare">Precio anterior</Label>
          <Input
            id="p-compare"
            type="number"
            inputMode="decimal"
            min="0"
            step="0.01"
            placeholder="Opcional"
            value={form.compareAtPrice}
            onChange={(e) => set("compareAtPrice", e.target.value)}
          />
        </div>
        <div className="flex flex-col gap-2">
          <Label htmlFor="p-sku">SKU</Label>
          <Input
            id="p-sku"
            value={form.sku}
            onChange={(e) => set("sku", e.target.value)}
            className="font-mono uppercase"
            maxLength={12}
            required
          />
        </div>
        <div className="flex flex-col gap-2">
          <Label htmlFor="p-cat">Categoría</Label>
          <NativeSelect id="p-cat" value={form.category} onChange={(e) => set("category", e.target.value)}>
            {categories.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </NativeSelect>
        </div>
      </div>
      <div className="flex items-center justify-between gap-4 rounded-lg border px-3 py-2.5">
        <Label htmlFor="p-active" className="flex flex-col items-start gap-0.5">
          <span>Visible en catálogo</span>
          <span className="text-xs font-normal text-muted-foreground">Los productos inactivos no admiten ofertas.</span>
        </Label>
        <Switch id="p-active" checked={form.active} onCheckedChange={(v) => set("active", v)} />
      </div>

      {error && (
        <p role="alert" className="text-sm text-destructive">
          {error}
        </p>
      )}

      <DialogFooter>
        <Button type="button" variant="outline" size="lg" onClick={onDone}>
          Cancelar
        </Button>
        <Button type="submit" size="lg">
          {product ? "Guardar cambios" : "Crear producto"}
        </Button>
      </DialogFooter>
    </form>
  )
}
