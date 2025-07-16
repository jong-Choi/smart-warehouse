import { Outlet, useLocation } from "react-router-dom";
import { TabSwitcher } from "@components/ui/TabSwitcher";
import FactoryBackground from "../factory/FactoryBackground";

function RootLayout() {
  const location = useLocation();
  const isFactory = location.pathname.startsWith("/factory");
  // const isDashboard = location.pathname.startsWith("/dashboard");

  return (
    <div>
      <div
        className={`h-screen flex flex-col  ${
          isFactory
            ? "bg-slate-200 duration-700 transition-colors "
            : "bg-white"
        }`}
      >
        <TabSwitcher />
        {/* Factory 백그라운드 - 공장일 때만 표시 */}
        <FactoryBackground />
        <Outlet />
      </div>
    </div>
  );
}

export default RootLayout;
