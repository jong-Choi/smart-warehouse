import { useState } from "react";
import { Dialog, DialogContent } from "@components/ui/dialog";
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
