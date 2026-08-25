// web-app/src/pages/Produccion.tsx

import { useState } from "react";
import { Box, Tabs, Tab } from "@mui/material";
import ProductionDailyTab from "../modules/production/components/ProductionDailyTab";
import InventoryTab from "../modules/production/components/InventoryTab";
import ProductionConfigTab from "../modules/production/components/ProductionConfigTab";

export default function ProductionPage() {
  const [activeTab, setActiveTab] = useState(0);

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>

      {/* Tabs */}
      <Tabs
        value={activeTab}
        onChange={(_, newValue: number) => setActiveTab(newValue)}
        sx={{
          borderBottom: "1px solid #e1dfdd",
          "& .MuiTab-root": {
            fontSize: "0.8rem",
            fontWeight: 600,
            textTransform: "none",
            color: "#605e5c",
            minHeight: 40,
          },
          "& .Mui-selected": { color: "#7b3c1e" },
          "& .MuiTabs-indicator": { bgcolor: "#7b3c1e" },
        }}
      >
        <Tab label="Producción diaria" />
        <Tab label="Inventario" />
        <Tab label="Configuración" />
      </Tabs>

      {/* Contenido del tab activo */}
      {activeTab === 0 && <ProductionDailyTab />}
      {activeTab === 1 && <InventoryTab />}
      {activeTab === 2 && <ProductionConfigTab />}

    </Box>
  );
}