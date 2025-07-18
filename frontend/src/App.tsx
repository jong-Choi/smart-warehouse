import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import RootLayout from "@components/layout/RootLayout";
import FactoryLayout from "@components/factory/layout/FactoryLayout";
import DashboardLayout from "@components/dashboard/layout/DashboardLayout";
import FactoryPage from "@pages/factory/FactoryPage";
import DashboardHomePage from "@pages/dashboard/home/DashboardHomePage";

import DashboardParcelsPage from "@pages/dashboard/parcels/DashboardParcelsPage";
import DashboardParcelsListPage from "@pages/dashboard/parcels/DashboardParcelsListPage";
import DashboardParcelsInboundPage from "@pages/dashboard/parcels/DashboardParcelsInboundPage";
import DashboardParcelsOutboundPage from "@pages/dashboard/parcels/DashboardParcelsOutboundPage";
import DashboardLocationPage from "@pages/dashboard/location/DashboardLocationPage";
import DashboardLocationListPage from "@pages/dashboard/location/DashboardLocationListPage";
import DashboardUnloadingPage from "@pages/dashboard/home/DashboardUnloadingPage";
import { DashboardWorkersPage } from "@pages/dashboard/workers/DashboardWorkersPage";
import { DashboardWorkerDetailPage } from "@pages/dashboard/workers/detail/DashboardWorkerDetailPage";

function App() {
  return (
    <Router>
      <Routes>
        {/* Root route with redirect */}
        <Route path="/" element={<Navigate to="/factory" replace />} />

        {/* Root layout with tab switcher */}
        <Route element={<RootLayout />}>
          {/* Factory routes */}
          <Route element={<FactoryLayout />}>
            <Route path="/factory" element={<FactoryPage />} />
          </Route>

          {/* Dashboard routes */}
          <Route
            path="/dashboard"
            element={<Navigate to="/dashboard/realtime/overview" replace />}
          />
          <Route element={<DashboardLayout />}>
            <Route
              path="/dashboard/realtime/overview"
              element={<DashboardHomePage />}
            />
            <Route
              path="/dashboard/realtime/waybill"
              element={<DashboardUnloadingPage />}
            />
            <Route
              path="/dashboard/realtime/workers"
              element={<DashboardWorkersPage />}
            />
            <Route
              path="/dashboard/workers/:id"
              element={<DashboardWorkerDetailPage />}
            />
            <Route
              path="/dashboard/parcels"
              element={<DashboardParcelsPage />}
            />
            <Route
              path="/dashboard/parcels/list"
              element={<DashboardParcelsListPage />}
            />
            <Route
              path="/dashboard/parcels/inbound"
              element={<DashboardParcelsInboundPage />}
            />
            <Route
              path="/dashboard/parcels/outbound"
              element={<DashboardParcelsOutboundPage />}
            />
            <Route
              path="/dashboard/location"
              element={<DashboardLocationPage />}
            />
            <Route
              path="/dashboard/location/list"
              element={<DashboardLocationListPage />}
            />
          </Route>
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
