"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import { CheckCircle2, ChevronRight, ChevronLeft, MapPin, CreditCard, ClipboardList, Truck, Store } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

// ─── Types ───────────────────────────────────────────────────────────────────

interface DeliveryInfo {
  fullName: string
  phone: string
  email: string
  address: string
  city: string
  postalCode: string
  deliveryMethod: "home_delivery" | "pickup"
}

interface PaymentInfo {
  method: "jazzcash" | "easypaisa" | "card" | "cod"
  cardNumber?: string
  cardExpiry?: string
  cardCvv?: string
}

interface CartItem {
  id: string
  name: string
  specs: string
  price: number
  qty: number
  image?: string
}

// ─── Mock Cart Data (replace with real cart state/context later) ─────────────

const MOCK_CART: CartItem[] = [
  { id: "PROD101", name: "Dell Latitude i5", specs: "i5 · 8GB · 256GB SSD · 14\"", price: 110000, qty: 1 },
  { id: "PROD104", name: "MacBook M1", specs: "M1 · 8GB · 256GB SSD · 13.3\"", price: 170000, qty: 1 },
]

const CITIES = [
  "Karachi", "Lahore", "Islamabad", "Rawalpindi",
  "Faisalabad", "Multan", "Peshawar", "Hyderabad",
]

// ─── Step Indicator ───────────────────────────────────────────────────────────

const STEPS = [
  { id: 1, label: "Delivery", icon: MapPin },
  { id: 2, label: "Payment", icon: CreditCard },
  { id: 3, label: "Review", icon: ClipboardList },
]

function StepIndicator({ currentStep }: { currentStep: number }) {
  return (
    <div className="flex items-center justify-center gap-0 mb-10">
      {STEPS.map((step, idx) => {
        const Icon = step.icon
        const isCompleted = currentStep > step.id
        const isActive = currentStep === step.id

        return (
          <div key={step.id} className="flex items-center">
            {/* Step circle */}
            <div className="flex flex-col items-center gap-1.5">
              <div
                className={cn(
                  "w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all duration-300",
                  isCompleted && "bg-[#2563EB] border-[#2563EB] text-white",
                  isActive && "bg-[#0A1628] border-[#2563EB] text-[#2563EB]",
                  !isCompleted && !isActive && "bg-transparent border-[#334155] text-[#64748B]"
                )}
              >
                {isCompleted
                  ? <CheckCircle2 className="w-5 h-5" />
                  : <Icon className="w-4 h-4" />
                }
              </div>
              <span
                className={cn(
                  "text-xs font-medium",
                  isActive ? "text-[#2563EB]" : isCompleted ? "text-white" : "text-[#64748B]"
                )}
              >
                {step.label}
              </span>
            </div>

            {/* Connector line */}
            {idx < STEPS.length - 1 && (
              <div
                className={cn(
                  "h-[2px] w-20 mx-2 mb-5 transition-all duration-500",
                  currentStep > step.id ? "bg-[#2563EB]" : "bg-[#1E293B]"
                )}
              />
            )}
          </div>
        )
      })}
    </div>
  )
}

// ─── Order Summary Sidebar ────────────────────────────────────────────────────

function OrderSummary({ cart }: { cart: CartItem[] }) {
  const subtotal = cart.reduce((sum, item) => sum + item.price * item.qty, 0)
  const shipping = subtotal >= 50000 ? 0 : 500
  const total = subtotal + shipping

  return (
    <div className="bg-[#0F1E35] border border-[#1E293B] rounded-2xl p-6 sticky top-6">
      <h3 className="text-white font-semibold text-base mb-4">Order Summary</h3>

      <div className="space-y-3 mb-4">
        {cart.map((item) => (
          <div key={item.id} className="flex items-start gap-3">
            {/* Image placeholder */}
            <div className="w-12 h-12 rounded-lg bg-[#1E293B] flex items-center justify-center flex-shrink-0">
              <span className="text-[#2563EB] text-xs font-bold">
                {item.name.slice(0, 2).toUpperCase()}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-white text-sm font-medium truncate">{item.name}</p>
              <p className="text-[#64748B] text-xs truncate">{item.specs}</p>
              <p className="text-[#64748B] text-xs">Qty: {item.qty}</p>
            </div>
            <p className="text-white text-sm font-semibold flex-shrink-0">
              PKR {(item.price * item.qty).toLocaleString()}
            </p>
          </div>
        ))}
      </div>

      <Separator className="bg-[#1E293B] my-4" />

      <div className="space-y-2 text-sm">
        <div className="flex justify-between text-[#94A3B8]">
          <span>Subtotal</span>
          <span>PKR {subtotal.toLocaleString()}</span>
        </div>
        <div className="flex justify-between text-[#94A3B8]">
          <span>Shipping</span>
          <span className={shipping === 0 ? "text-green-400" : ""}>
            {shipping === 0 ? "FREE" : `PKR ${shipping.toLocaleString()}`}
          </span>
        </div>
      </div>

      {shipping !== 0 && (
        <p className="text-xs text-[#64748B] mt-2">
          Free shipping on orders above PKR 50,000
        </p>
      )}

      <Separator className="bg-[#1E293B] my-4" />

      <div className="flex justify-between text-white font-bold text-base">
        <span>Total</span>
        <span className="text-[#2563EB]">PKR {total.toLocaleString()}</span>
      </div>
    </div>
  )
}

// ─── Step 1: Delivery Info ────────────────────────────────────────────────────

function StepDelivery({
  data,
  onChange,
}: {
  data: DeliveryInfo
  onChange: (d: DeliveryInfo) => void
}) {
  const set = (key: keyof DeliveryInfo, val: string) =>
    onChange({ ...data, [key]: val })

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-white text-xl font-semibold mb-1">Delivery Information</h2>
        <p className="text-[#64748B] text-sm">Where should we send your order?</p>
      </div>

      {/* Personal Info */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <Label className="text-[#94A3B8] text-sm">Full Name *</Label>
          <Input
            placeholder="e.g. Ammar Shahzad"
            value={data.fullName}
            onChange={(e) => set("fullName", e.target.value)}
            className="bg-[#0F1E35] border-[#1E293B] text-white placeholder:text-[#334155] focus:border-[#2563EB] focus:ring-[#2563EB]"
          />
        </div>
        <div className="space-y-1.5">
          <Label className="text-[#94A3B8] text-sm">Phone Number *</Label>
          <Input
            placeholder="0300-0000000"
            value={data.phone}
            onChange={(e) => set("phone", e.target.value)}
            className="bg-[#0F1E35] border-[#1E293B] text-white placeholder:text-[#334155] focus:border-[#2563EB]"
          />
        </div>
      </div>

      <div className="space-y-1.5">
        <Label className="text-[#94A3B8] text-sm">Email Address *</Label>
        <Input
          type="email"
          placeholder="you@example.com"
          value={data.email}
          onChange={(e) => set("email", e.target.value)}
          className="bg-[#0F1E35] border-[#1E293B] text-white placeholder:text-[#334155] focus:border-[#2563EB]"
        />
      </div>

      <div className="space-y-1.5">
        <Label className="text-[#94A3B8] text-sm">Street Address *</Label>
        <Input
          placeholder="House No., Street, Area"
          value={data.address}
          onChange={(e) => set("address", e.target.value)}
          className="bg-[#0F1E35] border-[#1E293B] text-white placeholder:text-[#334155] focus:border-[#2563EB]"
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <Label className="text-[#94A3B8] text-sm">City *</Label>
          <Select value={data.city} onValueChange={(val) => set("city", val)}>
            <SelectTrigger className="bg-[#0F1E35] border-[#1E293B] text-white focus:border-[#2563EB]">
              <SelectValue placeholder="Select city" />
            </SelectTrigger>
            <SelectContent className="bg-[#0F1E35] border-[#1E293B]">
              {CITIES.map((city) => (
                <SelectItem key={city} value={city} className="text-white hover:bg-[#1E293B]">
                  {city}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-1.5">
          <Label className="text-[#94A3B8] text-sm">Postal Code</Label>
          <Input
            placeholder="75500"
            value={data.postalCode}
            onChange={(e) => set("postalCode", e.target.value)}
            className="bg-[#0F1E35] border-[#1E293B] text-white placeholder:text-[#334155] focus:border-[#2563EB]"
          />
        </div>
      </div>

      {/* Delivery Method Toggle */}
      <div className="space-y-3">
        <Label className="text-[#94A3B8] text-sm">Delivery Method *</Label>
        <RadioGroup
          value={data.deliveryMethod}
          onValueChange={(val) => set("deliveryMethod", val as DeliveryInfo["deliveryMethod"])}
          className="grid grid-cols-1 sm:grid-cols-2 gap-3"
        >
          {[
            {
              value: "home_delivery",
              label: "Home Delivery",
              desc: "Delivered to your address (1–3 business days)",
              icon: Truck,
            },
            {
              value: "pickup",
              label: "Pickup from Store",
              desc: "Collect from your nearest Laptops Official store",
              icon: Store,
            },
          ].map(({ value, label, desc, icon: Icon }) => (
            <label
              key={value}
              htmlFor={value}
              className={cn(
                "flex items-start gap-3 p-4 rounded-xl border-2 cursor-pointer transition-all",
                data.deliveryMethod === value
                  ? "border-[#2563EB] bg-[#2563EB]/10"
                  : "border-[#1E293B] bg-[#0F1E35] hover:border-[#334155]"
              )}
            >
              <RadioGroupItem value={value} id={value} className="mt-0.5 border-[#334155] text-[#2563EB]" />
              <Icon className={cn("w-5 h-5 mt-0.5", data.deliveryMethod === value ? "text-[#2563EB]" : "text-[#64748B]")} />
              <div>
                <p className="text-white text-sm font-medium">{label}</p>
                <p className="text-[#64748B] text-xs mt-0.5">{desc}</p>
              </div>
            </label>
          ))}
        </RadioGroup>
      </div>
    </div>
  )
}

// ─── Step 2: Payment Method ───────────────────────────────────────────────────

const PAYMENT_OPTIONS = [
  {
    value: "jazzcash",
    label: "JazzCash",
    desc: "Pay via JazzCash mobile wallet",
    color: "border-orange-500 bg-orange-500/10",
    activeColor: "border-orange-500",
    icon: "🟠",
    badge: "orange",
  },
  {
    value: "easypaisa",
    label: "EasyPaisa",
    desc: "Pay via EasyPaisa mobile wallet",
    color: "border-green-500 bg-green-500/10",
    activeColor: "border-green-500",
    icon: "🟢",
    badge: "green",
  },
  {
    value: "card",
    label: "Debit / Credit Card",
    desc: "Visa, Mastercard, UnionPay",
    color: "border-[#2563EB] bg-[#2563EB]/10",
    activeColor: "border-[#2563EB]",
    icon: "💳",
    badge: "blue",
  },
  {
    value: "cod",
    label: "Cash on Delivery",
    desc: "Pay cash when your order arrives",
    color: "border-[#475569] bg-[#475569]/10",
    activeColor: "border-[#475569]",
    icon: "💵",
    badge: "gray",
  },
]

function StepPayment({
  data,
  onChange,
}: {
  data: PaymentInfo
  onChange: (d: PaymentInfo) => void
}) {
  const set = (key: keyof PaymentInfo, val: string) =>
    onChange({ ...data, [key]: val })

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-white text-xl font-semibold mb-1">Payment Method</h2>
        <p className="text-[#64748B] text-sm">Choose how you'd like to pay</p>
      </div>

      <RadioGroup
        value={data.method}
        onValueChange={(val) => onChange({ method: val as PaymentInfo["method"] })}
        className="space-y-3"
      >
        {PAYMENT_OPTIONS.map((opt) => (
          <label
            key={opt.value}
            htmlFor={`pay-${opt.value}`}
            className={cn(
              "flex items-center gap-4 p-4 rounded-xl border-2 cursor-pointer transition-all",
              data.method === opt.value
                ? opt.color
                : "border-[#1E293B] bg-[#0F1E35] hover:border-[#334155]"
            )}
          >
            <RadioGroupItem
              value={opt.value}
              id={`pay-${opt.value}`}
              className="border-[#334155]"
            />
            <span className="text-xl">{opt.icon}</span>
            <div className="flex-1">
              <p className="text-white text-sm font-semibold">{opt.label}</p>
              <p className="text-[#64748B] text-xs">{opt.desc}</p>
            </div>
          </label>
        ))}
      </RadioGroup>

      {/* Card fields — only show when card is selected */}
      {data.method === "card" && (
        <div className="bg-[#0F1E35] border border-[#1E293B] rounded-xl p-5 space-y-4 mt-2">
          <p className="text-white text-sm font-medium">Card Details</p>
          <div className="space-y-1.5">
            <Label className="text-[#94A3B8] text-xs">Card Number</Label>
            <Input
              placeholder="1234 5678 9012 3456"
              maxLength={19}
              value={data.cardNumber || ""}
              onChange={(e) => {
                // Auto-format with spaces
                const raw = e.target.value.replace(/\D/g, "").slice(0, 16)
                const formatted = raw.replace(/(.{4})/g, "$1 ").trim()
                set("cardNumber", formatted)
              }}
              className="bg-[#0A1628] border-[#1E293B] text-white placeholder:text-[#334155] focus:border-[#2563EB] font-mono"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label className="text-[#94A3B8] text-xs">Expiry Date</Label>
              <Input
                placeholder="MM / YY"
                maxLength={7}
                value={data.cardExpiry || ""}
                onChange={(e) => {
                  const raw = e.target.value.replace(/\D/g, "").slice(0, 4)
                  const formatted = raw.length > 2 ? `${raw.slice(0, 2)} / ${raw.slice(2)}` : raw
                  set("cardExpiry", formatted)
                }}
                className="bg-[#0A1628] border-[#1E293B] text-white placeholder:text-[#334155] focus:border-[#2563EB] font-mono"
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-[#94A3B8] text-xs">CVV</Label>
              <Input
                placeholder="•••"
                maxLength={3}
                type="password"
                value={data.cardCvv || ""}
                onChange={(e) => set("cardCvv", e.target.value.replace(/\D/g, "").slice(0, 3))}
                className="bg-[#0A1628] border-[#1E293B] text-white placeholder:text-[#334155] focus:border-[#2563EB] font-mono"
              />
            </div>
          </div>
          <p className="text-[#64748B] text-xs flex items-center gap-1">
            🔒 Your card details are encrypted and secure
          </p>
        </div>
      )}

      {(data.method === "jazzcash" || data.method === "easypaisa") && (
        <div className="bg-[#0F1E35] border border-[#1E293B] rounded-xl p-4">
          <p className="text-[#94A3B8] text-sm">
            📲 After placing your order, you'll receive a payment request on your registered mobile number. Complete the payment within 15 minutes to confirm your order.
          </p>
        </div>
      )}

      {data.method === "cod" && (
        <div className="bg-[#0F1E35] border border-[#1E293B] rounded-xl p-4">
          <p className="text-[#94A3B8] text-sm">
            💵 Please keep the exact cash amount ready at the time of delivery. Our rider will collect payment upon handover.
          </p>
        </div>
      )}
    </div>
  )
}

// ─── Step 3: Review & Confirm ─────────────────────────────────────────────────

function StepReview({
  delivery,
  payment,
  cart,
  onPlaceOrder,
  loading,
}: {
  delivery: DeliveryInfo
  payment: PaymentInfo
  cart: CartItem[]
  onPlaceOrder: () => void
  loading: boolean
}) {
  const subtotal = cart.reduce((sum, item) => sum + item.price * item.qty, 0)
  const shipping = subtotal >= 50000 ? 0 : 500
  const total = subtotal + shipping

  const paymentLabel = PAYMENT_OPTIONS.find((p) => p.value === payment.method)?.label ?? ""

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-white text-xl font-semibold mb-1">Review Your Order</h2>
        <p className="text-[#64748B] text-sm">Double-check everything before placing your order</p>
      </div>

      {/* Delivery Summary */}
      <div className="bg-[#0F1E35] border border-[#1E293B] rounded-xl p-5 space-y-2">
        <div className="flex items-center justify-between mb-3">
          <p className="text-white font-medium text-sm flex items-center gap-2">
            <MapPin className="w-4 h-4 text-[#2563EB]" /> Delivery Details
          </p>
          <Badge variant="outline" className="border-[#2563EB] text-[#2563EB] text-xs">
            {delivery.deliveryMethod === "home_delivery" ? "Home Delivery" : "Store Pickup"}
          </Badge>
        </div>
        <div className="text-[#94A3B8] text-sm space-y-1">
          <p><span className="text-[#64748B]">Name:</span> {delivery.fullName}</p>
          <p><span className="text-[#64748B]">Phone:</span> {delivery.phone}</p>
          <p><span className="text-[#64748B]">Email:</span> {delivery.email}</p>
          {delivery.deliveryMethod === "home_delivery" && (
            <p><span className="text-[#64748B]">Address:</span> {delivery.address}, {delivery.city} {delivery.postalCode}</p>
          )}
        </div>
      </div>

      {/* Payment Summary */}
      <div className="bg-[#0F1E35] border border-[#1E293B] rounded-xl p-5">
        <p className="text-white font-medium text-sm flex items-center gap-2 mb-3">
          <CreditCard className="w-4 h-4 text-[#2563EB]" /> Payment Method
        </p>
        <p className="text-[#94A3B8] text-sm">{paymentLabel}</p>
        {payment.method === "card" && payment.cardNumber && (
          <p className="text-[#64748B] text-xs mt-1">
            Card ending in {payment.cardNumber.replace(/\s/g, "").slice(-4)}
          </p>
        )}
      </div>

      {/* Itemized Order */}
      <div className="bg-[#0F1E35] border border-[#1E293B] rounded-xl p-5">
        <p className="text-white font-medium text-sm mb-4">Order Items</p>
        <div className="space-y-3">
          {cart.map((item) => (
            <div key={item.id} className="flex items-center justify-between">
              <div>
                <p className="text-white text-sm">{item.name}</p>
                <p className="text-[#64748B] text-xs">{item.specs} · Qty: {item.qty}</p>
              </div>
              <p className="text-white text-sm font-semibold">
                PKR {(item.price * item.qty).toLocaleString()}
              </p>
            </div>
          ))}
        </div>

        <Separator className="bg-[#1E293B] my-4" />

        <div className="space-y-2 text-sm">
          <div className="flex justify-between text-[#94A3B8]">
            <span>Subtotal</span>
            <span>PKR {subtotal.toLocaleString()}</span>
          </div>
          <div className="flex justify-between text-[#94A3B8]">
            <span>Shipping</span>
            <span className={shipping === 0 ? "text-green-400" : ""}>
              {shipping === 0 ? "FREE" : `PKR ${shipping.toLocaleString()}`}
            </span>
          </div>
          <Separator className="bg-[#1E293B] my-2" />
          <div className="flex justify-between text-white font-bold text-base">
            <span>Total</span>
            <span className="text-[#2563EB]">PKR {total.toLocaleString()}</span>
          </div>
        </div>
      </div>

      {/* Place Order */}
      <Button
        onClick={onPlaceOrder}
        disabled={loading}
        className="w-full h-12 bg-[#2563EB] hover:bg-[#1D4ED8] text-white font-semibold text-base rounded-xl transition-all disabled:opacity-60"
      >
        {loading ? (
          <span className="flex items-center gap-2">
            <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            Placing Order...
          </span>
        ) : (
          "Place Order"
        )}
      </Button>

      <p className="text-center text-[#64748B] text-xs">
        🔒 Secure checkout · By placing this order, you agree to our Terms & Conditions
      </p>
    </div>
  )
}

// ─── Main Checkout Page ───────────────────────────────────────────────────────

export default function CheckoutPage() {
  const router = useRouter()
  const [currentStep, setCurrentStep] = useState(1)
  const [loading, setLoading] = useState(false)

  const [delivery, setDelivery] = useState<DeliveryInfo>({
    fullName: "",
    phone: "",
    email: "",
    address: "",
    city: "",
    postalCode: "",
    deliveryMethod: "home_delivery",
  })

  const [payment, setPayment] = useState<PaymentInfo>({
    method: "cod",
  })

  const cart = MOCK_CART

  // ── Validation ──

  const validateStep1 = () => {
    const { fullName, phone, email, address, city, deliveryMethod } = delivery
    if (!fullName.trim()) return alert("Please enter your full name."), false
    if (!phone.trim()) return alert("Please enter your phone number."), false
    if (!email.trim()) return alert("Please enter your email."), false
    if (deliveryMethod === "home_delivery" && !address.trim()) return alert("Please enter your address."), false
    if (!city) return alert("Please select your city."), false
    return true
  }

  const validateStep2 = () => {
    if (payment.method === "card") {
      if (!payment.cardNumber || payment.cardNumber.replace(/\s/g, "").length < 16)
        return alert("Please enter a valid card number."), false
      if (!payment.cardExpiry)
        return alert("Please enter the card expiry date."), false
      if (!payment.cardCvv || payment.cardCvv.length < 3)
        return alert("Please enter the CVV."), false
    }
    return true
  }

  const handleNext = () => {
    if (currentStep === 1 && !validateStep1()) return
    if (currentStep === 2 && !validateStep2()) return
    setCurrentStep((s) => Math.min(s + 1, 3))
  }

  const handleBack = () => setCurrentStep((s) => Math.max(s - 1, 1))

  const handlePlaceOrder = async () => {
    setLoading(true)
    // Simulate API call — replace with real Supabase insert later
    await new Promise((res) => setTimeout(res, 1800))
    const mockOrderId = `ORD-${Date.now().toString().slice(-6)}`
    router.push(`/order-confirmation?orderId=${mockOrderId}`)
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className="min-h-screen bg-[#0A1628] py-10 px-4"
    >
      <div className="max-w-5xl mx-auto">

        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-white text-2xl font-bold tracking-tight">Checkout</h1>
          <p className="text-[#64748B] text-sm mt-1">Know It. Test It. Own It.</p>
        </div>

        <StepIndicator currentStep={currentStep} />

        {/* Content: form + sidebar */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

          {/* Form area (2/3 width) */}
          <div className="lg:col-span-2 bg-[#0F1E35] border border-[#1E293B] rounded-2xl p-6 md:p-8">

            <AnimatePresence mode="wait">
              <motion.div
                key={currentStep}
                initial={{ opacity: 0, x: 24 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
              >
                {currentStep === 1 && (
                  <StepDelivery data={delivery} onChange={setDelivery} />
                )}
                {currentStep === 2 && (
                  <StepPayment data={payment} onChange={setPayment} />
                )}
                {currentStep === 3 && (
                  <StepReview
                    delivery={delivery}
                    payment={payment}
                    cart={cart}
                    onPlaceOrder={handlePlaceOrder}
                    loading={loading}
                  />
                )}
              </motion.div>
            </AnimatePresence>

            {/* Navigation buttons (not shown on step 3 since Place Order is inline) */}
            {currentStep < 3 && (
              <div className="flex items-center justify-between mt-8 pt-6 border-t border-[#1E293B]">
                <Button
                  variant="ghost"
                  onClick={handleBack}
                  disabled={currentStep === 1}
                  className="text-[#64748B] hover:text-white hover:bg-[#1E293B] disabled:opacity-30 gap-1"
                >
                  <ChevronLeft className="w-4 h-4" /> Back
                </Button>
                <Button
                  onClick={handleNext}
                  className="bg-[#2563EB] hover:bg-[#1D4ED8] text-white px-8 h-10 rounded-xl gap-1"
                >
                  Continue <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
            )}

            {currentStep === 3 && (
              <div className="mt-6 pt-6 border-t border-[#1E293B]">
                <Button
                  variant="ghost"
                  onClick={handleBack}
                  className="text-[#64748B] hover:text-white hover:bg-[#1E293B] gap-1"
                >
                  <ChevronLeft className="w-4 h-4" /> Back to Payment
                </Button>
              </div>
            )}
          </div>

          {/* Sidebar (1/3 width) */}
          <div className="lg:col-span-1">
            <OrderSummary cart={cart} />
          </div>
        </div>
      </div>
    </div>
  )
}
