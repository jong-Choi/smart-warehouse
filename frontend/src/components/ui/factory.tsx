import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card";
import {
  Play,
  Pause,
  RotateCcw,
  Settings,
  HelpCircle,
  Loader2,
} from "lucide-react";
import { useUnloadingParcels } from "@hooks/useWaybills";

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
          <TypographyLabel>{label}</TypographyLabel>
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
        <TypographyMono className="min-w-[3rem] text-right">
          {value}
        </TypographyMono>
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
      <TypographyHeading>
        <Settings className="w-5 h-5 mr-2 text-blue-600" />
        {title}
      </TypographyHeading>
      <div className="space-y-4">{children}</div>
    </div>
  );
};

// 상태 표시 컴포넌트
interface StatusIndicatorProps {
  isPaused: boolean;
  onStartUnload: () => void;
  onStopUnload: () => void;
  onReset: () => void;
}

export const StatusIndicator: React.FC<StatusIndicatorProps> = ({
  isPaused,
  onStartUnload,
  onStopUnload,
  onReset,
}) => {
  const { isLoading } = useUnloadingParcels();
  return (
    <div className="flex items-center justify-between w-full">
      {isPaused ? (
        <Button
          size="default"
          variant="default"
          onClick={onStartUnload}
          disabled={isLoading}
          className="flex items-center space-x-1 font-semibold shadow-md hover:shadow-lg transition-all duration-200"
        >
          {isLoading ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Play className="w-4 h-4" />
          )}
          <span>하차 시작</span>
        </Button>
      ) : (
        <Button
          size="default"
          variant="secondary"
          onClick={onStopUnload}
          className="flex items-center space-x-1 font-semibold shadow-md hover:shadow-lg transition-all duration-200"
        >
          <Pause className="w-4 h-4" />
          <span>하차 정지</span>
        </Button>
      )}

      <Button
        size="sm"
        variant="ghost"
        onClick={onReset}
        className="flex items-center space-x-1 text-gray-600 hover:text-gray-800 hover:bg-gray-100 text-xs"
      >
        <RotateCcw className="w-3 h-3" />
        <span>설정 초기화</span>
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
          <TypographyTitle>{title}</TypographyTitle>
          <TypographyValue>{value}</TypographyValue>
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

// 컨트롤러 레이아웃 컴포넌트
interface ControllerLayoutProps {
  children: React.ReactNode;
  className?: string;
}

export const ControllerLayout: React.FC<ControllerLayoutProps> = ({
  children,
  className = "",
}) => {
  return (
    <div
      className={`w-80 space-y-4 bg-slate-700/50 p-4 rounded-lg ${className} max-h-[calc(100vh-2rem)] overflow-y-auto`}
    >
      {children}
    </div>
  );
};

// 작업자 카드 컴포넌트
interface WorkerCardProps {
  label: string;
  value: string | number;
  className?: string;
}

export const WorkerCard: React.FC<WorkerCardProps> = ({
  label,
  value,
  className = "",
}) => {
  return (
    <div
      className={`bg-blue-50 border border-blue-200 rounded p-1 text-center ${className}`}
    >
      <div className="text-xs font-bold text-blue-700">{label}</div>
      <div className="text-xs font-mono text-blue-600">{value}</div>
    </div>
  );
};

// 작업자 그리드 컴포넌트
interface WorkerGridProps {
  children: React.ReactNode;
  cols?: 2 | 3 | 4;
  gap?: 1 | 2 | 3;
  className?: string;
}

export const WorkerGrid: React.FC<WorkerGridProps> = ({
  children,
  cols = 3,
  gap = 1,
  className = "",
}) => {
  const gridCols = {
    2: "grid-cols-2",
    3: "grid-cols-3",
    4: "grid-cols-4",
  };

  const gridGap = {
    1: "gap-1",
    2: "gap-2",
    3: "gap-3",
  };

  return (
    <div className={`grid ${gridCols[cols]} ${gridGap[gap]} ${className}`}>
      {children}
    </div>
  );
};

// 시스템 정보 컨테이너 컴포넌트
interface SystemInfoContainerProps {
  children: React.ReactNode;
  className?: string;
}

export const SystemInfoContainer: React.FC<SystemInfoContainerProps> = ({
  children,
  className = "",
}) => {
  return (
    <div className={`text-sm space-y-2 text-gray-600 ${className}`}>
      {children}
    </div>
  );
};

// 시스템 정보 행 컴포넌트
interface SystemInfoRowProps {
  label: string;
  value: React.ReactNode;
  valueColor?: "default" | "green" | "red" | "blue";
  className?: string;
}

export const SystemInfoRow: React.FC<SystemInfoRowProps> = ({
  label,
  value,
  valueColor = "default",
  className = "",
}) => {
  const valueColorClasses = {
    default: "font-medium",
    green: "text-green-600 font-medium",
    red: "font-medium text-red-600",
    blue: "text-blue-600 font-medium",
  };

  return (
    <div className={`flex justify-between ${className}`}>
      <span>{label}:</span>
      <span className={valueColorClasses[valueColor]}>{value}</span>
    </div>
  );
};

// 타이포그래피 컴포넌트들
interface TypographyProps {
  children: React.ReactNode;
  className?: string;
}

export const TypographyLabel: React.FC<TypographyProps> = ({
  children,
  className = "",
}) => {
  return (
    <span className={`text-sm font-medium text-gray-700 ${className}`}>
      {children}
    </span>
  );
};

export const TypographyMono: React.FC<TypographyProps> = ({
  children,
  className = "",
}) => {
  return (
    <span className={`text-sm font-mono text-gray-600 ${className}`}>
      {children}
    </span>
  );
};

export const TypographyHeading: React.FC<TypographyProps> = ({
  children,
  className = "",
}) => {
  return (
    <h3
      className={`text-lg font-semibold text-gray-800 mb-3 flex items-center ${className}`}
    >
      {children}
    </h3>
  );
};

export const TypographyValue: React.FC<TypographyProps> = ({
  children,
  className = "",
}) => {
  return (
    <p className={`text-xl font-bold text-gray-800 ${className}`}>{children}</p>
  );
};

export const TypographyTitle: React.FC<TypographyProps> = ({
  children,
  className = "",
}) => {
  return <p className={`text-sm text-gray-600 ${className}`}>{children}</p>;
};
