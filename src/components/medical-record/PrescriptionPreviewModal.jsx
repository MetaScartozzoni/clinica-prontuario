import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Printer, X } from 'lucide-react';

const PrescriptionPreviewModal = ({ isOpen, onClose, patientDetails, prescriptionText }) => {
  if (!isOpen) return null;

  const handlePrint = () => {
    const printableContent = document.getElementById('prescription-printable-content');
    if (printableContent) {
      const printWindow = window.open('', '_blank', 'height=800,width=800');
      printWindow.document.write('<html><head><title>Receituário Médico</title>');
      
      printWindow.document.write('<style>');
      printWindow.document.write(`
        @import url('https://fonts.googleapis.com/css2?family=Roboto:wght@400;700&display=swap');
        body { font-family: 'Roboto', Arial, sans-serif; margin: 20px; color: #333; }
        .printable-container { padding: 25px; border: 1px solid #ccc; border-radius: 8px; background-color: #fff; max-width: 700px; margin: auto; }
        .printable-header { text-align: center; margin-bottom: 30px; border-bottom: 2px solid #5D3FD3; padding-bottom: 15px; }
        .printable-header h2 { margin: 0; color: #5D3FD3; font-size: 1.8em; }
        .printable-header p { margin: 5px 0 0; font-size: 0.9em; color: #666; }
        .patient-info { margin-bottom: 25px; padding: 15px; border: 1px solid #eee; border-radius: 5px; background-color: #f9f9f9; }
        .patient-info p { margin: 5px 0; font-size: 1.1em; }
        .prescription-body { margin-bottom: 25px; }
        .prescription-body h3 { font-size: 1.3em; color: #444; margin-bottom: 10px; border-bottom: 1px solid #eee; padding-bottom: 5px; }
        .prescription-body pre { white-space: pre-wrap; word-wrap: break-word; font-family: 'Roboto', sans-serif; font-size: 1.1em; line-height: 1.6; }
        .printable-footer { font-size: 0.8em; color: #777; margin-top: 40px; border-top: 1px solid #ccc; padding-top: 15px; text-align: center; }
        .signature-placeholder { margin-top: 60px; padding-top: 20px; border-top: 1px solid #aaa; text-align: center; width: 60%; margin-left: auto; margin-right: auto; }
        .signature-placeholder p { margin: 2px 0; }
      `);
      printWindow.document.write('</style></head><body>');
      printWindow.document.write('<div class="printable-container">');
      printWindow.document.write(printableContent.innerHTML);
      printWindow.document.write('</div>');
      printWindow.document.write('</body></html>');
      printWindow.document.close();
      printWindow.print();
    }
  };
  
  const today = new Date();
  const formattedDate = `${today.getDate().toString().padStart(2, '0')}/${(today.getMonth() + 1).toString().padStart(2, '0')}/${today.getFullYear()}`;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl w-full modal-light-theme">
        <DialogHeader>
          <DialogTitle className="dialog-title-custom">Prévia do Receituário Médico</DialogTitle>
          <DialogDescription className="dialog-description-custom">
            Esta é uma prévia de como o receituário será apresentado para impressão.
          </DialogDescription>
        </DialogHeader>

        <div id="prescription-printable-content" className="my-4 p-4 border border-[hsl(var(--modal-light-border-hsl))] rounded-lg bg-[hsla(var(--modal-light-input-bg-hsl-values),var(--modal-light-input-bg-opacity))] max-h-[70vh] overflow-y-auto">
          <div className="printable-header">
            <h2 className="text-2xl font-bold text-primary">RECEITUÁRIO MÉDICO</h2>
            <p>Clínica Dr. Marcio Scartozzoni</p>
          </div>

          <div className="patient-info">
            <p><strong>Paciente:</strong> {patientDetails?.name || 'N/I'}</p>
            <p><strong>Data:</strong> {formattedDate}</p>
          </div>

          <div className="prescription-body">
            <h3 className="font-semibold">Prescrição:</h3>
            <pre>{prescriptionText || 'Nenhuma prescrição informada.'}</pre>
          </div>

          <div className="printable-footer">
             <div className="signature-placeholder">
              <p className="font-semibold">Dr. Marcio Scartozzoni</p>
              <p className="text-sm text-[hsl(var(--modal-light-input-placeholder-hsl))]">CRM: [Número do CRM]</p>
            </div>
            <p className="text-xs text-[hsl(var(--modal-light-input-placeholder-hsl))] text-center mt-4">
              Este receituário é pessoal e intransferível. Siga as orientações médicas.
            </p>
          </div>
        </div>

        <DialogFooter className="gap-2 sm:justify-end">
          <Button type="button" variant="outline" onClick={onClose}>
            <X className="mr-2 h-4 w-4" /> Fechar
          </Button>
          <Button type="button" onClick={handlePrint} className="btn-frutacor">
            <Printer className="mr-2 h-4 w-4" /> Imprimir Receituário
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default PrescriptionPreviewModal;