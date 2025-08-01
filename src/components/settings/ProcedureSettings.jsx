import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { PlusCircle, Trash2, Save, Loader2 } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/lib/supabaseClient';

const ProcedureSettings = () => {
  const { toast } = useToast();
  const [surgeryTypes, setSurgeryTypes] = useState([]);
  const [extraMaterials, setExtraMaterials] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  const fetchProcedureData = useCallback(async () => {
    setIsLoading(true);
    try {
      const { data: surgeryTypesData, error: stError } = await supabase
        .from('surgery_types')
        .select('*')
        .order('name');
      if (stError) throw stError;
      setSurgeryTypes(surgeryTypesData.map(st => ({...st, clinic_team_cost: st.clinic_team_cost || 0, hospital_cost: st.hospital_cost || 0 })));

      const { data: extraMaterialsData, error: emError } = await supabase
        .from('extra_materials')
        .select('*')
        .order('name');
      if (emError) throw emError;
      setExtraMaterials(extraMaterialsData.map(em => ({...em, cost: em.cost || 0 })));

    } catch (error) {
      toast({ title: "Erro ao carregar dados", description: error.message, variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    fetchProcedureData();
  }, [fetchProcedureData]);

  const handleAddSurgeryType = () => {
    setSurgeryTypes([...surgeryTypes, { id: `new_${Date.now()}`, name: '', clinic_team_cost: 0, hospital_cost: 0, isNew: true }]);
  };
  const handleSurgeryTypeChange = (index, field, value) => {
    const updated = [...surgeryTypes];
    updated[index][field] = (field === 'clinic_team_cost' || field === 'hospital_cost') ? parseFloat(value) || 0 : value;
    setSurgeryTypes(updated);
  };
  const handleDeleteSurgeryType = async (index, id) => {
    if (!id.startsWith('new_')) {
      if (!window.confirm("Tem certeza que deseja excluir este tipo de cirurgia do banco de dados?")) return;
      try {
        const { error } = await supabase.from('surgery_types').delete().eq('id', id);
        if (error) throw error;
        toast({ title: "Tipo de Cirurgia Excluído", variant: "success" });
      } catch (error) {
        toast({ title: "Erro ao excluir tipo de cirurgia", description: error.message, variant: "destructive" });
        return;
      }
    }
    setSurgeryTypes(surgeryTypes.filter((_, i) => i !== index));
  };

  const handleAddExtraMaterial = () => {
    setExtraMaterials([...extraMaterials, { id: `new_${Date.now()}`, name: '', cost: 0, description: '', isNew: true }]);
  };
  const handleExtraMaterialChange = (index, field, value) => {
    const updated = [...extraMaterials];
    updated[index][field] = field === 'cost' ? parseFloat(value) || 0 : value;
    setExtraMaterials(updated);
  };
  const handleDeleteExtraMaterial = async (index, id) => {
     if (!id.startsWith('new_')) {
      if (!window.confirm("Tem certeza que deseja excluir este material extra do banco de dados?")) return;
      try {
        const { error } = await supabase.from('extra_materials').delete().eq('id', id);
        if (error) throw error;
        toast({ title: "Material Extra Excluído", variant: "success" });
      } catch (error) {
        toast({ title: "Erro ao excluir material extra", description: error.message, variant: "destructive" });
        return;
      }
    }
    setExtraMaterials(extraMaterials.filter((_, i) => i !== index));
  };

  const handleSaveChanges = async () => {
    setIsSaving(true);
    try {
      // Save Surgery Types
      for (const st of surgeryTypes) {
        const { id, isNew, ...dataToSave } = st;
        dataToSave.updated_at = new Date().toISOString();
        if (isNew) {
          dataToSave.created_at = new Date().toISOString();
          const { error } = await supabase.from('surgery_types').insert(dataToSave);
          if (error) throw error;
        } else {
          const { error } = await supabase.from('surgery_types').update(dataToSave).eq('id', id);
          if (error) throw error;
        }
      }

      // Save Extra Materials
      for (const em of extraMaterials) {
        const { id, isNew, ...dataToSave } = em;
        dataToSave.updated_at = new Date().toISOString();
        if (isNew) {
          dataToSave.created_at = new Date().toISOString();
          const { error } = await supabase.from('extra_materials').insert(dataToSave);
          if (error) throw error;
        } else {
          const { error } = await supabase.from('extra_materials').update(dataToSave).eq('id', id);
          if (error) throw error;
        }
      }
      toast({ title: "Configurações Salvas", description: "Os dados de procedimentos foram atualizados no banco de dados.", variant: "success" });
      fetchProcedureData(); // Refresh data
    } catch (error) {
      toast({ title: "Erro ao Salvar Configurações", description: error.message, variant: "destructive" });
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return <div className="flex justify-center items-center h-32"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;
  }

  return (
    <div className="space-y-6">
      <Card className="shadow-lg">
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle>Tipos de Cirurgia</CardTitle>
              <CardDescription>Gerencie os tipos de cirurgia e seus custos base.</CardDescription>
            </div>
            <Button onClick={handleAddSurgeryType} variant="outline" size="sm" disabled={isSaving}><PlusCircle className="mr-2 h-4 w-4" /> Adicionar Tipo</Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {surgeryTypes.map((st, index) => (
            <div key={st.id} className="grid grid-cols-1 md:grid-cols-4 gap-3 p-3 border rounded-md items-end">
              <Input placeholder="Nome da Cirurgia" value={st.name} onChange={(e) => handleSurgeryTypeChange(index, 'name', e.target.value)} disabled={isSaving}/>
              <Input type="number" placeholder="Custo Equipe Clínica (R$)" value={st.clinic_team_cost} onChange={(e) => handleSurgeryTypeChange(index, 'clinic_team_cost', e.target.value)} disabled={isSaving}/>
              <Input type="number" placeholder="Custo Hospital (R$)" value={st.hospital_cost} onChange={(e) => handleSurgeryTypeChange(index, 'hospital_cost', e.target.value)} disabled={isSaving}/>
              <div className="flex items-center justify-end">
                <Button variant="ghost" size="icon" onClick={() => handleDeleteSurgeryType(index, st.id)} className="text-destructive hover:bg-destructive/10" disabled={isSaving}><Trash2 className="h-4 w-4"/></Button>
              </div>
            </div>
          ))}
          {surgeryTypes.length === 0 && <p className="text-muted-foreground text-center py-4">Nenhum tipo de cirurgia cadastrado.</p>}
        </CardContent>
      </Card>

      <Card className="shadow-lg">
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle>Materiais e Serviços Extras</CardTitle>
              <CardDescription>Gerencie materiais/serviços extras e seus custos para a clínica.</CardDescription>
            </div>
            <Button onClick={handleAddExtraMaterial} variant="outline" size="sm" disabled={isSaving}><PlusCircle className="mr-2 h-4 w-4" /> Adicionar Material/Serviço</Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {extraMaterials.map((em, index) => (
            <div key={em.id} className="grid grid-cols-1 md:grid-cols-4 gap-3 p-3 border rounded-md items-end">
              <Input placeholder="Nome do Material/Serviço" value={em.name} onChange={(e) => handleExtraMaterialChange(index, 'name', e.target.value)} disabled={isSaving} className="md:col-span-2"/>
              <Input type="number" placeholder="Custo para Clínica (R$)" value={em.cost} onChange={(e) => handleExtraMaterialChange(index, 'cost', e.target.value)} disabled={isSaving}/>
              <div className="flex items-center justify-end">
                <Button variant="ghost" size="icon" onClick={() => handleDeleteExtraMaterial(index, em.id)} className="text-destructive hover:bg-destructive/10" disabled={isSaving}><Trash2 className="h-4 w-4"/></Button>
              </div>
              <Textarea 
                placeholder="Descrição (opcional)" 
                value={em.description || ''} 
                onChange={(e) => handleExtraMaterialChange(index, 'description', e.target.value)} 
                disabled={isSaving}
                className="md:col-span-4 mt-2 text-sm"
                rows={1}
              />
            </div>
          ))}
          {extraMaterials.length === 0 && <p className="text-muted-foreground text-center py-4">Nenhum material/serviço extra cadastrado.</p>}
        </CardContent>
      </Card>
      <Button onClick={handleSaveChanges} className="w-full md:w-auto bg-gradient-to-r from-primary to-pink-500 hover:from-primary/90 hover:to-pink-500/90 text-white" disabled={isSaving}>
        {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
        Salvar Configurações de Procedimentos
      </Button>
    </div>
  );
};

export default ProcedureSettings;