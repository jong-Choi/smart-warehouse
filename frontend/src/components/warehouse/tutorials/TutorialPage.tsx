import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@components/ui/button";
import { motion, AnimatePresence } from "framer-motion";

interface TutorialPageProps {
  page: number;
  totalPages: number;
  onNext: () => void;
  onPrev: () => void;
  onSkip: () => void;
}

const TUTORIAL_CONTENT = {
  1: {
    title: "하차 시작하기",
    description: "하차 시작 버튼을 눌러서 창고 작업을 시작해보세요.",
    image: "/tutorial-1.png",
  },
  2: {
    title: "실시간 작업 진행",
    description:
      "하차 시작 버튼을 누르면 소포가 하차되고 \n실시간으로 작업이 진행됩니다.",
    image: "/tutorial-2.png",
  },
  3: {
    title: "대시보드 모니터링",
    description: "대시보드 버튼을 눌러서 실시간 모니터링을 확인해보세요.",
    image: "/tutorial-3.png",
  },
};

export default function TutorialPage({
  page,
  totalPages,
  onNext,
  onPrev,
}: TutorialPageProps) {
  const content = TUTORIAL_CONTENT[page as keyof typeof TUTORIAL_CONTENT];

  return (
    <div className="relative bg-white rounded-lg overflow-hidden">
      {/* 헤더 */}
      <div className="flex items-center justify-between p-6 border-b">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-gray-500 pt-1">
            튜토리얼 {page}/{totalPages}
          </span>
        </div>
      </div>

      {/* 콘텐츠 */}
      <div className="p-6">
        <AnimatePresence mode="wait">
          <motion.div
            key={page}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5, ease: "easeInOut" }}
            className="text-center mb-6"
          >
            <h2 className="text-2xl font-bold text-gray-900 mb-3">
              {content.title}
            </h2>
            <p className="text-gray-600 text-lg leading-relaxed h-12 whitespace-pre ">
              {content.description}
            </p>
          </motion.div>
        </AnimatePresence>

        {/* 이미지 */}
        <AnimatePresence mode="wait">
          <motion.div
            key={page}
            className="flex justify-center mb-6"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5, ease: "easeInOut" }}
          >
            <img
              src={content.image}
              alt={`Tutorial ${page}`}
              className="max-w-full rounded-lg shadow-lg"
              style={{
                height: "250px",
                maxWidth: "350px",
                objectFit: "contain",
              }}
            />
          </motion.div>
        </AnimatePresence>
      </div>

      {/* 네비게이션 */}
      <div className="flex items-center justify-between p-6 border-t bg-gray-50">
        <Button
          variant="outline"
          onClick={onPrev}
          disabled={page === 1}
          className="flex items-center gap-2"
        >
          <ChevronLeft className="h-4 w-4" />
          이전
        </Button>

        <div className="flex gap-2">
          {Array.from({ length: totalPages }, (_, i) => (
            <div
              key={i}
              className={`w-2 h-2 rounded-full ${
                i + 1 === page ? "bg-blue-600" : "bg-gray-300"
              }`}
            />
          ))}
        </div>

        <Button onClick={onNext} className="flex items-center gap-2">
          {page === totalPages ? "완료" : "다음"}
          {page !== totalPages && <ChevronRight className="h-4 w-4" />}
        </Button>
      </div>
    </div>
  );
}
