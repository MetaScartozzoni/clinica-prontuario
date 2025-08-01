import React, { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/customSupabaseClient';
import { useToast } from '@/components/ui/use-toast';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Loader2, Save, PlusCircle, Trash2 } from 'lucide-react';

const SystemParameters = () => {
  const [parameters, setParameters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();

  const fetchParameters = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase.from('system_parameters').select('*').order('created_at');
    if (error) {
      toast({
        title: 'Erro ao carregar parâmetros',
        description: error.message,
        variant: 'destructive',
      });
    } else {
      setParameters(data);
    }
    setLoading(false);
  }, [toast]);

  useEffect(() => {
    fetchParameters();
  }, [fetchParameters]);

  const handleParameterChange = (index, field, value) => {
    const newParameters = [...parameters];
    newParameters[index][field] = value;
    setParameters(newParameters);
  };

  const handleSaveChanges = async () => {
    setSaving(true);
    const upsertPromises = parameters.map(param =>
      supabase.from('system_parameters').upsert(param, { onConflict: 'parameter_key' })
    );

    const results = await Promise.all(upsertPromises);
    const hasError = results.some(res => res.error);

    if (hasError) {
      toast({
        title: 'Erro ao salvar parâmetros',
        description: 'Alguns parâmetros não puderam ser salvos. Verifique o console para mais detalhes.',
        variant: 'destructive',
      });
      console.error('Error saving parameters:', results.map(r => r.error).filter(Boolean));
    } else {
      toast({
        title: 'Parâmetros salvos com sucesso!',
        description: 'As configurações do sistema foram atualizadas.',
      });
    }
    setSaving(false);
    fetchParameters();
  };

  const handleAddParameter = () => {
    setParameters([...parameters, { parameter_key: '', parameter_value: '', description: '' }]);
  };

  const handleDeleteParameter = async (parameterKey, index) => {
    if (!parameterKey) {
      const newParameters = parameters.filter((_, i) => i !== index);
      setParameters(newParameters);
      return;
    }

    const { error } = await supabase.from('system_parameters').delete().eq('parameter_key', parameterKey);
    if (error) {
      toast({
        title: 'Erro ao deletar parâmetro',
        description: error.message,
        variant: 'destructive',
      });
    } else {
      toast({
        title: 'Parâmetro deletado com sucesso!',
      });
      fetchParameters();
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center p-8">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Parâmetros do Sistema</CardTitle>
        <CardDescription>
          Gerencie as variáveis de configuração globais do sistema. Tenha cuidado ao editar estas chaves.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-12 gap-4 font-semibold text-sm text-muted-foreground px-2">
          <div className="col-span-4">Chave do Parâmetro</div>
          <div className="col-span-4">Valor do Parâmetro</div>
          <div className="col-span-3">Descrição</div>
          <div className="col-span-1">Ação</div>
        </div>
        {parameters.map((param, index) => (
          <div key={index} className="grid grid-cols-12 gap-4 items-center">
            <div className="col-span-4">
              <Input
                placeholder="ex: STRIPE_API_KEY"
                value={param.parameter_key}
                onChange={(e) => handleParameterChange(index, 'parameter_key', e.target.value)}
                className="font-mono text-sm"
              />
            </div>
            <div className="col-span-4">
              <Input
                placeholder="Valor da chave"
                value={param.parameter_value}
                onChange={(e) => handleParameterChange(index, 'parameter_value', e.target.value)}
              />
            </div>
            <div className="col-span-3">
              <Input
                placeholder="Descrição do parâmetro"
                value={param.description || ''}
                onChange={(e) => handleParameterChange(index, 'description', e.target.value)}
              />
            </div>
            <div className="col-span-1">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => handleDeleteParameter(param.parameter_key, index)}
              >
                <Trash2 className="h-4 w-4 text-destructive" />
              </Button>
            </div>
          </div>
        ))}
        <Button variant="outline" size="sm" onClick={handleAddParameter}>
          <PlusCircle className="h-4 w-4 mr-2" />
          Adicionar Parâmetro
        </Button>
      </CardContent>
      <CardFooter>
        <Button onClick={handleSaveChanges} disabled={saving}>
          {saving ? (
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
          ) : (
            <Save className="h-4 w-4 mr-2" />
          )}
          Salvar Alterações
        </Button>
      </CardFooter>
    </Card>
  );
};

export default SystemParameters;