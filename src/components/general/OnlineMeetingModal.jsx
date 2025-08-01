import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { ExternalLink, Video } from 'lucide-react';

const OnlineMeetingModal = ({ isOpen, onClose, meetingUrl }) => {
  const handleOpenLink = () => {
    window.open(meetingUrl, '_blank', 'noopener,noreferrer');
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md modal-light-theme"> {/* Applied modal-light-theme */}
        <DialogHeader>
          <DialogTitle className="flex items-center text-xl font-semibold dialog-title-custom">
            <Video className="mr-2 h-6 w-6 text-primary" />
            Reunião Online
          </DialogTitle>
          <DialogDescription className="dialog-description-custom">
            Você será redirecionado para a plataforma da reunião online.
          </DialogDescription>
        </DialogHeader>
        <div className="py-4">
          <p className="text-sm text-[hsl(var(--modal-light-input-placeholder-hsl))]">
            Clique no botão abaixo para abrir o link da reunião em uma nova aba.
          </p>
          <p className="text-xs text-[hsl(var(--modal-light-input-placeholder-hsl))] mt-1 truncate">
            Link: <a href={meetingUrl} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">{meetingUrl}</a>
          </p>
        </div>
        <DialogFooter className="pt-4">
          <DialogClose asChild>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancelar
            </Button>
          </DialogClose>
          <Button type="button" onClick={handleOpenLink} className="btn-frutacor">
            <ExternalLink className="mr-2 h-4 w-4" /> Abrir Link da Reunião
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default OnlineMeetingModal;