import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { CalendarPlus, ArrowLeftToLine, DollarSign, FileSignature, FileText, FlaskConical, BookOpen, Search, ListChecks, LayoutGrid, CalendarDays, Mail } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/components/ui/use-toast';

const SurgeryPageHeader = ({ 
  onScheduleNew, 
  searchTerm,
  onSearchTermChange,
  viewMode,
  onViewModeChange
}) => {
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleNotImplemented = () => {
    toast({
      title: "🚧 Feature não implementada ainda",
      description: "Essa funcionalidade ainda não está disponível, mas você pode solicitá-la em seu próximo prompt! 🚀",
      variant: "default",
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center text-primary">
            <ListChecks className="mr-3 h-8 w-8" /> Cockpit Cirúrgico
          </h1>
          <p className="text-muted-foreground">Seu centro de comando para todas as cirurgias.</p>
        </div>
        <div className="flex gap-2 flex-wrap">
          <Button onClick={onScheduleNew} className="btn-frutacor">
            <CalendarPlus className="mr-2 h-4 w-4" /> Agendar Nova Cirurgia
          </Button>
        </div>
      </div>

      <div className="pt-4 border-t border-[hsl(var(--border))]">
        <h2 className="text-lg font-semibold mb-2 text-foreground">Ações Rápidas</h2>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" onClick={() => navigate('/exames')}>
            <FlaskConical className="mr-2 h-4 w-4" /> Exames
          </Button>
          <Button variant="outline" onClick={() => navigate('/orcamentos')}>
            <DollarSign className="mr-2 h-4 w-4" /> Orçamentos
          </Button>
          <Button variant="outline" onClick={() => navigate('/agenda')}>
            <CalendarDays className="mr-2 h-4 w-4" /> Agenda
          </Button>
          <Button variant="outline" onClick={handleNotImplemented}>
            <Mail className="mr-2 h-4 w-4" /> Enviar por Email (PDF)
          </Button>
        </div>
      </div>

      <div className="pt-4 border-t border-[hsl(var(--border))]">
        <h2 className="text-lg font-semibold mb-2 text-foreground">📄 Gerar Documentos Pré-Operatórios</h2>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" onClick={handleNotImplemented}>
            <FileSignature className="mr-2 h-4 w-4" /> Gerar Documento Manual
          </Button>
          <Button variant="outline" onClick={handleNotImplemented}>
            <FileText className="mr-2 h-4 w-4" /> Termo de Consentimento
          </Button>
          <Button variant="outline" onClick={handleNotImplemented}>
            <FlaskConical className="mr-2 h-4 w-4" /> Exames Pré-Op
          </Button>
          <Button variant="outline" onClick={handleNotImplemented}>
            <BookOpen className="mr-2 h-4 w-4" /> Orientações Pós-Op
          </Button>
        </div>
      </div>

      <div className="mt-6 flex flex-col md:flex-row gap-4 items-center">
        <div className="relative flex-grow w-full md:w-auto">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Buscar por nome do paciente..."
            className="pl-10 w-full bg-background"
            value={searchTerm}
            onChange={(e) => onSearchTermChange(e.target.value)}
          />
        </div>
        <div className="flex gap-2">
          <Button 
            variant={viewMode === 'journey' ? 'default' : 'outline'} 
            onClick={() => onViewModeChange('journey')}
            aria-label="Visualizar como Jornada (Cards)"
          >
            <LayoutGrid className="mr-2 h-4 w-4"/> Cards
          </Button>
          <Button 
            variant={viewMode === 'list' ? 'default' : 'outline'} 
            onClick={() => onViewModeChange('list')}
            aria-label="Visualizar como Lista (Tabela)"
          >
            <ListChecks className="mr-2 h-4 w-4"/> Tabela
          </Button>
          <Button 
            variant={viewMode === 'calendar' ? 'default' : 'outline'} 
            onClick={() => onViewModeChange('calendar')}
            aria-label="Visualizar como Calendário"
          >
            <CalendarPlus className="mr-2 h-4 w-4"/> Calendário
          </Button>
        </div>
      </div>
    </div>
  );
};

export default SurgeryPageHeader;