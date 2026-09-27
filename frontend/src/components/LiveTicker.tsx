"use client";

import { motion } from "framer-motion";
import { useEffect, useState } from "react";

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
  { symbol: "MSFT", price: 415.30, change: 1.85, changePct: 0.45 },
  { symbol: "AMZN", price: 178.50, change: -0.95, changePct: -0.53 },
  { symbol: "GOOGL", price: 142.80, change: 0.72, changePct: 0.51 },
  { symbol: "META", price: 495.20, change: 3.15, changePct: 0.64 },
  { symbol: "NFLX", price: 620.10, change: -2.40, changePct: -0.39 },
  { symbol: "JPM", price: 198.70, change: 1.20, changePct: 0.61 },
  { symbol: "BRK.B", price: 425.60, change: 0.85, changePct: 0.20 },
];

export default function LiveTicker() {
  const [items, setItems] = useState<TickerItem[]>(TICKER_DATA);

  // Simulate live price updates
  useEffect(() => {
    const interval = setInterval(() => {
      setItems((prev) =>
        prev.map((item) => {
          const baseItem = TICKER_DATA.find(t => t.symbol === item.symbol)!;
          const volatility = baseItem.price * 0.0002;
          const delta = (Math.random() - 0.5) * volatility * 2;
          const newPrice = Math.max(0.01, baseItem.price + delta);
          const newChange = newPrice - baseItem.price;
          const newChangePct = (newChange / baseItem.price) * 100;
          return { ...item, price: newPrice, change: newChange, changePct: newChangePct };
        })
      );
    }, 1500);
    return () => clearInterval(interval);
  }, []);

  const formatPrice = (price: number) => {
    if (price >= 1000) return price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    return price.toFixed(2);
  };

  const renderTickerItem = (item: TickerItem, index: number) => (
    <span key={`${item.symbol}-${index}`} className="flex items-center gap-3 whitespace-nowrap">
      <span className="font-mono text-xs text-slate-300 font-medium">{item.symbol}</span>
      <span className="font-mono text-xs text-slate-100 tabular-nums">{formatPrice(item.price)}</span>
      <span className={`font-mono text-xs font-medium tabular-nums ${item.change >= 0 ? "text-emerald-400" : "text-rose-400"}`}>
        {item.change >= 0 ? "+" : ""}{item.changePct.toFixed(2)}%
      </span>
      <span className="text-slate-600 px-2">|</span>
    </span>
  );

  return (
    <div className="w-full bg-slate-900 border-b border-slate-800 overflow-hidden">
      <div className="flex items-center py-2">
        <motion.div
          animate={{ x: ["0%", "-50%"] }}
          transition={{ duration: 40, ease: "linear", repeat: Infinity }}
          className="flex items-center gap-6 min-w-max"
        >
          {/* First pass */}
          {items.map((item, i) => renderTickerItem(item, i))}
          {/* Second pass for seamless loop */}
          {items.map((item, i) => renderTickerItem(item, i + items.length))}
        </motion.div>
      </div>
    </div>
  );
}