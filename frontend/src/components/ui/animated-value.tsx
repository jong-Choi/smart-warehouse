import { motion, useMotionValue, useTransform, animate } from "framer-motion";
import { useEffect } from "react";

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

  useEffect(() => {
    const controls = animate(count, value, {
      duration: 0.3,
      ease: "easeOut",
    });
    return controls.stop;
  }, [value, count]);

  return <motion.span className={className}>{formatted}</motion.span>;
}
