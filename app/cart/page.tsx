"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Minus, Plus, Trash2, ShoppingBag, ArrowLeft, CreditCard, Truck, Tag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

interface CartItem {
  id: string;
  name: string;
  brand: string;
  image: string;
  specs: {
    processor: string;
    ram: string;
    storage: string;
  };
  price: number;
  quantity: number;
}

// Sample cart data
const initialCartItems: CartItem[] = [
  {
    id: "1",
    name: "Dell Latitude 5540 Business Laptop",
    brand: "Dell",
    image: "/images/products/laptop-1.jpg",
    specs: {
      processor: "Intel Core i7-1365U",
      ram: "16GB DDR5",
      storage: "512GB SSD",
    },
    price: 245000,
    quantity: 1,
  },
  {
    id: "2",
    name: "HP EliteBook 840 G10",
    brand: "HP",
    image: "/images/products/laptop-2.jpg",
    specs: {
      processor: "Intel Core i5-1345U",
      ram: "16GB DDR5",
      storage: "256GB SSD",
    },
    price: 198000,
    quantity: 2,
  },
  {
    id: "3",
    name: "Lenovo ThinkPad X1 Carbon Gen 11",
    brand: "Lenovo",
    image: "/images/products/laptop-3.jpg",
    specs: {
      processor: "Intel Core i7-1365U",
      ram: "32GB DDR5",
      storage: "1TB SSD",
    },
    price: 385000,
    quantity: 1,
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

function EmptyCart() {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4">
      <div className="relative mb-8">
        <div className="flex h-32 w-32 items-center justify-center rounded-full bg-muted">
          <ShoppingBag className="h-16 w-16 text-muted-foreground" />
        </div>
        <div className="absolute -bottom-2 -right-2 flex h-12 w-12 items-center justify-center rounded-full bg-electric-blue text-white">
          <span className="text-xl font-bold">0</span>
        </div>
      </div>
      <h2 className="mb-2 text-2xl font-bold text-foreground">Your cart is empty</h2>
      <p className="mb-8 max-w-md text-center text-muted-foreground">
        Looks like you haven&apos;t added any laptops to your cart yet. Explore our collection and find the perfect device for you.
      </p>
      <Button asChild size="lg" className="bg-electric-blue text-white hover:bg-electric-blue/90">
        <Link href="/explore">
          <ShoppingBag className="mr-2 h-5 w-5" />
          Start Shopping
        </Link>
      </Button>
    </div>
  );
}

function CartItemRow({
  item,
  onUpdateQuantity,
  onRemove,
}: {
  item: CartItem;
  onUpdateQuantity: (id: string, quantity: number) => void;
  onRemove: (id: string) => void;
}) {
  return (
    <div className="flex flex-col gap-4 py-6 sm:flex-row sm:items-center">
      {/* Product Image */}
      <div className="relative h-24 w-24 shrink-0 overflow-hidden rounded-lg bg-muted sm:h-28 sm:w-28">
        <Image
          src={item.image}
          alt={item.name}
          fill
          className="object-cover"
          sizes="112px"
        />
      </div>

      {/* Product Details */}
      <div className="flex flex-1 flex-col gap-2 sm:gap-1">
        <div className="flex items-start justify-between gap-2">
          <div>
            <span className="mb-1 inline-block rounded bg-muted px-2 py-0.5 text-xs font-medium text-muted-foreground">
              {item.brand}
            </span>
            <h3 className="font-semibold text-foreground line-clamp-2">{item.name}</h3>
          </div>
          <Button
            variant="ghost"
            size="icon-sm"
            className="shrink-0 text-muted-foreground hover:text-destructive"
            onClick={() => onRemove(item.id)}
            aria-label="Remove item"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>

        {/* Specs */}
        <div className="flex flex-wrap gap-1.5">
          <span className="rounded bg-muted px-2 py-0.5 text-[10px] font-medium text-muted-foreground">
            {item.specs.processor}
          </span>
          <span className="rounded bg-muted px-2 py-0.5 text-[10px] font-medium text-muted-foreground">
            {item.specs.ram}
          </span>
          <span className="rounded bg-muted px-2 py-0.5 text-[10px] font-medium text-muted-foreground">
            {item.specs.storage}
          </span>
        </div>

        {/* Price, Quantity, Line Total */}
        <div className="mt-2 flex flex-wrap items-center justify-between gap-4">
          <div className="text-sm text-muted-foreground">
            Unit Price: <span className="font-medium text-foreground">{formatPrice(item.price)}</span>
          </div>

          {/* Quantity Stepper */}
          <div className="flex items-center gap-1 rounded-lg border bg-background p-1">
            <Button
              variant="ghost"
              size="icon-sm"
              className="h-7 w-7"
              onClick={() => onUpdateQuantity(item.id, Math.max(1, item.quantity - 1))}
              disabled={item.quantity <= 1}
              aria-label="Decrease quantity"
            >
              <Minus className="h-3 w-3" />
            </Button>
            <span className="w-8 text-center text-sm font-medium">{item.quantity}</span>
            <Button
              variant="ghost"
              size="icon-sm"
              className="h-7 w-7"
              onClick={() => onUpdateQuantity(item.id, item.quantity + 1)}
              aria-label="Increase quantity"
            >
              <Plus className="h-3 w-3" />
            </Button>
          </div>

          {/* Line Total */}
          <div className="text-right">
            <span className="text-lg font-bold text-electric-blue">
              {formatPrice(item.price * item.quantity)}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function CartPage() {
  const [cartItems, setCartItems] = useState<CartItem[]>(initialCartItems);
  const [discountCode, setDiscountCode] = useState("");
  const [appliedDiscount, setAppliedDiscount] = useState<number>(0);
  const [discountError, setDiscountError] = useState("");

  const updateQuantity = (id: string, quantity: number) => {
    setCartItems((items) =>
      items.map((item) => (item.id === id ? { ...item, quantity } : item))
    );
  };

  const removeItem = (id: string) => {
    setCartItems((items) => items.filter((item) => item.id !== id));
  };

  const applyDiscount = () => {
    // Sample discount codes
    if (discountCode.toUpperCase() === "SAVE10") {
      setAppliedDiscount(10);
      setDiscountError("");
    } else if (discountCode.toUpperCase() === "SAVE20") {
      setAppliedDiscount(20);
      setDiscountError("");
    } else if (discountCode.trim() === "") {
      setDiscountError("Please enter a discount code");
    } else {
      setDiscountError("Invalid discount code");
      setAppliedDiscount(0);
    }
  };

  const subtotal = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const shippingFee = subtotal >= 50000 ? 0 : 2500;
  const discountAmount = (subtotal * appliedDiscount) / 100;
  const grandTotal = subtotal - discountAmount + shippingFee;

  if (cartItems.length === 0) {
    return (
      <div className="container mx-auto max-w-6xl px-4 py-8">
        <h1 className="mb-8 text-3xl font-bold text-foreground">Shopping Cart</h1>
        <EmptyCart />
      </div>
    );
  }

  return (
    <div className="container mx-auto max-w-6xl px-4 py-8">
      <h1 className="mb-8 text-3xl font-bold text-foreground">Shopping Cart</h1>

      <div className="flex flex-col gap-8 lg:flex-row">
        {/* Left Column - Cart Items */}
        <div className="flex-1">
          <Card className="py-0">
            <CardHeader className="border-b px-6 py-4">
              <CardTitle className="text-lg">
                Cart Items ({cartItems.reduce((sum, item) => sum + item.quantity, 0)})
              </CardTitle>
            </CardHeader>
            <CardContent className="divide-y px-6 py-0">
              {cartItems.map((item) => (
                <CartItemRow
                  key={item.id}
                  item={item}
                  onUpdateQuantity={updateQuantity}
                  onRemove={removeItem}
                />
              ))}
            </CardContent>
          </Card>

          {/* Continue Shopping Link */}
          <Link
            href="/explore"
            className="mt-6 inline-flex items-center gap-2 text-sm font-medium text-electric-blue hover:underline"
          >
            <ArrowLeft className="h-4 w-4" />
            Continue Shopping
          </Link>
        </div>

        {/* Right Column - Order Summary */}
        <div className="w-full lg:w-[380px]">
          <Card className="sticky top-24">
            <CardHeader className="border-b px-6 py-4">
              <CardTitle className="text-lg">Order Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 px-6 pt-6">
              {/* Subtotal */}
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Subtotal</span>
                <span className="font-medium">{formatPrice(subtotal)}</span>
              </div>

              {/* Shipping */}
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

              {/* Free Shipping Note */}
              <div className="flex items-start gap-2 rounded-lg bg-muted/50 p-3">
                <Truck className="mt-0.5 h-4 w-4 shrink-0 text-electric-blue" />
                <p className="text-xs text-muted-foreground">
                  Free shipping on orders above <span className="font-medium text-foreground">PKR 50,000</span>
                </p>
              </div>

              {/* Discount Applied */}
              {appliedDiscount > 0 && (
                <div className="flex items-center justify-between text-green-600">
                  <span>Discount ({appliedDiscount}%)</span>
                  <span className="font-medium">-{formatPrice(discountAmount)}</span>
                </div>
              )}

              <Separator />

              {/* Discount Code Input */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">Discount Code</label>
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <Tag className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      type="text"
                      placeholder="Enter code"
                      value={discountCode}
                      onChange={(e) => {
                        setDiscountCode(e.target.value);
                        setDiscountError("");
                      }}
                      className="pl-9"
                    />
                  </div>
                  <Button variant="outline" onClick={applyDiscount}>
                    Apply
                  </Button>
                </div>
                {discountError && (
                  <p className="text-xs text-destructive">{discountError}</p>
                )}
                {appliedDiscount > 0 && (
                  <p className="text-xs text-green-600">
                    Code applied! You save {formatPrice(discountAmount)}
                  </p>
                )}
              </div>

              <Separator />

              {/* Grand Total */}
              <div className="flex items-center justify-between">
                <span className="text-lg font-semibold">Grand Total</span>
                <span className="text-2xl font-bold text-electric-blue">
                  {formatPrice(grandTotal)}
                </span>
              </div>

              {/* Checkout Button */}
              <Button
                size="lg"
                className="w-full bg-electric-blue text-white hover:bg-electric-blue/90"
              >
                <CreditCard className="mr-2 h-5 w-5" />
                Proceed to Checkout
              </Button>

              {/* Payment Methods */}
              <div className="pt-4">
                <p className="mb-3 text-center text-xs text-muted-foreground">
                  Accepted Payment Methods
                </p>
                <div className="flex flex-wrap items-center justify-center gap-3">
                  {/* JazzCash */}
                  <div className="flex h-8 items-center justify-center rounded border bg-background px-3">
                    <span className="text-xs font-semibold text-red-600">JazzCash</span>
                  </div>
                  {/* EasyPaisa */}
                  <div className="flex h-8 items-center justify-center rounded border bg-background px-3">
                    <span className="text-xs font-semibold text-green-600">EasyPaisa</span>
                  </div>
                  {/* Visa/Mastercard */}
                  <div className="flex h-8 items-center justify-center gap-1 rounded border bg-background px-3">
                    <svg className="h-4 w-6" viewBox="0 0 48 32" fill="none">
                      <rect width="48" height="32" rx="4" fill="#1A1F71" />
                      <path d="M18 22L21 10H24L21 22H18Z" fill="white" />
                      <path
                        d="M32 10L29 18L28 10H25L27 22H30L35 10H32Z"
                        fill="white"
                      />
                      <path
                        d="M14 10L10 22H13L13.5 20H17L17.5 22H21L17 10H14ZM14.5 17L15.5 13L16.5 17H14.5Z"
                        fill="white"
                      />
                    </svg>
                    <svg className="h-4 w-6" viewBox="0 0 48 32" fill="none">
                      <rect width="48" height="32" rx="4" fill="#F9F9F9" />
                      <circle cx="20" cy="16" r="8" fill="#EB001B" />
                      <circle cx="28" cy="16" r="8" fill="#F79E1B" />
                      <path
                        d="M24 10C26 12 27 14 27 16C27 18 26 20 24 22C22 20 21 18 21 16C21 14 22 12 24 10Z"
                        fill="#FF5F00"
                      />
                    </svg>
                  </div>
                  {/* COD */}
                  <div className="flex h-8 items-center justify-center rounded border bg-background px-3">
                    <span className="text-xs font-semibold text-navy">COD</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
