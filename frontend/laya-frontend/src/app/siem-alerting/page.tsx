"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { AppShell } from "@/components/layout/AppShell";
import { SiemKpiRibbon } from "@/components/siem/SiemKpiRibbon";
import { IncidentQueue } from "@/components/siem/IncidentQueue";
import { ForensicWorkspace } from "@/components/siem/ForensicWorkspace";
import { getAlerts } from "@/lib/api";
import { AlertItem } from "@/lib/types";
import { mockAlerts } from "@/lib/mock-data";
import { Zap } from "lucide-react";

function SiemAlertingContent() {
  const searchParams = useSearchParams();
  const selectedParam = searchParams.get("selected");

  const [alerts, setAlerts] = useState<AlertItem[]>(mockAlerts);
  const [selectedAlert, setSelectedAlert] = useState<AlertItem | null>(null);

  useEffect(() => {
    let ignore = false;

    async function loadData() {
      try {
        const alertsRes = await getAlerts();
        if (ignore) return;
        setAlerts(alertsRes.data);

        // If no alert selected yet, default to the one from query param or first critical alert
        setSelectedAlert((current) => {
          if (current) return current;
          if (selectedParam) {
            const found = alertsRes.data.find((a) => a.id === selectedParam);
            if (found) return found;
          }
          return alertsRes.data[0] || null;
        });
      } catch {
        // Keep last known
      }
    }

    loadData();
    const interval = setInterval(loadData, 1000);
    return () => {
      ignore = true;
      clearInterval(interval);
    };
  }, [selectedParam]);

  return (
    <div className="flex flex-col w-full gap-5">
      {/* Operational Breadcrumbs & Real-time Poll Ribbon */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 bg-white p-4 rounded-xl border border-[#E2E8F0] shadow-sm">
        <div className="flex items-center gap-1.5 text-[#64748B] font-mono text-[0.75rem]">
          <span className="hover:text-[#1E293B] transition-colors cursor-pointer">
            SOC
          </span>
          <span>/</span>
          <span className="hover:text-[#1E293B] transition-colors cursor-pointer">
            Threat Operations
          </span>
          <span>/</span>
          <span className="text-[#1E293B] font-semibold">
            SIEM Security Alerts &amp; Incident Triage Queue
          </span>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#F0F3FF] border border-[#CBD5E1] shadow-sm">
            <span className="inline-block w-2 h-2 rounded-full bg-[#009768] animate-pulse"></span>
            <span className="font-mono text-[0.75rem] text-[#1E293B]">
              Endpoint: <code className="font-semibold text-[#006398]">GET /alerts</code>{" "}
              (Polling 1s)
            </span>
          </div>
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#F0F3FF] border border-[#CBD5E1] shadow-sm">
            <Zap className="w-3.5 h-3.5 text-[#006398]" />
            <span className="font-mono text-[0.75rem] text-[#1E293B]">
              SOAR: <span className="text-[#009768] font-semibold">Active</span>
            </span>
          </div>
        </div>
      </div>

      {/* KPI Triage Ribbon */}
      <SiemKpiRibbon alerts={alerts} />

      {/* Incident Operations Queue Table */}
      <IncidentQueue
        alerts={alerts}
        selectedId={selectedAlert?.id ?? null}
        onSelect={(alert) => setSelectedAlert(alert)}
      />

      {/* Detailed Forensic Workspace Section */}
      <ForensicWorkspace selectedAlert={selectedAlert} />
    </div>
  );
}

export default function SiemAlertingPage() {
  return (
    <AppShell currentSection="SIEM_ALERTS">
      <Suspense
        fallback={
          <div className="p-8 text-center text-[#64748B] font-mono text-[0.875rem]">
            Loading SIEM alerts...
          </div>
        }
      >
        <SiemAlertingContent />
      </Suspense>
    </AppShell>
  );
}
