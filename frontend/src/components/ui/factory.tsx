import React from "react";
import { Button } from "./button";
import { Slider } from "./slider";
import { HoverCard, HoverCardContent, HoverCardTrigger } from "./hover-card";
import { Play, Pause, RotateCcw, Settings, HelpCircle } from "lucide-react";

// 슬라이더 컴포넌트
interface SliderProps {
  value: number;
  min?: number;
  max: number;
  onChange: (value: number) => void;
  label: string;
  icon?: React.ReactNode;
  tooltip?: string;
}

export const FactorySlider: React.FC<SliderProps> = ({
  value,
  min = 0,
  max,
  onChange,
  label,
  icon,
  tooltip,
}) => {
  return (
    <div className="flex flex-col space-y-2 relative">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          {icon && <span className="text-gray-500">{icon}</span>}
          <label className="text-sm font-medium text-gray-700">{label}</label>
        </div>
        {tooltip && (
          <HoverCard>
            <HoverCardTrigger asChild>
              <button className="text-gray-400 hover:text-gray-600 transition-colors">
                <HelpCircle className="w-4 h-4" />
              </button>
            </HoverCardTrigger>
            <HoverCardContent className="w-64">
              <div className="space-y-2">
                <h4 className="font-semibold text-sm">{label} 설정</h4>
                <p className="text-sm text-gray-600">{tooltip}</p>
              </div>
            </HoverCardContent>
          </HoverCard>
        )}
      </div>
      <div className="flex items-center space-x-3">
        <Slider
          value={[value]}
          min={min}
          max={max}
          onValueChange={(values) => onChange(values[0])}
          className="flex-1"
        />
        <span className="text-sm font-mono text-gray-600 min-w-[3rem] text-right">
          {value}
        </span>
      </div>
    </div>
  );
};

// 컨트롤 패널 컴포넌트
interface ControlPanelProps {
  title: string;
  children: React.ReactNode;
  className?: string;
}

export const ControlPanel: React.FC<ControlPanelProps> = ({
  title,
  children,
  className = "",
}) => {
  return (
    <div
      className={`bg-white/90 backdrop-blur-sm rounded-lg border border-gray-200 shadow-lg p-4 ${className}`}
    >
      <h3 className="text-lg font-semibold text-gray-800 mb-3 flex items-center">
        <Settings className="w-5 h-5 mr-2 text-blue-600" />
        {title}
      </h3>
      <div className="space-y-4">{children}</div>
    </div>
  );
};

// 상태 표시 컴포넌트
interface StatusIndicatorProps {
  isRunning: boolean;
  isPaused: boolean;
  onToggleRunning: () => void;
  onTogglePaused: () => void;
  onReset: () => void;
}

export const StatusIndicator: React.FC<StatusIndicatorProps> = ({
  isRunning,
  isPaused,
  onToggleRunning,
  onTogglePaused,
  onReset,
}) => {
  return (
    <div className="flex items-center space-x-2">
      <Button
        size="sm"
        variant={isRunning ? "default" : "secondary"}
        onClick={onToggleRunning}
        className="flex items-center space-x-1"
      >
        {isRunning ? (
          <Pause className="w-4 h-4" />
        ) : (
          <Play className="w-4 h-4" />
        )}
        <span>{isRunning ? "정지" : "시작"}</span>
      </Button>

      <Button
        size="sm"
        variant={isPaused ? "default" : "outline"}
        onClick={onTogglePaused}
        disabled={!isRunning}
      >
        일시정지
      </Button>

      <Button
        size="sm"
        variant="outline"
        onClick={onReset}
        className="flex items-center space-x-1"
      >
        <RotateCcw className="w-4 h-4" />
        <span>리셋</span>
      </Button>
    </div>
  );
};

// 메트릭 카드 컴포넌트
interface MetricCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  color?: string;
}

export const MetricCard: React.FC<MetricCardProps> = ({
  title,
  value,
  icon,
  color = "blue",
}) => {
  const colorClasses = {
    blue: "text-blue-600 bg-blue-50",
    green: "text-green-600 bg-green-50",
    orange: "text-orange-600 bg-orange-50",
    red: "text-red-600 bg-red-50",
  };

  return (
    <div className="bg-white/90 backdrop-blur-sm rounded-lg border border-gray-200 p-3">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-600">{title}</p>
          <p className="text-xl font-bold text-gray-800">{value}</p>
        </div>
        <div
          className={`p-2 rounded-full ${
            colorClasses[color as keyof typeof colorClasses]
          }`}
        >
          {icon}
        </div>
      </div>
    </div>
  );
};
