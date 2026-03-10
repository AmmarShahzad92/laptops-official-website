"use client"

import { useSearchParams } from "next/navigation"
import { Suspense } from "react"
import Link from "next/link"
import { CheckCircle2, Package, ArrowRight, Home } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"

function ConfirmationContent() {
  const params = useSearchParams()
  const orderId = params.get("orderId") ?? "ORD-XXXXXX"

  return (
    <div className="min-h-screen bg-[#0A1628] flex items-center justify-center px-4 py-16">
      <div className="max-w-md w-full text-center space-y-6">

        {/* Success icon with pulse ring */}
        <div className="relative inline-flex items-center justify-center">
          <span className="absolute w-24 h-24 rounded-full bg-[#2563EB]/20 animate-ping" />
          <div className="relative w-20 h-20 rounded-full bg-[#2563EB]/10 border-2 border-[#2563EB] flex items-center justify-center">
            <CheckCircle2 className="w-10 h-10 text-[#2563EB]" />
          </div>
        </div>

        {/* Text */}
        <div className="space-y-2">
          <h1 className="text-white text-2xl font-bold">Order Placed!</h1>
          <p className="text-[#64748B] text-sm">
            Thank you for shopping with Laptops Official.
            <br />Your order has been received and is being processed.
          </p>
        </div>

        {/* Order ID card */}
        <div className="bg-[#0F1E35] border border-[#1E293B] rounded-xl p-5 text-left space-y-3">
          <div className="flex items-center gap-2 text-[#2563EB]">
            <Package className="w-4 h-4" />
            <span className="text-sm font-medium">Order Reference</span>
          </div>
          <p className="text-white text-2xl font-mono font-bold tracking-wider">
            {orderId}
          </p>
          <Separator className="bg-[#1E293B]" />
          <p className="text-[#64748B] text-xs">
            A confirmation email will be sent to your registered email address. Keep this order ID for tracking and support.
          </p>
        </div>

        {/* What happens next */}
        <div className="bg-[#0F1E35] border border-[#1E293B] rounded-xl p-5 text-left space-y-3">
          <p className="text-white text-sm font-medium">What happens next?</p>
          <div className="space-y-2 text-xs text-[#64748B]">
            {[
              "We verify your order and payment",
              "Our team prepares and packages your items",
              "Your order is dispatched for delivery",
              "You receive your laptops at your doorstep",
            ].map((step, i) => (
              <div key={i} className="flex items-start gap-2">
                <span className="w-5 h-5 rounded-full bg-[#2563EB]/20 text-[#2563EB] flex items-center justify-center flex-shrink-0 text-xs font-bold">
                  {i + 1}
                </span>
                <span className="mt-0.5">{step}</span>
              </div>
            ))}
          </div>
        </div>

        {/* CTAs */}
        <div className="flex flex-col sm:flex-row gap-3">
          <Link href="/account" className="flex-1">
            <Button
              className="w-full bg-[#2563EB] hover:bg-[#1D4ED8] text-white rounded-xl gap-1"
            >
              Track Order <ArrowRight className="w-4 h-4" />
            </Button>
          </Link>
          <Link href="/" className="flex-1">
            <Button
              variant="outline"
              className="w-full border-[#1E293B] text-[#94A3B8] hover:bg-[#1E293B] hover:text-white rounded-xl gap-1"
            >
              <Home className="w-4 h-4" /> Back to Home
            </Button>
          </Link>
        </div>

        <p className="text-[#334155] text-xs">
          Need help? Contact us at{" "}
          <a href="mailto:support@laptopsofficial.pk" className="text-[#2563EB] hover:underline">
            support@laptopsofficial.pk
          </a>
        </p>
      </div>
    </div>
  )
}

export default function OrderConfirmationPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[#0A1628] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-[#2563EB]/30 border-t-[#2563EB] rounded-full animate-spin" />
      </div>
    }>
      <ConfirmationContent />
    </Suspense>
  )
}
