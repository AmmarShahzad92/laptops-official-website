"use client"

/**
 * /app/inventory/page.tsx
 * Inventory Management — 4-tab internal portal
 *
 * Tab 1 : Products List   — sortable/filterable data table
 * Tab 2 : Add Product     — full form with all Product model fields + image upload
 * Tab 3 : Stock Movement  — StockMovementRecord table + New Transfer modal
 * Tab 4 : Purchases       — Purchase table + Record Purchase modal
 *
 * Data models mirror the Python desktop app exactly:
 *   products.py · categories.py · stocks.py
 *   stock_movement_records.py · purchases.py · seed_data.py
 *
 * Wire-up points are marked: // TODO: Supabase
 */

import {
  useState, useMemo, useCallback, useRef, useEffect,
  type ChangeEvent, type DragEvent,
} from "react"
import {
  Package, Plus, MoveRight, ShoppingBag,
  Search, X, ArrowUpDown, ChevronRight,
  Pencil, Trash2, Eye, UploadCloud, CheckCircle2,
  AlertTriangle, RotateCcw, Loader2, TrendingUp,
  BarChart3, Layers, AlertCircle, ImagePlus,
} from "lucide-react"
import { Button }    from "@/components/ui/button"
import { Input }     from "@/components/ui/input"
import { Label }     from "@/components/ui/label"
import { Badge }     from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import {
  Select, SelectContent, SelectItem,
  SelectTrigger, SelectValue,
} from "@/components/ui/select"
import {
  Dialog, DialogContent, DialogHeader,
  DialogTitle, DialogFooter,
} from "@/components/ui/dialog"
import {
  Table, TableBody, TableCell,
  TableHead, TableHeader, TableRow,
} from "@/components/ui/table"
import { cn } from "@/lib/utils"

// ─────────────────────────────────────────────────────────────────────────────
// TYPE DEFINITIONS  (mirrors desktop app models exactly)
// ─────────────────────────────────────────────────────────────────────────────

type ProductType = "laptop" | "desktop" | "tower"
type StaffStatus = "active" | "inactive" | "suspended"
type LocationType = "store" | "warehouse" | "platform"

interface Category {
  category_id: number
  category_brand: string
  model_name: string
  product_type: ProductType
  screen_size: number | null
  color: string
}

interface Supplier {
  supplier_id: number
  supplier_name: string
  contact_no: string
  email: string
}

interface Location {
  location_id: number
  location_name: string
  location_type: LocationType
}

interface Staff {
  staff_id: number
  staff_name: string
  role_id: number
}

interface ProductRow {
  product_id: string
  product_name: string
  product_code: string
  category_id: number
  category_brand: string
  model_name: string
  product_type: ProductType
  supplier_id: number
  supplier_name: string
  screen_size: number | null
  color: string
  processor: string
  ram: string
  primary_storage: string
  secondary_storage: string
  gpu: string
  cost_price: number
  wholesale_price: number
  sale_price: number
  stock_qty: number   // aggregated from stocks
  is_active: boolean
}

interface ProductFormState {
  // Basic info
  product_name: string
  product_type: ProductType
  category_brand: string
  model_name: string
  // Specifications
  screen_size: string   // "13.3" | "14" | "15.6" | "17" | ""
  color: string
  processor: string
  ram: string
  primary_storage: string
  secondary_storage: string
  gpu: string
  // Pricing
  cost_price: string
  wholesale_price: string
  sale_price: string
  // Stock
  initial_qty: string
  location_id: string
  supplier_id: string
}

interface StockMovement {
  smr_id: number
  product_id: string
  product_name: string
  product_code: string
  from_location_id: number
  from_location_name: string
  to_location_id: number
  to_location_name: string
  quantity_moved: number
  unit_cost: number
  movement_amount: number      // generated: quantity_moved × unit_cost
  approved_by: number          // staff_id
  approved_by_name: string
  movement_date: string
  remarks: string
}

interface TransferFormState {
  product_id: string
  from_location_id: string
  to_location_id: string
  quantity: string
  remarks: string
}

interface PurchaseRow {
  purchase_id: number
  supplier_id: number
  supplier_name: string
  product_id: string
  product_name: string
  product_code: string
  quantity: number
  unit_cost: number
  total_amount: number         // generated: quantity × unit_cost
  purchase_date: string
  received_by: number          // staff_id
  received_by_name: string
  location_id: number
  location_name: string
  remarks: string
}

interface PurchaseFormState {
  supplier_id: string
  product_id: string
  quantity: string
  unit_cost: string
  received_by: string          // staff_id
  location_id: string
  remarks: string
}

type InventoryTab = "products" | "add_product" | "stock_movement" | "purchases"

// ─────────────────────────────────────────────────────────────────────────────
// REFERENCE DATA  (from seed_data.py — replace with Supabase queries)
// ─────────────────────────────────────────────────────────────────────────────

const CATEGORIES: Category[] = [
  { category_id: 1,  category_brand: "Dell",   model_name: "Latitude 5420",   product_type: "laptop",  screen_size: 14,   color: "Black"  },
  { category_id: 2,  category_brand: "HP",     model_name: "EliteBook 840",   product_type: "laptop",  screen_size: 14,   color: "Silver" },
  { category_id: 3,  category_brand: "Lenovo", model_name: "ThinkPad T14",    product_type: "laptop",  screen_size: 14,   color: "Black"  },
  { category_id: 4,  category_brand: "Apple",  model_name: "MacBook Pro M1",  product_type: "laptop",  screen_size: 13.3, color: "Gray"   },
  { category_id: 5,  category_brand: "Acer",   model_name: "Aspire 5",        product_type: "laptop",  screen_size: 15.6, color: "Black"  },
  { category_id: 6,  category_brand: "Asus",   model_name: "VivoBook",        product_type: "laptop",  screen_size: 14,   color: "Blue"   },
  { category_id: 7,  category_brand: "MSI",    model_name: "Modern 14",       product_type: "laptop",  screen_size: 14,   color: "Gray"   },
  { category_id: 8,  category_brand: "Dell",   model_name: "OptiPlex 7090",   product_type: "desktop", screen_size: null, color: "Black"  },
  { category_id: 9,  category_brand: "HP",     model_name: "ProDesk 600",     product_type: "desktop", screen_size: null, color: "Black"  },
  { category_id: 10, category_brand: "Lenovo", model_name: "ThinkCentre M70", product_type: "desktop", screen_size: null, color: "Black"  },
]

const SUPPLIERS: Supplier[] = [
  { supplier_id: 1,  supplier_name: "Tech Distributors", contact_no: "021-1111", email: "info@tech.com"     },
  { supplier_id: 2,  supplier_name: "Pak Computers",     contact_no: "021-2222", email: "sales@pak.com"     },
  { supplier_id: 3,  supplier_name: "IT Hub",            contact_no: "021-3333", email: "info@ithub.com"    },
  { supplier_id: 4,  supplier_name: "Mega Traders",      contact_no: "021-4444", email: "mega@trade.com"    },
  { supplier_id: 5,  supplier_name: "Digital World",     contact_no: "021-5555", email: "digital@world.com" },
  { supplier_id: 6,  supplier_name: "System House",      contact_no: "021-6666", email: "sys@house.com"     },
  { supplier_id: 7,  supplier_name: "CompZone",          contact_no: "021-7777", email: "zone@comp.com"     },
  { supplier_id: 8,  supplier_name: "NextGen IT",        contact_no: "021-8888", email: "next@gen.com"      },
  { supplier_id: 9,  supplier_name: "Hardware City",     contact_no: "021-9999", email: "hard@city.com"     },
  { supplier_id: 10, supplier_name: "Byte Solutions",    contact_no: "021-1010", email: "byte@sol.com"      },
]

const LOCATIONS: Location[] = [
  { location_id: 1,  location_name: "Main Store Karachi",   location_type: "store"     },
  { location_id: 2,  location_name: "Lahore Store",         location_type: "store"     },
  { location_id: 3,  location_name: "Islamabad Store",      location_type: "store"     },
  { location_id: 4,  location_name: "Central Warehouse",    location_type: "warehouse" },
  { location_id: 5,  location_name: "North Warehouse",      location_type: "warehouse" },
  { location_id: 6,  location_name: "Online Platform",      location_type: "platform"  },
  { location_id: 7,  location_name: "Hyderabad Store",      location_type: "store"     },
  { location_id: 8,  location_name: "Multan Store",         location_type: "store"     },
  { location_id: 9,  location_name: "Faisalabad Store",     location_type: "store"     },
  { location_id: 10, location_name: "Peshawar Store",       location_type: "store"     },
]

const STAFF_LIST: Staff[] = [
  { staff_id: 1,  staff_name: "System Admin",  role_id: 1 },
  { staff_id: 2,  staff_name: "Ali Khan",      role_id: 2 },
  { staff_id: 3,  staff_name: "Sara Ahmed",    role_id: 3 },
  { staff_id: 4,  staff_name: "Usman Tariq",   role_id: 4 },
  { staff_id: 5,  staff_name: "Bilal Hussain", role_id: 5 },
  { staff_id: 6,  staff_name: "Ayesha Noor",   role_id: 6 },
]

const PROCESSORS = [
  "Intel Core i3", "Intel Core i5", "Intel Core i7", "Intel Core i9",
  "AMD Ryzen 3", "AMD Ryzen 5", "AMD Ryzen 7", "AMD Ryzen 9",
  "Apple M1", "Apple M2", "Apple M3",
]
const RAM_OPTIONS        = ["4GB", "8GB", "16GB", "32GB", "64GB"]
const STORAGE_OPTIONS    = ["128GB SSD", "256GB SSD", "512GB SSD", "1TB SSD", "256GB HDD", "512GB HDD", "1TB HDD", "2TB HDD", "2TB SSD"]
const SCREEN_SIZES       = ["13.3", "14", "15.6", "17"] as const
const GPU_SUGGESTIONS    = ["Intel Iris Xe", "Intel UHD 620", "AMD Radeon", "NVIDIA RTX 3050", "NVIDIA RTX 3060", "NVIDIA RTX 4070", "Apple GPU"]

const COLOR_SWATCHES = [
  { label: "Black",    hex: "#1C1C1E" },
  { label: "Silver",   hex: "#C0C0C0" },
  { label: "White",    hex: "#F5F5F5" },
  { label: "Gray",     hex: "#6B7280" },
  { label: "Blue",     hex: "#2563EB" },
  { label: "Red",      hex: "#EF4444" },
  { label: "Gold",     hex: "#D97706" },
  { label: "Rose Gold",hex: "#E8A0A0" },
]

// Mock data  (seed_data.py values)
const MOCK_PRODUCTS: ProductRow[] = [
  { product_id:"PROD101", product_name:"Dell Latitude i5",      product_code:"P101", category_id:1,  category_brand:"Dell",   model_name:"Latitude 5420",   product_type:"laptop",  supplier_id:1, supplier_name:"Tech Distributors", screen_size:14,   color:"Black",  processor:"i5",     ram:"8GB",  primary_storage:"256GB SSD", secondary_storage:"",      gpu:"Intel",  cost_price:80000,  wholesale_price:90000,  sale_price:110000, stock_qty:8,  is_active:true  },
  { product_id:"PROD102", product_name:"HP EliteBook i7",        product_code:"P102", category_id:2,  category_brand:"HP",     model_name:"EliteBook 840",   product_type:"laptop",  supplier_id:2, supplier_name:"Pak Computers",     screen_size:14,   color:"Silver", processor:"i7",     ram:"16GB", primary_storage:"512GB SSD", secondary_storage:"",      gpu:"Intel",  cost_price:100000, wholesale_price:115000, sale_price:140000, stock_qty:5,  is_active:true  },
  { product_id:"PROD103", product_name:"Lenovo T14 Ryzen",       product_code:"P103", category_id:3,  category_brand:"Lenovo", model_name:"ThinkPad T14",    product_type:"laptop",  supplier_id:3, supplier_name:"IT Hub",            screen_size:14,   color:"Black",  processor:"Ryzen 5",ram:"16GB", primary_storage:"512GB SSD", secondary_storage:"",      gpu:"AMD",    cost_price:95000,  wholesale_price:110000, sale_price:135000, stock_qty:4,  is_active:true  },
  { product_id:"PROD104", product_name:"MacBook M1",             product_code:"P104", category_id:4,  category_brand:"Apple",  model_name:"MacBook Pro M1",  product_type:"laptop",  supplier_id:1, supplier_name:"Tech Distributors", screen_size:13.3, color:"Gray",   processor:"M1",     ram:"8GB",  primary_storage:"256GB SSD", secondary_storage:"",      gpu:"Apple",  cost_price:120000, wholesale_price:140000, sale_price:170000, stock_qty:2,  is_active:true  },
  { product_id:"PROD105", product_name:"Acer Aspire 5",          product_code:"P105", category_id:5,  category_brand:"Acer",   model_name:"Aspire 5",        product_type:"laptop",  supplier_id:4, supplier_name:"Mega Traders",      screen_size:15.6, color:"Black",  processor:"i5",     ram:"8GB",  primary_storage:"512GB SSD", secondary_storage:"",      gpu:"Intel",  cost_price:70000,  wholesale_price:82000,  sale_price:99000,  stock_qty:11, is_active:true  },
  { product_id:"PROD106", product_name:"Asus VivoBook",          product_code:"P106", category_id:6,  category_brand:"Asus",   model_name:"VivoBook",        product_type:"laptop",  supplier_id:5, supplier_name:"Digital World",     screen_size:14,   color:"Blue",   processor:"i5",     ram:"8GB",  primary_storage:"256GB SSD", secondary_storage:"",      gpu:"Intel",  cost_price:75000,  wholesale_price:88000,  sale_price:105000, stock_qty:7,  is_active:true  },
  { product_id:"PROD107", product_name:"MSI Modern",             product_code:"P107", category_id:7,  category_brand:"MSI",    model_name:"Modern 14",       product_type:"laptop",  supplier_id:6, supplier_name:"System House",      screen_size:14,   color:"Gray",   processor:"i7",     ram:"16GB", primary_storage:"512GB SSD", secondary_storage:"",      gpu:"Intel",  cost_price:105000, wholesale_price:120000, sale_price:145000, stock_qty:3,  is_active:true  },
  { product_id:"PROD108", product_name:"Dell OptiPlex",          product_code:"P108", category_id:8,  category_brand:"Dell",   model_name:"OptiPlex 7090",   product_type:"desktop", supplier_id:7, supplier_name:"CompZone",          screen_size:null, color:"Black",  processor:"i5",     ram:"8GB",  primary_storage:"1TB HDD",   secondary_storage:"",      gpu:"Intel",  cost_price:65000,  wholesale_price:75000,  sale_price:92000,  stock_qty:6,  is_active:true  },
  { product_id:"PROD109", product_name:"HP ProDesk",             product_code:"P109", category_id:9,  category_brand:"HP",     model_name:"ProDesk 600",     product_type:"desktop", supplier_id:8, supplier_name:"NextGen IT",        screen_size:null, color:"Black",  processor:"i5",     ram:"16GB", primary_storage:"512GB SSD", secondary_storage:"",      gpu:"Intel",  cost_price:70000,  wholesale_price:82000,  sale_price:99000,  stock_qty:4,  is_active:true  },
  { product_id:"PROD110", product_name:"Lenovo ThinkCentre",     product_code:"P110", category_id:10, category_brand:"Lenovo", model_name:"ThinkCentre M70", product_type:"desktop", supplier_id:9, supplier_name:"Hardware City",     screen_size:null, color:"Black",  processor:"i7",     ram:"16GB", primary_storage:"1TB SSD",   secondary_storage:"",      gpu:"Intel",  cost_price:90000,  wholesale_price:105000, sale_price:130000, stock_qty:0,  is_active:false },
]

const MOCK_MOVEMENTS: StockMovement[] = [
  { smr_id:1, product_id:"PROD101", product_name:"Dell Latitude i5",  product_code:"P101", from_location_id:4, from_location_name:"Central Warehouse",  to_location_id:1, to_location_name:"Main Store Karachi", quantity_moved:5, unit_cost:80000,  movement_amount:400000, approved_by:1, approved_by_name:"System Admin",  movement_date:"2026-03-08", remarks:"Store restocking"      },
  { smr_id:2, product_id:"PROD102", product_name:"HP EliteBook i7",    product_code:"P102", from_location_id:4, from_location_name:"Central Warehouse",  to_location_id:2, to_location_name:"Lahore Store",       quantity_moved:3, unit_cost:100000, movement_amount:300000, approved_by:2, approved_by_name:"Ali Khan",       movement_date:"2026-03-07", remarks:"Lahore branch request"  },
  { smr_id:3, product_id:"PROD104", product_name:"MacBook M1",         product_code:"P104", from_location_id:1, from_location_name:"Main Store Karachi", to_location_id:6, to_location_name:"Online Platform",    quantity_moved:2, unit_cost:120000, movement_amount:240000, approved_by:1, approved_by_name:"System Admin",  movement_date:"2026-03-05", remarks:"Online listing"         },
  { smr_id:4, product_id:"PROD107", product_name:"MSI Modern",         product_code:"P107", from_location_id:4, from_location_name:"Central Warehouse",  to_location_id:3, to_location_name:"Islamabad Store",    quantity_moved:2, unit_cost:105000, movement_amount:210000, approved_by:4, approved_by_name:"Usman Tariq",   movement_date:"2026-03-03", remarks:"New branch stock"       },
]

const MOCK_PURCHASES: PurchaseRow[] = [
  { purchase_id:1, supplier_id:1, supplier_name:"Tech Distributors", product_id:"PROD101", product_name:"Dell Latitude i5", product_code:"P101", quantity:10, unit_cost:80000,  total_amount:800000, purchase_date:"2026-03-01", received_by:4, received_by_name:"Usman Tariq",   location_id:4, location_name:"Central Warehouse", remarks:"Quarterly restock"  },
  { purchase_id:2, supplier_id:2, supplier_name:"Pak Computers",     product_id:"PROD102", product_name:"HP EliteBook i7",  product_code:"P102", quantity:5,  unit_cost:100000, total_amount:500000, purchase_date:"2026-02-20", received_by:5, received_by_name:"Bilal Hussain", location_id:4, location_name:"Central Warehouse", remarks:"New stock"          },
  { purchase_id:3, supplier_id:3, supplier_name:"IT Hub",            product_id:"PROD103", product_name:"Lenovo T14 Ryzen", product_code:"P103", quantity:4,  unit_cost:95000,  total_amount:380000, purchase_date:"2026-02-15", received_by:4, received_by_name:"Usman Tariq",   location_id:5, location_name:"North Warehouse",   remarks:""                   },
  { purchase_id:4, supplier_id:4, supplier_name:"Mega Traders",      product_id:"PROD105", product_name:"Acer Aspire 5",    product_code:"P105", quantity:8,  unit_cost:70000,  total_amount:560000, purchase_date:"2026-02-10", received_by:5, received_by_name:"Bilal Hussain", location_id:4, location_name:"Central Warehouse", remarks:"High demand model"  },
]

// ─────────────────────────────────────────────────────────────────────────────
// SHARED HELPERS
// ─────────────────────────────────────────────────────────────────────────────

const fmt = (n: number) => `PKR ${n.toLocaleString("en-PK")}`

function StockPill({ qty }: { qty: number }) {
  if (qty === 0)     return <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium border border-red-500/30 bg-red-500/10 text-red-400">Out of Stock</span>
  if (qty <= 3)      return <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium border border-orange-500/30 bg-orange-500/10 text-orange-400">{qty} — Critical</span>
  if (qty <= 5)      return <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium border border-amber-500/30 bg-amber-500/10 text-amber-400">{qty} — Low</span>
  return               <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium border border-emerald-500/30 bg-emerald-500/10 text-emerald-400">{qty} in stock</span>
}

function StatusPill({ active }: { active: boolean }) {
  return active
    ? <span className="inline-flex px-2 py-0.5 rounded-full text-[10px] font-medium border border-emerald-500/30 bg-emerald-500/10 text-emerald-400">Active</span>
    : <span className="inline-flex px-2 py-0.5 rounded-full text-[10px] font-medium border border-slate-600/40 bg-slate-700/20 text-slate-400">Inactive</span>
}

const field   = "bg-[#0A1628] border-[#1E293B] text-white placeholder:text-[#2D3F55] h-9 text-sm focus:border-[#2563EB] focus:ring-0"
const lbl     = "text-[#94A3B8] text-xs mb-1.5 block font-medium"
const section = "bg-[#060F1E]/80 border border-[#1E293B] rounded-2xl p-6"

function FieldSection({ title, icon: Icon, children }: { title: string; icon: React.ElementType; children: React.ReactNode }) {
  return (
    <div className={section}>
      <div className="flex items-center gap-2 mb-5">
        <div className="w-7 h-7 rounded-lg bg-[#2563EB]/15 border border-[#2563EB]/25 flex items-center justify-center">
          <Icon className="w-3.5 h-3.5 text-[#2563EB]" />
        </div>
        <p className="text-white text-sm font-semibold">{title}</p>
      </div>
      {children}
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// TAB 1 — PRODUCTS LIST
// ─────────────────────────────────────────────────────────────────────────────

function ProductsListTab({ onAddProduct }: { onAddProduct: () => void }) {
  const [products, setProducts] = useState<ProductRow[]>(MOCK_PRODUCTS)
  const [search,      setSearch]      = useState("")
  const [typeFilter,  setTypeFilter]  = useState<string>("all")
  const [brandFilter, setBrandFilter] = useState<string>("all")
  const [sortKey,     setSortKey]     = useState<keyof ProductRow>("product_id")
  const [sortDir,     setSortDir]     = useState<"asc"|"desc">("asc")

  const brands = useMemo(() => [...new Set(MOCK_PRODUCTS.map(p => p.category_brand))].sort(), [])

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()
    let rows = products.filter(p => {
      const matchQ    = !q || p.product_name.toLowerCase().includes(q) || p.product_code.toLowerCase().includes(q) || p.category_brand.toLowerCase().includes(q) || p.processor.toLowerCase().includes(q)
      const matchType = typeFilter === "all" || p.product_type === typeFilter
      const matchBrand= brandFilter === "all" || p.category_brand === brandFilter
      return matchQ && matchType && matchBrand
    })
    rows = [...rows].sort((a, b) => {
      const av = String(a[sortKey] ?? "")
      const bv = String(b[sortKey] ?? "")
      const cmp = av.localeCompare(bv, undefined, { numeric: true })
      return sortDir === "asc" ? cmp : -cmp
    })
    return rows
  }, [products, search, typeFilter, brandFilter, sortKey, sortDir])

  const toggleSort = (key: keyof ProductRow) => {
    if (sortKey === key) setSortDir(d => d === "asc" ? "desc" : "asc")
    else { setSortKey(key); setSortDir("asc") }
  }

  const sortIcon = (key: keyof ProductRow) => (
    <ArrowUpDown className={cn("w-3 h-3 ml-1 inline-block", sortKey === key ? "text-[#2563EB]" : "text-[#2D3F55]")} />
  )

  // Summary KPIs
  const total      = products.length
  const active     = products.filter(p => p.is_active).length
  const outOfStock = products.filter(p => p.stock_qty === 0).length
  const lowStock   = products.filter(p => p.stock_qty > 0 && p.stock_qty <= 5).length
  const invValue   = products.reduce((s, p) => s + p.cost_price * p.stock_qty, 0)

  const kpis = [
    { label: "Total Products", value: total,          accent: "text-white"        },
    { label: "Active",         value: active,         accent: "text-emerald-400"  },
    { label: "Out of Stock",   value: outOfStock,     accent: "text-red-400"      },
    { label: "Low Stock",      value: `${lowStock} (≤5)`, accent: "text-amber-400"},
    { label: "Inventory Value",value: fmt(invValue),  accent: "text-[#2563EB]"    },
  ]

  return (
    <div className="space-y-5">
      {/* KPI cards */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
        {kpis.map(k => (
          <div key={k.label} className="bg-[#060F1E]/80 border border-[#1E293B] rounded-2xl px-4 py-3.5 space-y-1">
            <p className="text-[#64748B] text-[10px] uppercase tracking-wider font-medium">{k.label}</p>
            <p className={cn("text-sm font-bold", k.accent)}>{k.value}</p>
          </div>
        ))}
      </div>

      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row gap-2.5">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[#64748B] pointer-events-none" />
          <Input
            value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Search name, code, brand, processor…"
            className={cn(field, "pl-9")}
          />
          {search && (
            <button onClick={() => setSearch("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-[#64748B] hover:text-white">
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        <Select value={typeFilter} onValueChange={setTypeFilter}>
          <SelectTrigger className={cn(field, "w-36")}><SelectValue placeholder="All Types" /></SelectTrigger>
          <SelectContent className="bg-[#0F1E35] border-[#1E293B] text-white">
            <SelectItem value="all">All Types</SelectItem>
            <SelectItem value="laptop">Laptop</SelectItem>
            <SelectItem value="desktop">Desktop</SelectItem>
            <SelectItem value="tower">Tower</SelectItem>
          </SelectContent>
        </Select>

        <Select value={brandFilter} onValueChange={setBrandFilter}>
          <SelectTrigger className={cn(field, "w-40")}><SelectValue placeholder="All Brands" /></SelectTrigger>
          <SelectContent className="bg-[#0F1E35] border-[#1E293B] text-white">
            <SelectItem value="all">All Brands</SelectItem>
            {brands.map(b => <SelectItem key={b} value={b}>{b}</SelectItem>)}
          </SelectContent>
        </Select>

        <Button onClick={onAddProduct} className="bg-[#2563EB] hover:bg-[#1D4ED8] text-white h-9 text-sm gap-1.5 px-4 rounded-xl">
          <Plus className="w-4 h-4" /> Add Product
        </Button>
      </div>

      {/* Table */}
      <div className="bg-[#060F1E]/80 border border-[#1E293B] rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="border-b border-[#1E293B] hover:bg-transparent">
                {([
                  ["product_id",   "ID"        ],
                  ["product_name", "Product"   ],
                  ["category_brand","Brand"    ],
                  ["processor",    "Processor" ],
                  ["ram",          "RAM"       ],
                  ["primary_storage","Storage" ],
                  ["stock_qty",    "Stock"     ],
                  ["cost_price",   "Cost"      ],
                  ["sale_price",   "Sale Price"],
                ] as [keyof ProductRow, string][]).map(([k, label]) => (
                  <TableHead key={k}
                    onClick={() => toggleSort(k)}
                    className="text-[#64748B] text-[11px] uppercase tracking-wider cursor-pointer select-none hover:text-[#94A3B8] whitespace-nowrap py-3">
                    {label}{sortIcon(k)}
                  </TableHead>
                ))}
                <TableHead className="text-[#64748B] text-[11px] uppercase tracking-wider py-3">Status</TableHead>
                <TableHead className="text-[#64748B] text-[11px] uppercase tracking-wider py-3 text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={11} className="text-center py-14 text-[#2D3F55]">
                    <Package className="w-8 h-8 mx-auto mb-2 opacity-40" />
                    <p className="text-sm">No products match your filters.</p>
                  </TableCell>
                </TableRow>
              ) : filtered.map(p => (
                <TableRow key={p.product_id} className="border-b border-[#0F1E35] hover:bg-[#0A1628]/60 transition-colors group">
                  <TableCell>
                    <span className="font-mono text-[#2563EB] text-xs bg-[#2563EB]/8 px-2 py-0.5 rounded-md">{p.product_id}</span>
                  </TableCell>
                  <TableCell>
                    <p className="text-white text-xs font-semibold leading-tight">{p.product_name}</p>
                    <p className="text-[#2D3F55] text-[10px] mt-0.5">{p.product_code} · {p.model_name}</p>
                  </TableCell>
                  <TableCell>
                    <span className="text-[#94A3B8] text-xs bg-[#1E293B] px-2.5 py-0.5 rounded-lg">{p.category_brand}</span>
                  </TableCell>
                  <TableCell className="text-[#94A3B8] text-xs whitespace-nowrap">{p.processor}</TableCell>
                  <TableCell className="text-[#94A3B8] text-xs">{p.ram}</TableCell>
                  <TableCell className="text-[#94A3B8] text-xs whitespace-nowrap">{p.primary_storage}</TableCell>
                  <TableCell><StockPill qty={p.stock_qty} /></TableCell>
                  <TableCell className="text-[#64748B] text-xs whitespace-nowrap">{fmt(p.cost_price)}</TableCell>
                  <TableCell className="text-white text-xs font-semibold whitespace-nowrap">{fmt(p.sale_price)}</TableCell>
                  <TableCell><StatusPill active={p.is_active} /></TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                      {[
                        { Icon: Eye,    cls: "hover:text-[#2563EB] hover:bg-[#2563EB]/10" },
                        { Icon: Pencil, cls: "hover:text-amber-400 hover:bg-amber-500/10" },
                        { Icon: Trash2, cls: "hover:text-red-400 hover:bg-red-500/10"     },
                      ].map(({ Icon, cls }) => (
                        <button key={cls} className={cn("w-7 h-7 rounded-lg flex items-center justify-center text-[#2D3F55] transition-colors", cls)}>
                          <Icon className="w-3.5 h-3.5" />
                        </button>
                      ))}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
        <div className="px-4 py-2.5 border-t border-[#1E293B] flex items-center justify-between">
          <p className="text-[#2D3F55] text-xs">Showing <span className="text-[#64748B]">{filtered.length}</span> of <span className="text-[#64748B]">{total}</span> products</p>
          <p className="text-[#2D3F55] text-xs">Last synced: just now</p>
        </div>
      </div>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// TAB 2 — ADD PRODUCT FORM
// ─────────────────────────────────────────────────────────────────────────────

const EMPTY_FORM: ProductFormState = {
  product_name:"", product_type:"laptop", category_brand:"", model_name:"",
  screen_size:"", color:"", processor:"", ram:"", primary_storage:"",
  secondary_storage:"", gpu:"", cost_price:"", wholesale_price:"", sale_price:"",
  initial_qty:"", location_id:"", supplier_id:"",
}

function AddProductTab({ onSuccess }: { onSuccess: () => void }) {
  const [form,    setForm]    = useState<ProductFormState>(EMPTY_FORM)
  const [errors,  setErrors]  = useState<Partial<Record<keyof ProductFormState, string>>>({})
  const [images,  setImages]  = useState<{ file: File; preview: string }[]>([])
  const [isDrag,  setIsDrag]  = useState(false)
  const [loading, setLoading] = useState(false)
  const [done,    setDone]    = useState(false)
  const imgRef = useRef<HTMLInputElement>(null)

  const set = (k: keyof ProductFormState, v: string) => {
    setForm(p => ({ ...p, [k]: v }))
    setErrors(e => ({ ...e, [k]: undefined }))
  }

  // Derived pricing state (mirrors products.py validate())
  const cp = Number(form.cost_price)      || 0
  const wp = Number(form.wholesale_price) || 0
  const sp = Number(form.sale_price)      || 0
  const priceHierarchy = {
    wholesale: !form.wholesale_price || wp >= cp,
    sale:      !form.sale_price      || sp >= wp,
  }

  // Image drop
  const processFiles = (files: FileList | null) => {
    if (!files) return
    Array.from(files).filter(f => f.type.startsWith("image/")).forEach(file => {
      const r = new FileReader()
      r.onload = () => setImages(prev => [...prev, { file, preview: r.result as string }])
      r.readAsDataURL(file)
    })
  }
  const onDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault(); setIsDrag(false); processFiles(e.dataTransfer.files)
  }

  // Validate (mirrors products.py Product.validate())
  const validate = (): boolean => {
    const e: typeof errors = {}
    if (!form.product_name.trim())   e.product_name   = "Product name is required."
    if (!form.category_brand)        e.category_brand = "Brand is required."
    if (!form.supplier_id)           e.supplier_id    = "Supplier is required."
    if (!form.model_name.trim())     e.model_name     = "Model name is required."
    if (form.cost_price && cp < 0)   e.cost_price     = "Cannot be negative."
    if (form.wholesale_price && !priceHierarchy.wholesale) e.wholesale_price = "Must be ≥ cost price."
    if (form.sale_price      && !priceHierarchy.sale)      e.sale_price      = "Must be ≥ wholesale price."
    if (form.screen_size && !SCREEN_SIZES.includes(form.screen_size as any))
      e.screen_size = "Must be one of: 13.3, 14, 15.6, 17."
    setErrors(e)
    return Object.keys(e).length === 0
  }

  const handleSubmit = async () => {
    if (!validate()) return
    setLoading(true)
    // TODO: Supabase — insert into categories → products → stocks
    // const { data: cat } = await supabase.from("categories").insert({...}).select().single()
    // const { data: prod } = await supabase.from("products").insert({ category_id: cat.category_id, ... }).select().single()
    // if (form.initial_qty) await supabase.from("stocks").insert({ product_id: prod.product_id, ... })
    await new Promise(r => setTimeout(r, 1600))
    setLoading(false)
    setDone(true)
    setTimeout(() => { setDone(false); setForm(EMPTY_FORM); setImages([]); onSuccess() }, 2200)
  }

  if (done) return (
    <div className="flex flex-col items-center justify-center h-72 gap-4 animate-in fade-in">
      <div className="w-16 h-16 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center">
        <CheckCircle2 className="w-8 h-8 text-emerald-400" />
      </div>
      <p className="text-white font-semibold text-base">Product added successfully!</p>
      <p className="text-[#64748B] text-sm">Redirecting to products list…</p>
    </div>
  )

  const Err = ({ k }: { k: keyof ProductFormState }) =>
    errors[k] ? <p className="text-red-400 text-[10px] mt-1 flex items-center gap-1"><AlertCircle className="w-3 h-3" />{errors[k]}</p> : null

  return (
    <div className="max-w-2xl space-y-5">

      {/* ── Basic Information ── */}
      <FieldSection title="Basic Information" icon={Package}>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

          {/* Product name – full width */}
          <div className="sm:col-span-2 space-y-1.5">
            <label className={lbl}>Product Name <span className="text-red-400">*</span></label>
            <Input value={form.product_name} onChange={e => set("product_name", e.target.value)}
              placeholder="e.g. Dell Latitude 5420 i5 8GB" className={cn(field, errors.product_name && "border-red-500/60")} />
            <Err k="product_name" />
          </div>

          {/* Product Type – radio cards */}
          <div className="sm:col-span-2 space-y-2">
            <label className={lbl}>Product Type <span className="text-red-400">*</span></label>
            <div className="flex gap-2">
              {(["laptop", "desktop", "tower"] as ProductType[]).map(t => (
                <label key={t} className={cn(
                  "flex items-center gap-2 px-4 py-2.5 rounded-xl border cursor-pointer text-sm capitalize font-medium transition-all select-none",
                  form.product_type === t
                    ? "border-[#2563EB] bg-[#2563EB]/10 text-[#2563EB]"
                    : "border-[#1E293B] text-[#64748B] hover:border-[#2D3F55] hover:text-[#94A3B8]"
                )}>
                  <input type="radio" name="product_type" value={t} checked={form.product_type === t}
                    onChange={() => set("product_type", t)} className="sr-only" />
                  <span className={cn("w-2 h-2 rounded-full border transition-colors",
                    form.product_type === t ? "bg-[#2563EB] border-[#2563EB]" : "border-[#2D3F55]")} />
                  {t}
                </label>
              ))}
            </div>
          </div>

          {/* Brand */}
          <div className="space-y-1.5">
            <label className={lbl}>Brand <span className="text-red-400">*</span></label>
            <Select value={form.category_brand} onValueChange={v => set("category_brand", v)}>
              <SelectTrigger className={cn(field, "w-full", errors.category_brand && "border-red-500/60")}>
                <SelectValue placeholder="Select brand" />
              </SelectTrigger>
              <SelectContent className="bg-[#0F1E35] border-[#1E293B] text-white">
                {[...new Set(CATEGORIES.map(c => c.category_brand))].sort().map(b => (
                  <SelectItem key={b} value={b}>{b}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Err k="category_brand" />
          </div>

          {/* Model name */}
          <div className="space-y-1.5">
            <label className={lbl}>Model Name <span className="text-red-400">*</span></label>
            <Input value={form.model_name} onChange={e => set("model_name", e.target.value)}
              placeholder="e.g. Latitude 5420" className={cn(field, errors.model_name && "border-red-500/60")} />
            <Err k="model_name" />
          </div>
        </div>
      </FieldSection>

      {/* ── Specifications ── */}
      <FieldSection title="Specifications" icon={Layers}>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

          {/* Screen size – only for laptop */}
          {form.product_type === "laptop" && (
            <div className="sm:col-span-2 space-y-2">
              <label className={lbl}>Screen Size</label>
              <div className="flex gap-2 flex-wrap">
                {SCREEN_SIZES.map(s => (
                  <label key={s} className={cn(
                    "px-4 py-2 rounded-xl border cursor-pointer text-sm font-medium transition-all select-none",
                    form.screen_size === s
                      ? "border-[#2563EB] bg-[#2563EB]/10 text-[#2563EB]"
                      : "border-[#1E293B] text-[#64748B] hover:border-[#2D3F55] hover:text-[#94A3B8]"
                  )}>
                    <input type="radio" name="screen_size" value={s} checked={form.screen_size === s}
                      onChange={() => set("screen_size", s)} className="sr-only" />
                    {s}"
                  </label>
                ))}
                <label className={cn("px-4 py-2 rounded-xl border cursor-pointer text-sm font-medium transition-all select-none",
                  form.screen_size === "" ? "border-[#1E293B] text-[#64748B]" : "")}>
                  <input type="radio" name="screen_size" value="" checked={form.screen_size === ""}
                    onChange={() => set("screen_size", "")} className="sr-only" />
                  <span className="text-[#2D3F55]">Not specified</span>
                </label>
              </div>
              <Err k="screen_size" />
            </div>
          )}

          {/* Color swatches */}
          <div className="sm:col-span-2 space-y-2">
            <label className={lbl}>Color</label>
            <div className="flex items-center gap-2 flex-wrap">
              {COLOR_SWATCHES.map(c => (
                <button key={c.label} type="button" title={c.label}
                  onClick={() => set("color", c.label)}
                  className={cn("w-7 h-7 rounded-full border-2 transition-all hover:scale-110",
                    form.color === c.label ? "border-white scale-110 ring-1 ring-white/30 ring-offset-1 ring-offset-[#060F1E]" : "border-transparent"
                  )}
                  style={{ backgroundColor: c.hex }} />
              ))}
              <Input value={form.color} onChange={e => set("color", e.target.value)}
                placeholder="Custom…" className={cn(field, "w-28 h-7 text-xs")} />
            </div>
          </div>

          {/* Processor */}
          <div className="space-y-1.5">
            <label className={lbl}>Processor</label>
            <Select value={form.processor} onValueChange={v => set("processor", v)}>
              <SelectTrigger className={cn(field, "w-full")}><SelectValue placeholder="Select processor" /></SelectTrigger>
              <SelectContent className="bg-[#0F1E35] border-[#1E293B] text-white">
                {PROCESSORS.map(p => <SelectItem key={p} value={p}>{p}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>

          {/* RAM */}
          <div className="space-y-1.5">
            <label className={lbl}>RAM</label>
            <Select value={form.ram} onValueChange={v => set("ram", v)}>
              <SelectTrigger className={cn(field, "w-full")}><SelectValue placeholder="Select RAM" /></SelectTrigger>
              <SelectContent className="bg-[#0F1E35] border-[#1E293B] text-white">
                {RAM_OPTIONS.map(r => <SelectItem key={r} value={r}>{r}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>

          {/* Primary storage */}
          <div className="space-y-1.5">
            <label className={lbl}>Primary Storage</label>
            <Select value={form.primary_storage} onValueChange={v => set("primary_storage", v)}>
              <SelectTrigger className={cn(field, "w-full")}><SelectValue placeholder="Select storage" /></SelectTrigger>
              <SelectContent className="bg-[#0F1E35] border-[#1E293B] text-white">
                {STORAGE_OPTIONS.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>

          {/* Secondary storage – optional free text */}
          <div className="space-y-1.5">
            <label className={lbl}>Secondary Storage <span className="text-[#2D3F55] font-normal">(optional)</span></label>
            <Input value={form.secondary_storage} onChange={e => set("secondary_storage", e.target.value)}
              placeholder="e.g. 1TB HDD expansion" className={field} />
          </div>

          {/* GPU */}
          <div className="sm:col-span-2 space-y-1.5">
            <label className={lbl}>GPU</label>
            <Input value={form.gpu} onChange={e => set("gpu", e.target.value)}
              placeholder="e.g. NVIDIA RTX 3050 / Intel Iris Xe" className={field}
              list="gpu-suggestions" />
            <datalist id="gpu-suggestions">
              {GPU_SUGGESTIONS.map(g => <option key={g} value={g} />)}
            </datalist>
          </div>
        </div>
      </FieldSection>

      {/* ── Pricing ── */}
      <FieldSection title="Pricing" icon={TrendingUp}>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {/* Cost */}
          <div className="space-y-1.5">
            <label className={lbl}>Cost Price (PKR) <span className="text-red-400">*</span></label>
            <Input type="number" min="0" value={form.cost_price} onChange={e => set("cost_price", e.target.value)}
              placeholder="0" className={cn(field, errors.cost_price && "border-red-500/60")} />
            <Err k="cost_price" />
          </div>

          {/* Wholesale */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-[#94A3B8] text-xs font-medium">Wholesale Price (PKR) <span className="text-red-400">*</span></label>
              {form.wholesale_price && (
                priceHierarchy.wholesale
                  ? <span className="flex items-center gap-0.5 text-emerald-400 text-[10px]"><CheckCircle2 className="w-3 h-3" />≥ cost</span>
                  : <span className="flex items-center gap-0.5 text-red-400 text-[10px]"><AlertTriangle className="w-3 h-3" />must be ≥ cost</span>
              )}
            </div>
            <Input type="number" min="0" value={form.wholesale_price} onChange={e => set("wholesale_price", e.target.value)}
              placeholder="0" className={cn(field, errors.wholesale_price && "border-red-500/60", form.wholesale_price && !priceHierarchy.wholesale && "border-red-500/60")} />
            <Err k="wholesale_price" />
          </div>

          {/* Sale */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-[#94A3B8] text-xs font-medium">Sale Price (PKR) <span className="text-red-400">*</span></label>
              {form.sale_price && (
                priceHierarchy.sale
                  ? <span className="flex items-center gap-0.5 text-emerald-400 text-[10px]"><CheckCircle2 className="w-3 h-3" />≥ wholesale</span>
                  : <span className="flex items-center gap-0.5 text-red-400 text-[10px]"><AlertTriangle className="w-3 h-3" />must be ≥ wholesale</span>
              )}
            </div>
            <Input type="number" min="0" value={form.sale_price} onChange={e => set("sale_price", e.target.value)}
              placeholder="0" className={cn(field, errors.sale_price && "border-red-500/60", form.sale_price && !priceHierarchy.sale && "border-red-500/60")} />
            <Err k="sale_price" />
          </div>
        </div>

        {/* Price hierarchy visual pill-chain */}
        {cp > 0 && wp > 0 && sp > 0 && (
          <div className="flex items-center gap-2 mt-4 flex-wrap">
            <span className="px-3 py-1.5 text-xs rounded-xl border border-[#1E293B] text-[#94A3B8]">Cost {fmt(cp)}</span>
            <ChevronRight className="w-3.5 h-3.5 text-[#2D3F55]" />
            <span className={cn("px-3 py-1.5 text-xs rounded-xl border", priceHierarchy.wholesale
              ? "border-emerald-500/25 bg-emerald-500/8 text-emerald-400"
              : "border-red-500/30 bg-red-500/8 text-red-400")}>
              Wholesale {fmt(wp)}
            </span>
            <ChevronRight className="w-3.5 h-3.5 text-[#2D3F55]" />
            <span className={cn("px-3 py-1.5 text-xs rounded-xl border", priceHierarchy.sale
              ? "border-[#2563EB]/30 bg-[#2563EB]/8 text-[#2563EB]"
              : "border-red-500/30 bg-red-500/8 text-red-400")}>
              Sale {fmt(sp)}
            </span>
            {priceHierarchy.wholesale && priceHierarchy.sale && (
              <span className="flex items-center gap-1 text-emerald-400 text-xs ml-1">
                <CheckCircle2 className="w-3.5 h-3.5" /> Hierarchy valid
              </span>
            )}
          </div>
        )}
      </FieldSection>

      {/* ── Images ── */}
      <FieldSection title="Product Images" icon={ImagePlus}>
        <div
          onDragOver={e => { e.preventDefault(); setIsDrag(true) }}
          onDragLeave={() => setIsDrag(false)}
          onDrop={onDrop}
          onClick={() => imgRef.current?.click()}
          className={cn(
            "border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all",
            isDrag
              ? "border-[#2563EB] bg-[#2563EB]/8 scale-[0.995]"
              : "border-[#1E293B] hover:border-[#2563EB]/40 hover:bg-[#2563EB]/4"
          )}
        >
          <UploadCloud className={cn("w-8 h-8 mx-auto mb-2 transition-colors", isDrag ? "text-[#2563EB]" : "text-[#2D3F55]")} />
          <p className="text-[#94A3B8] text-sm">
            Drag & drop images here, or <span className="text-[#2563EB] font-medium">browse</span>
          </p>
          <p className="text-[#2D3F55] text-xs mt-1">PNG · JPG · WEBP · max 5 MB each · multiple files</p>
          <p className="text-[#1E293B] text-[10px] mt-1.5">Images are uploaded to Cloudinary on submit</p>
          <input ref={imgRef} type="file" multiple accept="image/*" className="sr-only"
            onChange={e => processFiles(e.target.files)} />
        </div>

        {images.length > 0 && (
          <div className="flex flex-wrap gap-3 mt-4">
            {images.map((img, i) => (
              <div key={i} className="relative group/img w-20 h-20 rounded-xl overflow-hidden border border-[#1E293B]">
                <img src={img.preview} alt="" className="w-full h-full object-cover" />
                <button
                  onClick={e => { e.stopPropagation(); setImages(p => p.filter((_, idx) => idx !== i)) }}
                  className="absolute inset-0 bg-black/60 flex items-center justify-center opacity-0 group-hover/img:opacity-100 transition-opacity"
                >
                  <X className="w-4 h-4 text-white" />
                </button>
                <span className="absolute bottom-0 left-0 right-0 text-[9px] text-white/60 text-center pb-1 truncate px-1">
                  {img.file.name}
                </span>
              </div>
            ))}
          </div>
        )}
      </FieldSection>

      {/* ── Stock ── */}
      <FieldSection title="Initial Stock" icon={BarChart3}>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="space-y-1.5">
            <label className={lbl}>Initial Quantity</label>
            <Input type="number" min="0" value={form.initial_qty} onChange={e => set("initial_qty", e.target.value)}
              placeholder="0" className={field} />
          </div>
          <div className="space-y-1.5">
            <label className={lbl}>Location</label>
            <Select value={form.location_id} onValueChange={v => set("location_id", v)}>
              <SelectTrigger className={cn(field, "w-full")}><SelectValue placeholder="Select location" /></SelectTrigger>
              <SelectContent className="bg-[#0F1E35] border-[#1E293B] text-white max-h-48">
                {LOCATIONS.map(l => (
                  <SelectItem key={l.location_id} value={String(l.location_id)}>
                    <span>{l.location_name}</span>
                    <span className="ml-1.5 text-[#64748B] text-xs capitalize">({l.location_type})</span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <label className={lbl}>Supplier <span className="text-red-400">*</span></label>
            <Select value={form.supplier_id} onValueChange={v => set("supplier_id", v)}>
              <SelectTrigger className={cn(field, "w-full", errors.supplier_id && "border-red-500/60")}>
                <SelectValue placeholder="Select supplier" />
              </SelectTrigger>
              <SelectContent className="bg-[#0F1E35] border-[#1E293B] text-white max-h-48">
                {SUPPLIERS.map(s => <SelectItem key={s.supplier_id} value={String(s.supplier_id)}>{s.supplier_name}</SelectItem>)}
              </SelectContent>
            </Select>
            <Err k="supplier_id" />
          </div>
        </div>
      </FieldSection>

      {/* Submit row */}
      <div className="flex items-center gap-3 pt-1">
        <Button onClick={handleSubmit} disabled={loading}
          className="bg-[#2563EB] hover:bg-[#1D4ED8] text-white h-11 px-7 text-sm font-semibold rounded-xl gap-2 disabled:opacity-60">
          {loading
            ? <><Loader2 className="w-4 h-4 animate-spin" /> Adding Product…</>
            : <><Plus className="w-4 h-4" /> Add Product</>
          }
        </Button>
        <Button variant="ghost" onClick={() => { setForm(EMPTY_FORM); setImages([]); setErrors({}) }}
          className="text-[#64748B] hover:text-white hover:bg-[#1E293B] h-11 gap-1.5 rounded-xl">
          <RotateCcw className="w-3.5 h-3.5" /> Reset
        </Button>
      </div>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// TAB 3 — STOCK MOVEMENT
// ─────────────────────────────────────────────────────────────────────────────

const EMPTY_TRANSFER: TransferFormState = {
  product_id: "", from_location_id: "", to_location_id: "", quantity: "", remarks: "",
}

function StockMovementTab() {
  const [movements, setMovements] = useState<StockMovement[]>(MOCK_MOVEMENTS)
  const [open,    setOpen]    = useState(false)
  const [form,    setForm]    = useState<TransferFormState>(EMPTY_TRANSFER)
  const [errors,  setErrors]  = useState<Partial<Record<keyof TransferFormState, string>>>({})
  const [loading, setLoading] = useState(false)

  const set = (k: keyof TransferFormState, v: string) => {
    setForm(p => ({ ...p, [k]: v }))
    setErrors(e => ({ ...e, [k]: undefined }))
  }

  // Selected product's current stock for UX guard
  const selectedProduct = MOCK_PRODUCTS.find(p => p.product_id === form.product_id)

  const validate = () => {
    const e: typeof errors = {}
    if (!form.product_id)                   e.product_id       = "Product is required."
    if (!form.from_location_id)             e.from_location_id = "From location is required."
    if (!form.to_location_id)               e.to_location_id   = "To location is required."
    if (form.from_location_id === form.to_location_id && form.from_location_id)
                                            e.to_location_id   = "Must differ from source."
    if (!form.quantity || Number(form.quantity) <= 0) e.quantity = "Enter a valid quantity."
    if (selectedProduct && Number(form.quantity) > selectedProduct.stock_qty)
                                            e.quantity         = `Only ${selectedProduct.stock_qty} available.`
    setErrors(e)
    return Object.keys(e).length === 0
  }

  const handleSubmit = async () => {
    if (!validate()) return
    setLoading(true)
    // TODO: Supabase — insert into stock_movement_records, update stocks
    await new Promise(r => setTimeout(r, 1000))
    const prod  = MOCK_PRODUCTS.find(p => p.product_id === form.product_id)!
    const from  = LOCATIONS.find(l => l.location_id === Number(form.from_location_id))!
    const to    = LOCATIONS.find(l => l.location_id === Number(form.to_location_id))!
    const qty   = Number(form.quantity)
    const newRecord: StockMovement = {
      smr_id:            movements.length + 1,
      product_id:        prod.product_id,
      product_name:      prod.product_name,
      product_code:      prod.product_code,
      from_location_id:  from.location_id,
      from_location_name:from.location_name,
      to_location_id:    to.location_id,
      to_location_name:  to.location_name,
      quantity_moved:    qty,
      unit_cost:         prod.cost_price,
      movement_amount:   qty * prod.cost_price,
      approved_by:       1,
      approved_by_name:  "System Admin",
      movement_date:     new Date().toISOString().split("T")[0],
      remarks:           form.remarks,
    }
    setMovements(p => [newRecord, ...p])
    setLoading(false)
    setOpen(false)
    setForm(EMPTY_TRANSFER)
    setErrors({})
  }

  const Err = ({ k }: { k: keyof TransferFormState }) =>
    errors[k] ? <p className="text-red-400 text-[10px] mt-1 flex items-center gap-1"><AlertCircle className="w-3 h-3"/>{errors[k]}</p> : null

  return (
    <div className="space-y-5">
      {/* Toolbar */}
      <div className="flex items-center justify-between">
        <div>
          <p className="text-white text-sm font-semibold">Stock Transfer Records</p>
          <p className="text-[#64748B] text-xs mt-0.5">{movements.length} movements · Value: {fmt(movements.reduce((s, m) => s + m.movement_amount, 0))}</p>
        </div>
        <Button onClick={() => setOpen(true)} className="bg-[#2563EB] hover:bg-[#1D4ED8] text-white h-9 text-sm gap-1.5 rounded-xl">
          <MoveRight className="w-4 h-4" /> New Transfer
        </Button>
      </div>

      {/* Table */}
      <div className="bg-[#060F1E]/80 border border-[#1E293B] rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="border-b border-[#1E293B] hover:bg-transparent">
                {["#","Product","From","","To","Qty","Amount","Approved By","Date","Remarks"].map(h => (
                  <TableHead key={h} className="text-[#64748B] text-[11px] uppercase tracking-wider py-3 whitespace-nowrap">{h}</TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {movements.map(m => (
                <TableRow key={m.smr_id} className="border-b border-[#0F1E35] hover:bg-[#0A1628]/60 transition-colors">
                  <TableCell><span className="font-mono text-[#2563EB] text-xs">#{m.smr_id}</span></TableCell>
                  <TableCell>
                    <p className="text-white text-xs font-semibold">{m.product_name}</p>
                    <p className="text-[#2D3F55] text-[10px]">{m.product_code}</p>
                  </TableCell>
                  <TableCell className="text-[#94A3B8] text-xs max-w-[110px]">
                    <p className="truncate">{m.from_location_name}</p>
                  </TableCell>
                  <TableCell>
                    <MoveRight className="w-3.5 h-3.5 text-[#2563EB]" />
                  </TableCell>
                  <TableCell className="text-[#94A3B8] text-xs max-w-[110px]">
                    <p className="truncate">{m.to_location_name}</p>
                  </TableCell>
                  <TableCell>
                    <span className="text-white text-xs font-bold bg-[#1E293B] px-2 py-0.5 rounded-lg">{m.quantity_moved}</span>
                  </TableCell>
                  <TableCell className="text-[#94A3B8] text-xs whitespace-nowrap">{fmt(m.movement_amount)}</TableCell>
                  <TableCell className="text-[#94A3B8] text-xs">{m.approved_by_name}</TableCell>
                  <TableCell className="text-[#64748B] text-xs whitespace-nowrap">{m.movement_date}</TableCell>
                  <TableCell className="text-[#64748B] text-xs max-w-[100px]">
                    <p className="truncate">{m.remarks || "—"}</p>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* New Transfer Modal */}
      <Dialog open={open} onOpenChange={v => { if (!loading) { setOpen(v); if (!v) { setForm(EMPTY_TRANSFER); setErrors({}) } } }}>
        <DialogContent className="bg-[#0D1B2E] border border-[#1E293B] text-white max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-white">
              <div className="w-7 h-7 rounded-lg bg-[#2563EB]/15 border border-[#2563EB]/25 flex items-center justify-center">
                <MoveRight className="w-3.5 h-3.5 text-[#2563EB]" />
              </div>
              New Stock Transfer
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-1">
            {/* Product */}
            <div className="space-y-1.5">
              <label className={lbl}>Product <span className="text-red-400">*</span></label>
              <Select value={form.product_id} onValueChange={v => set("product_id", v)}>
                <SelectTrigger className={cn(field, "w-full", errors.product_id && "border-red-500/60")}>
                  <SelectValue placeholder="Select product" />
                </SelectTrigger>
                <SelectContent className="bg-[#0F1E35] border-[#1E293B] text-white max-h-52">
                  {MOCK_PRODUCTS.filter(p => p.is_active && p.stock_qty > 0).map(p => (
                    <SelectItem key={p.product_id} value={p.product_id}>
                      <span className="font-medium">{p.product_name}</span>
                      <span className="text-[#64748B] text-xs ml-1.5">({p.stock_qty} in stock)</span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Err k="product_id" />
              {selectedProduct && (
                <p className="text-[#64748B] text-xs">Available stock: <span className="text-white font-medium">{selectedProduct.stock_qty} units</span></p>
              )}
            </div>

            {/* From / To */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className={lbl}>From Location <span className="text-red-400">*</span></label>
                <Select value={form.from_location_id} onValueChange={v => set("from_location_id", v)}>
                  <SelectTrigger className={cn(field, "w-full", errors.from_location_id && "border-red-500/60")}>
                    <SelectValue placeholder="From" />
                  </SelectTrigger>
                  <SelectContent className="bg-[#0F1E35] border-[#1E293B] text-white max-h-48">
                    {LOCATIONS.map(l => <SelectItem key={l.location_id} value={String(l.location_id)}>{l.location_name}</SelectItem>)}
                  </SelectContent>
                </Select>
                <Err k="from_location_id" />
              </div>
              <div className="space-y-1.5">
                <label className={lbl}>To Location <span className="text-red-400">*</span></label>
                <Select value={form.to_location_id} onValueChange={v => set("to_location_id", v)}>
                  <SelectTrigger className={cn(field, "w-full", errors.to_location_id && "border-red-500/60")}>
                    <SelectValue placeholder="To" />
                  </SelectTrigger>
                  <SelectContent className="bg-[#0F1E35] border-[#1E293B] text-white max-h-48">
                    {LOCATIONS.filter(l => l.location_id !== Number(form.from_location_id)).map(l => (
                      <SelectItem key={l.location_id} value={String(l.location_id)}>{l.location_name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Err k="to_location_id" />
              </div>
            </div>

            {/* Quantity */}
            <div className="space-y-1.5">
              <label className={lbl}>Quantity to Move <span className="text-red-400">*</span></label>
              <Input type="number" min="1" max={selectedProduct?.stock_qty}
                value={form.quantity} onChange={e => set("quantity", e.target.value)}
                placeholder="0" className={cn(field, errors.quantity && "border-red-500/60")} />
              <Err k="quantity" />
            </div>

            {/* Remarks */}
            <div className="space-y-1.5">
              <label className={lbl}>Remarks <span className="text-[#2D3F55] font-normal">(optional)</span></label>
              <Input value={form.remarks} onChange={e => set("remarks", e.target.value)}
                placeholder="Reason for transfer…" className={field} />
            </div>
          </div>

          <DialogFooter className="gap-2 pt-1">
            <Button variant="ghost" onClick={() => setOpen(false)} disabled={loading}
              className="border border-[#1E293B] text-[#64748B] hover:text-white hover:bg-[#1E293B] rounded-xl">Cancel</Button>
            <Button onClick={handleSubmit} disabled={loading}
              className="bg-[#2563EB] hover:bg-[#1D4ED8] text-white gap-2 rounded-xl">
              {loading ? <><Loader2 className="w-4 h-4 animate-spin" />Transferring…</> : <><MoveRight className="w-4 h-4" />Transfer Stock</>}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// TAB 4 — PURCHASES
// ─────────────────────────────────────────────────────────────────────────────

const EMPTY_PURCHASE: PurchaseFormState = {
  supplier_id: "", product_id: "", quantity: "", unit_cost: "",
  received_by: "", location_id: "", remarks: "",
}

function PurchasesTab() {
  const [purchases, setPurchases] = useState<PurchaseRow[]>(MOCK_PURCHASES)
  const [open,    setOpen]    = useState(false)
  const [form,    setForm]    = useState<PurchaseFormState>(EMPTY_PURCHASE)
  const [errors,  setErrors]  = useState<Partial<Record<keyof PurchaseFormState, string>>>({})
  const [loading, setLoading] = useState(false)

  const set = (k: keyof PurchaseFormState, v: string) => {
    setForm(p => ({ ...p, [k]: v }))
    setErrors(e => ({ ...e, [k]: undefined }))
    // Auto-fill unit_cost from product's cost_price
    if (k === "product_id") {
      const prod = MOCK_PRODUCTS.find(p => p.product_id === v)
      if (prod) setForm(prev => ({ ...prev, product_id: v, unit_cost: String(prod.cost_price) }))
    }
  }

  const previewTotal = Number(form.quantity) > 0 && Number(form.unit_cost) > 0
    ? Number(form.quantity) * Number(form.unit_cost)
    : 0

  const validate = () => {
    const e: typeof errors = {}
    if (!form.supplier_id)                      e.supplier_id  = "Supplier is required."
    if (!form.product_id)                       e.product_id   = "Product is required."
    if (!form.quantity || Number(form.quantity) <= 0) e.quantity = "Quantity must be > 0."
    if (!form.unit_cost || Number(form.unit_cost) < 0) e.unit_cost = "Unit cost required."
    if (!form.received_by)                      e.received_by  = "Select receiving staff."
    if (!form.location_id)                      e.location_id  = "Location is required."
    setErrors(e)
    return Object.keys(e).length === 0
  }

  const handleSubmit = async () => {
    if (!validate()) return
    setLoading(true)
    // TODO: Supabase — insert into purchases, update stocks + inventory
    // const { data } = await supabase.from("purchases").insert({ supplier_id, product_id, quantity, unit_cost, received_by, location_id, remarks }).select().single()
    // update stocks qty_stocked += quantity WHERE product_id AND location_id
    await new Promise(r => setTimeout(r, 1100))
    const supplier = SUPPLIERS.find(s => s.supplier_id === Number(form.supplier_id))!
    const prod     = MOCK_PRODUCTS.find(p => p.product_id === form.product_id)!
    const staff    = STAFF_LIST.find(s => s.staff_id === Number(form.received_by))!
    const location = LOCATIONS.find(l => l.location_id === Number(form.location_id))!
    const qty      = Number(form.quantity)
    const uc       = Number(form.unit_cost)
    const newRow: PurchaseRow = {
      purchase_id:     purchases.length + 1,
      supplier_id:     supplier.supplier_id,
      supplier_name:   supplier.supplier_name,
      product_id:      prod.product_id,
      product_name:    prod.product_name,
      product_code:    prod.product_code,
      quantity:        qty,
      unit_cost:       uc,
      total_amount:    qty * uc,
      purchase_date:   new Date().toISOString().split("T")[0],
      received_by:     staff.staff_id,
      received_by_name:staff.staff_name,
      location_id:     location.location_id,
      location_name:   location.location_name,
      remarks:         form.remarks,
    }
    setPurchases(p => [newRow, ...p])
    setLoading(false)
    setOpen(false)
    setForm(EMPTY_PURCHASE)
    setErrors({})
  }

  const totalValue = purchases.reduce((s, p) => s + p.total_amount, 0)

  const Err = ({ k }: { k: keyof PurchaseFormState }) =>
    errors[k] ? <p className="text-red-400 text-[10px] mt-1 flex items-center gap-1"><AlertCircle className="w-3 h-3"/>{errors[k]}</p> : null

  return (
    <div className="space-y-5">
      {/* Toolbar */}
      <div className="flex items-center justify-between">
        <div>
          <p className="text-white text-sm font-semibold">Supplier Purchase Records</p>
          <p className="text-[#64748B] text-xs mt-0.5">{purchases.length} records · Total: <span className="text-[#2563EB]">{fmt(totalValue)}</span></p>
        </div>
        <Button onClick={() => setOpen(true)} className="bg-[#2563EB] hover:bg-[#1D4ED8] text-white h-9 text-sm gap-1.5 rounded-xl">
          <ShoppingBag className="w-4 h-4" /> Record Purchase
        </Button>
      </div>

      {/* Table */}
      <div className="bg-[#060F1E]/80 border border-[#1E293B] rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="border-b border-[#1E293B] hover:bg-transparent">
                {["#","Supplier","Product","Qty","Unit Cost","Total","Received By","Location","Date","Remarks"].map(h => (
                  <TableHead key={h} className="text-[#64748B] text-[11px] uppercase tracking-wider py-3 whitespace-nowrap">{h}</TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {purchases.map(p => (
                <TableRow key={p.purchase_id} className="border-b border-[#0F1E35] hover:bg-[#0A1628]/60 transition-colors">
                  <TableCell><span className="font-mono text-[#2563EB] text-xs">#{p.purchase_id}</span></TableCell>
                  <TableCell className="text-[#94A3B8] text-xs whitespace-nowrap">{p.supplier_name}</TableCell>
                  <TableCell>
                    <p className="text-white text-xs font-semibold">{p.product_name}</p>
                    <p className="text-[#2D3F55] text-[10px]">{p.product_code}</p>
                  </TableCell>
                  <TableCell>
                    <span className="text-white text-xs font-bold bg-[#1E293B] px-2 py-0.5 rounded-lg">{p.quantity}</span>
                  </TableCell>
                  <TableCell className="text-[#94A3B8] text-xs whitespace-nowrap">{fmt(p.unit_cost)}</TableCell>
                  <TableCell className="text-[#2563EB] text-xs font-semibold whitespace-nowrap">{fmt(p.total_amount)}</TableCell>
                  <TableCell className="text-[#94A3B8] text-xs whitespace-nowrap">{p.received_by_name}</TableCell>
                  <TableCell className="text-[#94A3B8] text-xs max-w-[110px]">
                    <p className="truncate">{p.location_name}</p>
                  </TableCell>
                  <TableCell className="text-[#64748B] text-xs whitespace-nowrap">{p.purchase_date}</TableCell>
                  <TableCell className="text-[#64748B] text-xs max-w-[100px]">
                    <p className="truncate">{p.remarks || "—"}</p>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
        <div className="px-4 py-2.5 border-t border-[#1E293B] flex justify-end">
          <p className="text-xs text-[#64748B]">Grand Total: <span className="text-[#2563EB] font-bold">{fmt(totalValue)}</span></p>
        </div>
      </div>

      {/* Record Purchase Modal */}
      <Dialog open={open} onOpenChange={v => { if (!loading) { setOpen(v); if (!v) { setForm(EMPTY_PURCHASE); setErrors({}) } } }}>
        <DialogContent className="bg-[#0D1B2E] border border-[#1E293B] text-white max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-white">
              <div className="w-7 h-7 rounded-lg bg-[#2563EB]/15 border border-[#2563EB]/25 flex items-center justify-center">
                <ShoppingBag className="w-3.5 h-3.5 text-[#2563EB]" />
              </div>
              Record New Purchase
            </DialogTitle>
          </DialogHeader>

          <div className="grid grid-cols-2 gap-4 py-1">
            {/* Supplier */}
            <div className="col-span-2 space-y-1.5">
              <label className={lbl}>Supplier <span className="text-red-400">*</span></label>
              <Select value={form.supplier_id} onValueChange={v => set("supplier_id", v)}>
                <SelectTrigger className={cn(field, "w-full", errors.supplier_id && "border-red-500/60")}>
                  <SelectValue placeholder="Select supplier" />
                </SelectTrigger>
                <SelectContent className="bg-[#0F1E35] border-[#1E293B] text-white max-h-48">
                  {SUPPLIERS.map(s => <SelectItem key={s.supplier_id} value={String(s.supplier_id)}>{s.supplier_name}</SelectItem>)}
                </SelectContent>
              </Select>
              <Err k="supplier_id" />
            </div>

            {/* Product */}
            <div className="col-span-2 space-y-1.5">
              <label className={lbl}>Product <span className="text-red-400">*</span></label>
              <Select value={form.product_id} onValueChange={v => set("product_id", v)}>
                <SelectTrigger className={cn(field, "w-full", errors.product_id && "border-red-500/60")}>
                  <SelectValue placeholder="Select product" />
                </SelectTrigger>
                <SelectContent className="bg-[#0F1E35] border-[#1E293B] text-white max-h-52">
                  {MOCK_PRODUCTS.map(p => (
                    <SelectItem key={p.product_id} value={p.product_id}>
                      <span>{p.product_name}</span>
                      <span className="text-[#64748B] text-xs ml-1.5">({p.product_code})</span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Err k="product_id" />
            </div>

            {/* Qty */}
            <div className="space-y-1.5">
              <label className={lbl}>Quantity <span className="text-red-400">*</span></label>
              <Input type="number" min="1" value={form.quantity} onChange={e => set("quantity", e.target.value)}
                placeholder="0" className={cn(field, errors.quantity && "border-red-500/60")} />
              <Err k="quantity" />
            </div>

            {/* Unit cost */}
            <div className="space-y-1.5">
              <label className={lbl}>Unit Cost (PKR) <span className="text-red-400">*</span></label>
              <Input type="number" min="0" value={form.unit_cost} onChange={e => set("unit_cost", e.target.value)}
                placeholder="0" className={cn(field, errors.unit_cost && "border-red-500/60")} />
              <Err k="unit_cost" />
            </div>

            {/* Total preview */}
            {previewTotal > 0 && (
              <div className="col-span-2 flex items-center justify-between bg-[#0A1628] border border-[#2563EB]/20 rounded-xl px-4 py-3">
                <span className="text-[#64748B] text-xs font-medium">Purchase Total</span>
                <span className="text-[#2563EB] font-bold text-sm">{fmt(previewTotal)}</span>
              </div>
            )}

            {/* Received by */}
            <div className="space-y-1.5">
              <label className={lbl}>Received By <span className="text-red-400">*</span></label>
              <Select value={form.received_by} onValueChange={v => set("received_by", v)}>
                <SelectTrigger className={cn(field, "w-full", errors.received_by && "border-red-500/60")}>
                  <SelectValue placeholder="Select staff" />
                </SelectTrigger>
                <SelectContent className="bg-[#0F1E35] border-[#1E293B] text-white">
                  {STAFF_LIST.map(s => <SelectItem key={s.staff_id} value={String(s.staff_id)}>{s.staff_name}</SelectItem>)}
                </SelectContent>
              </Select>
              <Err k="received_by" />
            </div>

            {/* Location */}
            <div className="space-y-1.5">
              <label className={lbl}>Receiving Location <span className="text-red-400">*</span></label>
              <Select value={form.location_id} onValueChange={v => set("location_id", v)}>
                <SelectTrigger className={cn(field, "w-full", errors.location_id && "border-red-500/60")}>
                  <SelectValue placeholder="Select location" />
                </SelectTrigger>
                <SelectContent className="bg-[#0F1E35] border-[#1E293B] text-white max-h-48">
                  {LOCATIONS.map(l => <SelectItem key={l.location_id} value={String(l.location_id)}>{l.location_name}</SelectItem>)}
                </SelectContent>
              </Select>
              <Err k="location_id" />
            </div>

            {/* Remarks */}
            <div className="col-span-2 space-y-1.5">
              <label className={lbl}>Remarks <span className="text-[#2D3F55] font-normal">(optional)</span></label>
              <Input value={form.remarks} onChange={e => set("remarks", e.target.value)}
                placeholder="e.g. Quarterly restock, high-demand model…" className={field} />
            </div>
          </div>

          <DialogFooter className="gap-2 pt-1">
            <Button variant="ghost" onClick={() => setOpen(false)} disabled={loading}
              className="border border-[#1E293B] text-[#64748B] hover:text-white hover:bg-[#1E293B] rounded-xl">Cancel</Button>
            <Button onClick={handleSubmit} disabled={loading}
              className="bg-[#2563EB] hover:bg-[#1D4ED8] text-white gap-2 rounded-xl">
              {loading ? <><Loader2 className="w-4 h-4 animate-spin" />Saving…</> : <><ShoppingBag className="w-4 h-4" />Record Purchase</>}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// ROOT PAGE SHELL
// ─────────────────────────────────────────────────────────────────────────────

const TABS: { id: InventoryTab; label: string; icon: React.ElementType; shortLabel: string }[] = [
  { id: "products",       label: "Products List",  shortLabel: "Products",  icon: Package     },
  { id: "add_product",    label: "Add Product",    shortLabel: "Add",       icon: Plus        },
  { id: "stock_movement", label: "Stock Movement", shortLabel: "Movement",  icon: MoveRight   },
  { id: "purchases",      label: "Purchases",      shortLabel: "Purchases", icon: ShoppingBag },
]

export default function InventoryPage() {
  const [active, setActive] = useState<InventoryTab>("products")

  const goAdd = useCallback(() => setActive("add_product"), [])
  const goList = useCallback(() => setActive("products"), [])

  return (
    <div className="min-h-screen bg-[#0A1628]">

      {/* ── Page header ── */}
      <div className="bg-[#060F1E] border-b border-[#1E293B]">
        <div className="max-w-screen-xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-[#2563EB]/15 border border-[#2563EB]/25 flex items-center justify-center">
              <Package className="w-4.5 h-4.5 text-[#2563EB]" />
            </div>
            <div>
              <h1 className="text-white text-base font-bold leading-tight">Inventory Management</h1>
              <p className="text-[#2D3F55] text-xs">Products · Stock · Purchases</p>
            </div>
          </div>
          {/* Breadcrumb */}
          <div className="hidden sm:flex items-center gap-1.5 text-xs text-[#2D3F55]">
            <span>Admin</span>
            <ChevronRight className="w-3 h-3" />
            <span className="text-[#64748B]">Inventory</span>
            <ChevronRight className="w-3 h-3" />
            <span className="text-white capitalize">{active.replace("_", " ")}</span>
          </div>
        </div>

        {/* ── Tab strip ── */}
        <div className="max-w-screen-xl mx-auto px-6">
          <div className="flex gap-0 border-b border-transparent -mb-px">
            {TABS.map(({ id, label, shortLabel, icon: Icon }) => (
              <button key={id} onClick={() => setActive(id)}
                className={cn(
                  "flex items-center gap-2 px-5 py-3.5 text-sm font-medium border-b-2 transition-all whitespace-nowrap",
                  active === id
                    ? "border-[#2563EB] text-white"
                    : "border-transparent text-[#64748B] hover:text-[#94A3B8] hover:border-[#2D3F55]"
                )}>
                <Icon className={cn("w-4 h-4", active === id ? "text-[#2563EB]" : "")} />
                <span className="hidden sm:inline">{label}</span>
                <span className="sm:hidden">{shortLabel}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ── Tab content ── */}
      <div className="max-w-screen-xl mx-auto px-6 py-6">
        {active === "products"       && <ProductsListTab  onAddProduct={goAdd}   />}
        {active === "add_product"    && <AddProductTab    onSuccess={goList}     />}
        {active === "stock_movement" && <StockMovementTab                         />}
        {active === "purchases"      && <PurchasesTab                             />}
      </div>

    </div>
  )
}
