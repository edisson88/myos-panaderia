import { useState } from "react";
import { Box, Toolbar } from "@mui/material";
import { Outlet } from "react-router-dom";
import Sidebar from "./Sidebar";
import Topbar from "./Topbar";

export default function AppLayout() {
    const [mobileOpen, setMobileOpen] = useState(false);

    const handleDrawerToggle = () => setMobileOpen((prev) => !prev);

    return (
        <Box sx={{ display: "flex", minHeight: "100vh", bgcolor: "#F8F7F5" }}>
            <Sidebar mobileOpen={mobileOpen} onClose={handleDrawerToggle} />
            <Topbar onMenuClick={handleDrawerToggle} />

            <Box
                component="main"
                sx={{
                    flexGrow: 1,
                    display: "flex",
                    flexDirection: "column",
                    minWidth: 0,
                }}
            >
                {/* Spacer below fixed AppBar */}
                <Toolbar />
                <Box sx={{ p: { xs: 2, sm: 3 }, flexGrow: 1 }}>
                    <Outlet />
                </Box>
            </Box>
        </Box>
    );
}