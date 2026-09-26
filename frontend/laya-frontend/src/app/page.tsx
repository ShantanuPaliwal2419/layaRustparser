"use client";

import { useEffect, useState, useCallback } from "react";
import { AppShell } from "@/components/layout/AppShell";
import { CommandRibbon } from "@/components/dashboard/CommandRibbon";
import { KpiTelemetryCards } from "@/components/dashboard/KpiTelemetryCards";
import { PerformanceChart } from "@/components/dashboard/PerformanceChart";
import { RestContractInspector } from "@/components/dashboard/RestContractInspector";
import { AlertFeed } from "@/components/dashboard/AlertFeed";
import { OcsfStreamTable } from "@/components/dashboard/OcsfStreamTable";
import { getMetrics, getAlerts, getBlockRecords } from "@/lib/api";
import {
  MetricsResponse,
  AlertItem,
  StoredRecordItem,
  TimeSeriesPoint,
} from "@/lib/types";
import { mockMetrics, mockAlerts, mockRecords } from "@/lib/mock-data";

export default function AnalystDashboardPage() {
  const [metrics, setMetrics] = useState<MetricsResponse>(mockMetrics);
  const [alerts, setAlerts] = useState<AlertItem[]>(mockAlerts);
  const [records, setRecords] = useState<StoredRecordItem[]>(mockRecords);
  const [isLive, setIsLive] = useState<boolean>(true);
  const [isPolling] = useState<boolean>(true);
  const [showJsonInspector, setShowJsonInspector] = useState<boolean>(true);

  // Time series buffer for live SVG performance chart
  const [history, setHistory] = useState<TimeSeriesPoint[]>([
    { time: "-60s", eps: 141000, latency_p50: 1.35 },
    { time: "-50s", eps: 141500, latency_p50: 1.3 },
    { time: "-40s", eps: 142000, latency_p50: 1.34 },
    { time: "-30s", eps: 141800, latency_p50: 1.28 },
    { time: "-20s", eps: 142200, latency_p50: 1.26 },
    { time: "-10s", eps: 142400, latency_p50: 1.29 },
    { time: "0s", eps: 142500, latency_p50: 1.28 },
  ]);

  const pollData = useCallback(async () => {
    try {
      const [metricsRes, alertsRes, recordsRes] = await Promise.all([
        getMetrics(),
        getAlerts(),
        getBlockRecords(1, { limit: 10 }),
      ]);

      setMetrics(metricsRes.data);
      setIsLive(metricsRes.isLive);
      setAlerts(alertsRes.data);
      if (recordsRes.data && recordsRes.data.length > 0) {
        setRecords(recordsRes.data);
      }

      // Append new time series point from actual response
      const newPoint: TimeSeriesPoint = {
        time: new Date().toLocaleTimeString().slice(-5),
        eps: metricsRes.data.eps,
        latency_p50: metricsRes.data.latency_p50_micros,
      };

      setHistory((prev) => {
        const next = [...prev.slice(-15), newPoint];
        return next;
      });
    } catch {
      // In case of network fault, keep last known or fixture
    }
  }, []);

  // 1-second polling requirement (Issue #13 and Section 15 of AGENTS.md)
  useEffect(() => {
    let ignore = false;

    async function initialPoll() {
      await pollData();
    }
    initialPoll();

    if (!isPolling) return;
    const interval = setInterval(() => {
      if (!ignore) {
        pollData();
      }
    }, 1000);

    return () => {
      ignore = true;
      clearInterval(interval);
    };
  }, [pollData, isPolling]);

  const epsHistory = history.map((h) => h.eps);

  return (
    <AppShell currentSection="LIVE_STREAM" eps={metrics.eps}>
      <div className="flex flex-col w-full gap-5">
        {/* Top Command & Telemetry Ribbon */}
        <CommandRibbon
          onSync={pollData}
          isPolling={isPolling}
          isLive={isLive}
        />

        {/* 4 KPI Telemetry Cards */}
        <KpiTelemetryCards metrics={metrics} epsHistory={epsHistory} />

        {/* Primary Visual Panel: Live Stream Latency & Throughput Profile + REST Inspector */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
          <div className={showJsonInspector ? "lg:col-span-8" : "lg:col-span-12"}>
            <PerformanceChart
              history={history}
              onToggleJson={() => setShowJsonInspector((prev) => !prev)}
              showJson={showJsonInspector}
            />
          </div>

          {showJsonInspector && (
            <div className="lg:col-span-4">
              <RestContractInspector metrics={metrics} />
            </div>
          )}
        </div>

        {/* Active Security Alerts Feed (GET /alerts) */}
        <AlertFeed alerts={alerts} onRefresh={pollData} />

        {/* Real-Time Ingested Events Stream Table (OCSF Canonical) */}
        <OcsfStreamTable records={records} />
      </div>
    </AppShell>
  );
}
