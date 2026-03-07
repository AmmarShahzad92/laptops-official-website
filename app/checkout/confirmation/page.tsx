"use client";

import { useSearchParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { CheckCircle2, Package, Truck, Home, ArrowRight, Copy, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { useState, Suspense } from "react";

// Sample order data
const orderItems = [
  {
    id: "1",
    name: "Dell Latitude 5540 Business Laptop",
    brand: "Dell",
    image: "/images/products/laptop-1.jpg",
    specs: { processor: "Intel Core i7", ram: "16GB", storage: "512GB SSD" },
    price: 245000,
    quantity: 1,
  },
  {
    id: "2",
    name: "HP EliteBook 840 G10",
    brand: "HP",
    image: "/images/products/laptop-2.jpg",
    specs: { processor: "Intel Core i5", ram: "16GB", storage: "256GB SSD" },
    price: 198000,
    quantity: 2,
  },
];

const formatPrice = (price: number) => {
  return new Intl.NumberFormat("en-PK", {
    style: "currency",
    currency: "PKR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(price);
};

function ConfirmationContent() {
  const searchParams = useSearchParams();
  const orderId = searchParams.get("orderId") || "LO-XXXXXXXX";
  const [copied, setCopied] = useState(false);

  const subtotal = orderItems.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );
  const shippingFee = subtotal >= 50000 ? 0 : 2500;
  const grandTotal = subtotal + shippingFee;

  const copyOrderId = async () => {
    await navigator.clipboard.writeText(orderId);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="container mx-auto max-w-3xl px-4 py-12">
      {/* Success Animation */}
      <div className="mb-8 flex flex-col items-center text-center">
        <div className="relative mb-6">
          <div className="flex h-24 w-24 items-center justify-center rounded-full bg-green-100">
            <CheckCircle2 className="h-14 w-14 text-green-600" />
          </div>
          <div className="absolute -right-1 -top-1 flex h-8 w-8 items-center justify-center rounded-full bg-electric-blue text-white">
            <Check className="h-4 w-4" />
          </div>
        </div>

        <h1 className="mb-2 text-3xl font-bold text-foreground">
          Order Confirmed!
        </h1>
        <p className="max-w-md text-muted-foreground">
          Thank you for your purchase. Your order has been received and is being
          processed.
        </p>
      </div>

      {/* Order ID */}
      <Card className="mb-6">
        <CardContent className="flex flex-col items-center justify-between gap-4 p-6 sm:flex-row">
          <div className="text-center sm:text-left">
            <p className="text-sm text-muted-foreground">Order ID</p>
            <p className="text-2xl font-bold text-electric-blue">{orderId}</p>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={copyOrderId}
            className="gap-2"
          >
            {copied ? (
              <>
                <Check className="h-4 w-4 text-green-600" />
                Copied!
              </>
            ) : (
              <>
                <Copy className="h-4 w-4" />
                Copy Order ID
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Order Timeline */}
      <Card className="mb-6">
        <CardHeader className="border-b px-6 py-4">
          <CardTitle className="text-lg">Order Status</CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            {/* Step 1 - Confirmed */}
            <div className="flex flex-col items-center">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-green-600 text-white">
                <Check className="h-5 w-5" />
              </div>
              <span className="mt-2 text-xs font-medium text-foreground">
                Confirmed
              </span>
            </div>

            {/* Line */}
            <div className="mx-2 h-1 flex-1 rounded-full bg-muted" />

            {/* Step 2 - Processing */}
            <div className="flex flex-col items-center">
              <div className="flex h-10 w-10 items-center justify-center rounded-full border-2 border-muted-foreground/30 text-muted-foreground">
                <Package className="h-5 w-5" />
              </div>
              <span className="mt-2 text-xs font-medium text-muted-foreground">
                Processing
              </span>
            </div>

            {/* Line */}
            <div className="mx-2 h-1 flex-1 rounded-full bg-muted" />

            {/* Step 3 - Shipped */}
            <div className="flex flex-col items-center">
              <div className="flex h-10 w-10 items-center justify-center rounded-full border-2 border-muted-foreground/30 text-muted-foreground">
                <Truck className="h-5 w-5" />
              </div>
              <span className="mt-2 text-xs font-medium text-muted-foreground">
                Shipped
              </span>
            </div>

            {/* Line */}
            <div className="mx-2 h-1 flex-1 rounded-full bg-muted" />

            {/* Step 4 - Delivered */}
            <div className="flex flex-col items-center">
              <div className="flex h-10 w-10 items-center justify-center rounded-full border-2 border-muted-foreground/30 text-muted-foreground">
                <Home className="h-5 w-5" />
              </div>
              <span className="mt-2 text-xs font-medium text-muted-foreground">
                Delivered
              </span>
            </div>
          </div>

          <p className="mt-6 text-center text-sm text-muted-foreground">
            Estimated delivery: <span className="font-medium text-foreground">3-5 business days</span>
          </p>
        </CardContent>
      </Card>

      {/* Order Details */}
      <Card className="mb-6">
        <CardHeader className="border-b px-6 py-4">
          <CardTitle className="text-lg">Order Details</CardTitle>
        </CardHeader>
        <CardContent className="divide-y px-6 py-0">
          {orderItems.map((item) => (
            <div key={item.id} className="flex gap-4 py-4">
              <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-lg bg-muted">
                <Image
                  src={item.image}
                  alt={item.name}
                  fill
                  className="object-cover"
                  sizes="80px"
                />
              </div>
              <div className="flex-1">
                <p className="font-medium">{item.name}</p>
                <div className="mt-1 flex flex-wrap gap-1">
                  <span className="rounded bg-muted px-2 py-0.5 text-xs text-muted-foreground">
                    {item.specs.processor}
                  </span>
                  <span className="rounded bg-muted px-2 py-0.5 text-xs text-muted-foreground">
                    {item.specs.ram}
                  </span>
                  <span className="rounded bg-muted px-2 py-0.5 text-xs text-muted-foreground">
                    {item.specs.storage}
                  </span>
                </div>
                <div className="mt-2 flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">
                    Qty: {item.quantity}
                  </span>
                  <span className="font-semibold text-electric-blue">
                    {formatPrice(item.price * item.quantity)}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Order Summary */}
      <Card className="mb-8">
        <CardHeader className="border-b px-6 py-4">
          <CardTitle className="text-lg">Payment Summary</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 px-6 pt-6">
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">Subtotal</span>
            <span className="font-medium">{formatPrice(subtotal)}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">Shipping</span>
            <span className="font-medium">
              {shippingFee === 0 ? (
                <span className="text-green-600">Free</span>
              ) : (
                formatPrice(shippingFee)
              )}
            </span>
          </div>
          <Separator />
          <div className="flex items-center justify-between">
            <span className="text-lg font-semibold">Total Paid</span>
            <span className="text-2xl font-bold text-electric-blue">
              {formatPrice(grandTotal)}
            </span>
          </div>
        </CardContent>
      </Card>

      {/* Action Buttons */}
      <div className="flex flex-col gap-4 sm:flex-row">
        <Button asChild variant="outline" className="flex-1">
          <Link href="/explore">
            Continue Shopping
          </Link>
        </Button>
        <Button
          asChild
          className="flex-1 gap-2 bg-electric-blue text-white hover:bg-electric-blue/90"
        >
          <Link href="/">
            Back to Home
            <ArrowRight className="h-4 w-4" />
          </Link>
        </Button>
      </div>

      {/* Support Note */}
      <p className="mt-8 text-center text-sm text-muted-foreground">
        A confirmation email has been sent to your email address.
        <br />
        For any queries, contact us at{" "}
        <a
          href="mailto:support@laptopsofficial.pk"
          className="font-medium text-electric-blue hover:underline"
        >
          support@laptopsofficial.pk
        </a>
      </p>
    </div>
  );
}

export default function ConfirmationPage() {
  return (
    <Suspense fallback={
      <div className="container mx-auto max-w-3xl px-4 py-12">
        <div className="flex flex-col items-center justify-center">
          <div className="h-24 w-24 animate-pulse rounded-full bg-muted" />
          <div className="mt-6 h-8 w-48 animate-pulse rounded bg-muted" />
          <div className="mt-2 h-4 w-64 animate-pulse rounded bg-muted" />
        </div>
      </div>
    }>
      <ConfirmationContent />
    </Suspense>
  );
}
