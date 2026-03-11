"use client"

import { useState, useMemo, useEffect, useRef, useCallback } from "react"
import {
  Search, X, Plus, Minus, Trash2, Receipt,
  CreditCard, Banknote, Building2, ShoppingCart,
  User, Phone, ChevronDown, Printer, Download,
  CheckCircle2, AlertTriangle, Keyboard, Zap,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
} from "@/components/ui/dialog"
import { cn } from "@/lib/utils"

// ─── Types ────────────────────────────────────────────────────────────────────

type ProductType = "laptop" | "desktop" | "tower"
type PaymentMethod = "cash" | "card" | "bank_transfer"

interface Product {
  product_id: string
  product_name: string
  product_code: string
  category_brand: string
  model_name: string
  product_type: ProductType
  processor: string
  ram: string
  primary_storage: string
  sale_price: number
  cost_price: number
  stock: number
}

interface CartItem {
  product_id: string
  product_code: string
  product_name: string
  category_brand: string
  processor: string
  ram: string
  primary_storage: string
  price: number
  quantity: number
  total: number
  max_stock: number
}

interface Customer {
  name: string
  phone: string
}

// ─── Mock Product Data (matches seed_data.py exactly) ────────────────────────

const ALL_PRODUCTS: Product[] = [
  { product_id: "PROD101", product_name: "Dell Latitude i5", product_code: "P101", category_brand: "Dell", model_name: "Latitude 5420", product_type: "laptop", processor: "i5", ram: "8GB", primary_storage: "256GB SSD", sale_price: 110000, cost_price: 80000, stock: 8 },
  { product_id: "PROD102", product_name: "HP EliteBook i7", product_code: "P102", category_brand: "HP", model_name: "EliteBook 840", product_type: "laptop", processor: "i7", ram: "16GB", primary_storage: "512GB SSD", sale_price: 140000, cost_price: 100000, stock: 5 },
  { product_id: "PROD103", product_name: "Lenovo T14 Ryzen", product_code: "P103", category_brand: "Lenovo", model_name: "ThinkPad T14", product_type: "laptop", processor: "Ryzen 5", ram: "16GB", primary_storage: "512GB SSD", sale_price: 135000, cost_price: 95000, stock: 4 },
  { product_id: "PROD104", product_name: "MacBook M1", product_code: "P104", category_brand: "Apple", model_name: "MacBook Pro M1", product_type: "laptop", processor: "M1", ram: "8GB", primary_storage: "256GB SSD", sale_price: 170000, cost_price: 120000, stock: 2 },
  { product_id: "PROD105", product_name: "Acer Aspire 5", product_code: "P105", category_brand: "Acer", model_name: "Aspire 5", product_type: "laptop", processor: "i5", ram: "8GB", primary_storage: "512GB SSD", sale_price: 99000, cost_price: 70000, stock: 11 },
  { product_id: "PROD106", product_name: "Asus VivoBook", product_code: "P106", category_brand: "Asus", model_name: "VivoBook", product_type: "laptop", processor: "i5", ram: "8GB", primary_storage: "256GB SSD", sale_price: 105000, cost_price: 75000, stock: 7 },
  { product_id: "PROD107", product_name: "MSI Modern 14", product_code: "P107", category_brand: "MSI", model_name: "Modern 14", product_type: "laptop", processor: "i7", ram: "16GB", primary_storage: "512GB SSD", sale_price: 145000, cost_price: 105000, stock: 3 },
  { product_id: "PROD108", product_name: "Dell OptiPlex", product_code: "P108", category_brand: "Dell", model_name: "OptiPlex 7090", product_type: "desktop", processor: "i5", ram: "8GB", primary_storage: "1TB HDD", sale_price: 92000, cost_price: 65000, stock: 6 },
  { product_id: "PROD109", product_name: "HP ProDesk", product_code: "P109", category_brand: "HP", model_name: "ProDesk 600", product_type: "desktop", processor: "i5", ram: "16GB", primary_storage: "512GB SSD", sale_price: 99000, cost_price: 70000, stock: 4 },
  { product_id: "PROD110", product_name: "Lenovo ThinkCentre", product_code: "P110", category_brand: "Lenovo", model_name: "ThinkCentre M70", product_type: "desktop", processor: "i7", ram: "16GB", primary_storage: "1TB SSD", sale_price: 130000, cost_price: 90000, stock: 0 },
]

const CATEGORY_TABS = ["All", "Laptops", "Desktops"] as const
type CategoryTab = typeof CATEGORY_TABS[number]

// ─── Helpers ──────────────────────────────────────────────────────────────────

function generateInvoiceId() {
  return `INV-${Date.now().toString().slice(-6)}`
}

function formatPKR(amount: number) {
  return `PKR ${amount.toLocaleString("en-PK")}`
}

const PAYMENT_OPTIONS: { value: PaymentMethod; label: string; icon: React.ElementType; color: string }[] = [
  { value: "cash", label: "Cash", icon: Banknote, color: "border-emerald-500/50 bg-emerald-500/10 text-emerald-400" },
  { value: "card", label: "Card", icon: CreditCard, color: "border-[#2563EB]/50 bg-[#2563EB]/10 text-[#2563EB]" },
  { value: "bank_transfer", label: "Bank Transfer", icon: Building2, color: "border-purple-500/50 bg-purple-500/10 text-purple-400" },
]

// ─── Product Card ─────────────────────────────────────────────────────────────

function ProductCard({ product, onAdd }: { product: Product; onAdd: (p: Product) => void }) {
  const outOfStock = product.stock === 0
  const lowStock = product.stock > 0 && product.stock <= 3

  return (
    <button
      onClick={() => !outOfStock && onAdd(product)}
      disabled={outOfStock}
      className={cn(
        "w-full text-left p-3 rounded-xl border transition-all duration-150 group",
        outOfStock
          ? "border-[#1E293B] bg-[#0A1628]/50 opacity-50 cursor-not-allowed"
          : "border-[#1E293B] bg-[#0F1E35] hover:border-[#2563EB]/60 hover:bg-[#2563EB]/5 active:scale-[0.98] cursor-pointer"
      )}
    >
      {/* Brand + type row */}
      <div className="flex items-center justify-between mb-1.5">
        <span className="text-[10px] font-semibold text-[#2563EB] uppercase tracking-wider">
          {product.category_brand}
        </span>
        <span
          className={cn(
            "text-[9px] px-1.5 py-0.5 rounded-full border font-medium",
            lowStock
              ? "border-amber-500/40 text-amber-400 bg-amber-500/10"
              : outOfStock
              ? "border-red-500/40 text-red-400 bg-red-500/10"
              : "border-emerald-500/30 text-emerald-400 bg-emerald-500/10"
          )}
        >
          {outOfStock ? "Out of Stock" : lowStock ? `${product.stock} left` : `${product.stock} in stock`}
        </span>
      </div>

      {/* Product name */}
      <p className="text-white text-xs font-semibold leading-tight mb-1 truncate">
        {product.product_name}
      </p>

      {/* Specs */}
      <p className="text-[#64748B] text-[10px] truncate mb-2">
        {product.processor} · {product.ram} · {product.primary_storage}
      </p>

      {/* Price + add indicator */}
      <div className="flex items-center justify-between">
        <span className="text-white text-sm font-bold">
          {formatPKR(product.sale_price)}
        </span>
        {!outOfStock && (
          <span className="w-6 h-6 rounded-full bg-[#2563EB]/20 border border-[#2563EB]/30 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
            <Plus className="w-3 h-3 text-[#2563EB]" />
          </span>
        )}
      </div>
    </button>
  )
}

// ─── Cart Item Row ────────────────────────────────────────────────────────────

function CartRow({
  item, onQtyChange, onRemove,
}: {
  item: CartItem
  onQtyChange: (id: string, qty: number) => void
  onRemove: (id: string) => void
}) {
  return (
    <div className="flex items-start gap-2 py-2.5 border-b border-[#1E293B] last:border-0">
      {/* Info */}
      <div className="flex-1 min-w-0">
        <p className="text-white text-xs font-medium truncate">{item.product_name}</p>
        <p className="text-[#64748B] text-[10px]">
          {item.processor} · {item.ram} · <span className="font-mono text-[#94A3B8]">{item.product_code}</span>
        </p>
        <p className="text-[#2563EB] text-[10px] font-medium mt-0.5">{formatPKR(item.price)} × {item.quantity}</p>
      </div>

      {/* Qty stepper */}
      <div className="flex items-center gap-1 flex-shrink-0">
        <button
          onClick={() => item.quantity > 1 ? onQtyChange(item.product_id, item.quantity - 1) : onRemove(item.product_id)}
          className="w-6 h-6 rounded-md bg-[#1E293B] hover:bg-[#2D3F55] text-[#94A3B8] hover:text-white flex items-center justify-center transition-colors"
        >
          <Minus className="w-3 h-3" />
        </button>
        <span className="text-white text-xs font-bold w-5 text-center">{item.quantity}</span>
        <button
          onClick={() => item.quantity < item.max_stock && onQtyChange(item.product_id, item.quantity + 1)}
          disabled={item.quantity >= item.max_stock}
          className="w-6 h-6 rounded-md bg-[#1E293B] hover:bg-[#2D3F55] text-[#94A3B8] hover:text-white flex items-center justify-center transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
        >
          <Plus className="w-3 h-3" />
        </button>
      </div>

      {/* Line total + remove */}
      <div className="flex flex-col items-end gap-1 flex-shrink-0">
        <span className="text-white text-xs font-bold">{formatPKR(item.total)}</span>
        <button
          onClick={() => onRemove(item.product_id)}
          className="text-[#334155] hover:text-red-400 transition-colors"
        >
          <Trash2 className="w-3 h-3" />
        </button>
      </div>
    </div>
  )
}

// ─── Receipt Modal ────────────────────────────────────────────────────────────

interface ReceiptData {
  invoice_id: string
  date: string
  customer: Customer
  items: CartItem[]
  subtotal: number
  discount: number
  grand_total: number
  payment_method: PaymentMethod
}

function ReceiptModal({ data, open, onClose }: { data: ReceiptData | null; open: boolean; onClose: () => void }) {
  const printRef = useRef<HTMLDivElement>(null)

  const handlePrint = () => {
    const content = printRef.current
    if (!content) return
    const win = window.open("", "_blank", "width=500,height=800")
    if (!win) return
    win.document.write(`
      <html><head><title>Receipt - ${data?.invoice_id}</title>
      <style>
        * { margin:0; padding:0; box-sizing:border-box; }
        body { font-family: 'Courier New', monospace; font-size: 12px; padding: 20px; background: white; color: black; }
        .center { text-align: center; }
        .bold { font-weight: bold; }
        .line { border-top: 1px dashed #000; margin: 8px 0; }
        .row { display: flex; justify-content: space-between; margin: 3px 0; }
        .total-row { font-weight: bold; font-size: 14px; }
        h2 { font-size: 18px; margin-bottom: 2px; }
        h3 { font-size: 13px; font-weight: normal; }
      </style></head><body>
      ${content.innerHTML}
      </body></html>
    `)
    win.document.close()
    win.print()
  }

  if (!data) return null

  const paymentLabel = PAYMENT_OPTIONS.find(p => p.value === data.payment_method)?.label ?? data.payment_method

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="bg-[#0F1E35] border border-[#1E293B] text-white max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-white flex items-center gap-2">
            <Receipt className="w-4 h-4 text-[#2563EB]" />
            Receipt Preview
          </DialogTitle>
        </DialogHeader>

        {/* Receipt paper */}
        <div
          ref={printRef}
          className="bg-white text-black rounded-lg p-5 font-mono text-xs"
        >
          {/* Header */}
          <div className="center mb-3">
            <h2 className="bold text-sm text-center">LAPTOPS OFFICIAL</h2>
            <h3 className="text-center text-[11px] text-gray-600">Know It. Test It. Own It.</h3>
            <p className="text-center text-[10px] text-gray-500 mt-1">
              Main Store, Karachi · +92-21-1234567<br />
              info@laptopsofficial.pk
            </p>
          </div>

          <div className="border-t border-dashed border-gray-400 my-2" />

          {/* Invoice meta */}
          <div className="space-y-0.5 mb-2">
            <div className="flex justify-between">
              <span className="text-gray-600">Invoice #:</span>
              <span className="font-bold">{data.invoice_id}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Date:</span>
              <span>{data.date}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Customer:</span>
              <span>{data.customer.name || "Walk-in Customer"}</span>
            </div>
            {data.customer.phone && (
              <div className="flex justify-between">
                <span className="text-gray-600">Contact:</span>
                <span>{data.customer.phone}</span>
              </div>
            )}
          </div>

          <div className="border-t border-dashed border-gray-400 my-2" />

          {/* Items */}
          <div className="mb-2">
            <div className="flex justify-between text-[10px] text-gray-500 mb-1">
              <span>ITEM</span>
              <span>QTY × PRICE = TOTAL</span>
            </div>
            {data.items.map((item) => (
              <div key={item.product_id} className="mb-1.5">
                <p className="font-medium text-[11px] leading-tight">{item.product_name}</p>
                <p className="text-gray-500 text-[10px]">{item.processor} · {item.ram} · {item.primary_storage}</p>
                <div className="flex justify-between text-[11px]">
                  <span className="text-gray-600">{item.quantity} × PKR {item.price.toLocaleString()}</span>
                  <span className="font-bold">PKR {item.total.toLocaleString()}</span>
                </div>
              </div>
            ))}
          </div>

          <div className="border-t border-dashed border-gray-400 my-2" />

          {/* Totals */}
          <div className="space-y-0.5">
            <div className="flex justify-between">
              <span className="text-gray-600">Subtotal:</span>
              <span>PKR {data.subtotal.toLocaleString()}</span>
            </div>
            {data.discount > 0 && (
              <div className="flex justify-between text-green-700">
                <span>Discount:</span>
                <span>- PKR {data.discount.toLocaleString()}</span>
              </div>
            )}
            <div className="flex justify-between font-bold text-sm border-t border-gray-300 pt-1 mt-1">
              <span>GRAND TOTAL:</span>
              <span>PKR {data.grand_total.toLocaleString()}</span>
            </div>
            <div className="flex justify-between text-[11px]">
              <span className="text-gray-600">Payment Method:</span>
              <span className="font-medium">{paymentLabel}</span>
            </div>
          </div>

          <div className="border-t border-dashed border-gray-400 my-3" />

          {/* Footer */}
          <div className="text-center text-[10px] text-gray-500">
            <p className="font-bold text-black text-[11px]">Thank you for your purchase!</p>
            <p className="mt-0.5">Returns accepted within 7 days with receipt.</p>
            <p>Warranty claims: support@laptopsofficial.pk</p>
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex gap-2 mt-2">
          <Button
            onClick={handlePrint}
            className="flex-1 bg-[#2563EB] hover:bg-[#1D4ED8] text-white gap-1.5 h-9 text-sm"
          >
            <Printer className="w-4 h-4" /> Print Receipt
          </Button>
          <Button
            variant="outline"
            onClick={onClose}
            className="flex-1 border-[#1E293B] text-[#94A3B8] hover:bg-[#1E293B] hover:text-white h-9 text-sm"
          >
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}

// ─── Keyboard Shortcuts Bar ───────────────────────────────────────────────────

function ShortcutBar() {
  const shortcuts = [
    { key: "Ctrl+F", label: "Search" },
    { key: "Ctrl+Enter", label: "Process Sale" },
    { key: "Esc", label: "Clear" },
    { key: "Ctrl+P", label: "Print" },
  ]
  return (
    <div className="flex items-center gap-3 px-4 py-1.5 bg-[#060F1E] border-t border-[#1E293B]">
      <Keyboard className="w-3 h-3 text-[#334155] flex-shrink-0" />
      {shortcuts.map(({ key, label }) => (
        <span key={key} className="flex items-center gap-1 text-[10px] text-[#334155]">
          <kbd className="px-1.5 py-0.5 bg-[#1E293B] border border-[#2D3F55] rounded text-[#64748B] font-mono">
            {key}
          </kbd>
          <span>{label}</span>
        </span>
      ))}
    </div>
  )
}

// ─── Main POS Page ────────────────────────────────────────────────────────────

export default function POSPage() {
  const [search, setSearch] = useState("")
  const [activeCategory, setActiveCategory] = useState<CategoryTab>("All")
  const [cart, setCart] = useState<CartItem[]>([])
  const [customer, setCustomer] = useState<Customer>({ name: "", phone: "" })
  const [discount, setDiscount] = useState<string>("")
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("cash")
  const [receiptData, setReceiptData] = useState<ReceiptData | null>(null)
  const [receiptOpen, setReceiptOpen] = useState(false)
  const [successMsg, setSuccessMsg] = useState("")
  const searchRef = useRef<HTMLInputElement>(null)

  // ── Filtered products ──
  const filteredProducts = useMemo(() => {
    const q = search.toLowerCase().trim()
    return ALL_PRODUCTS.filter((p) => {
      const matchesCategory =
        activeCategory === "All" ||
        (activeCategory === "Laptops" && p.product_type === "laptop") ||
        (activeCategory === "Desktops" && (p.product_type === "desktop" || p.product_type === "tower"))
      const matchesSearch =
        !q ||
        p.product_name.toLowerCase().includes(q) ||
        p.product_code.toLowerCase().includes(q) ||
        p.category_brand.toLowerCase().includes(q) ||
        p.processor.toLowerCase().includes(q)
      return matchesCategory && matchesSearch
    })
  }, [search, activeCategory])

  // ── Totals ──
  const subtotal = cart.reduce((s, i) => s + i.total, 0)
  const discountAmt = Math.min(Number(discount) || 0, subtotal)
  const grandTotal = subtotal - discountAmt

  // ── Cart operations ──
  const addToCart = useCallback((product: Product) => {
    setCart((prev) => {
      const existing = prev.find((i) => i.product_id === product.product_id)
      if (existing) {
        if (existing.quantity >= product.stock) return prev
        return prev.map((i) =>
          i.product_id === product.product_id
            ? { ...i, quantity: i.quantity + 1, total: (i.quantity + 1) * i.price }
            : i
        )
      }
      return [
        ...prev,
        {
          product_id: product.product_id,
          product_code: product.product_code,
          product_name: product.product_name,
          category_brand: product.category_brand,
          processor: product.processor,
          ram: product.ram,
          primary_storage: product.primary_storage,
          price: product.sale_price,
          quantity: 1,
          total: product.sale_price,
          max_stock: product.stock,
        },
      ]
    })
  }, [])

  const updateQty = useCallback((id: string, qty: number) => {
    setCart((prev) =>
      prev.map((i) => i.product_id === id ? { ...i, quantity: qty, total: qty * i.price } : i)
    )
  }, [])

  const removeFromCart = useCallback((id: string) => {
    setCart((prev) => prev.filter((i) => i.product_id !== id))
  }, [])

  const clearTransaction = () => {
    setCart([])
    setCustomer({ name: "", phone: "" })
    setDiscount("")
    setPaymentMethod("cash")
  }

  // ── Process sale ──
  const processSale = () => {
    if (cart.length === 0) return
    const invoiceId = generateInvoiceId()
    const now = new Date()
    const dateStr = now.toLocaleDateString("en-PK", {
      day: "2-digit", month: "short", year: "numeric",
      hour: "2-digit", minute: "2-digit",
    })
    const receipt: ReceiptData = {
      invoice_id: invoiceId,
      date: dateStr,
      customer,
      items: [...cart],
      subtotal,
      discount: discountAmt,
      grand_total: grandTotal,
      payment_method: paymentMethod,
    }
    setReceiptData(receipt)
    setSuccessMsg(`Sale processed! Invoice ${invoiceId}`)
    setTimeout(() => setSuccessMsg(""), 4000)
    clearTransaction()
    setReceiptOpen(true)
  }

  // ── Keyboard shortcuts ──
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.key === "f") {
        e.preventDefault()
        searchRef.current?.focus()
      }
      if (e.ctrlKey && e.key === "Enter") {
        e.preventDefault()
        if (cart.length > 0) processSale()
      }
      if (e.key === "Escape") {
        e.preventDefault()
        clearTransaction()
      }
      if (e.ctrlKey && e.key === "p") {
        e.preventDefault()
        if (receiptData) setReceiptOpen(true)
      }
    }
    window.addEventListener("keydown", handler)
    return () => window.removeEventListener("keydown", handler)
  }, [cart, receiptData])

  return (
    <div className="flex flex-col h-screen bg-[#0A1628] overflow-hidden">

      {/* ── Top Bar ── */}
      <div className="h-12 bg-[#060F1E] border-b border-[#1E293B] flex items-center justify-between px-4 flex-shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-7 h-7 rounded-lg bg-[#2563EB] flex items-center justify-center">
            <span className="text-white text-[10px] font-black">LO</span>
          </div>
          <div>
            <span className="text-white text-sm font-semibold">Point of Sale</span>
            <span className="text-[#334155] text-xs ml-2">Main Store · Karachi</span>
          </div>
          <Zap className="w-3.5 h-3.5 text-[#2563EB] ml-1" />
        </div>
        <div className="flex items-center gap-2">
          {successMsg && (
            <div className="flex items-center gap-1.5 text-xs text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-3 py-1 rounded-full animate-in fade-in">
              <CheckCircle2 className="w-3 h-3" />
              {successMsg}
            </div>
          )}
          <span className="text-[#64748B] text-xs">{new Date().toLocaleDateString("en-PK", { weekday: "short", day: "numeric", month: "short" })}</span>
        </div>
      </div>

      {/* ── Main Content ── */}
      <div className="flex flex-1 overflow-hidden">

        {/* ════ LEFT PANEL — Product Selection ════ */}
        <div className="flex flex-col w-[58%] border-r border-[#1E293B] overflow-hidden bg-[#0A1628]">

          {/* Search bar */}
          <div className="p-3 border-b border-[#1E293B] flex-shrink-0">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#64748B]" />
              <Input
                ref={searchRef}
                placeholder="Search by product name, code, brand or processor... (Ctrl+F)"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="bg-[#0F1E35] border-[#1E293B] text-white placeholder:text-[#334155] pl-10 h-10 text-sm focus:border-[#2563EB] focus:ring-1 focus:ring-[#2563EB]"
              />
              {search && (
                <button onClick={() => setSearch("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#64748B] hover:text-white">
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>

          {/* Category tabs */}
          <div className="flex items-center gap-1 px-3 py-2 border-b border-[#1E293B] flex-shrink-0">
            {CATEGORY_TABS.map((tab) => {
              const count = tab === "All"
                ? ALL_PRODUCTS.length
                : tab === "Laptops"
                ? ALL_PRODUCTS.filter(p => p.product_type === "laptop").length
                : ALL_PRODUCTS.filter(p => p.product_type === "desktop" || p.product_type === "tower").length
              return (
                <button
                  key={tab}
                  onClick={() => setActiveCategory(tab)}
                  className={cn(
                    "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all",
                    activeCategory === tab
                      ? "bg-[#2563EB] text-white"
                      : "text-[#64748B] hover:text-white hover:bg-[#1E293B]"
                  )}
                >
                  {tab}
                  <span className={cn(
                    "text-[10px] px-1.5 rounded-full",
                    activeCategory === tab ? "bg-white/20 text-white" : "bg-[#1E293B] text-[#64748B]"
                  )}>
                    {count}
                  </span>
                </button>
              )
            })}
            <span className="ml-auto text-[#334155] text-[10px]">
              {filteredProducts.length} results
            </span>
          </div>

          {/* Products grid */}
          <div className="flex-1 overflow-y-auto p-3">
            {filteredProducts.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-40 text-center">
                <Search className="w-8 h-8 text-[#1E293B] mb-2" />
                <p className="text-[#64748B] text-sm">No products found</p>
                <p className="text-[#334155] text-xs">Try a different search term</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 xl:grid-cols-3 gap-2">
                {filteredProducts.map((product) => (
                  <ProductCard key={product.product_id} product={product} onAdd={addToCart} />
                ))}
              </div>
            )}
          </div>
        </div>

        {/* ════ RIGHT PANEL — Transaction ════ */}
        <div className="flex flex-col w-[42%] overflow-hidden bg-[#060F1E]">

          {/* Panel header */}
          <div className="px-4 py-3 border-b border-[#1E293B] flex items-center justify-between flex-shrink-0">
            <div className="flex items-center gap-2">
              <ShoppingCart className="w-4 h-4 text-[#2563EB]" />
              <span className="text-white text-sm font-semibold">Current Transaction</span>
              {cart.length > 0 && (
                <Badge className="bg-[#2563EB] text-white text-[10px] h-4 px-1.5 rounded-full">
                  {cart.reduce((s, i) => s + i.quantity, 0)}
                </Badge>
              )}
            </div>
            <button
              onClick={clearTransaction}
              className="text-[10px] text-[#334155] hover:text-red-400 flex items-center gap-1 transition-colors"
              title="Clear (Esc)"
            >
              <X className="w-3 h-3" /> Clear
            </button>
          </div>

          <div className="flex-1 overflow-y-auto">

            {/* Customer quick-add */}
            <div className="px-4 py-3 border-b border-[#1E293B]">
              <p className="text-[#64748B] text-[10px] uppercase tracking-wider font-medium mb-2 flex items-center gap-1">
                <User className="w-3 h-3" /> Customer (Optional)
              </p>
              <div className="grid grid-cols-2 gap-2">
                <Input
                  placeholder="Customer name"
                  value={customer.name}
                  onChange={(e) => setCustomer(prev => ({ ...prev, name: e.target.value }))}
                  className="bg-[#0A1628] border-[#1E293B] text-white placeholder:text-[#334155] h-8 text-xs focus:border-[#2563EB]"
                />
                <Input
                  placeholder="Phone number"
                  value={customer.phone}
                  onChange={(e) => setCustomer(prev => ({ ...prev, phone: e.target.value }))}
                  className="bg-[#0A1628] border-[#1E293B] text-white placeholder:text-[#334155] h-8 text-xs focus:border-[#2563EB]"
                />
              </div>
            </div>

            {/* Cart items */}
            <div className="px-4 py-2 flex-shrink-0">
              <p className="text-[#64748B] text-[10px] uppercase tracking-wider font-medium mb-2">
                Cart Items
              </p>
              {cart.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-8 text-center">
                  <ShoppingCart className="w-8 h-8 text-[#1E293B] mb-2" />
                  <p className="text-[#334155] text-xs">Cart is empty</p>
                  <p className="text-[#1E293B] text-[10px] mt-0.5">Click a product to add it</p>
                </div>
              ) : (
                <div>
                  {cart.map((item) => (
                    <CartRow
                      key={item.product_id}
                      item={item}
                      onQtyChange={updateQty}
                      onRemove={removeFromCart}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* ── Bottom: totals + payment + actions ── */}
          <div className="border-t border-[#1E293B] bg-[#060F1E] flex-shrink-0">

            {/* Discount + totals */}
            <div className="px-4 py-3 space-y-2">
              {/* Discount field */}
              <div className="flex items-center gap-2">
                <Label className="text-[#64748B] text-[10px] uppercase tracking-wider w-20 flex-shrink-0">
                  Discount
                </Label>
                <Input
                  type="number"
                  placeholder="PKR 0"
                  value={discount}
                  onChange={(e) => setDiscount(e.target.value)}
                  className="bg-[#0A1628] border-[#1E293B] text-white placeholder:text-[#334155] h-7 text-xs focus:border-emerald-500 flex-1"
                />
              </div>

              {/* Totals */}
              <div className="space-y-1 text-xs">
                <div className="flex justify-between text-[#64748B]">
                  <span>Subtotal</span>
                  <span className="text-[#94A3B8]">{formatPKR(subtotal)}</span>
                </div>
                {discountAmt > 0 && (
                  <div className="flex justify-between text-emerald-400">
                    <span>Discount</span>
                    <span>− {formatPKR(discountAmt)}</span>
                  </div>
                )}
                <Separator className="bg-[#1E293B]" />
                <div className="flex justify-between text-white font-bold text-sm">
                  <span>Grand Total</span>
                  <span className="text-[#2563EB]">{formatPKR(grandTotal)}</span>
                </div>
              </div>
            </div>

            {/* Payment method */}
            <div className="px-4 pb-3">
              <p className="text-[#64748B] text-[10px] uppercase tracking-wider font-medium mb-2">
                Payment Method
              </p>
              <div className="grid grid-cols-3 gap-1.5">
                {PAYMENT_OPTIONS.map(({ value, label, icon: Icon, color }) => (
                  <button
                    key={value}
                    onClick={() => setPaymentMethod(value)}
                    className={cn(
                      "flex flex-col items-center gap-1 py-2 px-1 rounded-lg border text-[10px] font-medium transition-all",
                      paymentMethod === value
                        ? color
                        : "border-[#1E293B] text-[#64748B] hover:border-[#2D3F55] hover:text-[#94A3B8]"
                    )}
                  >
                    <Icon className="w-3.5 h-3.5" />
                    {label}
                  </button>
                ))}
              </div>
            </div>

            {/* Action buttons */}
            <div className="px-4 pb-4 space-y-2">
              {/* Process Sale */}
              <Button
                onClick={processSale}
                disabled={cart.length === 0}
                className={cn(
                  "w-full h-11 font-bold text-sm rounded-xl gap-2 transition-all",
                  cart.length > 0
                    ? "bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg shadow-emerald-900/30"
                    : "bg-[#1E293B] text-[#334155] cursor-not-allowed"
                )}
              >
                <CheckCircle2 className="w-4 h-4" />
                Process Sale
                {cart.length > 0 && (
                  <kbd className="ml-auto text-[10px] bg-white/10 px-1.5 py-0.5 rounded font-mono">
                    Ctrl+↵
                  </kbd>
                )}
              </Button>

              {/* Secondary buttons */}
              <div className="grid grid-cols-2 gap-2">
                <Button
                  variant="outline"
                  onClick={() => receiptData && setReceiptOpen(true)}
                  disabled={!receiptData}
                  className="h-8 text-xs border-[#1E293B] text-[#64748B] hover:text-white hover:bg-[#1E293B] gap-1.5 disabled:opacity-30"
                >
                  <Receipt className="w-3.5 h-3.5" /> Print Receipt
                </Button>
                <Button
                  variant="ghost"
                  onClick={clearTransaction}
                  className="h-8 text-xs text-[#64748B] hover:text-red-400 hover:bg-red-500/10 gap-1.5"
                >
                  <X className="w-3.5 h-3.5" /> Clear
                  <kbd className="ml-auto text-[9px] bg-[#1E293B] px-1 py-0.5 rounded font-mono">Esc</kbd>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Shortcuts bar */}
      <ShortcutBar />

      {/* Receipt modal */}
      <ReceiptModal
        data={receiptData}
        open={receiptOpen}
        onClose={() => setReceiptOpen(false)}
      />
    </div>
  )
}
