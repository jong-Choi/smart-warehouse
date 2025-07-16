import { useNavigate, useLocation } from "react-router-dom";
import { motion, useAnimation } from "framer-motion";
import { useEffect } from "react";
import { cn } from "../../lib/utils";

interface TabSwitcherProps {
  className?: string;
}

export function TabSwitcher({ className = "" }: TabSwitcherProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const controls = useAnimation();

  const isFactory = location.pathname.startsWith("/factory");
  const isDashboard = location.pathname.startsWith("/dashboard");

  useEffect(() => {
    const animateIndicator = async () => {
      await controls.start({
        left: isFactory ? "4px" : "100px",
        scaleX: [1, 0.8, 0.9, 1],
        scaleY: [1, 0.98, 0.99, 1],
        transition: {
          type: "tween",
          ease: [0.1, 0.2, 0.3, 0.94],
          duration: 0.8,
        },
      });
    };

    animateIndicator();
  }, [isFactory, controls]);

  return (
    <div
      className={cn(
        "flex justify-center items-center py-4 px-4 w-fit absolute top-0 left-[50%] translate-x-[-50%]",
        className
      )}
      style={{ zIndex: 100 }}
    >
      {/* 알약 모양 컨테이너 */}
      <motion.div
        className="relative bg-gray-100 rounded-full p-1 shadow-lg border border-gray-200"
        animate={{
          x: isFactory ? 0 : "calc(50vw - 150px)",
        }}
        initial={{
          x: isFactory ? 0 : "calc(50vw - 150px)",
        }}
        transition={{
          type: "tween",
          ease: [0.1, 0.2, 0.3, 0.94],
          duration: 0.8,
        }}
      >
        {/* 움직이는 원형 인디케이터 */}
        <motion.div
          className="absolute top-1 w-24 h-10 bg-slate-800 rounded-full shadow-lg"
          animate={controls}
          initial={{
            left: isFactory ? "4px" : "100px",
            scaleX: 1,
          }}
        />

        {/* 탭 버튼들 */}
        <div className="relative flex">
          <button
            onClick={() => navigate("/factory")}
            className={`
              relative z-10 w-24 h-10 flex items-center justify-center text-sm font-semibold rounded-full transition-all duration-200 cursor-pointer
              ${isFactory ? "text-white" : "text-gray-600 hover:text-gray-800"}
            `}
          >
            🏭 공장
          </button>
          <button
            onClick={() => navigate("/dashboard")}
            className={`
              relative z-10 w-24 h-10 flex items-center justify-center text-sm font-semibold rounded-full transition-all duration-200 cursor-pointer
              ${
                isDashboard ? "text-white" : "text-gray-600 hover:text-gray-800"
              }
            `}
          >
            📊 대시보드
          </button>
        </div>
      </motion.div>
    </div>
  );
}
