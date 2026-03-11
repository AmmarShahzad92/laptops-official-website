"use client"

import { useState, useMemo } from "react"
import { motion } from "framer-motion"

const kpiGridVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.09 } },
}
const kpiItemVariants = {
  hidden: { opacity: 0, y: 22, scale: 0.97 },
  visible: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.45, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] } },
}
import {
  LayoutDashboard, Users, Package, UserCircle, Truck,
  MapPin, ShieldCheck, Settings, LogOut, ChevronRight,
  TrendingUp, ShoppingCart, BoxIcon, UserCheck,
  Search, Plus, Pencil, Trash2, X, Eye, EyeOff,
  AlertTriangle, ArrowUpDown, ChevronDown, Menu,
} from "lucide-react"
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Area, AreaChart,
} from "recharts"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
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
import { Separator } from "@/components/ui/separator"
import { cn } from "@/lib/utils"

// ─── Types ────────────────────────────────────────────────────────────────────

type AdminTab =
  | "dashboard" | "staff" | "products" | "customers"
  | "suppliers" | "locations" | "roles" | "settings"

type StaffStatus = "active" | "inactive" | "suspended"
type OrderStatus = "processing" | "delivered" | "returned"
type SortDir = "asc" | "desc" | null

interface StaffMember {
  staff_id: number
  staff_name: string
  username: string
  password_hash: string
  role: string
  location: string
  staff_contact: string
  staff_email: string
  staff_cnic: string
  staff_bank_acno: string
  staff_salary: number
  staff_hiring_date: string
  staff_status: StaffStatus
}

interface StaffFormData {
  staff_name: string
  username: string
  password: string
  role: string
  location: string
  staff_contact: string
  staff_email: string
  staff_cnic: string
  staff_bank_acno: string
  staff_salary: string
  staff_hiring_date: string
  staff_status: StaffStatus
}

// ─── Mock Data ────────────────────────────────────────────────────────────────

const ROLES = [
  "Admin", "Store Manager", "Sales Staff", "Inventory Manager",
  "Warehouse Staff", "Accounts", "Support", "IT", "Supervisor", "Auditor",
]

const LOCATIONS = [
  "Main Store Karachi", "Lahore Store", "Islamabad Store",
  "Central Warehouse", "North Warehouse", "Online Platform",
  "Hyderabad Store", "Multan Store", "Faisalabad Store", "Peshawar Store",
]

const MOCK_STAFF: StaffMember[] = [
  { staff_id: 1, staff_name: "System Admin", username: "admin", password_hash: "••••••••", role: "Admin", location: "Main Store Karachi", staff_contact: "0300-0000001", staff_email: "admin@sys.com", staff_cnic: "11111-1111111-1", staff_bank_acno: "1111111111111111", staff_salary: 80000, staff_hiring_date: "2024-01-01", staff_status: "active" },
  { staff_id: 2, staff_name: "Ali Khan", username: "manager1", password_hash: "••••••••", role: "Store Manager", location: "Main Store Karachi", staff_contact: "0300-0000002", staff_email: "ali@store.com", staff_cnic: "22222-2222222-2", staff_bank_acno: "2222222222222222", staff_salary: 60000, staff_hiring_date: "2024-02-01", staff_status: "active" },
  { staff_id: 3, staff_name: "Sara Ahmed", username: "sales1", password_hash: "••••••••", role: "Sales Staff", location: "Main Store Karachi", staff_contact: "0300-0000003", staff_email: "sara@sales.com", staff_cnic: "33333-3333333-3", staff_bank_acno: "3333333333333333", staff_salary: 45000, staff_hiring_date: "2024-03-01", staff_status: "active" },
  { staff_id: 4, staff_name: "Usman Tariq", username: "inv1", password_hash: "••••••••", role: "Inventory Manager", location: "Central Warehouse", staff_contact: "0300-0000004", staff_email: "usman@inv.com", staff_cnic: "44444-4444444-4", staff_bank_acno: "4444444444444444", staff_salary: 50000, staff_hiring_date: "2024-02-10", staff_status: "active" },
  { staff_id: 5, staff_name: "Bilal Hussain", username: "wh1", password_hash: "••••••••", role: "Warehouse Staff", location: "Central Warehouse", staff_contact: "0300-0000005", staff_email: "bilal@wh.com", staff_cnic: "55555-5555555-5", staff_bank_acno: "5555555555555555", staff_salary: 40000, staff_hiring_date: "2024-01-15", staff_status: "inactive" },
  { staff_id: 6, staff_name: "Ayesha Noor", username: "acc1", password_hash: "••••••••", role: "Accounts", location: "Main Store Karachi", staff_contact: "0300-0000006", staff_email: "ayesha@acc.com", staff_cnic: "66666-6666666-6", staff_bank_acno: "6666666666666666", staff_salary: 55000, staff_hiring_date: "2024-03-05", staff_status: "active" },
  { staff_id: 7, staff_name: "Hamza Ali", username: "support1", password_hash: "••••••••", role: "Support", location: "Online Platform", staff_contact: "0300-0000007", staff_email: "hamza@support.com", staff_cnic: "77777-7777777-7", staff_bank_acno: "7777777777777777", staff_salary: 42000, staff_hiring_date: "2024-04-01", staff_status: "suspended" },
  { staff_id: 8, staff_name: "Zain Raza", username: "it1", password_hash: "••••••••", role: "IT", location: "Main Store Karachi", staff_contact: "0300-0000008", staff_email: "zain@it.com", staff_cnic: "88888-8888888-8", staff_bank_acno: "8888888888888888", staff_salary: 70000, staff_hiring_date: "2024-01-20", staff_status: "active" },
]

const REVENUE_DATA = [
  { month: "Aug", revenue: 420000, orders: 12 },
  { month: "Sep", revenue: 580000, orders: 17 },
  { month: "Oct", revenue: 390000, orders: 11 },
  { month: "Nov", revenue: 710000, orders: 21 },
  { month: "Dec", revenue: 950000, orders: 28 },
  { month: "Jan", revenue: 830000, orders: 24 },
  { month: "Feb", revenue: 1100000, orders: 31 },
  { month: "Mar", revenue: 980000, orders: 27 },
]

const RECENT_ORDERS = [
  { id: "ORD-001", customer: "Ahmed Raza", product: "Dell Latitude i5", amount: 110000, date: "2026-03-10", status: "delivered" as OrderStatus },
  { id: "ORD-002", customer: "Fatima Shah", product: "MacBook M1", amount: 170000, date: "2026-03-10", status: "processing" as OrderStatus },
  { id: "ORD-003", customer: "Omar Malik", product: "HP EliteBook i7", amount: 140000, date: "2026-03-09", status: "processing" as OrderStatus },
  { id: "ORD-004", customer: "Sana Khan", product: "Lenovo ThinkPad", amount: 135000, date: "2026-03-08", status: "returned" as OrderStatus },
  { id: "ORD-005", customer: "Bilal Ahmed", product: "Acer Aspire 5", amount: 99000, date: "2026-03-07", status: "delivered" as OrderStatus },
]

const LOW_STOCK = [
  { product: "MacBook M1 (13.3\")", stock: 2, threshold: 5 },
  { product: "MSI Modern 14", stock: 1, threshold: 5 },
  { product: "Dell OptiPlex", stock: 3, threshold: 5 },
]

const EMPTY_FORM: StaffFormData = {
  staff_name: "", username: "", password: "", role: "",
  location: "", staff_contact: "", staff_email: "",
  staff_cnic: "", staff_bank_acno: "", staff_salary: "",
  staff_hiring_date: "", staff_status: "active",
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function StatusBadge({ status }: { status: StaffStatus | OrderStatus }) {
  const map: Record<string, string> = {
    active: "bg-emerald-500/15 text-emerald-400 border-emerald-500/30",
    inactive: "bg-slate-500/15 text-slate-400 border-slate-500/30",
    suspended: "bg-red-500/15 text-red-400 border-red-500/30",
    processing: "bg-amber-500/15 text-amber-400 border-amber-500/30",
    delivered: "bg-emerald-500/15 text-emerald-400 border-emerald-500/30",
    returned: "bg-red-500/15 text-red-400 border-red-500/30",
  }
  return (
    <span className={cn("px-2 py-0.5 rounded-full text-xs font-medium border capitalize", map[status])}>
      {status}
    </span>
  )
}

function KpiCard({ label, value, icon: Icon, trend, color }: {
  label: string; value: string; icon: React.ElementType; trend: string; color: string
}) {
  return (
    <motion.div
      variants={kpiItemVariants}
      className="bg-[#0F1E35] border border-[#1E293B] rounded-xl p-5 flex items-start gap-4"
    >
      <div className={cn("w-11 h-11 rounded-lg flex items-center justify-center flex-shrink-0", color)}>
        <Icon className="w-5 h-5" />
      </div>
      <div className="min-w-0">
        <p className="text-[#64748B] text-xs mb-1">{label}</p>
        <p className="text-white text-xl font-bold leading-none">{value}</p>
        <p className="text-emerald-400 text-xs mt-1.5">{trend}</p>
      </div>
    </motion.div>
  )
}
// ─── Sidebar ──────────────────────────────────────────────────────────────

const NAV_ITEMS: { id: AdminTab; label: string; icon: React.ElementType }[] = [
  { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
  { id: "staff", label: "Staff Management", icon: Users },
  { id: "products", label: "Products Management", icon: Package },
  { id: "customers", label: "Customer Management", icon: UserCircle },
  { id: "suppliers", label: "Supplier Management", icon: Truck },
  { id: "locations", label: "Locations Management", icon: MapPin },
  { id: "roles", label: "Roles Management", icon: ShieldCheck },
  { id: "settings", label: "System Settings", icon: Settings },
]

function Sidebar({
  active, onSelect, collapsed, onToggle,
}: {
  active: AdminTab; onSelect: (t: AdminTab) => void
  collapsed: boolean; onToggle: () => void
}) {
  return (
    <aside
      className={cn(
        "bg-[#060F1E] border-r border-[#1E293B] flex flex-col transition-all duration-300 flex-shrink-0",
        collapsed ? "w-16" : "w-56"
      )}
    >
      {/* Logo */}
      <div className={cn("flex items-center gap-3 p-4 border-b border-[#1E293B] h-16", collapsed && "justify-center")}>
        <div className="w-8 h-8 rounded-lg bg-[#2563EB] flex items-center justify-center flex-shrink-0">
          <span className="text-white text-xs font-black">LO</span>
        </div>
        {!collapsed && (
          <div className="min-w-0">
            <p className="text-white text-sm font-bold truncate">Laptops Official</p>
            <p className="text-[#2563EB] text-[10px] truncate">Admin Panel</p>
          </div>
        )}
      </div>

      {/* Nav */}
      <nav className="flex-1 py-3 overflow-y-auto">
        {NAV_ITEMS.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => onSelect(id)}
            title={collapsed ? label : undefined}
            className={cn(
              "w-full flex items-center gap-3 px-3 py-2.5 mx-1 rounded-lg text-sm font-medium transition-all",
              "hover:bg-[#1E293B] hover:text-white",
              active === id
                ? "bg-[#2563EB]/15 text-[#2563EB] border border-[#2563EB]/20"
                : "text-[#64748B]",
              collapsed ? "justify-center w-10" : "w-[calc(100%-8px)]"
            )}
          >
            <Icon className="w-4 h-4 flex-shrink-0" />
            {!collapsed && <span className="truncate">{label}</span>}
            {!collapsed && active === id && (
              <ChevronRight className="w-3 h-3 ml-auto flex-shrink-0" />
            )}
          </button>
        ))}
      </nav>

      {/* Collapse toggle */}
      <button
        onClick={onToggle}
        className="m-3 p-2 rounded-lg border border-[#1E293B] text-[#64748B] hover:text-white hover:bg-[#1E293B] transition-all flex items-center justify-center"
      >
        <Menu className="w-4 h-4" />
      </button>
    </aside>
  )
}

// ─── Top Bar ──────────────────────────────────────────────────────────────────

function TopBar({ tab }: { tab: AdminTab }) {
  const label = NAV_ITEMS.find((n) => n.id === tab)?.label ?? "Dashboard"

  return (
    <div className="h-16 bg-[#0A1628] border-b border-[#1E293B] flex items-center justify-between px-6 flex-shrink-0">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm">
        <span className="text-[#64748B]">Admin Panel</span>
        <ChevronRight className="w-3.5 h-3.5 text-[#334155]" />
        <span className="text-white font-medium">{label}</span>
      </div>

      {/* Right side */}
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-[#2563EB] flex items-center justify-center">
            <span className="text-white text-xs font-bold">AS</span>
          </div>
          <div className="hidden sm:block text-right">
            <p className="text-white text-xs font-semibold">Ammar Shahzad</p>
            <p className="text-[#64748B] text-[10px]">Administrator</p>
          </div>
        </div>
        <Separator orientation="vertical" className="h-6 bg-[#1E293B]" />
        <Button
          variant="ghost"
          size="sm"
          className="text-[#64748B] hover:text-red-400 hover:bg-red-500/10 gap-1.5 text-xs"
        >
          <LogOut className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Logout</span>
        </Button>
      </div>
    </div>
  )
}

// ─── Dashboard Tab ────────────────────────────────────────────────────────────

function DashboardTab() {
  return (
    <div className="space-y-6">
      {/* KPIs */}
      <motion.div
        variants={kpiGridVariants}
        initial="hidden"
        animate="visible"
        className="grid grid-cols-2 xl:grid-cols-4 gap-4"
      >
        <KpiCard label="Total Revenue" value="PKR 59.6L" icon={TrendingUp} trend="↑ 18% this month" color="bg-[#2563EB]/15 text-[#2563EB]" />
        <KpiCard label="Total Orders" value="171" icon={ShoppingCart} trend="↑ 12% this month" color="bg-purple-500/15 text-purple-400" />
        <KpiCard label="Active Products" value="10" icon={BoxIcon} trend="2 low stock alerts" color="bg-amber-500/15 text-amber-400" />
        <KpiCard label="Total Staff" value="8" icon={UserCheck} trend="1 suspended" color="bg-emerald-500/15 text-emerald-400" />
      </motion.div>

      {/* Revenue chart + Low stock */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
        {/* Chart */}
        <div className="xl:col-span-2 bg-[#0F1E35] border border-[#1E293B] rounded-xl p-5">
          <div className="flex items-center justify-between mb-5">
            <div>
              <p className="text-white font-semibold text-sm">Revenue Overview</p>
              <p className="text-[#64748B] text-xs mt-0.5">Last 8 months</p>
            </div>
            <Badge variant="outline" className="border-[#2563EB]/30 text-[#2563EB] text-xs">
              PKR
            </Badge>
          </div>
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={REVENUE_DATA} margin={{ top: 5, right: 10, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#2563EB" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#2563EB" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#1E293B" />
              <XAxis dataKey="month" tick={{ fill: "#64748B", fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis
                tick={{ fill: "#64748B", fontSize: 10 }}
                axisLine={false} tickLine={false}
                tickFormatter={(v) => `${(v / 100000).toFixed(0)}L`}
              />
              <Tooltip
                contentStyle={{ background: "#0F1E35", border: "1px solid #1E293B", borderRadius: 8 }}
                labelStyle={{ color: "#94A3B8", fontSize: 11 }}
                formatter={(v: number) => [`PKR ${v.toLocaleString()}`, "Revenue"]}
              />
              <Area type="monotone" dataKey="revenue" stroke="#2563EB" strokeWidth={2} fill="url(#revGrad)" dot={false} />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Low Stock */}
        <div className="bg-[#0F1E35] border border-[#1E293B] rounded-xl p-5">
          <div className="flex items-center gap-2 mb-4">
            <AlertTriangle className="w-4 h-4 text-amber-400" />
            <p className="text-white font-semibold text-sm">Low Stock Alerts</p>
          </div>
          <div className="space-y-3">
            {LOW_STOCK.map((item, i) => (
              <div key={i} className="bg-[#0A1628] rounded-lg p-3">
                <p className="text-white text-xs font-medium truncate">{item.product}</p>
                <div className="flex items-center justify-between mt-2">
                  <div className="flex-1 h-1.5 bg-[#1E293B] rounded-full mr-3">
                    <div
                      className="h-full bg-amber-400 rounded-full"
                      style={{ width: `${(item.stock / item.threshold) * 100}%` }}
                    />
                  </div>
                  <span className="text-amber-400 text-xs font-bold flex-shrink-0">{item.stock} left</span>
                </div>
              </div>
            ))}
          </div>
          <Button
            variant="ghost"
            size="sm"
            className="w-full mt-4 text-[#64748B] hover:text-[#2563EB] text-xs border border-[#1E293B] hover:border-[#2563EB]/30"
          >
            View Full Inventory
          </Button>
        </div>
      </div>

      {/* Recent Orders */}
      <div className="bg-[#0F1E35] border border-[#1E293B] rounded-xl">
        <div className="flex items-center justify-between p-5 border-b border-[#1E293B]">
          <p className="text-white font-semibold text-sm">Recent Orders</p>
          <Button variant="ghost" size="sm" className="text-[#2563EB] text-xs hover:bg-[#2563EB]/10">
            View All
          </Button>
        </div>
        <Table>
          <TableHeader>
            <TableRow className="border-[#1E293B] hover:bg-transparent">
              {["Order ID", "Customer", "Product", "Amount", "Date", "Status"].map((h) => (
                <TableHead key={h} className="text-[#64748B] text-xs font-medium">{h}</TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {RECENT_ORDERS.map((order) => (
              <TableRow key={order.id} className="border-[#1E293B] hover:bg-[#0A1628] transition-colors">
                <TableCell className="text-[#2563EB] text-xs font-mono font-medium">{order.id}</TableCell>
                <TableCell className="text-white text-xs">{order.customer}</TableCell>
                <TableCell className="text-[#94A3B8] text-xs">{order.product}</TableCell>
                <TableCell className="text-white text-xs font-medium">PKR {order.amount.toLocaleString()}</TableCell>
                <TableCell className="text-[#64748B] text-xs">{order.date}</TableCell>
                <TableCell><StatusBadge status={order.status} /></TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}

// ─── Staff Form Modal ─────────────────────────────────────────────────────────

function StaffModal({
  open, onClose, editing, onSave,
}: {
  open: boolean
  onClose: () => void
  editing: StaffMember | null
  onSave: (data: StaffFormData) => void
}) {
  const [form, setForm] = useState<StaffFormData>(
    editing
      ? {
          staff_name: editing.staff_name,
          username: editing.username,
          password: "",
          role: editing.role,
          location: editing.location,
          staff_contact: editing.staff_contact,
          staff_email: editing.staff_email,
          staff_cnic: editing.staff_cnic,
          staff_bank_acno: editing.staff_bank_acno,
          staff_salary: String(editing.staff_salary),
          staff_hiring_date: editing.staff_hiring_date,
          staff_status: editing.staff_status,
        }
      : EMPTY_FORM
  )
  const [showPw, setShowPw] = useState(false)

  const set = (k: keyof StaffFormData, v: string) =>
    setForm((prev) => ({ ...prev, [k]: v }))

  const inputCls = "bg-[#0A1628] border-[#1E293B] text-white placeholder:text-[#334155] focus:border-[#2563EB] text-sm h-9"
  const labelCls = "text-[#94A3B8] text-xs"

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="bg-[#0F1E35] border border-[#1E293B] text-white max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-white text-base font-semibold">
            {editing ? "Edit Staff Member" : "Add New Staff Member"}
          </DialogTitle>
        </DialogHeader>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 py-2">
          {/* Full Name */}
          <div className="space-y-1.5">
            <Label className={labelCls}>Full Name *</Label>
            <Input placeholder="e.g. Ali Khan" value={form.staff_name}
              onChange={(e) => set("staff_name", e.target.value)} className={inputCls} />
          </div>

          {/* Username */}
          <div className="space-y-1.5">
            <Label className={labelCls}>Username *</Label>
            <Input placeholder="e.g. ali_khan" value={form.username}
              onChange={(e) => set("username", e.target.value)} className={inputCls} />
          </div>

          {/* Password */}
          <div className="space-y-1.5">
            <Label className={labelCls}>{editing ? "New Password (leave blank to keep)" : "Password *"}</Label>
            <div className="relative">
              <Input
                type={showPw ? "text" : "password"}
                placeholder="••••••••"
                value={form.password}
                onChange={(e) => set("password", e.target.value)}
                className={cn(inputCls, "pr-9")}
              />
              <button
                type="button"
                onClick={() => setShowPw(!showPw)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[#64748B] hover:text-white"
              >
                {showPw ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
              </button>
            </div>
          </div>

          {/* Role */}
          <div className="space-y-1.5">
            <Label className={labelCls}>Role *</Label>
            <Select value={form.role} onValueChange={(v) => set("role", v)}>
              <SelectTrigger className={cn(inputCls, "w-full")}>
                <SelectValue placeholder="Select role" />
              </SelectTrigger>
              <SelectContent className="bg-[#0F1E35] border-[#1E293B]">
                {ROLES.map((r) => (
                  <SelectItem key={r} value={r} className="text-white hover:bg-[#1E293B] text-sm">{r}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Location */}
          <div className="space-y-1.5">
            <Label className={labelCls}>Location *</Label>
            <Select value={form.location} onValueChange={(v) => set("location", v)}>
              <SelectTrigger className={cn(inputCls, "w-full")}>
                <SelectValue placeholder="Select location" />
              </SelectTrigger>
              <SelectContent className="bg-[#0F1E35] border-[#1E293B]">
                {LOCATIONS.map((l) => (
                  <SelectItem key={l} value={l} className="text-white hover:bg-[#1E293B] text-sm">{l}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Contact */}
          <div className="space-y-1.5">
            <Label className={labelCls}>Contact Number *</Label>
            <Input placeholder="0300-0000000" value={form.staff_contact}
              onChange={(e) => set("staff_contact", e.target.value)} className={inputCls} />
          </div>

          {/* Email */}
          <div className="space-y-1.5 sm:col-span-2">
            <Label className={labelCls}>Email Address *</Label>
            <Input type="email" placeholder="staff@laptopsofficial.pk" value={form.staff_email}
              onChange={(e) => set("staff_email", e.target.value)} className={inputCls} />
          </div>

          {/* CNIC */}
          <div className="space-y-1.5">
            <Label className={labelCls}>CNIC *</Label>
            <Input placeholder="XXXXX-XXXXXXX-X" value={form.staff_cnic}
              onChange={(e) => set("staff_cnic", e.target.value)} className={inputCls} />
          </div>

          {/* Bank Account */}
          <div className="space-y-1.5">
            <Label className={labelCls}>Bank Account No. *</Label>
            <Input placeholder="16-digit account number" value={form.staff_bank_acno}
              onChange={(e) => set("staff_bank_acno", e.target.value)} className={inputCls} />
          </div>

          {/* Salary */}
          <div className="space-y-1.5">
            <Label className={labelCls}>Salary (PKR) *</Label>
            <Input type="number" placeholder="50000" value={form.staff_salary}
              onChange={(e) => set("staff_salary", e.target.value)} className={inputCls} />
          </div>

          {/* Hiring Date */}
          <div className="space-y-1.5">
            <Label className={labelCls}>Hiring Date *</Label>
            <Input type="date" value={form.staff_hiring_date}
              onChange={(e) => set("staff_hiring_date", e.target.value)}
              className={cn(inputCls, "text-white [color-scheme:dark]")} />
          </div>

          {/* Status */}
          <div className="space-y-1.5 sm:col-span-2">
            <Label className={labelCls}>Status *</Label>
            <Select value={form.staff_status} onValueChange={(v) => set("staff_status", v as StaffStatus)}>
              <SelectTrigger className={cn(inputCls, "w-full sm:w-1/2")}>
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-[#0F1E35] border-[#1E293B]">
                {(["active", "inactive", "suspended"] as StaffStatus[]).map((s) => (
                  <SelectItem key={s} value={s} className="text-white hover:bg-[#1E293B] text-sm capitalize">{s}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <DialogFooter className="gap-2 pt-2">
          <Button variant="ghost" onClick={onClose}
            className="text-[#64748B] hover:text-white border border-[#1E293B] hover:bg-[#1E293B]">
            Cancel
          </Button>
          <Button onClick={() => onSave(form)}
            className="bg-[#2563EB] hover:bg-[#1D4ED8] text-white">
            {editing ? "Save Changes" : "Add Staff"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

// ─── Delete Confirm Modal ─────────────────────────────────────────────────────

function DeleteModal({
  open, onClose, onConfirm, name,
}: {
  open: boolean; onClose: () => void; onConfirm: () => void; name: string
}) {
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="bg-[#0F1E35] border border-[#1E293B] text-white max-w-sm">
        <DialogHeader>
          <DialogTitle className="text-white text-base">Delete Staff Member</DialogTitle>
        </DialogHeader>
        <p className="text-[#94A3B8] text-sm py-2">
          Are you sure you want to remove <span className="text-white font-semibold">{name}</span>?
          This action cannot be undone.
        </p>
        <DialogFooter className="gap-2">
          <Button variant="ghost" onClick={onClose}
            className="text-[#64748B] hover:text-white border border-[#1E293B] hover:bg-[#1E293B]">
            Cancel
          </Button>
          <Button onClick={onConfirm}
            className="bg-red-600 hover:bg-red-700 text-white">
            Delete
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

// ─── Staff Management Tab ─────────────────────────────────────────────────────

type SortKey = keyof Pick<StaffMember, "staff_id" | "staff_name" | "role" | "location" | "staff_status">

function StaffTab() {
  const [staff, setStaff] = useState<StaffMember[]>(MOCK_STAFF)
  const [search, setSearch] = useState("")
  const [modalOpen, setModalOpen] = useState(false)
  const [deleteOpen, setDeleteOpen] = useState(false)
  const [editing, setEditing] = useState<StaffMember | null>(null)
  const [deletingId, setDeletingId] = useState<number | null>(null)
  const [sortKey, setSortKey] = useState<SortKey>("staff_id")
  const [sortDir, setSortDir] = useState<SortDir>("asc")

  const filtered = useMemo(() => {
    const q = search.toLowerCase()
    let list = staff.filter((s) =>
      s.staff_name.toLowerCase().includes(q) ||
      s.username.toLowerCase().includes(q) ||
      s.role.toLowerCase().includes(q) ||
      s.location.toLowerCase().includes(q)
    )
    if (sortKey && sortDir) {
      list = [...list].sort((a, b) => {
        const av = String(a[sortKey]), bv = String(b[sortKey])
        return sortDir === "asc" ? av.localeCompare(bv) : bv.localeCompare(av)
      })
    }
    return list
  }, [staff, search, sortKey, sortDir])

  const handleSort = (key: SortKey) => {
    if (sortKey === key) setSortDir((d) => d === "asc" ? "desc" : "asc")
    else { setSortKey(key); setSortDir("asc") }
  }

  const handleSave = (data: StaffFormData) => {
    if (editing) {
      setStaff((prev) => prev.map((s) =>
        s.staff_id === editing.staff_id
          ? { ...s, ...data, staff_salary: Number(data.staff_salary) }
          : s
      ))
    } else {
      const newMember: StaffMember = {
        staff_id: Math.max(...staff.map((s) => s.staff_id)) + 1,
        staff_name: data.staff_name,
        username: data.username,
        password_hash: "••••••••",
        role: data.role,
        location: data.location,
        staff_contact: data.staff_contact,
        staff_email: data.staff_email,
        staff_cnic: data.staff_cnic,
        staff_bank_acno: data.staff_bank_acno,
        staff_salary: Number(data.staff_salary),
        staff_hiring_date: data.staff_hiring_date,
        staff_status: data.staff_status,
      }
      setStaff((prev) => [...prev, newMember])
    }
    setModalOpen(false)
    setEditing(null)
  }

  const handleDelete = () => {
    if (deletingId !== null) {
      setStaff((prev) => prev.filter((s) => s.staff_id !== deletingId))
    }
    setDeleteOpen(false)
    setDeletingId(null)
  }

  const SortHeader = ({ col, label }: { col: SortKey; label: string }) => (
    <TableHead
      className="text-[#64748B] text-xs font-medium cursor-pointer select-none hover:text-white transition-colors"
      onClick={() => handleSort(col)}
    >
      <span className="flex items-center gap-1">
        {label}
        <ArrowUpDown className={cn("w-3 h-3", sortKey === col ? "text-[#2563EB]" : "text-[#334155]")} />
      </span>
    </TableHead>
  )

  const deletingName = staff.find((s) => s.staff_id === deletingId)?.staff_name ?? ""

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div className="relative w-full sm:w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[#64748B]" />
          <Input
            placeholder="Search staff by name, role, location..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="bg-[#0F1E35] border-[#1E293B] text-white placeholder:text-[#334155] pl-9 h-9 text-sm focus:border-[#2563EB]"
          />
          {search && (
            <button onClick={() => setSearch("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-[#64748B] hover:text-white">
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
        <Button
          onClick={() => { setEditing(null); setModalOpen(true) }}
          className="bg-[#2563EB] hover:bg-[#1D4ED8] text-white h-9 text-sm gap-1.5 flex-shrink-0"
        >
          <Plus className="w-4 h-4" /> Add New Staff
        </Button>
      </div>

      {/* Stats row */}
      <div className="flex items-center gap-4 text-xs text-[#64748B]">
        <span>Total: <span className="text-white font-medium">{staff.length}</span></span>
        <span>Active: <span className="text-emerald-400 font-medium">{staff.filter(s => s.staff_status === "active").length}</span></span>
        <span>Inactive: <span className="text-slate-400 font-medium">{staff.filter(s => s.staff_status === "inactive").length}</span></span>
        <span>Suspended: <span className="text-red-400 font-medium">{staff.filter(s => s.staff_status === "suspended").length}</span></span>
        {search && <span>Showing: <span className="text-[#2563EB] font-medium">{filtered.length}</span> results</span>}
      </div>

      {/* Table */}
      <div className="bg-[#0F1E35] border border-[#1E293B] rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="border-[#1E293B] hover:bg-transparent">
                <SortHeader col="staff_id" label="ID" />
                <SortHeader col="staff_name" label="Name" />
                <SortHeader col="role" label="Role" />
                <SortHeader col="location" label="Location" />
                <TableHead className="text-[#64748B] text-xs font-medium">Contact</TableHead>
                <SortHeader col="staff_status" label="Status" />
                <TableHead className="text-[#64748B] text-xs font-medium text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center text-[#64748B] text-sm py-10">
                    No staff members found.
                  </TableCell>
                </TableRow>
              ) : filtered.map((s) => (
                <TableRow
                  key={s.staff_id}
                  className="border-[#1E293B] hover:bg-[#0A1628] transition-colors group"
                >
                  <TableCell className="text-[#2563EB] text-xs font-mono">#{s.staff_id.toString().padStart(3, "0")}</TableCell>
                  <TableCell>
                    <div>
                      <p className="text-white text-xs font-medium">{s.staff_name}</p>
                      <p className="text-[#64748B] text-[10px]">@{s.username}</p>
                    </div>
                  </TableCell>
                  <TableCell>
                    <span className="text-[#94A3B8] text-xs bg-[#1E293B] px-2 py-0.5 rounded-md">
                      {s.role}
                    </span>
                  </TableCell>
                  <TableCell className="text-[#94A3B8] text-xs max-w-[140px] truncate">{s.location}</TableCell>
                  <TableCell className="text-[#94A3B8] text-xs">{s.staff_contact}</TableCell>
                  <TableCell><StatusBadge status={s.staff_status} /></TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-1 opacity-60 group-hover:opacity-100 transition-opacity">
                      <Button
                        variant="ghost" size="sm"
                        onClick={() => { setEditing(s); setModalOpen(true) }}
                        className="h-7 w-7 p-0 text-[#64748B] hover:text-[#2563EB] hover:bg-[#2563EB]/10"
                      >
                        <Pencil className="w-3.5 h-3.5" />
                      </Button>
                      <Button
                        variant="ghost" size="sm"
                        onClick={() => { setDeletingId(s.staff_id); setDeleteOpen(true) }}
                        className="h-7 w-7 p-0 text-[#64748B] hover:text-red-400 hover:bg-red-500/10"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* Modals */}
      <StaffModal
        open={modalOpen}
        onClose={() => { setModalOpen(false); setEditing(null) }}
        editing={editing}
        onSave={handleSave}
      />
      <DeleteModal
        open={deleteOpen}
        onClose={() => { setDeleteOpen(false); setDeletingId(null) }}
        onConfirm={handleDelete}
        name={deletingName}
      />
    </div>
  )
}

// ─── Placeholder Tab ──────────────────────────────────────────────────────────

function PlaceholderTab({ label }: { label: string }) {
  return (
    <div className="flex flex-col items-center justify-center h-64 text-center">
      <div className="w-12 h-12 rounded-xl bg-[#1E293B] flex items-center justify-center mb-3">
        <Package className="w-6 h-6 text-[#334155]" />
      </div>
      <p className="text-white font-medium text-sm">{label}</p>
      <p className="text-[#64748B] text-xs mt-1">This module will be built in the next iteration.</p>
    </div>
  )
}

// ─── Main Admin Page ──────────────────────────────────────────────────────────

export default function AdminPage() {
  const [activeTab, setActiveTab] = useState<AdminTab>("dashboard")
  const [collapsed, setCollapsed] = useState(false)

  const renderContent = () => {
    switch (activeTab) {
      case "dashboard": return <DashboardTab />
      case "staff": return <StaffTab />
      case "products": return <PlaceholderTab label="Products Management" />
      case "customers": return <PlaceholderTab label="Customer Management" />
      case "suppliers": return <PlaceholderTab label="Supplier Management" />
      case "locations": return <PlaceholderTab label="Locations Management" />
      case "roles": return <PlaceholderTab label="Roles Management" />
      case "settings": return <PlaceholderTab label="System Settings" />
    }
  }

  return (
    <div className="flex h-screen bg-[#0A1628] overflow-hidden">
      <Sidebar
        active={activeTab}
        onSelect={setActiveTab}
        collapsed={collapsed}
        onToggle={() => setCollapsed(!collapsed)}
      />

      <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
        <TopBar tab={activeTab} />

        <main className="flex-1 overflow-y-auto p-6">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.32, ease: [0.22, 1, 0.36, 1] }}
          >
            {renderContent()}
          </motion.div>
        </main>
      </div>
    </div>
  )
}
