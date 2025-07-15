import { useLocation } from "react-router-dom";
import Warehouse2D from "../../Warehouse2D";
import backgroundFullSvg from "@assets/backgrounds/background-full.svg";

function FactoryBackground() {
  const location = useLocation();
  const isFactory = location.pathname.startsWith("/factory");

  return (
    <div
      className={`absolute inset-0 transition-opacity duration-300  overflow-hidden ${
        isFactory
          ? "opacity-100 pointer-events-auto"
          : "opacity-0 pointer-events-none hidden"
      }`}
    >
      <div className="relative w-full h-full flex justify-center items-center">
        {/* 배경 SVG - 고정 크기로 설정 */}
        <img
          src={backgroundFullSvg}
          alt="Background"
          className="absolute top-[calc(50%-60px)] left-[calc(50%+20px)] transform -translate-x-1/2 -translate-y-1/2 w-[1640px] h-[1640px] max-w-none max-h-none z-0 pointer-events-none"
        />

        {/* Factory 컨텐츠 */}
        <div className="relative z-10 w-full h-full flex justify-center items-center">
          <Warehouse2D />
        </div>
      </div>
    </div>
  );
}

export default FactoryBackground;
