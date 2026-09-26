"use client";

import { useEffect, useState, useSyncExternalStore } from "react";
import { Search, Bell, User, RefreshCw } from "lucide-react";
import { getApiMode, setApiMode, checkBackendReachable } from "@/lib/api";

interface HeaderProps {
  currentSection?: string;
  eps?: number;
}

export function Header({ currentSection = "LIVE_OVERVIEW", eps = 142500 }: HeaderProps) {
  const mode = useSyncExternalStore(
    (callback) => {
      window.addEventListener("ulpf_api_mode_change", callback);
      return () => window.removeEventListener("ulpf_api_mode_change", callback);
    },
    () => getApiMode(),
    () => "LIVE"
  );
  const [backendOnline, setBackendOnline] = useState<boolean | null>(null);
  const [timeRange, setTimeRange] = useState<"15m" | "1h" | "24h">("1h");

  useEffect(() => {
    async function probe() {
      const ok = await checkBackendReachable();
      setBackendOnline(ok);
    }
    probe();

    const interval = setInterval(probe, 5000);
    return () => clearInterval(interval);
  }, []);

  const toggleMode = () => {
    const next = mode === "LIVE" ? "MOCK" : "LIVE";
    setApiMode(next);
  };

  return (
    <header className="fixed top-0 left-[250px] right-0 h-16 bg-white/95 backdrop-blur-md border-b border-[#E2E8F0] z-40 px-6 flex items-center justify-between">
      {/* Left: Breadcrumbs & Live EPS */}
      <div className="flex items-center gap-4">
        <nav className="flex items-center gap-1.5 text-[#64748B] font-mono text-[0.75rem] uppercase tracking-wider">
          <span className="hover:text-[#1E293B] transition-colors cursor-pointer">SOC</span>
          <span>/</span>
          <span className="hover:text-[#1E293B] transition-colors cursor-pointer">ULPF_CORE</span>
          <span>/</span>
          <span className="text-[#1E293B] font-semibold">{currentSection}</span>
        </nav>

        <div className="hidden xl:flex items-center gap-2 px-2.5 py-1 rounded bg-[#F0F3FF] border border-[#C5C6CA]/30">
          <span className="w-2 h-2 rounded-full bg-[#10B981] animate-pulse"></span>
          <span className="font-mono text-[0.75rem] text-[#1E293B] font-medium">
            INGESTING: {eps.toLocaleString("en-US")} EPS
          </span>
        </div>
      </div>

      {/* Right: Actions, Filters, Mode & User */}
      <div className="flex items-center gap-3">
        {/* Live vs Mock Mode Switcher */}
        <button
          onClick={toggleMode}
          title={`Click to switch to ${mode === "LIVE" ? "MOCK FIXTURE" : "LIVE BACKEND"} mode`}
          className={`flex items-center gap-1.5 px-2.5 py-1 rounded text-[0.75rem] font-mono font-semibold transition-all border shadow-sm ${mode === "LIVE"
              ? backendOnline
                ? "bg-emerald-50 text-emerald-700 border-emerald-300 hover:bg-emerald-100"
                : "bg-amber-50 text-amber-800 border-amber-300 hover:bg-amber-100"
              : "bg-sky-50 text-sky-700 border-sky-300 hover:bg-sky-100"
            }`}
        >
          <span
            className={`w-2 h-2 rounded-full ${mode === "LIVE"
                ? backendOnline
                  ? "bg-emerald-500 animate-pulse"
                  : "bg-amber-500"
                : "bg-sky-500"
              }`}
          />
          <span>
            {mode === "LIVE"
              ? backendOnline
                ? "LIVE API (8080)"
                : "LIVE API (UNREACHABLE)"
              : "FIXTURE MODE"}
          </span>
          <RefreshCw className="w-3 h-3 ml-0.5 opacity-60" />
        </button>

        {/* Time Filter */}
        <div className="hidden md:flex items-center bg-[#F0F3FF] border border-[#C5C6CA]/40 rounded px-1 py-0.5">
          {(["15m", "1h", "24h"] as const).map((t) => (
            <button
              key={t}
              onClick={() => setTimeRange(t)}
              className={`px-2 py-0.5 font-mono text-[0.75rem] rounded transition-colors ${timeRange === t
                  ? "bg-white text-[#1E293B] font-semibold shadow-[0_1px_2px_rgba(0,0,0,0.04)]"
                  : "text-[#64748B] hover:text-[#1E293B]"
                }`}
            >
              {t}
            </button>
          ))}
        </div>

        {/* Search Input */}
        <div className="relative hidden lg:block w-52">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#64748B]" />
          <input
            type="text"
            placeholder="Filter stream (regex, OCSF)..."
            className="w-full h-8 pl-8 pr-2.5 bg-[#F0F3FF] border border-[#C5C6CA]/40 rounded text-[#1E293B] text-[0.75rem] placeholder:text-[#64748B]/70 focus:outline-none focus:border-[#0284C7]"
          />
        </div>

        {/* Notifications */}
        <div className="relative flex items-center justify-center p-1.5 rounded text-[#64748B] hover:text-[#1E293B] hover:bg-[#E2E4E8] cursor-pointer">
          <Bell className="w-5 h-5" />
          <span className="absolute top-1 right-1 w-2 h-2 bg-[#FF5C5C] rounded-full ring-2 ring-white"></span>
        </div>

        {/* User Avatar */}
        <div className="w-8 h-8 rounded-full bg-[#1A1D20] text-white flex items-center justify-center font-medium shadow-sm">
          <User className="w-4 h-4 text-white" />
        </div>
      </div>
    </header>
  );
}
