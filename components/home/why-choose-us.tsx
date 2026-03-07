"use client";

import { ShieldCheck, Headphones, Truck, RotateCcw } from "lucide-react";

const features = [
  {
    icon: ShieldCheck,
    title: "Genuine Products",
    description:
      "100% authentic products from authorized dealers with original manufacturer warranty.",
  },
  {
    icon: Headphones,
    title: "Warranty Support",
    description:
      "Dedicated after-sales support team to help with any warranty claims or technical issues.",
  },
  {
    icon: Truck,
    title: "Nationwide Delivery",
    description:
      "Fast and secure delivery across Pakistan with real-time tracking on all orders.",
  },
  {
    icon: RotateCcw,
    title: "Easy Returns",
    description:
      "Hassle-free 7-day return policy if you're not completely satisfied with your purchase.",
  },
];

export function WhyChooseUs() {
  return (
    <section className="bg-muted/50 py-12 sm:py-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="mb-10 text-center">
          <h2 className="text-2xl font-bold text-foreground sm:text-3xl">
            Why Choose Laptops Official?
          </h2>
          <p className="mx-auto mt-2 max-w-2xl text-muted-foreground">
            We&apos;re committed to providing the best shopping experience with
            quality products and exceptional service.
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {features.map((feature) => {
            const Icon = feature.icon;
            return (
              <div
                key={feature.title}
                className="group flex flex-col items-center rounded-xl border bg-card p-6 text-center transition-all duration-300 hover:-translate-y-1 hover:border-electric-blue/50 hover:shadow-lg hover:shadow-electric-blue/10"
              >
                {/* Icon */}
                <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-electric-blue/10 transition-colors group-hover:bg-electric-blue/20">
                  <Icon className="h-7 w-7 text-electric-blue" />
                </div>

                {/* Title */}
                <h3 className="mb-2 text-lg font-semibold text-foreground">
                  {feature.title}
                </h3>

                {/* Description */}
                <p className="text-sm leading-relaxed text-muted-foreground">
                  {feature.description}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
