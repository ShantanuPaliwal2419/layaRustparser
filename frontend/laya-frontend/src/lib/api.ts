import {
  MetricsResponse,
  AlertItem,
  StoredRecordItem,
  BlockRecordsResponse,
  BlockItem,
} from "./types";
import { mockMetrics, mockAlerts, mockRecords } from "./mock-data";

const API_BASE = "http://127.0.0.1:8080";

export type ApiMode = "LIVE" | "MOCK";

// Global mode state stored in memory and local storage
let currentMode: ApiMode = "LIVE";

export function getApiMode(): ApiMode {
  if (typeof window !== "undefined") {
    const saved = localStorage.getItem("ulpf_api_mode") as ApiMode | null;
    if (saved === "LIVE" || saved === "MOCK") {
      currentMode = saved;
    }
  }
  return currentMode;
}

export function setApiMode(mode: ApiMode) {
  currentMode = mode;
  if (typeof window !== "undefined") {
    localStorage.setItem("ulpf_api_mode", mode);
    window.dispatchEvent(new Event("ulpf_api_mode_change"));
  }
}

/**
 * Checks if the ULPF backend is responding on API_BASE
 */
export async function checkBackendReachable(): Promise<boolean> {
  try {
    const res = await fetch(`${API_BASE}/metrics`, {
      method: "GET",
      cache: "no-store",
      headers: { Accept: "application/json" },
      signal: AbortSignal.timeout(1500),
    });
    return res.ok;
  } catch {
    return false;
  }
}

/**
 * Fetches metrics from GET /metrics.
 * If backend fails or mode is MOCK, falls back to fixture data.
 */
export async function getMetrics(): Promise<{
  data: MetricsResponse;
  isLive: boolean;
}> {
  const mode = getApiMode();

  if (mode === "LIVE") {
    try {
      const res = await fetch(`${API_BASE}/metrics`, {
        method: "GET",
        cache: "no-store",
        headers: { Accept: "application/json" },
        signal: AbortSignal.timeout(2000),
      });

      if (res.ok) {
        const json: MetricsResponse = await res.json();
        return { data: json, isLive: true };
      }
    } catch {
      // Fallback below
    }
  }

  return { data: mockMetrics, isLive: false };
}

/**
 * Fetches active alerts from GET /alerts.
 */
export async function getAlerts(): Promise<{
  data: AlertItem[];
  isLive: boolean;
}> {
  const mode = getApiMode();

  if (mode === "LIVE") {
    try {
      const res = await fetch(`${API_BASE}/alerts`, {
        method: "GET",
        cache: "no-store",
        headers: { Accept: "application/json" },
        signal: AbortSignal.timeout(2000),
      });

      if (res.ok) {
        const json: AlertItem[] = await res.json();
        return { data: json, isLive: true };
      }
    } catch {
      // Fallback below
    }
  }

  return { data: mockAlerts, isLive: false };
}

/**
 * Fetches stored records for a block from GET /blocks/:id/records.
 */
export async function getBlockRecords(
  blockId: number = 1,
  params?: {
    offset?: number;
    limit?: number;
    vendor?: string;
    disposition?: string;
  }
): Promise<{ data: StoredRecordItem[]; total: number; isLive: boolean }> {
  const mode = getApiMode();

  if (mode === "LIVE") {
    try {
      const query = new URLSearchParams();
      if (params?.offset !== undefined) query.set("offset", params.offset.toString());
      if (params?.limit !== undefined) query.set("limit", params.limit.toString());
      if (params?.vendor) query.set("vendor", params.vendor);
      if (params?.disposition) query.set("disposition", params.disposition);

      const qs = query.toString() ? `?${query.toString()}` : "";
      const res = await fetch(`${API_BASE}/blocks/${blockId}/records${qs}`, {
        method: "GET",
        cache: "no-store",
        headers: { Accept: "application/json" },
        signal: AbortSignal.timeout(3000),
      });

      if (res.ok) {
        const json: BlockRecordsResponse = await res.json();
        return {
          data: json.records,
          total: json.total_records_in_block,
          isLive: true,
        };
      }
    } catch {
      // Fallback below
    }
  }

  return {
    data: mockRecords,
    total: mockRecords.length,
    isLive: false,
  };
}

/**
 * Fetches blocks ledger from GET /blocks.
 */
export async function getBlocks(): Promise<{
  data: BlockItem[];
  isLive: boolean;
}> {
  const mode = getApiMode();

  if (mode === "LIVE") {
    try {
      const res = await fetch(`${API_BASE}/blocks`, {
        method: "GET",
        cache: "no-store",
        headers: { Accept: "application/json" },
        signal: AbortSignal.timeout(2000),
      });

      if (res.ok) {
        const json: BlockItem[] = await res.json();
        return { data: json, isLive: true };
      }
    } catch {
      // Fallback below
    }
  }

  return {
    data: [
      {
        block_id: 0,
        timestamp: 1789984478063,
        leaf_count: 1000,
        merkle_root:
          "e12dfacf15b6cc84fcedf91aeb3119f7d8c7a638e2c7e9541b9bb02d12833b72",
        parquet_file: "block_00000.parquet",
        status: "FAIL",
        size_bytes: 345163,
        file_exists: true,
      },
      {
        block_id: 1,
        timestamp: 1789984478081,
        leaf_count: 1000,
        merkle_root:
          "398e59a6304ea9fa83b3d9eb5f0739bf081a01ce4d34e30e5c320040fd9e69a8",
        parquet_file: "block_00001.parquet",
        status: "PASS",
        size_bytes: 425310,
        file_exists: true,
      },
    ],
    isLive: false,
  };
}
