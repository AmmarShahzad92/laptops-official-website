"use client";

import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { ArrowRight, Sparkles } from "lucide-react";

// ─── Animation variants ───────────────────────────────────────────────────────

const contentContainer = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.12, delayChildren: 0.05 } },
};

const fadeUp = {
  hidden: { opacity: 0, y: 28 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] } },
};

const fadeInRight = {
  hidden: { opacity: 0, x: 50, scale: 0.97 },
  visible: { opacity: 1, x: 0, scale: 1, transition: { duration: 0.75, ease: [0.22, 1, 0.36, 1], delay: 0.15 } },
};

const trustContainer = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.1, delayChildren: 0.0 } },
};

// ─── Shared trust badge SVG icons ─────────────────────────────────────────────

function ShieldIcon() {
  return (
    <svg className="h-5 w-5 text-electric-blue" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
    </svg>
  );
}
function CardIcon() {
  return (
    <svg className="h-5 w-5 text-electric-blue" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
    </svg>
  );
}
function TruckIcon() {
  return (
    <svg className="h-5 w-5 text-electric-blue" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path d="M9 17a2 2 0 11-4 0 2 2 0 014 0zM19 17a2 2 0 11-4 0 2 2 0 014 0z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10a1 1 0 001 1h1m8-1a1 1 0 01-1 1H9m4-1V8a1 1 0 011-1h2.586a1 1 0 01.707.293l3.414 3.414a1 1 0 01.293.707V16a1 1 0 01-1 1h-1m-6-1a1 1 0 001 1h1M5 17a2 2 0 104 0m-4 0a2 2 0 114 0m6 0a2 2 0 104 0m-4 0a2 2 0 114 0" />
    </svg>
  );
}

const TRUST_ITEMS = [
  { label: "Genuine Products", Icon: ShieldIcon },
  { label: "Secure Payment",   Icon: CardIcon  },
  { label: "Fast Delivery",    Icon: TruckIcon },
];

// ─── Hero ─────────────────────────────────────────────────────────────────────

export function Hero() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-background via-background to-muted">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-5">
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: `radial-gradient(circle at 1px 1px, currentColor 1px, transparent 0)`,
            backgroundSize: "40px 40px",
          }}
        />
      </div>

      <div className="relative mx-auto max-w-7xl px-4 py-16 sm:px-6 sm:py-24 lg:px-8 lg:py-32">
        <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-8">

          {/* ── Left: Content column ───────────────────────────────────────── */}
          <motion.div
            variants={contentContainer}
            initial="hidden"
            animate="visible"
            className="flex flex-col items-center text-center lg:items-start lg:text-left"
          >
            {/* Badge */}
            <motion.div
              variants={fadeUp}
              className="inline-flex items-center gap-2 rounded-full bg-electric-blue/10 px-4 py-2 text-sm font-medium text-electric-blue"
            >
              <Sparkles className="h-4 w-4" />
              <span>Pakistan&apos;s #1 Laptop Store</span>
            </motion.div>

            {/* Headline */}
            <motion.h1
              variants={fadeUp}
              className="mt-6 text-4xl font-bold tracking-tight text-navy sm:text-5xl lg:text-6xl"
            >
              <span className="block">Premium Laptops</span>
              <span className="mt-2 block text-electric-blue">At Best Prices</span>
            </motion.h1>

            {/* Tagline */}
            <motion.p variants={fadeUp} className="mt-6 text-xl font-medium text-slate">
              &quot;Know It. Test It. Own It.&quot;
            </motion.p>

            {/* Description */}
            <motion.p variants={fadeUp} className="mt-4 max-w-md text-base leading-relaxed text-muted-foreground">
              Discover our curated collection of laptops and desktops from top brands.
              Genuine products, verified warranties, and nationwide delivery across Pakistan.
            </motion.p>

            {/* CTA Buttons */}
            <motion.div variants={fadeUp} className="mt-8 flex flex-col gap-4 sm:flex-row">
              <Button
                size="lg"
                className="bg-electric-blue text-white hover:bg-electric-blue/90 transition-transform duration-200 hover:scale-105"
                asChild
              >
                <Link href="/explore">
                  Explore Laptops
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="border-navy text-navy hover:bg-navy hover:text-white transition-transform duration-200 hover:scale-105"
                asChild
              >
                <Link href="/deals">View Deals</Link>
              </Button>
            </motion.div>

            {/* Trust Indicators */}
            <motion.div
              variants={trustContainer}
              initial="hidden"
              animate="visible"
              className="mt-10 flex flex-wrap items-center justify-center gap-6 lg:justify-start"
            >
              {TRUST_ITEMS.map(({ label, Icon }) => (
                <motion.div key={label} variants={fadeUp} className="flex items-center gap-2">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-muted">
                    <Icon />
                  </div>
                  <span className="text-sm font-medium text-foreground">{label}</span>
                </motion.div>
              ))}
            </motion.div>
          </motion.div>

          {/* ── Right: Hero image ──────────────────────────────────────────── */}
          <motion.div
            variants={fadeInRight}
            initial="hidden"
            animate="visible"
            className="relative flex items-center justify-center lg:justify-end"
          >
            <div className="relative">
              {/* Decorative blobs */}
              <motion.div
                animate={{ scale: [1, 1.08, 1], opacity: [0.6, 1, 0.6] }}
                transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
                className="absolute -left-8 -top-8 h-64 w-64 rounded-full bg-electric-blue/10 blur-3xl"
              />
              <motion.div
                animate={{ scale: [1, 1.12, 1], opacity: [0.5, 0.9, 0.5] }}
                transition={{ duration: 7, repeat: Infinity, ease: "easeInOut", delay: 1 }}
                className="absolute -bottom-8 -right-8 h-48 w-48 rounded-full bg-navy/10 blur-3xl"
              />

              {/* Image container */}
              <div className="relative z-10 rounded-2xl bg-gradient-to-br from-navy/5 to-electric-blue/5 p-4">
                <div className="relative aspect-[4/3] w-full max-w-lg overflow-hidden rounded-xl shadow-2xl">
                  <Image
                    src="/images/hero-laptop.jpg"
                    alt="Premium laptops at Laptops Official"
                    fill
                    className="object-cover transition-transform duration-700 hover:scale-105"
                    priority
                    sizes="(max-width: 768px) 100vw, 50vw"
                  />
                </div>
              </div>
            </div>
          </motion.div>

        </div>
      </div>
    </section>
  );
}
