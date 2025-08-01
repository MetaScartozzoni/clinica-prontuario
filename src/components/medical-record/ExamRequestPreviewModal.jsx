import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Printer, X } from 'lucide-react';

const ExamRequestPreviewModal = ({ isOpen, onClose, patientDetails, requestedExams }) => {
  if (!isOpen) return null;

  const handlePrint = () => {
    const printableContent = document.getElementById('exam-request-printable-content');
    if (printableContent) {
      const printWindow = window.open('', '_blank', 'height=600,width=800');
      printWindow.document.write('<html><head><title>Solicitação de Exame</title>');
      
      printWindow.document.write('<style>');
      printWindow.document.write(`
        body { font-family: Arial, sans-serif; margin: 20px; color: #333; }
        .printable-container { padding: 20px; border: 1px solid #ccc; border-radius: 8px; background-color: #fff; }
        .printable-header, .printable-footer { text-align: center; margin-bottom: 20px; }
        .printable-header h2 { margin: 0; color: #5D3FD3; }
        .patient-info, .exam-list-section { margin-bottom: 15px; padding: 10px; border: 1px solid #eee; border-radius: 5px; }
        .patient-info p, .exam-list-section li { margin: 5px 0; }
        .exam-list-section ul { list-style: none; padding-left: 0; }
        .exam-list-section h3 { font-size: 1.1em; color: #444; margin-bottom: 8px; }
        .printable-footer { font-size: 0.8em; color: #777; margin-top: 30px; border-top: 1px solid #ccc; padding-top: 10px; }
        .signature-placeholder { margin-top: 40px; padding-top: 20px; border-top: 1px solid #aaa; text-align: center; }
      `);
      printWindow.document.write('</style></head><body>');
      printWindow.document.write('<div class="printable-container">'); // Wrap content
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
      <DialogContent className="max-w-2xl w-full modal-light-theme"> {/* Applied modal-light-theme */}
        <DialogHeader>
          <DialogTitle className="dialog-title-custom">Prévia da Solicitação de Exame</DialogTitle>
          <DialogDescription className="dialog-description-custom">
            Esta é uma prévia de como a solicitação de exame será apresentada.
          </DialogDescription>
        </DialogHeader>

        <div id="exam-request-printable-content" className="my-4 p-4 border border-[hsl(var(--modal-light-border-hsl))] rounded-lg bg-[hsla(var(--modal-light-input-bg-hsl-values),var(--modal-light-input-bg-opacity))] max-h-[60vh] overflow-y-auto">
          <div className="printable-header text-center mb-6">
            <h2 className="text-2xl font-bold text-primary">SOLICITAÇÃO DE EXAMES</h2>
            <p className="text-sm text-[hsl(var(--modal-light-input-placeholder-hsl))]">Clínica Dr. Marcio Scartozzoni</p>
          </div>

          <div className="patient-info mb-4 p-3 border border-[hsl(var(--modal-light-border-hsl))] rounded">
            <p><strong>Paciente:</strong> {patientDetails?.name || 'N/I'}</p>
            <p><strong>ID Paciente:</strong> {patientDetails?.patient_custom_id || patientDetails?.id || 'N/I'}</p>
            <p><strong>Telefone:</strong> {patientDetails?.phone || 'N/I'}</p>
            <p><strong>Data da Solicitação:</strong> {formattedDate}</p>
          </div>

          <div className="exam-list-section mb-4 p-3 border border-[hsl(var(--modal-light-border-hsl))] rounded">
            <h3 className="font-semibold mb-2 text-lg text-[hsl(var(--modal-light-foreground-hsl))]">Exames Solicitados:</h3>
            {requestedExams && requestedExams.length > 0 ? (
              <ul className="list-disc list-inside ml-4 space-y-1">
                {requestedExams.map((exam, index) => (
                  <li key={index}>
                    <strong>{exam.type}</strong>
                    {exam.obs && <span className="text-sm text-[hsl(var(--modal-light-input-placeholder-hsl))] italic"> (Obs: {exam.obs})</span>}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-[hsl(var(--modal-light-input-placeholder-hsl))]">Nenhum exame especificado para esta solicitação.</p>
            )}
          </div>

          <div className="printable-footer mt-8 pt-4 border-t border-[hsl(var(--modal-light-border-hsl))]">
             <div className="signature-placeholder mt-10 text-center">
              <p className="mb-12">_________________________________________</p>
              <p className="font-semibold">Dr. Marcio Scartozzoni</p>
              <p className="text-sm text-[hsl(var(--modal-light-input-placeholder-hsl))]">CRM: [Número do CRM]</p>
              <p className="text-sm text-[hsl(var(--modal-light-input-placeholder-hsl))]">Assinatura Digital (Placeholder)</p>
            </div>
            <p className="text-xs text-[hsl(var(--modal-light-input-placeholder-hsl))] text-center mt-4">
              Este documento é uma solicitação médica e deve ser apresentado ao laboratório/clínica de imagem.
            </p>
          </div>
        </div>

        <DialogFooter className="gap-2 sm:justify-end">
          <Button type="button" variant="outline" onClick={onClose}>
            <X className="mr-2 h-4 w-4" /> Fechar
          </Button>
          <Button type="button" onClick={handlePrint} className="btn-frutacor">
            <Printer className="mr-2 h-4 w-4" /> Imprimir Solicitação
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ExamRequestPreviewModal;