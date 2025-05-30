
import React from "react";
import { Dialog, DialogContent, DialogOverlay } from "@/components/ui/dialog";

interface ContributionModalProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
}

const ContributionModal: React.FC<ContributionModalProps> = ({ isOpen, onClose, children }) => {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogOverlay className="bg-black/50" />
      <DialogContent className="max-w-lg p-0 gap-0">
        {children}
      </DialogContent>
    </Dialog>
  );
};

export default ContributionModal;
