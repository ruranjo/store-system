import type { Activity, Database, Offer, Product, Promoter } from "@/lib/types"
import { buildOfferCode, hourKeyOf } from "@/lib/offers/code"

const CATEGORIES = ["Tecnología", "Calzado", "Ropa", "Accesorios", "Belleza"]

function iso(minutesAgo: number) {
  return new Date(Date.now() - minutesAgo * 60_000).toISOString()
}

export function createSeed(): Database {
  const products: Product[] = [
    {
      id: "prod-aud",
      name: "Audífonos Bluetooth Pulse",
      description:
        "Audífonos over-ear con cancelación activa de ruido, 40 horas de batería y carga rápida USB-C. Almohadillas de espuma viscoelástica para uso prolongado.",
      image: "/products/audifonos.png",
      price: 89.9,
      compareAtPrice: 119.9,
      category: "Tecnología",
      sku: "AUD01",
      status: "active",
      createdAt: iso(60 * 24 * 20),
      updatedAt: iso(60 * 24 * 3),
    },
    {
      id: "prod-smw",
      name: "Smartwatch Fit Pro",
      description:
        "Reloj inteligente con monitor de ritmo cardíaco, oxígeno en sangre, GPS integrado y resistencia al agua 5 ATM. Hasta 10 días de autonomía.",
      image: "/products/smartwatch.png",
      price: 129,
      compareAtPrice: 159,
      category: "Tecnología",
      sku: "SMW02",
      status: "active",
      createdAt: iso(60 * 24 * 18),
      updatedAt: iso(60 * 24 * 2),
    },
    {
      id: "prod-zap",
      name: "Zapatos deportivos Stride",
      description:
        "Zapatillas para running con suela de alto rebote, malla transpirable y plantilla anatómica. Ideales para entrenamiento diario.",
      image: "/products/zapatos.png",
      price: 74.5,
      category: "Calzado",
      sku: "ZAP03",
      status: "active",
      createdAt: iso(60 * 24 * 15),
      updatedAt: iso(20),
    },
    {
      id: "prod-cam",
      name: "Camiseta Essential Algodón",
      description:
        "Camiseta de algodón peinado 100%, corte regular y cuello reforzado. Disponible en tallas S a XXL.",
      image: "/products/camiseta.png",
      price: 19.9,
      category: "Ropa",
      sku: "CAM04",
      status: "active",
      createdAt: iso(60 * 24 * 12),
      updatedAt: iso(60 * 24 * 12),
    },
    {
      id: "prod-moc",
      name: "Mochila Urbana Commuter",
      description:
        "Mochila de 22 L resistente al agua, compartimento acolchado para laptop de 15\", bolsillo antirrobo y puerto USB externo.",
      image: "/products/mochila.png",
      price: 54,
      compareAtPrice: 65,
      category: "Accesorios",
      sku: "MOC05",
      status: "active",
      createdAt: iso(60 * 24 * 10),
      updatedAt: iso(60 * 24 * 4),
    },
    {
      id: "prod-per",
      name: "Perfume Ámbar Noir 100 ml",
      description:
        "Eau de parfum con notas de ámbar, vainilla y madera de cedro. Fijación de larga duración, presentación de 100 ml.",
      image: "/products/perfume.png",
      price: 68,
      category: "Belleza",
      sku: "PER06",
      status: "active",
      createdAt: iso(60 * 24 * 9),
      updatedAt: iso(60 * 24 * 9),
    },
    {
      id: "prod-par",
      name: "Parlante Bluetooth Wave",
      description:
        "Parlante portátil con sonido 360°, resistencia IPX7, 18 horas de reproducción y emparejamiento estéreo.",
      image: "/products/parlante.png",
      price: 49.9,
      compareAtPrice: 59.9,
      category: "Tecnología",
      sku: "PAR07",
      status: "active",
      createdAt: iso(60 * 24 * 7),
      updatedAt: iso(60 * 24 * 1),
    },
    {
      id: "prod-tec",
      name: "Teclado mecánico Compact 75",
      description:
        "Teclado mecánico 75% con switches hot-swap, retroiluminación RGB y conexión triple: USB-C, Bluetooth y 2.4 GHz.",
      image: "/products/teclado.png",
      price: 99,
      category: "Tecnología",
      sku: "TEC08",
      status: "inactive",
      createdAt: iso(60 * 24 * 5),
      updatedAt: iso(60 * 24 * 1),
    },
  ]

  const promoters: Promoter[] = [
    {
      id: "pro-001",
      username: "promotor1",
      name: "Juan Pérez",
      code: "PROMO-001",
      email: "juan.perez@demo.com",
      phone: "+52 55 1234 5678",
      status: "active",
      createdAt: iso(60 * 24 * 30),
    },
    {
      id: "pro-002",
      username: "promotor2",
      name: "María López",
      code: "PROMO-002",
      email: "maria.lopez@demo.com",
      phone: "+52 55 8765 4321",
      status: "active",
      createdAt: iso(60 * 24 * 25),
    },
    {
      id: "pro-003",
      username: "promotor3",
      name: "Carlos Gómez",
      code: "PROMO-003",
      email: "carlos.gomez@demo.com",
      phone: "+52 33 2468 1357",
      status: "active",
      createdAt: iso(60 * 24 * 14),
    },
  ]

  const offerPlan: [number, number, number][] = [
    // [promoterIndex, productIndex, minutesAgo]
    [0, 0, 5],
    [1, 2, 12],
    [2, 1, 48],
    [0, 4, 95],
    [1, 0, 180],
    [0, 2, 60 * 26],
    [2, 6, 60 * 27],
    [1, 5, 60 * 30],
    [0, 1, 60 * 49],
    [1, 3, 60 * 50],
    [2, 0, 60 * 72],
    [0, 6, 60 * 75],
    [1, 1, 60 * 98],
    [0, 5, 60 * 120],
  ]
  const discounts = [10, 15, 5, 20, 10]
  const codes = new Set<string>()
  const offers: Offer[] = offerPlan.map(([pi, pr, ago], i) => {
    const promoter = promoters[pi]
    const product = products[pr]
    const createdAt = iso(ago)
    const code = buildOfferCode(promoter.code, product.sku, codes)
    codes.add(code)
    return {
      id: `off-seed-${i}`,
      code,
      promoterId: promoter.id,
      promoterName: promoter.name,
      promoterCode: promoter.code,
      productId: product.id,
      productName: product.name,
      productPrice: product.price,
      discount: discounts[i % discounts.length],
      hourKey: hourKeyOf(new Date(createdAt)),
      createdAt,
    }
  })

  const activity: Activity[] = [
    ...offers.slice(0, 5).map((o, i) => ({
      id: `act-seed-o${i}`,
      type: "offer_created" as const,
      message: `generó una oferta de ${o.discount}% para "${o.productName}"`,
      actor: o.promoterName,
      at: o.createdAt,
    })),
    {
      id: "act-seed-p1",
      type: "product_updated",
      message: `actualizó el producto "Zapatos deportivos Stride"`,
      actor: "Super Admin",
      at: iso(20),
    },
  ]
  activity.sort((a, b) => b.at.localeCompare(a.at))

  return {
    users: [
      {
        id: "usr-super",
        username: "superadmin",
        name: "Super Admin",
        role: "superadmin",
        email: "superadmin@demo.com",
      },
      {
        id: "usr-admin",
        username: "admin",
        name: "Laura Méndez",
        role: "admin",
        email: "admin@demo.com",
      },
    ],
    promoters,
    products,
    offers,
    activity,
    settings: {
      storeName: "Vitrina",
      whatsappNumber: "5215512345678",
      maxDiscount: 25,
      offerValidityHours: 48,
      currency: "USD",
      categories: CATEGORIES,
      commissionRate: 5,
      dailyGoal: 3,
      weeklyGoal: 15,
    },
    session: null,
  }
}
