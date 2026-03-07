"use client";

import Link from "next/link";
import { Laptop, Monitor, Gamepad2, Headphones } from "lucide-react";

const categories = [
  {
    name: "Laptops",
    slug: "laptops",
    icon: Laptop,
    description: "Business & Personal",
    count: "150+ Products",
  },
  {
    name: "Desktops",
    slug: "desktops",
    icon: Monitor,
    description: "Workstations & PCs",
    count: "80+ Products",
  },
  {
    name: "Gaming",
    slug: "gaming",
    icon: Gamepad2,
    description: "High Performance",
    count: "60+ Products",
  },
  {
    name: "Accessories",
    slug: "accessories",
    icon: Headphones,
    description: "Peripherals & More",
    count: "200+ Products",
  },
];

export function FeaturedCategories() {
  return (
    <section className="py-12 sm:py-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-foreground sm:text-3xl">
              Shop by Category
            </h2>
            <p className="mt-1 text-muted-foreground">
              Find what you need quickly
            </p>
          </div>
          <Link
            href="/categories"
            className="hidden text-sm font-medium text-electric-blue hover:underline sm:block"
          >
            View All Categories
          </Link>
        </div>

        {/* Categories Strip - Horizontal Scroll on Mobile */}
        <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide sm:grid sm:grid-cols-2 sm:gap-6 sm:overflow-visible sm:pb-0 lg:grid-cols-4">
          {categories.map((category) => {
            const Icon = category.icon;
            return (
              <Link
                key={category.slug}
                href={`/category/${category.slug}`}
                className="group flex min-w-[200px] flex-col items-center rounded-xl border bg-card p-6 text-center transition-all duration-300 hover:-translate-y-1 hover:border-electric-blue/50 hover:shadow-lg hover:shadow-electric-blue/10 sm:min-w-0"
              >
                {/* Icon Container */}
                <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-muted transition-colors group-hover:bg-electric-blue/10">
                  <Icon className="h-8 w-8 text-electric-blue transition-transform duration-300 group-hover:scale-110" />
                </div>

                {/* Category Info */}
                <h3 className="text-lg font-semibold text-foreground">
                  {category.name}
                </h3>
                <p className="mt-1 text-sm text-muted-foreground">
                  {category.description}
                </p>
                <span className="mt-2 text-xs font-medium text-electric-blue">
                  {category.count}
                </span>
              </Link>
            );
          })}
        </div>

        {/* Mobile View All Link */}
        <div className="mt-4 text-center sm:hidden">
          <Link
            href="/categories"
            className="text-sm font-medium text-electric-blue hover:underline"
          >
            View All Categories
          </Link>
        </div>
      </div>
    </section>
  );
}
