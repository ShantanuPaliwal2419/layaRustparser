"use client";

import { useState } from "react";
import { MetricsResponse } from "@/lib/types";
import { Terminal, Copy, Check } from "lucide-react";

interface RestContractInspectorProps {
  metrics: MetricsResponse;
}

export function RestContractInspector({ metrics }: RestContractInspectorProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText("curl -s http://127.0.0.1:8080/metrics");
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <div className="flex flex-col bg-white p-4 rounded-xl border border-[#E2E8F0] shadow-sm justify-between">
      <div className="flex items-center justify-between pb-2">
        <div className="flex items-center gap-2">
          <Terminal className="w-4 h-4 text-[#0284C7]" />
          <span className="text-[1.125rem] text-[#1E293B] font-semibold">
            REST Contract Inspector
          </span>
        </div>
        <span className="font-mono text-[0.6875rem] px-2 py-0.5 rounded bg-[#F0F3FF] text-[#009768] font-semibold border border-emerald-200 uppercase">
          HTTP 200 OK
        </span>
      </div>

      <div className="bg-[#1A1D20] text-[#E7EEFF] p-3 rounded-lg font-mono text-[0.75rem] my-2 overflow-x-auto shadow-inner border border-[#313540]">
        <div className="flex items-center justify-between text-[#828589] pb-2 mb-2 border-b border-[#313540]/60">
          <span>{"// GET /metrics"}</span>
          <span className="text-[#4EDEA3]">live: true</span>
        </div>
        <pre className="leading-relaxed text-[0.75rem]">
          <span className="text-[#5BB8FE]">&quot;eps&quot;</span>:{" "}
          <span className="text-[#6FFBBE]">{metrics.eps}</span>,{"\n"}
          <span className="text-[#5BB8FE]">&quot;latency_p50_micros&quot;</span>:{" "}
          <span className="text-[#6FFBBE]">{metrics.latency_p50_micros}</span>,{"\n"}
          <span className="text-[#5BB8FE]">&quot;latency_p99_micros&quot;</span>:{" "}
          <span className="text-[#6FFBBE]">{metrics.latency_p99_micros}</span>,{"\n"}
          <span className="text-[#5BB8FE]">&quot;lru_hit_rate&quot;</span>:{" "}
          <span className="text-[#6FFBBE]">{metrics.lru_hit_rate}</span>,{"\n"}
          <span className="text-[#5BB8FE]">&quot;queue_depth&quot;</span>:{" "}
          <span className="text-[#6FFBBE]">{metrics.queue_depth}</span>,{"\n"}
          <span className="text-[#5BB8FE]">&quot;queue_capacity&quot;</span>:{" "}
          <span className="text-[#6FFBBE]">{metrics.queue_capacity}</span>,{"\n"}
          <span className="text-[#5BB8FE]">&quot;total_ingested&quot;</span>:{" "}
          <span className="text-[#6FFBBE]">{metrics.total_ingested}</span>,{"\n"}
          <span className="text-[#5BB8FE]">&quot;vendor_mix&quot;</span>:{" "}
          <span className="text-[#D8E3FB]">
            {JSON.stringify(metrics.vendor_mix)}
          </span>
          ,{"\n"}
          <span className="text-[#5BB8FE]">&quot;disposition_breakdown&quot;</span>:{" "}
          <span className="text-[#D8E3FB]">
            {JSON.stringify(metrics.disposition_breakdown)}
          </span>
          ,{"\n"}
          <span className="text-[#5BB8FE]">&quot;status&quot;</span>:{" "}
          <span className="text-[#93CCFF]">&quot;{metrics.status}&quot;</span>
        </pre>
      </div>

      <div className="flex items-center justify-between text-[#64748B] font-mono text-[0.75rem] pt-2 border-t border-[#F1F5F9]">
        <span className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-[#009768]"></span> Zero-Copy Deserialization
        </span>
        <button
          onClick={handleCopy}
          className="flex items-center gap-1 text-[#0284C7] hover:underline cursor-pointer"
        >
          {copied ? (
            <>
              <Check className="w-3.5 h-3.5 text-emerald-600" />
              <span className="text-emerald-600">Copied!</span>
            </>
          ) : (
            <>
              <Copy className="w-3.5 h-3.5" />
              <span>Copy Curl</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
}
