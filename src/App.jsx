import { useState, useMemo, useCallback } from "react";
import { villages as initialVillages, CENTRAL_DEPOT } from "./data/mockData";
import { getDispatchPriority } from "./utils/priorityEngine";
import DashboardHeader from "./components/DashboardHeader";
import Sidebar from "./components/Sidebar";
import MapView from "./components/MapView";
import DispatchToast from "./components/DispatchToast";

const TANKER_CAPACITY = 5000; // liters per dispatch

export default function App() {
  const [villageData, setVillageData] = useState(initialVillages);
  const [depotWater, setDepotWater] = useState(CENTRAL_DEPOT.current_available_liters);
  const [toast, setToast] = useState(null);
  const [selectedVillageId, setSelectedVillageId] = useState(null);

  // ---------- Enriched village list (sorted by priority) ----------
  const enrichedVillages = useMemo(() => {
    return villageData
      .map((v) => {
        const { priorityScore, wsi, distanceKm } = getDispatchPriority(v);
        return { ...v, priorityScore, wsi, distanceKm };
      })
      .sort((a, b) => b.priorityScore - a.priorityScore);
  }, [villageData]);

  // ---------- Dashboard summary stats ----------
  const summaryStats = useMemo(() => {
    const criticalVillages = enrichedVillages.filter(
      (v) => v.wsi.category === "CRITICAL"
    );
    const stressedVillages = enrichedVillages.filter(
      (v) => v.wsi.category === "STRESSED"
    );
    const atRiskPop = [...criticalVillages, ...stressedVillages].reduce(
      (sum, v) => sum + v.demographics.population,
      0
    );
    const totalPop = enrichedVillages.reduce(
      (sum, v) => sum + v.demographics.population,
      0
    );
    return {
      criticalCount: criticalVillages.length,
      stressedCount: stressedVillages.length,
      atRiskPopulation: atRiskPop,
      totalPopulation: totalPop,
      depotWater,
      totalVillages: enrichedVillages.length,
    };
  }, [enrichedVillages, depotWater]);

  // ---------- Dispatch tanker handler ----------
  const handleDispatch = useCallback(
    (villageId) => {
      if (depotWater < TANKER_CAPACITY) {
        setToast({
          type: "error",
          message: "Insufficient depot water! Cannot dispatch tanker.",
        });
        setTimeout(() => setToast(null), 3000);
        return;
      }

      setVillageData((prev) =>
        prev.map((v) =>
          v.id === villageId
            ? {
              ...v,
              status: {
                ...v.status,
                current_available_liters:
                  v.status.current_available_liters + TANKER_CAPACITY,
              },
            }
            : v
        )
      );
      setDepotWater((prev) => prev - TANKER_CAPACITY);

      const village = villageData.find((v) => v.id === villageId);
      setToast({
        type: "success",
        message: `Tanker dispatched to ${village?.name}! (+${TANKER_CAPACITY.toLocaleString()}L)`,
      });
      setTimeout(() => setToast(null), 3500);
    },
    [depotWater, villageData]
  );

  return (
    <div className="h-screen flex flex-col bg-[var(--color-gov-900)] overflow-hidden">
      {/* ---- Header ---- */}
      <DashboardHeader stats={summaryStats} />

      {/* ---- Main Content ---- */}
      <div className="flex flex-1 min-h-0">
        {/* ---- Sidebar ---- */}
        <Sidebar
          villages={enrichedVillages}
          onDispatch={handleDispatch}
          depotWater={depotWater}
          tankerCapacity={TANKER_CAPACITY}
          selectedVillageId={selectedVillageId}
          onSelectVillage={setSelectedVillageId}
        />

        {/* ---- Map ---- */}
        <main className="flex-1 p-3 min-h-0">
          <MapView
            villages={enrichedVillages}
            depot={CENTRAL_DEPOT}
            depotWater={depotWater}
            onDispatch={handleDispatch}
            tankerCapacity={TANKER_CAPACITY}
            selectedVillageId={selectedVillageId}
            onSelectVillage={setSelectedVillageId}
          />
        </main>
      </div>

      {/* ---- Toast Notification ---- */}
      {toast && <DispatchToast toast={toast} />}
    </div>
  );
}
