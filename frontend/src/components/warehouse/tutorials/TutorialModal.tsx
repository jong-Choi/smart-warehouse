import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
} from "@components/ui/dialog";
import TutorialPage from "@components/warehouse/tutorials/TutorialPage";

interface TutorialModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function TutorialModal({ isOpen, onClose }: TutorialModalProps) {
  const [currentPage, setCurrentPage] = useState(1);
  const totalPages = 3;

  const handleNext = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    } else {
      onClose();
    }
  };

  const handlePrev = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  const handleSkip = () => {
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-dashboard-primary/70 border-0 p-0 max-w-2xl">
        <DialogTitle className="sr-only">튜토리얼</DialogTitle>
        <DialogDescription className="sr-only">
          웨어하우스 시스템 사용법을 안내하는 튜토리얼입니다.
        </DialogDescription>
        <TutorialPage
          page={currentPage}
          totalPages={totalPages}
          onNext={handleNext}
          onPrev={handlePrev}
          onSkip={handleSkip}
        />
      </DialogContent>
    </Dialog>
  );
}
