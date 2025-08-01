import React, { useState, useEffect, useCallback } from 'react';
    import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
    import { Button } from '@/components/ui/button';
    import { Input } from '@/components/ui/input';
    import { Label } from '@/components/ui/label';
    import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
    import { PlusCircle, Trash2, Clock, Loader2, AlertCircle } from 'lucide-react';
    import { useToast } from '@/components/ui/use-toast';
    import { useProfile } from '@/contexts/ProfileContext';
    import { supabase } from '@/lib/supabaseClient';

    const daysOfWeek = [
      { id: 1, name: "Segunda-feira" },
      { id: 2, name: "Terça-feira" },
      { id: 3, name: "Quarta-feira" },
      { id: 4, name: "Quinta-feira" },
      { id: 5, name: "Sexta-feira" },
    ];

    const AvailabilitySettings = () => {
      const { toast } = useToast();
      const { profile } = useProfile();
      const [availability, setAvailability] = useState([]);
      const [isLoading, setIsLoading] = useState(true);
      const [newSlot, setNewSlot] = useState({ day_of_week: 1, start_time: '09:00', end_time: '12:00' });

      const fetchAvailability = useCallback(async () => {
        if (!profile) return;
        setIsLoading(true);
        try {
          const { data, error } = await supabase
            .from('professional_availability_slots')
            .select('*')
            .eq('professional_id', profile.id)
            .order('day_of_week')
            .order('start_time');
          
          if (error) throw error;
          setAvailability(data);
        } catch (error) {
          toast({ title: "Erro ao carregar disponibilidade", description: error.message, variant: "destructive" });
        } finally {
          setIsLoading(false);
        }
      }, [profile, toast]);

      useEffect(() => {
        fetchAvailability();
      }, [fetchAvailability]);

      const handleAddSlot = async () => {
        if (!newSlot.start_time || !newSlot.end_time || !profile) return;

        const { data, error } = await supabase
          .from('professional_availability_slots')
          .insert({
            professional_id: profile.id,
            ...newSlot
          });
        
        if (error) {
          toast({ title: "Erro ao adicionar horário", description: "Verifique se o horário não conflita com um existente.", variant: "destructive" });
        } else {
          toast({ title: "Horário adicionado", variant: "success" });
          fetchAvailability();
        }
      };
      
      const handleDeleteSlot = async (slotId) => {
        const { error } = await supabase
          .from('professional_availability_slots')
          .delete()
          .eq('id', slotId);

        if (error) {
          toast({ title: "Erro ao remover horário", description: error.message, variant: "destructive" });
        } else {
          toast({ title: "Horário removido", variant: "success" });
          fetchAvailability();
        }
      };

      return (
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-6 w-6 text-primary"/>
              Disponibilidade para Teleconsultas
            </CardTitle>
            <CardDescription>
              Defina seus horários disponíveis para que os pacientes possam agendar bate-papos de 30 minutos.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex flex-col sm:flex-row gap-4 items-end p-4 border rounded-lg bg-muted/20">
              <div className="grid gap-2 flex-grow">
                <Label>Dia da Semana</Label>
                <Select value={newSlot.day_of_week.toString()} onValueChange={(v) => setNewSlot({...newSlot, day_of_week: parseInt(v)})}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {daysOfWeek.map(day => <SelectItem key={day.id} value={day.id.toString()}>{day.name}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2 flex-grow">
                <Label>Hora de Início</Label>
                <Input type="time" value={newSlot.start_time} onChange={(e) => setNewSlot({...newSlot, start_time: e.target.value})} />
              </div>
              <div className="grid gap-2 flex-grow">
                <Label>Hora de Fim</Label>
                <Input type="time" value={newSlot.end_time} onChange={(e) => setNewSlot({...newSlot, end_time: e.target.value})} />
              </div>
              <Button onClick={handleAddSlot} className="w-full sm:w-auto"><PlusCircle className="mr-2 h-4 w-4"/>Adicionar</Button>
            </div>
            
            <div className="space-y-3">
              <h3 className="text-md font-semibold text-muted-foreground">Horários Cadastrados:</h3>
              {isLoading ? <Loader2 className="mx-auto h-6 w-6 animate-spin"/> :
               availability.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {availability.map((slot) => (
                  <div key={slot.id} className="flex items-center justify-between p-3 border rounded-md bg-muted/30">
                    <div>
                      <p className="font-semibold">{daysOfWeek.find(d => d.id === slot.day_of_week)?.name}</p>
                      <p className="text-sm text-violet-300">{slot.start_time.slice(0,5)} - {slot.end_time.slice(0,5)}</p>
                    </div>
                    <Button variant="ghost" size="icon" onClick={() => handleDeleteSlot(slot.id)} className="text-destructive hover:bg-destructive/10">
                      <Trash2 className="h-4 w-4"/>
                    </Button>
                  </div>
                ))}
                </div>
              ) : (
                <p className="text-muted-foreground text-center py-4">Nenhum horário de disponibilidade cadastrado.</p>
              )}
            </div>
          </CardContent>
        </Card>
      );
    };

    export default AvailabilitySettings;