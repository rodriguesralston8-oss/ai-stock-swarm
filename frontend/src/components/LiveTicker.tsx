"use client";

import { useEffect, useRef, useState } from "react";

interface TickerItem {
  symbol: string;
  price: number;
  change: number;
  changePct: number;
}

const TICKER_DATA: TickerItem[] = [
  { symbol: "SPY", price: 510.42, change: 2.28, changePct: 0.45 },
  { symbol: "QQQ", price: 440.18, change: 2.71, changePct: 0.62 },
  { symbol: "AAPL", price: 182.50, change: 2.07, changePct: 1.15 },
  { symbol: "NVDA", price: 875.20, change: -7.38, changePct: -0.84 },
  { symbol: "TSLA", price: 175.30, change: -2.49, changePct: -1.40 },
  { symbol: "BTC/USD", price: 65420, change: 1342, changePct: 2.10 },
];

export default function LiveTicker() {
  const [items, setItems] = useState<TickerItem[]>(TICKER_DATA);
  const containerRef = useRef<HTMLDivElement>(null);
  const animationRef = useRef<number>();
  const [paused, setPaused] = useState(false);

  // Simulate live updates
  useEffect(() => {
    const interval = setInterval(() => {
      setItems((prev) =>
        prev.map((item) => {
          const volatility = item.price * 0.0002;
          const delta = (Math.random() - 0.5) * volatility * 2;
          const newPrice = Math.max(0.01, item.price + delta);
          const newChange = newPrice - TICKER_DATA.find(t => t.symbol === item.symbol)!.price;
          const newChangePct = (newChange / TICKER_DATA.find(t => t.symbol === item.symbol)!.price) * 100;
          return { ...item, price: newPrice, change: newChange, changePct: newChangePct };
        })
      );
    }, 1500);
    return () => clearInterval(interval);
  }, []);

  // Marquee animation
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const content = container.querySelector(".ticker-content");
    if (!content) return;

    let position = 0;
    const speed = 0.5;
    const contentWidth = content.scrollWidth;

    const animate = () => {
      if (paused) {
        animationRef.current = requestAnimationFrame(animate);
        return;
      }
      position -= speed;
      if (Math.abs(position) >= contentWidth / 2) {
        position = 0;
      }
      content.style.transform = `translateX(${position}px)`;
      animationRef.current = requestAnimationFrame(animate);
    };

    animationRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animationRef.current!);
  }, [paused, items]);

  const formatPrice = (price: number) => {
    if (price >= 1000) return price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    return price.toFixed(2);
  };

  return (
    <div className="w-full bg-slate-900 border-b border-slate-800 overflow-hidden">
      <div 
        ref={containerRef}
        className="flex items-center py-2 whitespace-nowrap"
        onMouseEnter={() => setPaused(true)}
        onMouseLeave={() => setPaused(false)}
      >
        <div className="ticker-content flex items-center gap-8 min-w-max">
          {items.flatMap((item) => [
            <span key={`${item.symbol}-sym`} className="font-mono text-xs text-slate-300 font-medium">{item.symbol}</span>,
            <span key={`${item.symbol}-price`} className="font-mono text-xs text-slate-100">{formatPrice(item.price)}</span>,
            <span 
              key={`${item.symbol}-change`}
              className={`font-mono text-xs font-medium ${
                item.change >= 0 ? "text-emerald-400" : "text-rose-400"
              }`}
            >
              {item.change >= 0 ? "+" : ""}{item.changePct.toFixed(2)}%
            </span>,
            <span key={`${item.symbol}-sep`} className="text-slate-700">|</span>,
          ])}
        </div>
      </div>
    </div>
  );
}