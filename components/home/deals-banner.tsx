"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowRight, Zap } from "lucide-react";

interface TimeLeft {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
}

function CountdownTimer({ targetDate }: { targetDate: Date }) {
  const [timeLeft, setTimeLeft] = useState<TimeLeft>({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
  });

  useEffect(() => {
    const calculateTimeLeft = () => {
      const difference = targetDate.getTime() - new Date().getTime();

      if (difference > 0) {
        setTimeLeft({
          days: Math.floor(difference / (1000 * 60 * 60 * 24)),
          hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
          minutes: Math.floor((difference / 1000 / 60) % 60),
          seconds: Math.floor((difference / 1000) % 60),
        });
      }
    };

    calculateTimeLeft();
    const timer = setInterval(calculateTimeLeft, 1000);

    return () => clearInterval(timer);
  }, [targetDate]);

  const TimeBlock = ({ value, label }: { value: number; label: string }) => (
    <div className="flex flex-col items-center">
      <div className="flex h-14 w-14 items-center justify-center rounded-lg bg-white/20 backdrop-blur-sm sm:h-16 sm:w-16">
        <span className="text-xl font-bold text-white sm:text-2xl">
          {String(value).padStart(2, "0")}
        </span>
      </div>
      <span className="mt-1 text-xs text-white/80">{label}</span>
    </div>
  );

  return (
    <div className="flex gap-3 sm:gap-4">
      <TimeBlock value={timeLeft.days} label="Days" />
      <TimeBlock value={timeLeft.hours} label="Hours" />
      <TimeBlock value={timeLeft.minutes} label="Mins" />
      <TimeBlock value={timeLeft.seconds} label="Secs" />
    </div>
  );
}

export function DealsBanner() {
  // Set deal end date to 7 days from now
  const dealEndDate = new Date();
  dealEndDate.setDate(dealEndDate.getDate() + 7);

  return (
    <section className="py-12 sm:py-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-navy via-navy/95 to-electric-blue p-8 sm:p-12 lg:p-16">
          {/* Background Pattern */}
          <div className="absolute inset-0 opacity-10">
            <div
              className="absolute inset-0"
              style={{
                backgroundImage: `radial-gradient(circle at 2px 2px, white 1px, transparent 0)`,
                backgroundSize: "32px 32px",
              }}
            />
          </div>

          {/* Decorative Elements */}
          <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-electric-blue/30 blur-3xl" />
          <div className="absolute -bottom-20 -left-20 h-64 w-64 rounded-full bg-white/10 blur-3xl" />

          <div className="relative z-10 flex flex-col items-center text-center lg:flex-row lg:items-center lg:justify-between lg:text-left">
            {/* Content */}
            <div className="max-w-xl">
              {/* Badge */}
              <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-white/20 px-4 py-1.5 text-sm font-medium text-white backdrop-blur-sm">
                <Zap className="h-4 w-4" />
                <span>Limited Time Offer</span>
              </div>

              <h2 className="text-3xl font-bold text-white sm:text-4xl lg:text-5xl">
                Mega Sale Week
              </h2>
              <p className="mt-4 text-lg text-white/80">
                Get up to <span className="font-bold text-white">40% OFF</span> on
                selected laptops and desktops. Free delivery on orders above
                Rs. 50,000.
              </p>

              {/* CTA Button */}
              <Button
                size="lg"
                className="mt-6 bg-white text-navy hover:bg-white/90"
                asChild
              >
                <Link href="/deals">
                  Shop Deals Now
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </div>

            {/* Countdown Timer */}
            <div className="mt-8 lg:mt-0">
              <p className="mb-3 text-sm font-medium text-white/80">
                Offer Ends In:
              </p>
              <CountdownTimer targetDate={dealEndDate} />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
