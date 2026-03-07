"use client";

import Link from "next/link";
import { ProductCard, type Product } from "@/components/product/product-card";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

const popularProducts: Product[] = [
  {
    id: "5",
    name: "MacBook Air M3 13-inch",
    brand: "Apple",
    slug: "macbook-air-m3-13",
    image: "/images/products/laptop-5.jpg",
    specs: {
      processor: "Apple M3",
      ram: "8GB Unified",
      storage: "256GB SSD",
    },
    originalPrice: 385000,
    salePrice: 365000,
    isOnSale: true,
  },
  {
    id: "6",
    name: "Dell XPS 15 9530 Premium Laptop",
    brand: "Dell",
    slug: "dell-xps-15-9530",
    image: "/images/products/laptop-6.jpg",
    specs: {
      processor: "Intel i7-13700H",
      ram: "16GB DDR5",
      storage: "512GB SSD",
    },
    originalPrice: 395000,
    salePrice: 359000,
    isOnSale: true,
  },
  {
    id: "7",
    name: "HP Victus 16 Gaming Laptop",
    brand: "HP",
    slug: "hp-victus-16-gaming",
    image: "/images/products/laptop-7.jpg",
    specs: {
      processor: "AMD Ryzen 7",
      ram: "16GB DDR5",
      storage: "512GB SSD",
    },
    originalPrice: 275000,
    salePrice: 245000,
    isOnSale: true,
  },
  {
    id: "8",
    name: "Lenovo IdeaPad Slim 5 Pro",
    brand: "Lenovo",
    slug: "lenovo-ideapad-slim-5-pro",
    image: "/images/products/laptop-8.jpg",
    specs: {
      processor: "AMD Ryzen 5",
      ram: "16GB DDR4",
      storage: "512GB SSD",
    },
    originalPrice: 185000,
    salePrice: 169000,
    isOnSale: true,
  },
  {
    id: "9",
    name: "ASUS ZenBook 14 OLED",
    brand: "ASUS",
    slug: "asus-zenbook-14-oled",
    image: "/images/products/laptop-9.jpg",
    specs: {
      processor: "Intel i5-1340P",
      ram: "16GB LPDDR5",
      storage: "512GB SSD",
    },
    originalPrice: 265000,
    salePrice: 239000,
    isOnSale: true,
  },
  {
    id: "10",
    name: "MSI Katana 15 Gaming",
    brand: "MSI",
    slug: "msi-katana-15-gaming",
    image: "/images/products/laptop-10.jpg",
    specs: {
      processor: "Intel i7-12650H",
      ram: "16GB DDR5",
      storage: "512GB SSD",
    },
    originalPrice: 325000,
    salePrice: 289000,
    isOnSale: true,
  },
];

export function PopularProducts() {
  return (
    <section className="py-12 sm:py-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h2 className="text-2xl font-bold text-foreground sm:text-3xl">
              Popular Right Now
            </h2>
            <p className="mt-1 text-muted-foreground">
              Trending laptops our customers love
            </p>
          </div>
          <Button
            variant="ghost"
            className="w-fit text-electric-blue hover:text-electric-blue/80"
            asChild
          >
            <Link href="/products?sort=popular">
              View All
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </div>

        {/* Horizontal Scrollable Products */}
        <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide lg:grid lg:grid-cols-6 lg:gap-4 lg:overflow-visible lg:pb-0">
          {popularProducts.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              variant="compact"
              className="min-w-[220px] flex-shrink-0 lg:min-w-0"
            />
          ))}
        </div>
      </div>
    </section>
  );
}
