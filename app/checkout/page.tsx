"use client";

import { useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  Check,
  ChevronLeft,
  ChevronRight,
  CreditCard,
  MapPin,
  Package,
  Truck,
  Building2,
  Smartphone,
  Banknote,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Progress } from "@/components/ui/progress";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

// Form schemas
const deliverySchema = z.object({
  fullName: z.string().min(2, "Full name is required"),
  phone: z.string().min(10, "Valid phone number is required"),
  email: z.string().email("Valid email is required"),
  address: z.string().min(5, "Address is required"),
  city: z.string().min(1, "City is required"),
  postalCode: z.string().min(5, "Postal code is required"),
  deliveryMethod: z.enum(["pickup", "delivery"]),
});

const paymentSchema = z.object({
  paymentMethod: z.enum(["jazzcash", "easypaisa", "card", "cod"]),
  cardNumber: z.string().optional(),
  cardExpiry: z.string().optional(),
  cardCvv: z.string().optional(),
});

type DeliveryFormValues = z.infer<typeof deliverySchema>;
type PaymentFormValues = z.infer<typeof paymentSchema>;

// Sample cart data for order summary
const cartItems = [
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

const cities = [
  "Karachi",
  "Lahore",
  "Islamabad",
  "Rawalpindi",
  "Faisalabad",
  "Multan",
  "Peshawar",
  "Hyderabad",
];

const formatPrice = (price: number) => {
  return new Intl.NumberFormat("en-PK", {
    style: "currency",
    currency: "PKR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(price);
};

const steps = [
  { id: 1, title: "Delivery", icon: Truck },
  { id: 2, title: "Payment", icon: CreditCard },
  { id: 3, title: "Review", icon: Check },
];

interface PaymentMethodCardProps {
  id: string;
  title: string;
  subtitle: string;
  icon: React.ReactNode;
  colorClass: string;
  selected: boolean;
  onSelect: () => void;
}

function PaymentMethodCard({
  title,
  subtitle,
  icon,
  colorClass,
  selected,
  onSelect,
}: PaymentMethodCardProps) {
  return (
    <button
      type="button"
      onClick={onSelect}
      className={cn(
        "relative flex w-full items-center gap-4 rounded-xl border-2 p-4 text-left transition-all hover:border-electric-blue/50",
        selected ? "border-electric-blue bg-electric-blue/5" : "border-border"
      )}
    >
      <div
        className={cn(
          "flex h-12 w-12 shrink-0 items-center justify-center rounded-lg",
          colorClass
        )}
      >
        {icon}
      </div>
      <div className="flex-1">
        <p className="font-semibold text-foreground">{title}</p>
        <p className="text-sm text-muted-foreground">{subtitle}</p>
      </div>
      <div
        className={cn(
          "flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 transition-all",
          selected
            ? "border-electric-blue bg-electric-blue"
            : "border-muted-foreground/30"
        )}
      >
        {selected && <Check className="h-3 w-3 text-white" />}
      </div>
    </button>
  );
}

function OrderSummary({ showItems = false }: { showItems?: boolean }) {
  const subtotal = cartItems.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );
  const shippingFee = subtotal >= 50000 ? 0 : 2500;
  const grandTotal = subtotal + shippingFee;

  return (
    <Card className="sticky top-24">
      <CardHeader className="border-b px-6 py-4">
        <CardTitle className="text-lg">Order Summary</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4 px-6 pt-6">
        {showItems && (
          <>
            <div className="space-y-4">
              {cartItems.map((item) => (
                <div key={item.id} className="flex gap-3">
                  <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-lg bg-muted">
                    <Image
                      src={item.image}
                      alt={item.name}
                      fill
                      className="object-cover"
                      sizes="64px"
                    />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium line-clamp-1">
                      {item.name}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Qty: {item.quantity}
                    </p>
                    <p className="text-sm font-semibold text-electric-blue">
                      {formatPrice(item.price * item.quantity)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
            <Separator />
          </>
        )}

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
          <span className="text-lg font-semibold">Total</span>
          <span className="text-2xl font-bold text-electric-blue">
            {formatPrice(grandTotal)}
          </span>
        </div>
      </CardContent>
    </Card>
  );
}

function StepIndicator({
  currentStep,
  totalSteps,
}: {
  currentStep: number;
  totalSteps: number;
}) {
  const progressValue = ((currentStep - 1) / (totalSteps - 1)) * 100;

  return (
    <div className="mb-8">
      <div className="flex items-center justify-between">
        {steps.map((step, index) => {
          const StepIcon = step.icon;
          const isCompleted = currentStep > step.id;
          const isCurrent = currentStep === step.id;

          return (
            <div key={step.id} className="flex flex-col items-center">
              <div
                className={cn(
                  "flex h-12 w-12 items-center justify-center rounded-full border-2 transition-all",
                  isCompleted
                    ? "border-electric-blue bg-electric-blue text-white"
                    : isCurrent
                    ? "border-electric-blue bg-electric-blue/10 text-electric-blue"
                    : "border-muted-foreground/30 text-muted-foreground"
                )}
              >
                {isCompleted ? (
                  <Check className="h-5 w-5" />
                ) : (
                  <StepIcon className="h-5 w-5" />
                )}
              </div>
              <span
                className={cn(
                  "mt-2 text-sm font-medium",
                  isCurrent || isCompleted
                    ? "text-foreground"
                    : "text-muted-foreground"
                )}
              >
                {step.title}
              </span>
            </div>
          );
        })}
      </div>
      <div className="relative mt-4">
        <Progress value={progressValue} className="h-2" />
      </div>
    </div>
  );
}

export default function CheckoutPage() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const deliveryForm = useForm<DeliveryFormValues>({
    resolver: zodResolver(deliverySchema),
    defaultValues: {
      fullName: "",
      phone: "",
      email: "",
      address: "",
      city: "",
      postalCode: "",
      deliveryMethod: "delivery",
    },
  });

  const paymentForm = useForm<PaymentFormValues>({
    resolver: zodResolver(paymentSchema),
    defaultValues: {
      paymentMethod: "cod",
      cardNumber: "",
      cardExpiry: "",
      cardCvv: "",
    },
  });

  const deliveryData = deliveryForm.watch();
  const paymentData = paymentForm.watch();

  const handleNextStep = async () => {
    if (currentStep === 1) {
      const isValid = await deliveryForm.trigger();
      if (isValid) {
        setCurrentStep(2);
      }
    } else if (currentStep === 2) {
      const isValid = await paymentForm.trigger();
      if (isValid) {
        setCurrentStep(3);
      }
    }
  };

  const handlePreviousStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handlePlaceOrder = async () => {
    setIsSubmitting(true);
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 2000));
    // Generate order ID
    const orderId = `LO-${Date.now().toString(36).toUpperCase()}`;
    router.push(`/checkout/confirmation?orderId=${orderId}`);
  };

  const getPaymentMethodLabel = (method: string) => {
    switch (method) {
      case "jazzcash":
        return "JazzCash";
      case "easypaisa":
        return "EasyPaisa";
      case "card":
        return "Debit/Credit Card";
      case "cod":
        return "Cash on Delivery";
      default:
        return method;
    }
  };

  return (
    <div className="container mx-auto max-w-6xl px-4 py-8">
      <h1 className="mb-2 text-3xl font-bold text-foreground">Checkout</h1>
      <p className="mb-8 text-muted-foreground">
        Complete your order in 3 simple steps
      </p>

      <StepIndicator currentStep={currentStep} totalSteps={3} />

      <div className="flex flex-col gap-8 lg:flex-row">
        {/* Main Content */}
        <div className="flex-1">
          {/* Step 1: Delivery Info */}
          {currentStep === 1 && (
            <Card>
              <CardHeader className="border-b px-6 py-4">
                <CardTitle className="flex items-center gap-2">
                  <Truck className="h-5 w-5 text-electric-blue" />
                  Delivery Information
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <Form {...deliveryForm}>
                  <form className="space-y-6">
                    {/* Delivery Method Toggle */}
                    <FormField
                      control={deliveryForm.control}
                      name="deliveryMethod"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Delivery Method</FormLabel>
                          <FormControl>
                            <div className="grid grid-cols-2 gap-4">
                              <button
                                type="button"
                                onClick={() => field.onChange("pickup")}
                                className={cn(
                                  "flex items-center gap-3 rounded-lg border-2 p-4 transition-all",
                                  field.value === "pickup"
                                    ? "border-electric-blue bg-electric-blue/5"
                                    : "border-border hover:border-electric-blue/50"
                                )}
                              >
                                <Building2 className="h-5 w-5 text-electric-blue" />
                                <div className="text-left">
                                  <p className="font-medium">
                                    Pickup from Store
                                  </p>
                                  <p className="text-xs text-muted-foreground">
                                    Free pickup
                                  </p>
                                </div>
                              </button>
                              <button
                                type="button"
                                onClick={() => field.onChange("delivery")}
                                className={cn(
                                  "flex items-center gap-3 rounded-lg border-2 p-4 transition-all",
                                  field.value === "delivery"
                                    ? "border-electric-blue bg-electric-blue/5"
                                    : "border-border hover:border-electric-blue/50"
                                )}
                              >
                                <Truck className="h-5 w-5 text-electric-blue" />
                                <div className="text-left">
                                  <p className="font-medium">Home Delivery</p>
                                  <p className="text-xs text-muted-foreground">
                                    2-5 business days
                                  </p>
                                </div>
                              </button>
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <div className="grid gap-6 sm:grid-cols-2">
                      <FormField
                        control={deliveryForm.control}
                        name="fullName"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Full Name</FormLabel>
                            <FormControl>
                              <Input placeholder="John Doe" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={deliveryForm.control}
                        name="phone"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Phone Number</FormLabel>
                            <FormControl>
                              <Input placeholder="03XX-XXXXXXX" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <FormField
                      control={deliveryForm.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Email Address</FormLabel>
                          <FormControl>
                            <Input
                              type="email"
                              placeholder="john@example.com"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={deliveryForm.control}
                      name="address"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Address</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="House #, Street, Area"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <div className="grid gap-6 sm:grid-cols-2">
                      <FormField
                        control={deliveryForm.control}
                        name="city"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>City</FormLabel>
                            <Select
                              onValueChange={field.onChange}
                              value={field.value}
                            >
                              <FormControl>
                                <SelectTrigger className="w-full">
                                  <SelectValue placeholder="Select city" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {cities.map((city) => (
                                  <SelectItem key={city} value={city}>
                                    {city}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={deliveryForm.control}
                        name="postalCode"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Postal Code</FormLabel>
                            <FormControl>
                              <Input placeholder="54000" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </form>
                </Form>
              </CardContent>
            </Card>
          )}

          {/* Step 2: Payment Method */}
          {currentStep === 2 && (
            <Card>
              <CardHeader className="border-b px-6 py-4">
                <CardTitle className="flex items-center gap-2">
                  <CreditCard className="h-5 w-5 text-electric-blue" />
                  Payment Method
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <Form {...paymentForm}>
                  <form className="space-y-4">
                    <FormField
                      control={paymentForm.control}
                      name="paymentMethod"
                      render={({ field }) => (
                        <FormItem>
                          <FormControl>
                            <div className="space-y-3">
                              <PaymentMethodCard
                                id="jazzcash"
                                title="JazzCash"
                                subtitle="Pay with JazzCash mobile wallet"
                                icon={
                                  <Smartphone className="h-6 w-6 text-white" />
                                }
                                colorClass="bg-orange-500"
                                selected={field.value === "jazzcash"}
                                onSelect={() => field.onChange("jazzcash")}
                              />

                              <PaymentMethodCard
                                id="easypaisa"
                                title="EasyPaisa"
                                subtitle="Pay with EasyPaisa mobile wallet"
                                icon={
                                  <Smartphone className="h-6 w-6 text-white" />
                                }
                                colorClass="bg-green-500"
                                selected={field.value === "easypaisa"}
                                onSelect={() => field.onChange("easypaisa")}
                              />

                              <PaymentMethodCard
                                id="card"
                                title="Debit/Credit Card"
                                subtitle="Pay with Visa or Mastercard"
                                icon={
                                  <CreditCard className="h-6 w-6 text-white" />
                                }
                                colorClass="bg-blue-600"
                                selected={field.value === "card"}
                                onSelect={() => field.onChange("card")}
                              />

                              <PaymentMethodCard
                                id="cod"
                                title="Cash on Delivery"
                                subtitle="Pay when you receive your order"
                                icon={
                                  <Banknote className="h-6 w-6 text-white" />
                                }
                                colorClass="bg-gray-600"
                                selected={field.value === "cod"}
                                onSelect={() => field.onChange("cod")}
                              />
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {/* Card Details - shown only when card is selected */}
                    {paymentData.paymentMethod === "card" && (
                      <div className="mt-6 space-y-4 rounded-lg border bg-muted/30 p-4">
                        <p className="text-sm font-medium text-foreground">
                          Card Details
                        </p>
                        <FormField
                          control={paymentForm.control}
                          name="cardNumber"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Card Number</FormLabel>
                              <FormControl>
                                <Input
                                  placeholder="1234 5678 9012 3456"
                                  {...field}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <div className="grid grid-cols-2 gap-4">
                          <FormField
                            control={paymentForm.control}
                            name="cardExpiry"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Expiry Date</FormLabel>
                                <FormControl>
                                  <Input placeholder="MM/YY" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={paymentForm.control}
                            name="cardCvv"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>CVV</FormLabel>
                                <FormControl>
                                  <Input
                                    type="password"
                                    placeholder="123"
                                    maxLength={4}
                                    {...field}
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>
                      </div>
                    )}
                  </form>
                </Form>
              </CardContent>
            </Card>
          )}

          {/* Step 3: Review & Confirm */}
          {currentStep === 3 && (
            <div className="space-y-6">
              {/* Delivery Summary */}
              <Card>
                <CardHeader className="border-b px-6 py-4">
                  <CardTitle className="flex items-center gap-2 text-base">
                    <MapPin className="h-5 w-5 text-electric-blue" />
                    Delivery Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div>
                      <p className="text-sm text-muted-foreground">Full Name</p>
                      <p className="font-medium">{deliveryData.fullName}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Phone</p>
                      <p className="font-medium">{deliveryData.phone}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Email</p>
                      <p className="font-medium">{deliveryData.email}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">
                        Delivery Method
                      </p>
                      <p className="font-medium">
                        {deliveryData.deliveryMethod === "pickup"
                          ? "Pickup from Store"
                          : "Home Delivery"}
                      </p>
                    </div>
                    <div className="sm:col-span-2">
                      <p className="text-sm text-muted-foreground">Address</p>
                      <p className="font-medium">
                        {deliveryData.address}, {deliveryData.city}{" "}
                        {deliveryData.postalCode}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Payment Summary */}
              <Card>
                <CardHeader className="border-b px-6 py-4">
                  <CardTitle className="flex items-center gap-2 text-base">
                    <CreditCard className="h-5 w-5 text-electric-blue" />
                    Payment Method
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                  <p className="font-medium">
                    {getPaymentMethodLabel(paymentData.paymentMethod)}
                  </p>
                  {paymentData.paymentMethod === "card" &&
                    paymentData.cardNumber && (
                      <p className="text-sm text-muted-foreground">
                        Card ending in ****
                        {paymentData.cardNumber.slice(-4)}
                      </p>
                    )}
                </CardContent>
              </Card>

              {/* Order Items */}
              <Card>
                <CardHeader className="border-b px-6 py-4">
                  <CardTitle className="flex items-center gap-2 text-base">
                    <Package className="h-5 w-5 text-electric-blue" />
                    Order Items
                  </CardTitle>
                </CardHeader>
                <CardContent className="divide-y px-6 py-0">
                  {cartItems.map((item) => (
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
            </div>
          )}

          {/* Navigation Buttons */}
          <div className="mt-8 flex items-center justify-between">
            <Button
              variant="outline"
              onClick={handlePreviousStep}
              disabled={currentStep === 1}
              className="gap-2"
            >
              <ChevronLeft className="h-4 w-4" />
              Back
            </Button>

            {currentStep < 3 ? (
              <Button
                onClick={handleNextStep}
                className="gap-2 bg-electric-blue text-white hover:bg-electric-blue/90"
              >
                Next
                <ChevronRight className="h-4 w-4" />
              </Button>
            ) : (
              <Button
                onClick={handlePlaceOrder}
                disabled={isSubmitting}
                className="gap-2 bg-electric-blue text-white hover:bg-electric-blue/90"
              >
                {isSubmitting ? (
                  <>
                    <svg
                      className="h-4 w-4 animate-spin"
                      viewBox="0 0 24 24"
                      fill="none"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      />
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      />
                    </svg>
                    Processing...
                  </>
                ) : (
                  <>
                    <Check className="h-4 w-4" />
                    Place Order
                  </>
                )}
              </Button>
            )}
          </div>
        </div>

        {/* Order Summary Sidebar */}
        <div className="w-full lg:w-[350px]">
          <OrderSummary showItems={currentStep === 3} />
        </div>
      </div>
    </div>
  );
}
