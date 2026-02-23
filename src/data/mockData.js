// ============================================================
// Mock Data: 10 Villages across Maharashtra's drought-prone belt
// ============================================================

export const CENTRAL_DEPOT = {
    name: "Central Water Depot – Solapur",
    coords: { lat: 17.6599, lng: 75.9064 },
    total_capacity_liters: 500000,
    current_available_liters: 500000,
};

export const villages = [
    {
        id: "VLG-001",
        name: "Pandharpur",
        coords: { lat: 17.6783, lng: 75.3269 },
        metrics: {
            rainfall_avg_10yr: 750,
            rainfall_current: 280,
            groundwater_depth: 58,
            soil_moisture: 8,
        },
        demographics: { population: 12400, livestock: 3200 },
        status: { storage_capacity_liters: 80000, current_available_liters: 12000 },
    },
    {
        id: "VLG-002",
        name: "Mangalvedha",
        coords: { lat: 17.5206, lng: 75.4684 },
        metrics: {
            rainfall_avg_10yr: 700,
            rainfall_current: 310,
            groundwater_depth: 52,
            soil_moisture: 10,
        },
        demographics: { population: 8900, livestock: 2100 },
        status: { storage_capacity_liters: 60000, current_available_liters: 8500 },
    },
    {
        id: "VLG-003",
        name: "Mohol",
        coords: { lat: 17.8144, lng: 75.6608 },
        metrics: {
            rainfall_avg_10yr: 680,
            rainfall_current: 400,
            groundwater_depth: 44,
            soil_moisture: 15,
        },
        demographics: { population: 6200, livestock: 1800 },
        status: { storage_capacity_liters: 50000, current_available_liters: 22000 },
    },
    {
        id: "VLG-004",
        name: "Barshi",
        coords: { lat: 18.2333, lng: 75.6917 },
        metrics: {
            rainfall_avg_10yr: 720,
            rainfall_current: 250,
            groundwater_depth: 62,
            soil_moisture: 6,
        },
        demographics: { population: 15800, livestock: 4200 },
        status: { storage_capacity_liters: 100000, current_available_liters: 9800 },
    },
    {
        id: "VLG-005",
        name: "Karmala",
        coords: { lat: 18.4083, lng: 75.1917 },
        metrics: {
            rainfall_avg_10yr: 650,
            rainfall_current: 380,
            groundwater_depth: 48,
            soil_moisture: 14,
        },
        demographics: { population: 7400, livestock: 2600 },
        status: { storage_capacity_liters: 55000, current_available_liters: 18000 },
    },
    {
        id: "VLG-006",
        name: "Madha",
        coords: { lat: 18.0333, lng: 75.5167 },
        metrics: {
            rainfall_avg_10yr: 690,
            rainfall_current: 520,
            groundwater_depth: 35,
            soil_moisture: 22,
        },
        demographics: { population: 5100, livestock: 1400 },
        status: { storage_capacity_liters: 45000, current_available_liters: 30000 },
    },
    {
        id: "VLG-007",
        name: "Malshiras",
        coords: { lat: 17.8456, lng: 75.1319 },
        metrics: {
            rainfall_avg_10yr: 710,
            rainfall_current: 290,
            groundwater_depth: 55,
            soil_moisture: 9,
        },
        demographics: { population: 10200, livestock: 3800 },
        status: { storage_capacity_liters: 70000, current_available_liters: 11000 },
    },
    {
        id: "VLG-008",
        name: "Sangola",
        coords: { lat: 17.4378, lng: 75.1942 },
        metrics: {
            rainfall_avg_10yr: 600,
            rainfall_current: 180,
            groundwater_depth: 68,
            soil_moisture: 5,
        },
        demographics: { population: 9600, livestock: 3500 },
        status: { storage_capacity_liters: 65000, current_available_liters: 5200 },
    },
    {
        id: "VLG-009",
        name: "Akkalkot",
        coords: { lat: 17.5333, lng: 76.2000 },
        metrics: {
            rainfall_avg_10yr: 740,
            rainfall_current: 450,
            groundwater_depth: 38,
            soil_moisture: 18,
        },
        demographics: { population: 11300, livestock: 2900 },
        status: { storage_capacity_liters: 75000, current_available_liters: 35000 },
    },
    {
        id: "VLG-010",
        name: "Tuljapur",
        coords: { lat: 18.0125, lng: 76.1378 },
        metrics: {
            rainfall_avg_10yr: 780,
            rainfall_current: 500,
            groundwater_depth: 32,
            soil_moisture: 25,
        },
        demographics: { population: 8200, livestock: 2000 },
        status: { storage_capacity_liters: 60000, current_available_liters: 40000 },
    },
];
