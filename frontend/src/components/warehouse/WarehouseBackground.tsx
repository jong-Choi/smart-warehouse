import { useLocation } from "react-router-dom";
import { useWarehouseStore } from "@/stores/warehouseStore";

import backgroundFullSvg from "@assets/backgrounds/background-full.svg";
import Warehouse2D from "@components/warehouse/warehouse2d/Warehouse2D";
import LeftController from "@components/warehouse/controllers/LeftController";
import RightController from "@components/warehouse/controllers/RightController";
import TutorialModal from "@components/warehouse/tutorials/TutorialModal";

function WarehouseBackground() {
  const location = useLocation();
  const isWarehouse = location.pathname.startsWith("/warehouse");

  // warehouseStore에서 isRunning 상태 가져오기
  const { isTutorialShown, setIsTutorialShown } = useWarehouseStore([
    "isTutorialShown",
    "setIsTutorialShown",
  ]);

  return (
    <div
      className={`absolute inset-0 transition-opacity duration-300 overflow-hidden ${
        isWarehouse
          ? "opacity-100 pointer-events-auto"
          : "opacity-0 pointer-events-none hidden"
      }`}
    >
      <div className="relative w-full h-full">
        {/* 배경 SVG - 고정 크기로 설정 */}
        <img
          src={backgroundFullSvg}
          alt="Background"
          className="absolute top-[calc(50%-60px)] left-[calc(50%+20px)] transform -translate-x-1/2 -translate-y-1/2 w-[1640px] h-[1640px] max-w-none max-h-none z-0 pointer-events-none"
        />

        {/* Warehouse 컨텐츠 */}
        <div className="relative w-full h-full">
          {/* Warehouse2D - 중앙에 배치하되 컨트롤러 공간 확보 */}
          <div className="flex justify-center items-center w-full h-full">
            <div className="relative z-10">
              <Warehouse2D />
            </div>
          </div>

          {/* 좌측 컨트롤러 - z-index를 높게 설정 */}
          <div className="absolute left-4 top-4 z-50 pointer-events-auto">
            <LeftController />
          </div>

          {/* 우측 컨트롤러 - z-index를 높게 설정 */}
          <div className="absolute right-4 top-4 z-50 pointer-events-auto">
            <RightController />
          </div>
        </div>
      </div>

      {/* 튜토리얼 모달 - isRunning이 false일 때만 표시 */}
      {isWarehouse && isTutorialShown && (
        <TutorialModal
          isOpen={true}
          onClose={() => {
            setIsTutorialShown(false);
          }}
        />
      )}
    </div>
  );
}

export default WarehouseBackground;
