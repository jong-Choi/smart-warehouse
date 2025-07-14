import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import FactoryLayout from "@components/factory/layout/FactoryLayout";
import DashboardLayout from "@components/dashboard/layout/DashboardLayout";
import FactoryPage from "@pages/factory/FactoryPage";
import DashboardHomePage from "@pages/dashboard/home/DashboardHomePage";
import DashboardParcelsPage from "@pages/dashboard/parcels/DashboardParcelsPage";

function App() {
  return (
    <Router>
      <Routes>
        {/* Root route with redirect */}
        <Route path="/" element={<Navigate to="/factory" replace />} />

        {/* Factory routes */}
        <Route element={<FactoryLayout />}>
          <Route path="/factory" element={<FactoryPage />} />
        </Route>

        {/* Dashboard routes */}
        <Route
          path="/dashboard"
          element={<Navigate to="/dashboard/home" replace />}
        />
        <Route element={<DashboardLayout />}>
          <Route path="/dashboard/home" element={<DashboardHomePage />} />
          <Route path="/dashboard/parcels" element={<DashboardParcelsPage />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
