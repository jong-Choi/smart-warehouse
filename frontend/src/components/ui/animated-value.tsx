import { motion, useMotionValue, useTransform, animate } from "framer-motion";
import { useEffect, useRef } from "react";

// 숫자 카운트업 애니메이션 컴포넌트
export function AnimatedNumber({
  value,
  format = (val: number) => val.toFixed(2), // 기본값을 소수점 2자리로
  className = "",
}: {
  value: number;
  format?: (value: number) => string;
  className?: string;
}) {
  const count = useMotionValue(value);
  const formatted = useTransform(count, (latest) =>
    format(Number(latest.toFixed(2)))
  );
  const prevValueRef = useRef(value);

  useEffect(() => {
    const controls = animate(count, value, {
      duration: 0.5,
      ease: "easeOut",
    });
    return controls.stop;
  }, [value, count]);

  // 변화량 계산
  const change = value - prevValueRef.current;
  const isPositive = change > 0;
  const isNegative = change < 0;

  // 이전 값 업데이트
  useEffect(() => {
    prevValueRef.current = value;
  }, [value]);

  return (
    <div className="relative inline-block">
      <motion.span className={className}>{formatted}</motion.span>
      {(isPositive || isNegative) && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.6 }}
          exit={{ opacity: 0 }}
          transition={{
            duration: 0,
          }}
          className={`absolute -bottom-3 right-0 text-xs font-thin ${
            isPositive ? "text-slate-600" : "text-stone-600"
          }`}
          style={{ opacity: 0.3 }}
        >
          {isPositive ? "+" : ""}
          {change.toFixed(2)}
        </motion.div>
      )}
    </div>
  );
}
