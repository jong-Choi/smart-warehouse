import { Outlet, useLocation } from "react-router-dom";
import { TabSwitcher } from "../ui/TabSwitcher";
import FactoryBackground from "../factory/FactoryBackground";

function RootLayout() {
  const location = useLocation();
  const isFactory = location.pathname.startsWith("/factory");
  // const isDashboard = location.pathname.startsWith("/dashboard");

  return (
    <div
      className={`h-screen flex flex-col  ${
        isFactory ? "bg-slate-200 duration-700 transition-colors " : "bg-white"
      }`}
    >
      {isFactory && <FactoryBackground />}
      {/* 상단 탭 스위처 */}
      <TabSwitcher />
      {/* 메인 컨텐츠 영역 */}
      <div className="flex-1 relative overflow-hidden">
        {/* Factory 백그라운드 - 공장일 때만 표시 */}

        {/* 현재 라우트 컨텐츠 */}
        <div className="relative z-20 w-full h-full">
          <Outlet />
        </div>
      </div>
    </div>
  );
}

export default RootLayout;
