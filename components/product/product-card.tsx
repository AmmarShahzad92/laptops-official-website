"use client";

import Image from "next/image";
import Link from "next/link";
import { Heart, ShoppingCart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

export interface Product {
  id: string;
  name: string;
  brand: string;
  slug: string;
  image: string;
  specs: {
    processor: string;
    ram: string;
    storage: string;
  };
  originalPrice: number;
  salePrice: number;
  isOnSale?: boolean;
}

interface ProductCardProps {
  product: Product;
  className?: string;
  variant?: "default" | "compact";
}

export function ProductCard({ product, className, variant = "default" }: ProductCardProps) {
  const discountPercent = Math.round(
    ((product.originalPrice - product.salePrice) / product.originalPrice) * 100
  );

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("en-PK", {
      style: "currency",
      currency: "PKR",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price);
  };

  return (
    <div
      className={cn(
        "group relative flex flex-col overflow-hidden rounded-xl border bg-card transition-all duration-300 hover:shadow-lg hover:shadow-electric-blue/10",
        "hover:-translate-y-1",
        variant === "compact" ? "min-w-[220px]" : "",
        className
      )}
    >
      {/* Wishlist Button */}
      <button
        className="absolute right-3 top-3 z-10 flex h-9 w-9 items-center justify-center rounded-full bg-white/90 text-slate shadow-sm backdrop-blur-sm transition-all hover:bg-white hover:text-red-500 hover:scale-110"
        aria-label="Add to wishlist"
      >
        <Heart className="h-4 w-4" />
      </button>

      {/* Sale Badge */}
      {product.isOnSale && discountPercent > 0 && (
        <Badge className="absolute left-3 top-3 z-10 bg-red-500 text-white border-none">
          -{discountPercent}%
        </Badge>
      )}

      {/* Image Container */}
      <Link href={`/product/${product.slug}`} className="relative block">
        <div className="relative aspect-[4/3] w-full overflow-hidden bg-muted">
          <Image
            src={product.image}
            alt={product.name}
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-105"
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
          />
        </div>
      </Link>

      {/* Content */}
      <div className="flex flex-1 flex-col p-4">
        {/* Brand Badge */}
        <Badge variant="secondary" className="mb-2 w-fit text-xs font-medium">
          {product.brand}
        </Badge>

        {/* Product Name */}
        <Link href={`/product/${product.slug}`}>
          <h3 className="line-clamp-2 text-sm font-semibold text-foreground transition-colors hover:text-electric-blue">
            {product.name}
          </h3>
        </Link>

        {/* Specs Tags */}
        <div className="mt-3 flex flex-wrap gap-1.5">
          <span className="rounded bg-muted px-2 py-0.5 text-[10px] font-medium text-muted-foreground">
            {product.specs.processor}
          </span>
          <span className="rounded bg-muted px-2 py-0.5 text-[10px] font-medium text-muted-foreground">
            {product.specs.ram}
          </span>
          <span className="rounded bg-muted px-2 py-0.5 text-[10px] font-medium text-muted-foreground">
            {product.specs.storage}
          </span>
        </div>

        {/* Price Section */}
        <div className="mt-auto pt-4">
          <div className="flex items-baseline gap-2">
            <span className="text-lg font-bold text-electric-blue">
              {formatPrice(product.salePrice)}
            </span>
            {product.originalPrice > product.salePrice && (
              <span className="text-sm text-muted-foreground line-through">
                {formatPrice(product.originalPrice)}
              </span>
            )}
          </div>
        </div>

        {/* Add to Cart Button */}
        <Button
          size="sm"
          className="mt-3 w-full bg-navy text-white hover:bg-navy/90 transition-all duration-300"
        >
          <ShoppingCart className="mr-2 h-4 w-4" />
          Add to Cart
        </Button>
      </div>
    </div>
  );
}
