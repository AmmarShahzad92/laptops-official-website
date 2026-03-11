"use client"

import { useState, useMemo } from "react"
import {
  TrendingUp, Package, ShoppingCart, RotateCcw,
  Users, Download, ChevronLeft, ChevronRight,
  ArrowUpDown, Activity, Menu, AlertTriangle,
  TrendingDown, LogOut, BarChart2,
} from "lucide-react"
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Legend,
} from "recharts"
import { Button } from "@/components/ui/button"
import {
  Select, SelectContent, SelectItem,
  SelectTrigger, SelectValue,
} from "@/components/ui/select"
import {
  Table, TableBody, TableCell,
  TableHead, TableHeader, TableRow,
} from "@/components/ui/table"
import { Separator } from "@/components/ui/separator"
import { cn } from "@/lib/utils"

// ─── Types ─────────────────────────────────────────────────────────────────────

type ReportType = "sales" | "inventory" | "purchase" | "stock-movement" | "returns" | "staff"
type ChartPeriod = "daily" | "weekly" | "monthly"

interface SalesRow {
  date: string; orderId: string; product: string; qty: number
  salePrice: number; cost: number; profit: number; staff: string; location: string
}
interface InventoryRow {
  productId: number; product: string; brand: string; stock: number
  unitCost: number; totalValue: number; supplier: string; location: string
}
interface PurchaseRow {
  date: string; purchaseId: string; product: string; qty: number
  unitCost: number; totalAmount: number; supplier: string; location: string
}
interface StockMovRow {
  date: string; product: string; movType: "in" | "out" | "transfer"
  qty: number; fromLoc: string; toLoc: string; staff: string; reason: string
}
interface ReturnRow {
  date: string; returnId: string; orderId: string; product: string
  qty: number; amount: number; reason: string; staff: string
  status: "approved" | "pending" | "rejected"
}
interface StaffRow {
  staffId: number; staffName: string; role: string; location: string
  ordersProcessed: number; totalSales: number; itemsManaged: number; lastActive: string
}

// ─── Constants ─────────────────────────────────────────────────────────────────

const LOCATIONS = [
  "All Locations", "Main Store Karachi", "Lahore Store",
  "Islamabad Store", "Central Warehouse", "North Warehouse",
  "Online Platform", "Hyderabad Store", "Multan Store",
]
const PAGE_SIZE = 10
const fmt = (n: number) => `PKR ${Math.abs(n).toLocaleString()}`

// ─── Mock Data: Sales ──────────────────────────────────────────────────────────

const SALES_TABLE: SalesRow[] = [
  { date: "2026-03-12", orderId: "ORD-031", product: "Dell Latitude i5 (14\")", qty: 2, salePrice: 110000, cost: 82000, profit: 28000, staff: "Sara Ahmed", location: "Main Store Karachi" },
  { date: "2026-03-12", orderId: "ORD-032", product: "MacBook Air M2 (13.6\")", qty: 1, salePrice: 220000, cost: 175000, profit: 45000, staff: "Ali Khan", location: "Lahore Store" },
  { date: "2026-03-11", orderId: "ORD-030", product: "HP EliteBook i7 (15\")", qty: 1, salePrice: 145000, cost: 115000, profit: 30000, staff: "Sara Ahmed", location: "Main Store Karachi" },
  { date: "2026-03-11", orderId: "ORD-029", product: "Lenovo ThinkPad X1 Carbon", qty: 1, salePrice: 138000, cost: 105000, profit: 33000, staff: "Ayesha Noor", location: "Online Platform" },
  { date: "2026-03-10", orderId: "ORD-028", product: "Acer Aspire 5 i5 (15.6\")", qty: 3, salePrice: 99000, cost: 78000, profit: 21000, staff: "Hamza Ali", location: "Online Platform" },
  { date: "2026-03-10", orderId: "ORD-027", product: "ASUS VivoBook 15 i5", qty: 2, salePrice: 89000, cost: 72000, profit: 17000, staff: "Ali Khan", location: "Islamabad Store" },
  { date: "2026-03-09", orderId: "ORD-026", product: "MSI Modern 14 B11M", qty: 1, salePrice: 115000, cost: 92000, profit: 23000, staff: "Sara Ahmed", location: "Main Store Karachi" },
  { date: "2026-03-09", orderId: "ORD-025", product: "Dell XPS 13 i7", qty: 1, salePrice: 185000, cost: 148000, profit: 37000, staff: "Ali Khan", location: "Lahore Store" },
  { date: "2026-03-08", orderId: "ORD-024", product: "HP Spectre x360 14", qty: 1, salePrice: 210000, cost: 170000, profit: 40000, staff: "Ayesha Noor", location: "Main Store Karachi" },
  { date: "2026-03-08", orderId: "ORD-023", product: "Lenovo IdeaPad 5 i5", qty: 2, salePrice: 82000, cost: 68000, profit: 14000, staff: "Sara Ahmed", location: "Hyderabad Store" },
  { date: "2026-03-07", orderId: "ORD-022", product: "Acer Swift 3 i3", qty: 1, salePrice: 72000, cost: 60000, profit: 12000, staff: "Hamza Ali", location: "Online Platform" },
  { date: "2026-03-07", orderId: "ORD-021", product: "MacBook Pro M3 (14\")", qty: 1, salePrice: 320000, cost: 260000, profit: 60000, staff: "Ali Khan", location: "Lahore Store" },
  { date: "2026-03-06", orderId: "ORD-020", product: "HP ProBook 450 G8", qty: 2, salePrice: 105000, cost: 84000, profit: 21000, staff: "Sara Ahmed", location: "Main Store Karachi" },
  { date: "2026-03-06", orderId: "ORD-019", product: "Dell Inspiron 15 i5", qty: 1, salePrice: 88000, cost: 96000, profit: -8000, staff: "Hamza Ali", location: "Online Platform" },
  { date: "2026-03-05", orderId: "ORD-018", product: "ASUS TUF Gaming F15", qty: 1, salePrice: 165000, cost: 138000, profit: 27000, staff: "Ayesha Noor", location: "Main Store Karachi" },
  { date: "2026-03-05", orderId: "ORD-017", product: "Lenovo Legion 5 i5", qty: 1, salePrice: 175000, cost: 192000, profit: -17000, staff: "Ali Khan", location: "Islamabad Store" },
  { date: "2026-03-04", orderId: "ORD-016", product: "HP Pavilion 15 i7", qty: 2, salePrice: 132000, cost: 105000, profit: 27000, staff: "Sara Ahmed", location: "Main Store Karachi" },
  { date: "2026-03-04", orderId: "ORD-015", product: "MSI GF63 Thin", qty: 1, salePrice: 158000, cost: 130000, profit: 28000, staff: "Hamza Ali", location: "Online Platform" },
  { date: "2026-03-03", orderId: "ORD-014", product: "Dell G15 Ryzen 5", qty: 1, salePrice: 145000, cost: 118000, profit: 27000, staff: "Ali Khan", location: "Lahore Store" },
  { date: "2026-03-03", orderId: "ORD-013", product: "MacBook Air M1 (13.3\")", qty: 1, salePrice: 175000, cost: 195000, profit: -20000, staff: "Ayesha Noor", location: "Main Store Karachi" },
]

const SALES_DAILY = [
  { period: "Mar 03", orders: 2, revenue: 320000, profit: 7000 },
  { period: "Mar 04", orders: 3, revenue: 422000, profit: 82000 },
  { period: "Mar 05", orders: 2, revenue: 340000, profit: 10000 },
  { period: "Mar 06", orders: 2, revenue: 193000, profit: 42000 },
  { period: "Mar 07", orders: 2, revenue: 392000, profit: 72000 },
  { period: "Mar 08", orders: 3, revenue: 446000, profit: 68000 },
  { period: "Mar 09", orders: 2, revenue: 300000, profit: 60000 },
  { period: "Mar 10", orders: 5, revenue: 564000, profit: 95000 },
  { period: "Mar 11", orders: 2, revenue: 283000, profit: 63000 },
  { period: "Mar 12", orders: 2, revenue: 330000, profit: 73000 },
]
const SALES_WEEKLY = [
  { period: "W1 Jan", orders: 18, revenue: 1650000, profit: 380000 },
  { period: "W2 Jan", orders: 22, revenue: 2100000, profit: 480000 },
  { period: "W3 Jan", orders: 15, revenue: 1380000, profit: 310000 },
  { period: "W4 Jan", orders: 24, revenue: 2280000, profit: 510000 },
  { period: "W1 Feb", orders: 19, revenue: 1820000, profit: 420000 },
  { period: "W2 Feb", orders: 27, revenue: 2590000, profit: 590000 },
  { period: "W3 Feb", orders: 20, revenue: 1940000, profit: 440000 },
  { period: "W4 Feb", orders: 25, revenue: 2350000, profit: 530000 },
  { period: "W1 Mar", orders: 19, revenue: 1850000, profit: 430000 },
  { period: "W2 Mar", orders: 11, revenue: 1076000, profit: 200000 },
]
const SALES_MONTHLY = [
  { period: "Apr'25", orders: 45, revenue: 3800000, profit: 850000 },
  { period: "May'25", orders: 52, revenue: 4600000, profit: 1020000 },
  { period: "Jun'25", orders: 38, revenue: 3200000, profit: 710000 },
  { period: "Jul'25", orders: 60, revenue: 5400000, profit: 1200000 },
  { period: "Aug'25", orders: 48, revenue: 4100000, profit: 915000 },
  { period: "Sep'25", orders: 55, revenue: 4900000, profit: 1090000 },
  { period: "Oct'25", orders: 42, revenue: 3600000, profit: 800000 },
  { period: "Nov'25", orders: 71, revenue: 6300000, profit: 1400000 },
  { period: "Dec'25", orders: 95, revenue: 8500000, profit: 1890000 },
  { period: "Jan'26", orders: 82, revenue: 7300000, profit: 1630000 },
  { period: "Feb'26", orders: 91, revenue: 8100000, profit: 1810000 },
  { period: "Mar'26", orders: 30, revenue: 2590000, profit: 547000 },
]

// ─── Mock Data: Inventory ──────────────────────────────────────────────────────

const INVENTORY_TABLE: InventoryRow[] = [
  { productId: 1,  product: "Dell Latitude i5 (14\")",     brand: "Dell",   stock: 8,  unitCost: 82000,  totalValue: 656000,  supplier: "Dell Pakistan",         location: "Main Store Karachi" },
  { productId: 2,  product: "MacBook Air M2 (13.6\")",     brand: "Apple",  stock: 3,  unitCost: 175000, totalValue: 525000,  supplier: "Apple Distributors",    location: "Lahore Store" },
  { productId: 3,  product: "HP EliteBook i7 (15\")",      brand: "HP",     stock: 5,  unitCost: 115000, totalValue: 575000,  supplier: "HP Pakistan",            location: "Main Store Karachi" },
  { productId: 4,  product: "Lenovo ThinkPad X1 Carbon",   brand: "Lenovo", stock: 4,  unitCost: 105000, totalValue: 420000,  supplier: "Lenovo Distributors",   location: "Central Warehouse" },
  { productId: 5,  product: "Acer Aspire 5 i5 (15.6\")",  brand: "Acer",   stock: 12, unitCost: 78000,  totalValue: 936000,  supplier: "Acer Pakistan",          location: "Central Warehouse" },
  { productId: 6,  product: "ASUS VivoBook 15 i5",         brand: "ASUS",   stock: 7,  unitCost: 72000,  totalValue: 504000,  supplier: "ASUS Distributors",     location: "Islamabad Store" },
  { productId: 7,  product: "MSI Modern 14 B11M",          brand: "MSI",    stock: 2,  unitCost: 92000,  totalValue: 184000,  supplier: "MSI Pakistan",           location: "North Warehouse" },
  { productId: 8,  product: "Dell XPS 13 i7",              brand: "Dell",   stock: 1,  unitCost: 148000, totalValue: 148000,  supplier: "Dell Pakistan",         location: "Lahore Store" },
  { productId: 9,  product: "HP Spectre x360 14",          brand: "HP",     stock: 2,  unitCost: 170000, totalValue: 340000,  supplier: "HP Pakistan",            location: "Main Store Karachi" },
  { productId: 10, product: "MacBook Pro M3 (14\")",       brand: "Apple",  stock: 4,  unitCost: 260000, totalValue: 1040000, supplier: "Apple Distributors",    location: "Lahore Store" },
  { productId: 11, product: "ASUS TUF Gaming F15",         brand: "ASUS",   stock: 6,  unitCost: 138000, totalValue: 828000,  supplier: "ASUS Distributors",     location: "Main Store Karachi" },
  { productId: 12, product: "Lenovo Legion 5 i5",          brand: "Lenovo", stock: 3,  unitCost: 192000, totalValue: 576000,  supplier: "Lenovo Distributors",   location: "Central Warehouse" },
]

// ─── Mock Data: Purchases ──────────────────────────────────────────────────────

const PURCHASE_TABLE: PurchaseRow[] = [
  { date: "2026-03-10", purchaseId: "PUR-015", product: "Dell Latitude i5 (14\")",   qty: 5, unitCost: 80000,  totalAmount: 400000, supplier: "Dell Pakistan",       location: "Central Warehouse" },
  { date: "2026-03-09", purchaseId: "PUR-014", product: "MacBook Air M2 (13.6\")",   qty: 3, unitCost: 172000, totalAmount: 516000, supplier: "Apple Distributors",  location: "Central Warehouse" },
  { date: "2026-03-07", purchaseId: "PUR-013", product: "HP EliteBook i7 (15\")",    qty: 4, unitCost: 112000, totalAmount: 448000, supplier: "HP Pakistan",         location: "Central Warehouse" },
  { date: "2026-03-05", purchaseId: "PUR-012", product: "ASUS TUF Gaming F15",       qty: 3, unitCost: 135000, totalAmount: 405000, supplier: "ASUS Distributors",   location: "North Warehouse" },
  { date: "2026-03-03", purchaseId: "PUR-011", product: "Acer Aspire 5 i5",          qty: 6, unitCost: 75000,  totalAmount: 450000, supplier: "Acer Pakistan",       location: "Central Warehouse" },
  { date: "2026-02-28", purchaseId: "PUR-010", product: "Lenovo ThinkPad X1",        qty: 3, unitCost: 102000, totalAmount: 306000, supplier: "Lenovo Distributors", location: "Central Warehouse" },
  { date: "2026-02-25", purchaseId: "PUR-009", product: "MSI Modern 14 B11M",        qty: 4, unitCost: 88000,  totalAmount: 352000, supplier: "MSI Pakistan",        location: "North Warehouse" },
  { date: "2026-02-22", purchaseId: "PUR-008", product: "MacBook Pro M3 (14\")",     qty: 2, unitCost: 255000, totalAmount: 510000, supplier: "Apple Distributors",  location: "Central Warehouse" },
  { date: "2026-02-19", purchaseId: "PUR-007", product: "Dell XPS 13 i7",            qty: 3, unitCost: 145000, totalAmount: 435000, supplier: "Dell Pakistan",       location: "Central Warehouse" },
  { date: "2026-02-15", purchaseId: "PUR-006", product: "ASUS VivoBook 15 i5",       qty: 5, unitCost: 70000,  totalAmount: 350000, supplier: "ASUS Distributors",   location: "Central Warehouse" },
  { date: "2026-02-10", purchaseId: "PUR-005", product: "HP Spectre x360 14",        qty: 2, unitCost: 168000, totalAmount: 336000, supplier: "HP Pakistan",         location: "North Warehouse" },
  { date: "2026-02-05", purchaseId: "PUR-004", product: "Lenovo Legion 5 i5",        qty: 4, unitCost: 188000, totalAmount: 752000, supplier: "Lenovo Distributors", location: "Central Warehouse" },
  { date: "2026-01-28", purchaseId: "PUR-003", product: "Dell Latitude i5 (14\")",   qty: 8, unitCost: 79000,  totalAmount: 632000, supplier: "Dell Pakistan",       location: "Central Warehouse" },
  { date: "2026-01-20", purchaseId: "PUR-002", product: "MacBook Air M2 (13.6\")",   qty: 4, unitCost: 170000, totalAmount: 680000, supplier: "Apple Distributors",  location: "Central Warehouse" },
  { date: "2026-01-15", purchaseId: "PUR-001", product: "HP EliteBook i7 (15\")",    qty: 5, unitCost: 110000, totalAmount: 550000, supplier: "HP Pakistan",         location: "Central Warehouse" },
]

const PURCHASE_MONTHLY = [
  { period: "Oct'25", amount: 2800000, purchases: 18 },
  { period: "Nov'25", amount: 3500000, purchases: 22 },
  { period: "Dec'25", amount: 4800000, purchases: 30 },
  { period: "Jan'26", amount: 3200000, purchases: 20 },
  { period: "Feb'26", amount: 3506000, purchases: 21 },
  { period: "Mar'26", amount: 1819000, purchases: 11 },
]

// ─── Mock Data: Stock Movements ────────────────────────────────────────────────

const STOCK_MOV_TABLE: StockMovRow[] = [
  { date: "2026-03-12", product: "Dell Latitude i5 (14\")",   movType: "out",      qty: 2, fromLoc: "Main Store Karachi",  toLoc: "—",                   staff: "Sara Ahmed",   reason: "Sale ORD-031" },
  { date: "2026-03-12", product: "MacBook Air M2 (13.6\")",   movType: "out",      qty: 1, fromLoc: "Lahore Store",         toLoc: "—",                   staff: "Ali Khan",     reason: "Sale ORD-032" },
  { date: "2026-03-11", product: "HP EliteBook i7 (15\")",    movType: "out",      qty: 1, fromLoc: "Main Store Karachi",  toLoc: "—",                   staff: "Sara Ahmed",   reason: "Sale ORD-030" },
  { date: "2026-03-10", product: "Dell Latitude i5 (14\")",   movType: "in",       qty: 5, fromLoc: "—",                   toLoc: "Central Warehouse",   staff: "Usman Tariq",  reason: "Purchase PUR-015" },
  { date: "2026-03-10", product: "Acer Aspire 5 i5",          movType: "out",      qty: 3, fromLoc: "Online Platform",     toLoc: "—",                   staff: "Hamza Ali",    reason: "Sale ORD-028" },
  { date: "2026-03-09", product: "MacBook Air M2 (13.6\")",   movType: "in",       qty: 3, fromLoc: "—",                   toLoc: "Central Warehouse",   staff: "Usman Tariq",  reason: "Purchase PUR-014" },
  { date: "2026-03-09", product: "Dell Latitude i5 (14\")",   movType: "transfer", qty: 3, fromLoc: "Central Warehouse",  toLoc: "Main Store Karachi",  staff: "Bilal Hussain", reason: "Stock Replenishment" },
  { date: "2026-03-08", product: "HP EliteBook i7 (15\")",    movType: "in",       qty: 4, fromLoc: "—",                   toLoc: "Central Warehouse",   staff: "Usman Tariq",  reason: "Purchase PUR-013" },
  { date: "2026-03-08", product: "HP Spectre x360 14",        movType: "out",      qty: 1, fromLoc: "Main Store Karachi",  toLoc: "—",                   staff: "Ayesha Noor",  reason: "Sale ORD-024" },
  { date: "2026-03-07", product: "MacBook Air M2 (13.6\")",   movType: "transfer", qty: 2, fromLoc: "Central Warehouse",  toLoc: "Lahore Store",         staff: "Bilal Hussain", reason: "Store Replenishment" },
  { date: "2026-03-06", product: "ASUS TUF Gaming F15",       movType: "in",       qty: 3, fromLoc: "—",                   toLoc: "North Warehouse",     staff: "Usman Tariq",  reason: "Purchase PUR-012" },
  { date: "2026-03-05", product: "Acer Aspire 5 i5",          movType: "in",       qty: 6, fromLoc: "—",                   toLoc: "Central Warehouse",   staff: "Usman Tariq",  reason: "Purchase PUR-011" },
  { date: "2026-03-05", product: "Lenovo Legion 5 i5",        movType: "out",      qty: 1, fromLoc: "Islamabad Store",     toLoc: "—",                   staff: "Ali Khan",     reason: "Sale ORD-017" },
  { date: "2026-03-04", product: "HP Pavilion 15 i7",         movType: "out",      qty: 2, fromLoc: "Main Store Karachi",  toLoc: "—",                   staff: "Sara Ahmed",   reason: "Sale ORD-016" },
  { date: "2026-03-03", product: "Dell Latitude i5",          movType: "transfer", qty: 4, fromLoc: "North Warehouse",    toLoc: "Central Warehouse",   staff: "Bilal Hussain", reason: "Inventory Rebalancing" },
]

const STOCK_MOV_CHART = [
  { period: "Mar 06", in: 9, out: 2, transfer: 0 },
  { period: "Mar 07", in: 0, out: 1, transfer: 2 },
  { period: "Mar 08", in: 4, out: 2, transfer: 0 },
  { period: "Mar 09", in: 3, out: 2, transfer: 2 },
  { period: "Mar 10", in: 5, out: 3, transfer: 0 },
  { period: "Mar 11", in: 0, out: 1, transfer: 0 },
  { period: "Mar 12", in: 0, out: 3, transfer: 0 },
]

// ─── Mock Data: Returns ────────────────────────────────────────────────────────

const RETURNS_TABLE: ReturnRow[] = [
  { date: "2026-03-11", returnId: "RET-012", orderId: "ORD-028", product: "Acer Aspire 5 i5",      qty: 1, amount: 99000,  reason: "Defective Display",        staff: "Sara Ahmed",   status: "approved" },
  { date: "2026-03-10", returnId: "RET-011", orderId: "ORD-025", product: "Dell XPS 13 i7",         qty: 1, amount: 185000, reason: "Customer Changed Mind",    staff: "Ali Khan",     status: "pending" },
  { date: "2026-03-09", returnId: "RET-010", orderId: "ORD-020", product: "HP ProBook 450 G8",      qty: 1, amount: 105000, reason: "Wrong Product Delivered",  staff: "Sara Ahmed",   status: "approved" },
  { date: "2026-03-08", returnId: "RET-009", orderId: "ORD-015", product: "MSI GF63 Thin",          qty: 1, amount: 158000, reason: "Hardware Malfunction",     staff: "Hamza Ali",    status: "approved" },
  { date: "2026-03-07", returnId: "RET-008", orderId: "ORD-012", product: "Dell Latitude i5",       qty: 1, amount: 110000, reason: "Battery Issue",            staff: "Ayesha Noor",  status: "pending" },
  { date: "2026-03-06", returnId: "RET-007", orderId: "ORD-009", product: "Lenovo IdeaPad 5",       qty: 2, amount: 164000, reason: "Performance Issues",       staff: "Sara Ahmed",   status: "approved" },
  { date: "2026-03-05", returnId: "RET-006", orderId: "ORD-007", product: "ASUS VivoBook 15",       qty: 1, amount: 89000,  reason: "Keyboard Defect",          staff: "Ali Khan",     status: "rejected" },
  { date: "2026-03-04", returnId: "RET-005", orderId: "ORD-005", product: "HP Spectre x360",        qty: 1, amount: 210000, reason: "Screen Flickering",        staff: "Ayesha Noor",  status: "approved" },
  { date: "2026-03-03", returnId: "RET-004", orderId: "ORD-003", product: "MacBook Air M2",         qty: 1, amount: 220000, reason: "Not As Described",         staff: "Ali Khan",     status: "pending" },
  { date: "2026-03-02", returnId: "RET-003", orderId: "ORD-002", product: "Dell XPS 13",            qty: 1, amount: 185000, reason: "Physical Damage",          staff: "Sara Ahmed",   status: "rejected" },
  { date: "2026-03-01", returnId: "RET-002", orderId: "ORD-001", product: "HP EliteBook i7",        qty: 1, amount: 145000, reason: "Software Issue",           staff: "Hamza Ali",    status: "approved" },
  { date: "2026-02-28", returnId: "RET-001", orderId: "ORD-098", product: "Lenovo ThinkPad X1",     qty: 1, amount: 138000, reason: "Charging Problem",         staff: "Ayesha Noor",  status: "approved" },
]

const RETURNS_BY_REASON = [
  { reason: "Defective / Malfunction", count: 4 },
  { reason: "Wrong / Not As Described", count: 2 },
  { reason: "Customer Changed Mind",    count: 2 },
  { reason: "Physical Damage",          count: 2 },
  { reason: "Other Issues",             count: 2 },
]

// ─── Mock Data: Staff Activity ─────────────────────────────────────────────────

const STAFF_TABLE: StaffRow[] = [
  { staffId: 1, staffName: "System Admin",    role: "Admin",              location: "Main Store Karachi",  ordersProcessed: 0,  totalSales: 0,       itemsManaged: 5,  lastActive: "2026-03-12" },
  { staffId: 2, staffName: "Ali Khan",        role: "Store Manager",      location: "Main Store Karachi",  ordersProcessed: 45, totalSales: 4580000, itemsManaged: 12, lastActive: "2026-03-12" },
  { staffId: 3, staffName: "Sara Ahmed",      role: "Sales Staff",        location: "Main Store Karachi",  ordersProcessed: 67, totalSales: 6250000, itemsManaged: 8,  lastActive: "2026-03-12" },
  { staffId: 4, staffName: "Usman Tariq",     role: "Inventory Manager",  location: "Central Warehouse",   ordersProcessed: 0,  totalSales: 0,       itemsManaged: 48, lastActive: "2026-03-12" },
  { staffId: 5, staffName: "Bilal Hussain",   role: "Warehouse Staff",    location: "Central Warehouse",   ordersProcessed: 0,  totalSales: 0,       itemsManaged: 35, lastActive: "2026-03-11" },
  { staffId: 6, staffName: "Ayesha Noor",     role: "Accounts",           location: "Main Store Karachi",  ordersProcessed: 28, totalSales: 2890000, itemsManaged: 4,  lastActive: "2026-03-12" },
  { staffId: 7, staffName: "Hamza Ali",       role: "Support",            location: "Online Platform",     ordersProcessed: 35, totalSales: 3210000, itemsManaged: 2,  lastActive: "2026-03-11" },
  { staffId: 8, staffName: "Zain Raza",       role: "IT",                 location: "Main Store Karachi",  ordersProcessed: 0,  totalSales: 0,       itemsManaged: 1,  lastActive: "2026-03-10" },
]

// ─── Sidebar Nav ────────────────────────────────────────────────────────────────

const REPORT_NAV: { id: ReportType; label: string; icon: React.ElementType; desc: string }[] = [
  { id: "sales",          label: "Sales Report",         icon: TrendingUp,   desc: "Orders & revenue" },
  { id: "inventory",      label: "Inventory Report",     icon: Package,      desc: "Stock levels & value" },
  { id: "purchase",       label: "Purchase Report",      icon: ShoppingCart, desc: "Supplier purchases" },
  { id: "stock-movement", label: "Stock Movement",       icon: ArrowUpDown,  desc: "In / out / transfers" },
  { id: "returns",        label: "Returns Report",       icon: RotateCcw,    desc: "Returns & refunds" },
  { id: "staff",          label: "Staff Activity",       icon: Users,        desc: "Performance metrics" },
]

// ─── Utilities ─────────────────────────────────────────────────────────────────

function downloadCSV<T extends object>(rows: T[], filename: string) {
  if (!rows.length) return
  const headers = Object.keys(rows[0]) as Array<keyof T>
  const escape = (v: unknown) => `"${String(v ?? "").replace(/"/g, '""')}"`
  const csv = [
    headers.join(","),
    ...rows.map((r) => headers.map((h) => escape(r[h])).join(",")),
  ].join("\n")
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" })
  const url = URL.createObjectURL(blob)
  const a = document.createElement("a")
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}

// ─── Shared Components ─────────────────────────────────────────────────────────

function KpiCard({ label, value, sub, color, icon: Icon }: {
  label: string; value: string; sub: string; color: string; icon: React.ElementType
}) {
  return (
    <div className="bg-[#0F1E35] border border-[#1E293B] rounded-xl p-5 flex items-start gap-4">
      <div className={cn("w-11 h-11 rounded-lg flex items-center justify-center flex-shrink-0", color)}>
        <Icon className="w-5 h-5" />
      </div>
      <div className="min-w-0">
        <p className="text-[#64748B] text-xs mb-1">{label}</p>
        <p className="text-white text-xl font-bold leading-none">{value}</p>
        <p className="text-[#64748B] text-xs mt-1.5">{sub}</p>
      </div>
    </div>
  )
}

function Pager({ page, total, onPrev, onNext }: {
  page: number; total: number; onPrev: () => void; onNext: () => void
}) {
  if (total <= 1) return null
  return (
    <div className="flex items-center justify-between pt-4 border-t border-[#1E293B]">
      <p className="text-[#64748B] text-xs">
        Page <span className="text-white font-medium">{page}</span> of{" "}
        <span className="text-white font-medium">{total}</span>
      </p>
      <div className="flex gap-2">
        <Button variant="outline" size="sm" onClick={onPrev} disabled={page === 1}
          className="h-8 w-8 p-0 bg-[#0F1E35] border-[#1E293B] text-[#64748B] hover:text-white hover:bg-[#1E293B] disabled:opacity-30">
          <ChevronLeft className="w-4 h-4" />
        </Button>
        <Button variant="outline" size="sm" onClick={onNext} disabled={page === total}
          className="h-8 w-8 p-0 bg-[#0F1E35] border-[#1E293B] text-[#64748B] hover:text-white hover:bg-[#1E293B] disabled:opacity-30">
          <ChevronRight className="w-4 h-4" />
        </Button>
      </div>
    </div>
  )
}

function ChartWrapper({ title, sub, children }: { title: string; sub: string; children: React.ReactNode }) {
  return (
    <div className="bg-[#0F1E35] border border-[#1E293B] rounded-xl p-5">
      <p className="text-white font-semibold text-sm">{title}</p>
      <p className="text-[#64748B] text-xs mt-0.5 mb-5">{sub}</p>
      {children}
    </div>
  )
}

function TableCard({ title, count, children }: { title: string; count: number; children: React.ReactNode }) {
  return (
    <div className="bg-[#0F1E35] border border-[#1E293B] rounded-xl">
      <div className="p-5 border-b border-[#1E293B]">
        <p className="text-white font-semibold text-sm">{title}</p>
        <p className="text-[#64748B] text-xs mt-0.5">{count} records</p>
      </div>
      <div className="overflow-x-auto">{children}</div>
    </div>
  )
}

const tooltipStyle = {
  contentStyle: { background: "#0F1E35", border: "1px solid #1E293B", borderRadius: 8 },
  labelStyle: { color: "#94A3B8", fontSize: 11 },
}
const axisStyle = { fill: "#64748B", fontSize: 11 }

// ─── Sales Report ──────────────────────────────────────────────────────────────

function SalesReport({ rows, page, setPage }: { rows: SalesRow[]; page: number; setPage: (p: number) => void }) {
  const [period, setPeriod] = useState<ChartPeriod>("daily")

  const totalRevenue = rows.reduce((s, r) => s + r.salePrice * r.qty, 0)
  const totalProfit = rows.reduce((s, r) => s + r.profit * r.qty, 0)
  const lossCount = rows.filter(r => r.profit < 0).length

  const chartData = period === "daily" ? SALES_DAILY : period === "weekly" ? SALES_WEEKLY : SALES_MONTHLY
  const totPages = Math.ceil(rows.length / PAGE_SIZE)
  const paged = rows.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
        <KpiCard label="Total Sales"    value={String(rows.length)}      sub={`${rows.reduce((s, r) => s + r.qty, 0)} units sold`}      color="bg-[#2563EB]/15 text-[#2563EB]"    icon={ShoppingCart} />
        <KpiCard label="Total Revenue"  value={fmt(totalRevenue)}         sub="Gross sales value"                                         color="bg-purple-500/15 text-purple-400"  icon={TrendingUp} />
        <KpiCard label="Total Profit"   value={fmt(Math.abs(totalProfit))} sub={totalProfit >= 0 ? "Net positive margin" : "Net loss"}    color={totalProfit >= 0 ? "bg-emerald-500/15 text-emerald-400" : "bg-red-500/15 text-red-400"} icon={totalProfit >= 0 ? TrendingUp : TrendingDown} />
        <KpiCard label="Loss Entries"   value={String(lossCount)}         sub="Discounted / below-cost"                                   color="bg-amber-500/15 text-amber-400"    icon={RotateCcw} />
      </div>

      {/* Chart with toggle */}
      <div className="bg-[#0F1E35] border border-[#1E293B] rounded-xl p-5">
        <div className="flex items-center justify-between mb-5">
          <div>
            <p className="text-white font-semibold text-sm">Sales Overview</p>
            <p className="text-[#64748B] text-xs mt-0.5">Revenue &amp; profit over time</p>
          </div>
          <div className="flex gap-1">
            {(["daily", "weekly", "monthly"] as ChartPeriod[]).map((p) => (
              <button key={p} onClick={() => { setPeriod(p); setPage(1) }}
                className={cn(
                  "px-3 py-1 rounded-md text-xs font-medium capitalize transition-all",
                  period === p
                    ? "bg-[#2563EB] text-white"
                    : "bg-[#0A1628] text-[#64748B] hover:text-white border border-[#1E293B]"
                )}>
                {p}
              </button>
            ))}
          </div>
        </div>
        <ResponsiveContainer width="100%" height={240}>
          <BarChart data={chartData} margin={{ top: 5, right: 10, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#1E293B" />
            <XAxis dataKey="period" tick={axisStyle} axisLine={false} tickLine={false} />
            <YAxis tick={{ ...axisStyle, fontSize: 10 }} axisLine={false} tickLine={false}
              tickFormatter={(v) => `${(v / 100000).toFixed(0)}L`} />
            <Tooltip {...tooltipStyle}
              formatter={(v: number, name: string) => [
                name === "orders" ? v : `PKR ${v.toLocaleString()}`,
                name.charAt(0).toUpperCase() + name.slice(1),
              ]} />
            <Legend wrapperStyle={{ fontSize: 11, color: "#64748B" }} />
            <Bar dataKey="revenue" fill="#2563EB" radius={[3, 3, 0, 0]} name="Revenue" />
            <Bar dataKey="profit"  fill="#10B981" radius={[3, 3, 0, 0]} name="Profit" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Table */}
      <TableCard title="Sales Transactions" count={rows.length}>
        <Table>
          <TableHeader>
            <TableRow className="border-[#1E293B] hover:bg-transparent">
              {["Date", "Order ID", "Product", "Qty", "Sale Price", "Cost", "Profit / Loss", "Staff", "Location"].map((h) => (
                <TableHead key={h} className="text-[#64748B] text-xs font-medium whitespace-nowrap">{h}</TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {paged.length === 0 ? (
              <TableRow><TableCell colSpan={9} className="text-center text-[#64748B] text-sm py-10">No records match the selected filters.</TableCell></TableRow>
            ) : paged.map((row) => (
              <TableRow key={row.orderId} className="border-[#1E293B] hover:bg-[#0A1628] transition-colors">
                <TableCell className="text-[#64748B] text-xs">{row.date}</TableCell>
                <TableCell className="text-[#2563EB] text-xs font-mono">{row.orderId}</TableCell>
                <TableCell className="text-white text-xs max-w-[180px] truncate">{row.product}</TableCell>
                <TableCell className="text-[#94A3B8] text-xs text-center">{row.qty}</TableCell>
                <TableCell className="text-white text-xs font-medium">{fmt(row.salePrice)}</TableCell>
                <TableCell className="text-[#94A3B8] text-xs">{fmt(row.cost)}</TableCell>
                <TableCell>
                  <span className={cn("text-xs font-semibold tabular-nums", row.profit >= 0 ? "text-emerald-400" : "text-red-400")}>
                    {row.profit < 0 ? "−" : "+"}{fmt(row.profit)}
                  </span>
                </TableCell>
                <TableCell className="text-[#94A3B8] text-xs">{row.staff}</TableCell>
                <TableCell className="text-[#64748B] text-xs max-w-[130px] truncate">{row.location}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        <div className="px-5 pb-5">
          <Pager page={page} total={totPages} onPrev={() => setPage(Math.max(1, page - 1))} onNext={() => setPage(Math.min(totPages, page + 1))} />
        </div>
      </TableCard>
    </div>
  )
}

// ─── Inventory Report ──────────────────────────────────────────────────────────

function InventoryReport({ rows, page, setPage }: { rows: InventoryRow[]; page: number; setPage: (p: number) => void }) {
  const totalValue = rows.reduce((s, r) => s + r.totalValue, 0)
  const lowStock   = rows.filter(r => r.stock > 0 && r.stock < 5).length
  const outOfStock = rows.filter(r => r.stock === 0).length

  const chartData = [...rows]
    .sort((a, b) => b.totalValue - a.totalValue)
    .slice(0, 8)
    .map(r => ({ product: r.product.split(" ").slice(0, 3).join(" "), value: r.totalValue }))

  const totPages = Math.ceil(rows.length / PAGE_SIZE)
  const paged = rows.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
        <KpiCard label="Total Products"    value={String(rows.length)} sub="Active SKUs"           color="bg-[#2563EB]/15 text-[#2563EB]"    icon={Package} />
        <KpiCard label="Total Stock Value" value={fmt(totalValue)}     sub="At cost price"          color="bg-purple-500/15 text-purple-400"  icon={TrendingUp} />
        <KpiCard label="Low Stock Items"   value={String(lowStock)}    sub="Below 5 units — reorder" color="bg-amber-500/15 text-amber-400"   icon={AlertTriangle} />
        <KpiCard label="Out of Stock"      value={String(outOfStock)}  sub="Immediate reorder needed" color="bg-red-500/15 text-red-400"     icon={Activity} />
      </div>

      <ChartWrapper title="Inventory Value by Product" sub="Top 8 products ranked by total stock value">
        <ResponsiveContainer width="100%" height={250}>
          <BarChart data={chartData} margin={{ top: 5, right: 10, left: 0, bottom: 50 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#1E293B" />
            <XAxis dataKey="product" tick={{ ...axisStyle, fontSize: 9 }} axisLine={false} tickLine={false} angle={-30} textAnchor="end" interval={0} />
            <YAxis tick={{ ...axisStyle, fontSize: 10 }} axisLine={false} tickLine={false} tickFormatter={(v) => `${(v / 100000).toFixed(0)}L`} />
            <Tooltip {...tooltipStyle} formatter={(v: number) => [`PKR ${v.toLocaleString()}`, "Stock Value"]} />
            <Bar dataKey="value" fill="#8B5CF6" radius={[3, 3, 0, 0]} name="Value" />
          </BarChart>
        </ResponsiveContainer>
      </ChartWrapper>

      <TableCard title="Inventory Details" count={rows.length}>
        <Table>
          <TableHeader>
            <TableRow className="border-[#1E293B] hover:bg-transparent">
              {["#", "Product", "Brand", "Stock Qty", "Unit Cost", "Total Value", "Supplier", "Location"].map((h) => (
                <TableHead key={h} className="text-[#64748B] text-xs font-medium whitespace-nowrap">{h}</TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {paged.map((row) => (
              <TableRow key={row.productId} className="border-[#1E293B] hover:bg-[#0A1628] transition-colors">
                <TableCell className="text-[#64748B] text-xs font-mono">#{row.productId}</TableCell>
                <TableCell className="text-white text-xs max-w-[190px] truncate">{row.product}</TableCell>
                <TableCell><span className="text-[#94A3B8] text-xs bg-[#1E293B] px-2 py-0.5 rounded-md">{row.brand}</span></TableCell>
                <TableCell>
                  <span className={cn("text-xs font-semibold tabular-nums",
                    row.stock === 0 ? "text-red-400" : row.stock < 5 ? "text-amber-400" : "text-emerald-400"
                  )}>{row.stock}</span>
                </TableCell>
                <TableCell className="text-[#94A3B8] text-xs">{fmt(row.unitCost)}</TableCell>
                <TableCell className="text-white text-xs font-medium">{fmt(row.totalValue)}</TableCell>
                <TableCell className="text-[#64748B] text-xs truncate max-w-[140px]">{row.supplier}</TableCell>
                <TableCell className="text-[#64748B] text-xs truncate max-w-[130px]">{row.location}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        <div className="px-5 pb-5">
          <Pager page={page} total={totPages} onPrev={() => setPage(Math.max(1, page - 1))} onNext={() => setPage(Math.min(totPages, page + 1))} />
        </div>
      </TableCard>
    </div>
  )
}

// ─── Purchase Report ───────────────────────────────────────────────────────────

function PurchaseReport({ rows, page, setPage }: { rows: PurchaseRow[]; page: number; setPage: (p: number) => void }) {
  const totalAmount = rows.reduce((s, r) => s + r.totalAmount, 0)
  const avgAmount   = rows.length ? Math.round(totalAmount / rows.length) : 0
  const supplierMap = rows.reduce<Record<string, number>>((m, r) => ({ ...m, [r.supplier]: (m[r.supplier] ?? 0) + 1 }), {})
  const topSupplier = Object.entries(supplierMap).sort((a, b) => b[1] - a[1])[0]?.[0] ?? "—"

  const totPages = Math.ceil(rows.length / PAGE_SIZE)
  const paged = rows.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
        <KpiCard label="Total Purchases"    value={String(rows.length)} sub="Purchase orders"        color="bg-[#2563EB]/15 text-[#2563EB]"   icon={ShoppingCart} />
        <KpiCard label="Total Amount"       value={fmt(totalAmount)}    sub="Total procurement cost"  color="bg-purple-500/15 text-purple-400" icon={TrendingUp} />
        <KpiCard label="Avg Purchase Value" value={fmt(avgAmount)}      sub="Per purchase order"      color="bg-emerald-500/15 text-emerald-400" icon={Activity} />
        <KpiCard label="Top Supplier"       value={topSupplier.split(" ").slice(0, 2).join(" ")} sub="Most frequent partner" color="bg-amber-500/15 text-amber-400" icon={Users} />
      </div>

      <ChartWrapper title="Monthly Purchase Volume" sub="Total procurement spend by month">
        <ResponsiveContainer width="100%" height={240}>
          <BarChart data={PURCHASE_MONTHLY} margin={{ top: 5, right: 10, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#1E293B" />
            <XAxis dataKey="period" tick={axisStyle} axisLine={false} tickLine={false} />
            <YAxis tick={{ ...axisStyle, fontSize: 10 }} axisLine={false} tickLine={false} tickFormatter={(v) => `${(v / 100000).toFixed(0)}L`} />
            <Tooltip {...tooltipStyle} formatter={(v: number, name: string) => [
              name === "purchases" ? v : `PKR ${v.toLocaleString()}`,
              name === "purchases" ? "Orders" : "Amount",
            ]} />
            <Legend wrapperStyle={{ fontSize: 11, color: "#64748B" }} />
            <Bar dataKey="amount"    fill="#2563EB" radius={[3, 3, 0, 0]} name="Amount (PKR)" />
            <Bar dataKey="purchases" fill="#8B5CF6" radius={[3, 3, 0, 0]} name="Orders" />
          </BarChart>
        </ResponsiveContainer>
      </ChartWrapper>

      <TableCard title="Purchase Orders" count={rows.length}>
        <Table>
          <TableHeader>
            <TableRow className="border-[#1E293B] hover:bg-transparent">
              {["Date", "Purchase ID", "Product", "Qty", "Unit Cost", "Total Amount", "Supplier", "Location"].map((h) => (
                <TableHead key={h} className="text-[#64748B] text-xs font-medium whitespace-nowrap">{h}</TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {paged.length === 0 ? (
              <TableRow><TableCell colSpan={8} className="text-center text-[#64748B] text-sm py-10">No records match the selected filters.</TableCell></TableRow>
            ) : paged.map((row) => (
              <TableRow key={row.purchaseId} className="border-[#1E293B] hover:bg-[#0A1628] transition-colors">
                <TableCell className="text-[#64748B] text-xs">{row.date}</TableCell>
                <TableCell className="text-[#2563EB] text-xs font-mono">{row.purchaseId}</TableCell>
                <TableCell className="text-white text-xs max-w-[180px] truncate">{row.product}</TableCell>
                <TableCell className="text-[#94A3B8] text-xs text-center">{row.qty}</TableCell>
                <TableCell className="text-[#94A3B8] text-xs">{fmt(row.unitCost)}</TableCell>
                <TableCell className="text-white text-xs font-medium">{fmt(row.totalAmount)}</TableCell>
                <TableCell className="text-[#64748B] text-xs truncate max-w-[140px]">{row.supplier}</TableCell>
                <TableCell className="text-[#64748B] text-xs truncate max-w-[130px]">{row.location}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        <div className="px-5 pb-5">
          <Pager page={page} total={totPages} onPrev={() => setPage(Math.max(1, page - 1))} onNext={() => setPage(Math.min(totPages, page + 1))} />
        </div>
      </TableCard>
    </div>
  )
}

// ─── Stock Movement Report ─────────────────────────────────────────────────────

function StockMovReport({ rows, page, setPage }: { rows: StockMovRow[]; page: number; setPage: (p: number) => void }) {
  const totalIn    = rows.filter(r => r.movType === "in").reduce((s, r) => s + r.qty, 0)
  const totalOut   = rows.filter(r => r.movType === "out").reduce((s, r) => s + r.qty, 0)
  const transfers  = rows.filter(r => r.movType === "transfer").length
  const net        = totalIn - totalOut

  const totPages = Math.ceil(rows.length / PAGE_SIZE)
  const paged = rows.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)

  const movBadge = (t: StockMovRow["movType"]) => {
    const cls = { in: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20", out: "text-red-400 bg-red-500/10 border-red-500/20", transfer: "text-[#2563EB] bg-[#2563EB]/10 border-[#2563EB]/20" }[t]
    return <span className={cn("text-xs font-medium px-2 py-0.5 rounded-full border capitalize", cls)}>{t}</span>
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
        <KpiCard label="Total Stock In"    value={String(totalIn)}   sub="Units received"       color="bg-emerald-500/15 text-emerald-400" icon={TrendingUp} />
        <KpiCard label="Total Stock Out"   value={String(totalOut)}  sub="Units dispatched"     color="bg-red-500/15 text-red-400"         icon={TrendingDown} />
        <KpiCard label="Net Movement"      value={`${net >= 0 ? "+" : ""}${net}`} sub={net >= 0 ? "Net stock gain" : "Net stock reduction"} color={net >= 0 ? "bg-[#2563EB]/15 text-[#2563EB]" : "bg-amber-500/15 text-amber-400"} icon={ArrowUpDown} />
        <KpiCard label="Transfers"         value={String(transfers)} sub="Inter-location moves"  color="bg-purple-500/15 text-purple-400"  icon={Activity} />
      </div>

      <ChartWrapper title="Stock Movement by Day" sub="Units in / out / transferred per day">
        <ResponsiveContainer width="100%" height={240}>
          <BarChart data={STOCK_MOV_CHART} margin={{ top: 5, right: 10, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#1E293B" />
            <XAxis dataKey="period" tick={axisStyle} axisLine={false} tickLine={false} />
            <YAxis tick={{ ...axisStyle, fontSize: 10 }} axisLine={false} tickLine={false} allowDecimals={false} />
            <Tooltip {...tooltipStyle} formatter={(v: number, name: string) => [v, name.charAt(0).toUpperCase() + name.slice(1)]} />
            <Legend wrapperStyle={{ fontSize: 11, color: "#64748B" }} />
            <Bar dataKey="in"       fill="#10B981" radius={[3, 3, 0, 0]} name="In" />
            <Bar dataKey="out"      fill="#EF4444" radius={[3, 3, 0, 0]} name="Out" />
            <Bar dataKey="transfer" fill="#2563EB" radius={[3, 3, 0, 0]} name="Transfer" />
          </BarChart>
        </ResponsiveContainer>
      </ChartWrapper>

      <TableCard title="Stock Movement Log" count={rows.length}>
        <Table>
          <TableHeader>
            <TableRow className="border-[#1E293B] hover:bg-transparent">
              {["Date", "Product", "Type", "Qty", "From", "To", "Staff", "Reason"].map((h) => (
                <TableHead key={h} className="text-[#64748B] text-xs font-medium whitespace-nowrap">{h}</TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {paged.length === 0 ? (
              <TableRow><TableCell colSpan={8} className="text-center text-[#64748B] text-sm py-10">No records match the selected filters.</TableCell></TableRow>
            ) : paged.map((row, i) => (
              <TableRow key={i} className="border-[#1E293B] hover:bg-[#0A1628] transition-colors">
                <TableCell className="text-[#64748B] text-xs">{row.date}</TableCell>
                <TableCell className="text-white text-xs max-w-[170px] truncate">{row.product}</TableCell>
                <TableCell>{movBadge(row.movType)}</TableCell>
                <TableCell className="text-[#94A3B8] text-xs font-semibold text-center">{row.qty}</TableCell>
                <TableCell className="text-[#64748B] text-xs truncate max-w-[120px]">{row.fromLoc}</TableCell>
                <TableCell className="text-[#64748B] text-xs truncate max-w-[120px]">{row.toLoc}</TableCell>
                <TableCell className="text-[#94A3B8] text-xs">{row.staff}</TableCell>
                <TableCell className="text-[#64748B] text-xs truncate max-w-[140px]">{row.reason}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        <div className="px-5 pb-5">
          <Pager page={page} total={totPages} onPrev={() => setPage(Math.max(1, page - 1))} onNext={() => setPage(Math.min(totPages, page + 1))} />
        </div>
      </TableCard>
    </div>
  )
}

// ─── Returns Report ────────────────────────────────────────────────────────────

function ReturnsReport({ rows, page, setPage }: { rows: ReturnRow[]; page: number; setPage: (p: number) => void }) {
  const totalAmount  = rows.reduce((s, r) => s + r.amount, 0)
  const pending      = rows.filter(r => r.status === "pending").length
  const approved     = rows.filter(r => r.status === "approved").length

  const totPages = Math.ceil(rows.length / PAGE_SIZE)
  const paged = rows.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)

  const statusBadge = (s: ReturnRow["status"]) => {
    const cls = { approved: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20", pending: "text-amber-400 bg-amber-500/10 border-amber-500/20", rejected: "text-red-400 bg-red-500/10 border-red-500/20" }[s]
    return <span className={cn("text-xs font-medium px-2 py-0.5 rounded-full border capitalize", cls)}>{s}</span>
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
        <KpiCard label="Total Returns"   value={String(rows.length)}  sub="Return requests"         color="bg-red-500/15 text-red-400"        icon={RotateCcw} />
        <KpiCard label="Return Amount"   value={fmt(totalAmount)}      sub="Total refund value"       color="bg-amber-500/15 text-amber-400"    icon={TrendingDown} />
        <KpiCard label="Approved"        value={String(approved)}      sub="Processed successfully"   color="bg-emerald-500/15 text-emerald-400" icon={Activity} />
        <KpiCard label="Pending Review"  value={String(pending)}       sub="Awaiting approval"        color="bg-purple-500/15 text-purple-400"  icon={AlertTriangle} />
      </div>

      <ChartWrapper title="Returns by Reason" sub="Breakdown of return reasons across all orders">
        <ResponsiveContainer width="100%" height={240}>
          <BarChart data={RETURNS_BY_REASON} margin={{ top: 5, right: 10, left: 0, bottom: 45 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#1E293B" />
            <XAxis dataKey="reason" tick={{ ...axisStyle, fontSize: 9 }} axisLine={false} tickLine={false} angle={-20} textAnchor="end" interval={0} />
            <YAxis tick={{ ...axisStyle, fontSize: 10 }} axisLine={false} tickLine={false} allowDecimals={false} />
            <Tooltip {...tooltipStyle} formatter={(v: number) => [v, "Returns"]} />
            <Bar dataKey="count" fill="#EF4444" radius={[3, 3, 0, 0]} name="Returns" />
          </BarChart>
        </ResponsiveContainer>
      </ChartWrapper>

      <TableCard title="Returns Log" count={rows.length}>
        <Table>
          <TableHeader>
            <TableRow className="border-[#1E293B] hover:bg-transparent">
              {["Date", "Return ID", "Order ID", "Product", "Qty", "Amount", "Reason", "Staff", "Status"].map((h) => (
                <TableHead key={h} className="text-[#64748B] text-xs font-medium whitespace-nowrap">{h}</TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {paged.length === 0 ? (
              <TableRow><TableCell colSpan={9} className="text-center text-[#64748B] text-sm py-10">No records match the selected filters.</TableCell></TableRow>
            ) : paged.map((row) => (
              <TableRow key={row.returnId} className="border-[#1E293B] hover:bg-[#0A1628] transition-colors">
                <TableCell className="text-[#64748B] text-xs">{row.date}</TableCell>
                <TableCell className="text-[#2563EB] text-xs font-mono">{row.returnId}</TableCell>
                <TableCell className="text-[#94A3B8] text-xs font-mono">{row.orderId}</TableCell>
                <TableCell className="text-white text-xs max-w-[160px] truncate">{row.product}</TableCell>
                <TableCell className="text-[#94A3B8] text-xs text-center">{row.qty}</TableCell>
                <TableCell className="text-red-400 text-xs font-semibold">{fmt(row.amount)}</TableCell>
                <TableCell className="text-[#64748B] text-xs truncate max-w-[150px]">{row.reason}</TableCell>
                <TableCell className="text-[#94A3B8] text-xs">{row.staff}</TableCell>
                <TableCell>{statusBadge(row.status)}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        <div className="px-5 pb-5">
          <Pager page={page} total={totPages} onPrev={() => setPage(Math.max(1, page - 1))} onNext={() => setPage(Math.min(totPages, page + 1))} />
        </div>
      </TableCard>
    </div>
  )
}

// ─── Staff Activity Report ─────────────────────────────────────────────────────

function StaffReport({ rows, page, setPage }: { rows: StaffRow[]; page: number; setPage: (p: number) => void }) {
  const totalOrders    = rows.reduce((s, r) => s + r.ordersProcessed, 0)
  const totalSales     = rows.reduce((s, r) => s + r.totalSales, 0)
  const activeSellers  = rows.filter(r => r.ordersProcessed > 0).length
  const avgSales       = activeSellers ? Math.round(totalSales / activeSellers) : 0

  const chartData = rows.filter(r => r.totalSales > 0).map(r => ({ name: r.staffName.split(" ")[0], sales: r.totalSales, orders: r.ordersProcessed }))

  const totPages = Math.ceil(rows.length / PAGE_SIZE)
  const paged = rows.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
        <KpiCard label="Total Staff"       value={String(rows.length)} sub="In selected location"     color="bg-[#2563EB]/15 text-[#2563EB]"   icon={Users} />
        <KpiCard label="Orders Processed"  value={String(totalOrders)} sub="By sales staff"            color="bg-purple-500/15 text-purple-400" icon={ShoppingCart} />
        <KpiCard label="Revenue Generated" value={fmt(totalSales)}     sub="Total from all staff"      color="bg-emerald-500/15 text-emerald-400" icon={TrendingUp} />
        <KpiCard label="Avg Sales / Staff" value={fmt(avgSales)}       sub="Among active sellers only" color="bg-amber-500/15 text-amber-400"   icon={Activity} />
      </div>

      <ChartWrapper title="Sales Performance by Staff" sub="Total sales generated per staff member (sales roles only)">
        <ResponsiveContainer width="100%" height={240}>
          <BarChart data={chartData} margin={{ top: 5, right: 10, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#1E293B" />
            <XAxis dataKey="name" tick={axisStyle} axisLine={false} tickLine={false} />
            <YAxis tick={{ ...axisStyle, fontSize: 10 }} axisLine={false} tickLine={false} tickFormatter={(v) => `${(v / 100000).toFixed(0)}L`} />
            <Tooltip {...tooltipStyle} formatter={(v: number, name: string) => [
              name === "orders" ? v : `PKR ${v.toLocaleString()}`,
              name === "orders" ? "Orders" : "Sales",
            ]} />
            <Legend wrapperStyle={{ fontSize: 11, color: "#64748B" }} />
            <Bar dataKey="sales"  fill="#2563EB" radius={[3, 3, 0, 0]} name="Sales (PKR)" />
            <Bar dataKey="orders" fill="#10B981" radius={[3, 3, 0, 0]} name="Orders" />
          </BarChart>
        </ResponsiveContainer>
      </ChartWrapper>

      <TableCard title="Staff Activity Details" count={rows.length}>
        <Table>
          <TableHeader>
            <TableRow className="border-[#1E293B] hover:bg-transparent">
              {["#", "Staff Name", "Role", "Location", "Orders Processed", "Total Sales", "Items Managed", "Last Active"].map((h) => (
                <TableHead key={h} className="text-[#64748B] text-xs font-medium whitespace-nowrap">{h}</TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {paged.map((row) => (
              <TableRow key={row.staffId} className="border-[#1E293B] hover:bg-[#0A1628] transition-colors">
                <TableCell className="text-[#64748B] text-xs font-mono">#{row.staffId.toString().padStart(3, "0")}</TableCell>
                <TableCell className="text-white text-xs font-medium">{row.staffName}</TableCell>
                <TableCell><span className="text-[#94A3B8] text-xs bg-[#1E293B] px-2 py-0.5 rounded-md">{row.role}</span></TableCell>
                <TableCell className="text-[#64748B] text-xs truncate max-w-[140px]">{row.location}</TableCell>
                <TableCell className="text-[#94A3B8] text-xs text-center font-semibold">{row.ordersProcessed}</TableCell>
                <TableCell className={cn("text-xs font-semibold", row.totalSales > 0 ? "text-emerald-400" : "text-[#334155]")}>
                  {row.totalSales > 0 ? fmt(row.totalSales) : "—"}
                </TableCell>
                <TableCell className="text-[#94A3B8] text-xs text-center">{row.itemsManaged}</TableCell>
                <TableCell className="text-[#64748B] text-xs">{row.lastActive}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        <div className="px-5 pb-5">
          <Pager page={page} total={totPages} onPrev={() => setPage(Math.max(1, page - 1))} onNext={() => setPage(Math.min(totPages, page + 1))} />
        </div>
      </TableCard>
    </div>
  )
}

// ─── Main Reports Page ─────────────────────────────────────────────────────────

export default function ReportsPage() {
  const [activeReport, setActiveReport] = useState<ReportType>("sales")
  const [dateFrom,     setDateFrom]     = useState("2026-03-01")
  const [dateTo,       setDateTo]       = useState("2026-03-12")
  const [location,     setLocation]     = useState("All Locations")
  const [page,         setPage]         = useState(1)
  const [sidebarOpen,  setSidebarOpen]  = useState(true)

  const resetPage = () => setPage(1)

  // ── Filtered data per report ─────────────────────────────────────────────────

  const filteredSales = useMemo(() => {
    let rows = SALES_TABLE
    if (dateFrom) rows = rows.filter(r => r.date >= dateFrom)
    if (dateTo)   rows = rows.filter(r => r.date <= dateTo)
    if (location !== "All Locations") rows = rows.filter(r => r.location === location)
    return rows
  }, [dateFrom, dateTo, location])

  const filteredInventory = useMemo(() => {
    if (location !== "All Locations") return INVENTORY_TABLE.filter(r => r.location === location)
    return INVENTORY_TABLE
  }, [location])

  const filteredPurchase = useMemo(() => {
    let rows = PURCHASE_TABLE
    if (dateFrom) rows = rows.filter(r => r.date >= dateFrom)
    if (dateTo)   rows = rows.filter(r => r.date <= dateTo)
    if (location !== "All Locations") rows = rows.filter(r => r.location === location)
    return rows
  }, [dateFrom, dateTo, location])

  const filteredStockMov = useMemo(() => {
    let rows = STOCK_MOV_TABLE
    if (dateFrom) rows = rows.filter(r => r.date >= dateFrom)
    if (dateTo)   rows = rows.filter(r => r.date <= dateTo)
    if (location !== "All Locations")
      rows = rows.filter(r => r.fromLoc === location || r.toLoc === location)
    return rows
  }, [dateFrom, dateTo, location])

  const filteredReturns = useMemo(() => {
    let rows = RETURNS_TABLE
    if (dateFrom) rows = rows.filter(r => r.date >= dateFrom)
    if (dateTo)   rows = rows.filter(r => r.date <= dateTo)
    return rows
  }, [dateFrom, dateTo])

  const filteredStaff = useMemo(() => {
    if (location !== "All Locations") return STAFF_TABLE.filter(r => r.location === location)
    return STAFF_TABLE
  }, [location])

  // ── CSV export ───────────────────────────────────────────────────────────────

  const handleExport = () => {
    const stamp = `${dateFrom}_${dateTo}`
    switch (activeReport) {
      case "sales":          return downloadCSV(filteredSales,     `Sales_Report_${stamp}.csv`)
      case "inventory":      return downloadCSV(filteredInventory, `Inventory_Report_${stamp}.csv`)
      case "purchase":       return downloadCSV(filteredPurchase,  `Purchase_Report_${stamp}.csv`)
      case "stock-movement": return downloadCSV(filteredStockMov,  `Stock_Movement_${stamp}.csv`)
      case "returns":        return downloadCSV(filteredReturns,   `Returns_Report_${stamp}.csv`)
      case "staff":          return downloadCSV(filteredStaff,     `Staff_Activity_${stamp}.csv`)
    }
  }

  // ── Render active report ─────────────────────────────────────────────────────

  const renderReport = () => {
    switch (activeReport) {
      case "sales":          return <SalesReport    rows={filteredSales}     page={page} setPage={setPage} />
      case "inventory":      return <InventoryReport rows={filteredInventory} page={page} setPage={setPage} />
      case "purchase":       return <PurchaseReport  rows={filteredPurchase}  page={page} setPage={setPage} />
      case "stock-movement": return <StockMovReport  rows={filteredStockMov}  page={page} setPage={setPage} />
      case "returns":        return <ReturnsReport   rows={filteredReturns}   page={page} setPage={setPage} />
      case "staff":          return <StaffReport     rows={filteredStaff}     page={page} setPage={setPage} />
    }
  }

  const activeNav = REPORT_NAV.find(n => n.id === activeReport)!

  return (
    <div className="flex h-screen bg-[#0A1628] overflow-hidden">

      {/* ── Sidebar ─────────────────────────────────────────────────────────── */}
      <aside className={cn(
        "bg-[#060F1E] border-r border-[#1E293B] flex flex-col transition-all duration-300 flex-shrink-0",
        sidebarOpen ? "w-56" : "w-16"
      )}>
        {/* Brand */}
        <div className={cn("flex items-center gap-3 p-4 border-b border-[#1E293B] h-16", !sidebarOpen && "justify-center")}>
          <div className="w-8 h-8 rounded-lg bg-[#2563EB] flex items-center justify-center flex-shrink-0">
            <BarChart2 className="w-4 h-4 text-white" />
          </div>
          {sidebarOpen && (
            <div className="min-w-0">
              <p className="text-white text-sm font-bold truncate">Reports</p>
              <p className="text-[#2563EB] text-[10px] truncate">Analytics Center</p>
            </div>
          )}
        </div>

        {/* Nav */}
        <nav className="flex-1 py-3 overflow-y-auto space-y-0.5">
          {REPORT_NAV.map(({ id, label, icon: Icon, desc }) => (
            <button
              key={id}
              onClick={() => { setActiveReport(id); resetPage() }}
              title={!sidebarOpen ? label : undefined}
              className={cn(
                "w-full flex items-center gap-3 px-3 py-2.5 mx-1 rounded-lg text-sm font-medium transition-all",
                "hover:bg-[#1E293B] hover:text-white",
                activeReport === id
                  ? "bg-[#2563EB]/15 text-[#2563EB] border border-[#2563EB]/20"
                  : "text-[#64748B]",
                !sidebarOpen ? "justify-center w-10" : "w-[calc(100%-8px)]"
              )}
            >
              <Icon className="w-4 h-4 flex-shrink-0" />
              {sidebarOpen && (
                <div className="min-w-0 text-left flex-1">
                  <p className="truncate text-xs font-semibold leading-tight">{label}</p>
                  <p className={cn("truncate text-[10px] leading-tight mt-0.5", activeReport === id ? "text-[#2563EB]/60" : "text-[#334155]")}>{desc}</p>
                </div>
              )}
              {sidebarOpen && activeReport === id && (
                <ChevronRight className="w-3 h-3 ml-auto flex-shrink-0" />
              )}
            </button>
          ))}
        </nav>

        {/* Admin link */}
        {sidebarOpen && (
          <div className="px-3 pb-2">
            <a href="/admin"
              className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-[#64748B] hover:text-white hover:bg-[#1E293B] transition-all text-xs">
              <LogOut className="w-3.5 h-3.5" />
              <span>Back to Admin</span>
            </a>
          </div>
        )}

        {/* Collapse toggle */}
        <button onClick={() => setSidebarOpen(!sidebarOpen)}
          className="m-3 p-2 rounded-lg border border-[#1E293B] text-[#64748B] hover:text-white hover:bg-[#1E293B] transition-all flex items-center justify-center">
          <Menu className="w-4 h-4" />
        </button>
      </aside>

      {/* ── Main ────────────────────────────────────────────────────────────── */}
      <div className="flex flex-col flex-1 min-w-0 overflow-hidden">

        {/* Top bar */}
        <div className="h-16 bg-[#0A1628] border-b border-[#1E293B] flex items-center justify-between px-6 flex-shrink-0">
          <div className="flex items-center gap-2 text-sm">
            <span className="text-[#64748B]">Reports</span>
            <ChevronRight className="w-3.5 h-3.5 text-[#334155]" />
            <span className="text-white font-medium">{activeNav.label}</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-[#2563EB] flex items-center justify-center">
              <span className="text-white text-xs font-bold">AS</span>
            </div>
            <div className="hidden sm:block text-right">
              <p className="text-white text-xs font-semibold">Ammar Shahzad</p>
              <p className="text-[#64748B] text-[10px]">Administrator</p>
            </div>
          </div>
        </div>

        {/* Filter bar */}
        <div className="bg-[#0F1E35] border-b border-[#1E293B] px-6 py-3 flex flex-wrap items-center gap-3 flex-shrink-0">
          {/* Date From */}
          <div className="flex items-center gap-2">
            <label className="text-[#64748B] text-xs whitespace-nowrap">From</label>
            <input
              type="date"
              value={dateFrom}
              onChange={e => { setDateFrom(e.target.value); resetPage() }}
              className="bg-[#0A1628] border border-[#1E293B] text-white text-xs rounded-lg px-3 py-1.5 focus:outline-none focus:border-[#2563EB] [color-scheme:dark] h-8"
            />
          </div>

          {/* Date To */}
          <div className="flex items-center gap-2">
            <label className="text-[#64748B] text-xs whitespace-nowrap">To</label>
            <input
              type="date"
              value={dateTo}
              onChange={e => { setDateTo(e.target.value); resetPage() }}
              className="bg-[#0A1628] border border-[#1E293B] text-white text-xs rounded-lg px-3 py-1.5 focus:outline-none focus:border-[#2563EB] [color-scheme:dark] h-8"
            />
          </div>

          <Separator orientation="vertical" className="h-5 bg-[#1E293B]" />

          {/* Location */}
          <Select value={location} onValueChange={v => { setLocation(v); resetPage() }}>
            <SelectTrigger className="bg-[#0A1628] border-[#1E293B] text-white text-xs h-8 w-44 focus:ring-0 focus:border-[#2563EB]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-[#0F1E35] border-[#1E293B]">
              {LOCATIONS.map(l => (
                <SelectItem key={l} value={l} className="text-white hover:bg-[#1E293B] text-xs">{l}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Separator orientation="vertical" className="h-5 bg-[#1E293B]" />

          {/* Export */}
          <Button onClick={handleExport} size="sm"
            className="h-8 bg-emerald-600 hover:bg-emerald-700 text-white text-xs gap-1.5 px-3">
            <Download className="w-3.5 h-3.5" />
            Export CSV
          </Button>

          {/* Active filter chips */}
          <div className="flex items-center gap-2 ml-auto">
            {location !== "All Locations" && (
              <span className="text-[10px] bg-[#2563EB]/15 text-[#2563EB] border border-[#2563EB]/20 px-2 py-0.5 rounded-full">
                {location}
              </span>
            )}
            <span className="text-[#334155] text-[10px]">{dateFrom} → {dateTo}</span>
          </div>
        </div>

        {/* Report content */}
        <main className="flex-1 overflow-y-auto p-6">
          {renderReport()}
        </main>
      </div>
    </div>
  )
}
