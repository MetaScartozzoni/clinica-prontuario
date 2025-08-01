import React, { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/components/ui/use-toast';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { PlusCircle, Loader2, Save, Trash2, BookOpen } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

const ScientificReviewPanel = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [reviews, setReviews] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentReview, setCurrentReview] = useState({});

  const fetchReviews = useCallback(async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('scientific_reviews')
        .select('*, created_by_profile:created_by(full_name)')
        .order('review_date', { ascending: false });
      if (error) throw error;
      setReviews(data);
    } catch (error) {
      toast({ title: "Erro ao buscar revisões", description: error.message, variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    fetchReviews();
  }, [fetchReviews]);

  const resetForm = () => {
    setCurrentReview({
      review_date: new Date().toISOString().split('T')[0],
      title: '',
      participants: '',
      meeting_minutes: '',
      action_plan: ''
    });
  };

  const handleOpenModal = () => {
    resetForm();
    setIsModalOpen(true);
  };

  const handleSave = async () => {
    if (!currentReview.title || !currentReview.review_date) {
      toast({ title: 'Campos obrigatórios', description: 'Título e data são necessários.', variant: 'warning' });
      return;
    }
    setIsSaving(true);
    try {
      const payload = {
        ...currentReview,
        participants: currentReview.participants.split(',').map(p => p.trim()),
        created_by: user.id
      };
      const { error } = await supabase.from('scientific_reviews').insert(payload);
      if (error) throw error;
      
      toast({ title: "Revisão registrada!", variant: "success" });
      fetchReviews();
      setIsModalOpen(false);
    } catch(error) {
      toast({ title: "Erro ao salvar", description: error.message, variant: "destructive" });
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Tem certeza que deseja excluir esta revisão?")) return;
    try {
      const { error } = await supabase.from('scientific_reviews').delete().eq('id', id);
      if (error) throw error;
      toast({ title: 'Revisão excluída', variant: 'success' });
      fetchReviews();
    } catch (error) {
      toast({ title: 'Erro ao excluir', description: error.message, variant: 'destructive' });
    }
  };

  return (
    <>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Painel de Revisão Científica</CardTitle>
            <CardDescription>Documente e acompanhe as reuniões de revisão de casos e estudos.</CardDescription>
          </div>
          <Button onClick={handleOpenModal}><PlusCircle className="mr-2 h-4 w-4" /> Nova Revisão</Button>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center"><Loader2 className="h-6 w-6 animate-spin mx-auto" /></div>
          ) : reviews.length === 0 ? (
            <div className="text-center text-muted-foreground py-8">
              <BookOpen className="mx-auto h-12 w-12 text-gray-300" />
              <p className="mt-4">Nenhuma revisão científica registrada.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {reviews.map(review => (
                <Card key={review.id}>
                  <CardHeader className="p-4">
                    <div className="flex justify-between items-center">
                      <h3 className="font-bold text-lg">{review.title} - {format(new Date(review.review_date), 'dd/MM/yyyy', { locale: ptBR })}</h3>
                      <Button variant="ghost" size="icon" onClick={() => handleDelete(review.id)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
                    </div>
                  </CardHeader>
                  <CardContent className="p-4">
                    <p><strong>Participantes:</strong> {review.participants?.join(', ') || 'N/A'}</p>
                    <p className="mt-2"><strong>Ata:</strong> {review.meeting_minutes || 'N/A'}</p>
                    <p className="mt-2"><strong>Plano de Ação:</strong> {review.action_plan || 'N/A'}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader><DialogTitle>Registrar Nova Revisão Científica</DialogTitle></DialogHeader>
          <div className="space-y-4 p-2">
            <div><Label htmlFor="title">Título</Label><Input id="title" value={currentReview.title || ''} onChange={e => setCurrentReview({...currentReview, title: e.target.value})} /></div>
            <div><Label htmlFor="review_date">Data</Label><Input id="review_date" type="date" value={currentReview.review_date || ''} onChange={e => setCurrentReview({...currentReview, review_date: e.target.value})} /></div>
            <div><Label htmlFor="participants">Participantes (separados por vírgula)</Label><Input id="participants" value={currentReview.participants || ''} onChange={e => setCurrentReview({...currentReview, participants: e.target.value})} /></div>
            <div><Label htmlFor="meeting_minutes">Ata da Reunião</Label><Textarea id="meeting_minutes" value={currentReview.meeting_minutes || ''} onChange={e => setCurrentReview({...currentReview, meeting_minutes: e.target.value})} /></div>
            <div><Label htmlFor="action_plan">Plano de Ação</Label><Textarea id="action_plan" value={currentReview.action_plan || ''} onChange={e => setCurrentReview({...currentReview, action_plan: e.target.value})} /></div>
            <Button onClick={handleSave} disabled={isSaving} className="w-full">
              {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
              Salvar Revisão
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default ScientificReviewPanel;