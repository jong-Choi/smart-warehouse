import React, { useState, useEffect, useRef } from "react";
import robotSvg from "@assets/svg/robot.svg";
import brokenRobotSvg from "@assets/svg/broken-robot.svg";
import openedBoxSvg from "@assets/svg/opened-box.svg";
import brokenBoxSvg from "@assets/svg/broken-box.svg";
import {
  BELT_WORKER_STYLE,
  WORKER_UI_OFFSET,
  WORKER_COOLDOWN_SCALES,
} from "@/utils/warehouse/constants";
import { toIsometric } from "@/utils/warehouse/calculations";
import { createChannelInterface } from "@/utils";

interface WorkerProps {
  index: number;
  position: { x: number; y: number };
  catchTimes: number[];
  brokenUntil: number;
  workerCooldown: number;
}

// 쿨다운 타이머만을 위한 별도 컴포넌트
const CooldownTimer = React.memo<{
  index: number;
  position: { x: number; y: number };
  catchTimes: number[];
  brokenUntil: number;
  workerCooldown: number;
  setIsWorking: (working: boolean) => void;
  setIsBroken: (broken: boolean) => void;
}>(
  ({
    index,
    position,
    catchTimes,
    brokenUntil,
    workerCooldown,
    setIsWorking,
    setIsBroken,
  }) => {
    const [currentTime, setCurrentTime] = useState(Date.now());
    const [hasSentCooldownEndMessage, setHasSentCooldownEndMessage] =
      useState(false);
    const channelRef = useRef(createChannelInterface("factory-events"));

    useEffect(() => {
      let animationId: number;

      const updateTime = () => {
        setCurrentTime(Date.now());
        animationId = requestAnimationFrame(updateTime);
      };

      animationId = requestAnimationFrame(updateTime);

      return () => {
        if (animationId) {
          cancelAnimationFrame(animationId);
        }
      };
    }, []);

    const now = currentTime;
    const lastCatchTime =
      catchTimes.length > 0 ? catchTimes[catchTimes.length - 1] : 0;
    const workerCooldownWithScale =
      workerCooldown * WORKER_COOLDOWN_SCALES[index];
    const cooldownLeft = Math.max(
      0,
      workerCooldownWithScale - (now - lastCatchTime)
    );
    const cooldownRatio = Math.min(1, cooldownLeft / workerCooldownWithScale);
    const r = 15;
    const cx = position.x;
    const cy = position.y;

    const isBroken = brokenUntil > now;
    const isWorking = cooldownLeft > 0 && !isBroken;

    // 쿨다운이 끝나는 순간 메시지 전송
    useEffect(() => {
      if (
        cooldownLeft === 0 &&
        !hasSentCooldownEndMessage &&
        catchTimes.length > 0
      ) {
        // 쿨다운이 끝났으므로 작업 종료 메시지 전송
        channelRef.current?.send({
          ts: now,
          msg: "작업 종료",
          category: "STATUS",
          severity: "INFO",
          asset: "WORKER",
          workerId: index < 10 ? `A${index + 1}` : `B${index - 9}`,
          operatorId: index + 1,
          operatorName:
            index < 10 ? `작업자A${index + 1}` : `작업자B${index - 9}`,
        });
        setHasSentCooldownEndMessage(true);
      } else if (cooldownLeft > 0) {
        // 쿨다운이 다시 시작되면 플래그 리셋
        setHasSentCooldownEndMessage(false);
      }
    }, [
      cooldownLeft,
      hasSentCooldownEndMessage,
      catchTimes.length,
      now,
      index,
    ]);

    // 상태 업데이트
    useEffect(() => {
      setIsWorking(isWorking);
      setIsBroken(isBroken);
    }, [isWorking, isBroken, setIsWorking, setIsBroken]);

    let barRatio = cooldownRatio;
    let barColor = "#fff59d";
    if (isBroken) {
      const brokenLeft = brokenUntil - now;
      barRatio = Math.min(1, Math.max(0, brokenLeft / 15000));
      barColor = "#ef5350";
    }
    const barHeight = 2 * r * barRatio;
    const barY = cy + r - barHeight;

    if (barRatio <= 0) return null;

    return (
      <g>
        <clipPath id={`cooldown-mask-${index}`}>
          <rect
            x={cx + WORKER_UI_OFFSET.x - r}
            y={barY - WORKER_UI_OFFSET.y}
            width={2 * r}
            height={barHeight}
          />
        </clipPath>
        <circle
          cx={cx + WORKER_UI_OFFSET.x}
          cy={cy - WORKER_UI_OFFSET.y}
          r={r}
          fill={barColor}
          stroke={BELT_WORKER_STYLE.stroke}
          strokeWidth={BELT_WORKER_STYLE.strokeWidth}
          clipPath={`url(#cooldown-mask-${index})`}
        />
      </g>
    );
  }
);

export const Worker = React.memo<WorkerProps>(
  ({ index, position, catchTimes, brokenUntil, workerCooldown }) => {
    // 작업자 1~10: A1~A10, 11~20: B1~B10
    const isTop = index < 10;
    const label = isTop ? `A${index + 1}` : `B${index - 9}`;
    const countY = isTop ? position.y - 24 : position.y - 20;

    const r = 15;
    const cx = position.x;
    const cy = position.y;

    // 상태를 useState로 관리
    const [isWorking, setIsWorking] = useState(false);
    const [isBroken, setIsBroken] = useState(false);

    const openedBoxOffset = toIsometric(-30, 0);
    const openedBoxX = cx + openedBoxOffset.x;
    const openedBoxY = cy + openedBoxOffset.y;

    // 로봇팔 표시 여부 및 좌우반전 결정
    const shouldShowRobot = true; // 항상 표시
    const shouldFlip = isWorking || isBroken; // 작업 중이거나 고장났을 때만 좌우반전

    return (
      <g>
        {/* 로봇팔 (작업 중이거나 고장났을 때만 표시) */}
        {shouldShowRobot && (
          <g
            transform={`translate(${cx - 30}, ${cy - 35}) ${
              shouldFlip ? "scale(-1, 1) translate(-60, 0)" : ""
            }`}
          >
            <image
              href={isBroken ? brokenRobotSvg : robotSvg}
              x={0}
              y={0}
              width={60}
              height={90}
            />
          </g>
        )}

        {/* 기본 초록색 원 */}
        <circle
          cx={cx + WORKER_UI_OFFSET.x}
          cy={cy - WORKER_UI_OFFSET.y}
          r={r}
          fill={BELT_WORKER_STYLE.fill}
          stroke={BELT_WORKER_STYLE.stroke}
          strokeWidth={BELT_WORKER_STYLE.strokeWidth}
        />

        {/* 쿨다운 타이머 (실시간 업데이트) */}
        <CooldownTimer
          index={index}
          position={position}
          catchTimes={catchTimes}
          brokenUntil={brokenUntil}
          workerCooldown={workerCooldown}
          setIsWorking={setIsWorking}
          setIsBroken={setIsBroken}
        />

        {/* 작업 중일 때 열린 박스 표시 */}
        {(isWorking || isBroken) && (
          <g transform={`translate(${openedBoxX - 20}, ${openedBoxY - 10})`}>
            <image
              href={isBroken ? brokenBoxSvg : openedBoxSvg}
              x={0}
              y={0}
              width={40}
              height={40}
            />
          </g>
        )}
        {/* 작업자 번호 */}
        <text
          x={cx + WORKER_UI_OFFSET.x}
          y={cy - (WORKER_UI_OFFSET.y - 6)}
          textAnchor="middle"
          fontSize={14}
          fontWeight="bold"
          fill="#222"
        >
          {label}
        </text>
        {/* 작업자별 카운트 */}
        <text
          x={cx + WORKER_UI_OFFSET.x}
          y={countY - WORKER_UI_OFFSET.y}
          textAnchor="middle"
          fontSize={16}
          fontWeight="bold"
          fill="#333"
        >
          {catchTimes.length}
        </text>
      </g>
    );
  }
);
