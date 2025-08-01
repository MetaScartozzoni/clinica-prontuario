import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { useProfile } from '@/contexts/ProfileContext';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, Star, Award, MessageCircle, TrendingUp, TrendingDown, Coins, UserCheck } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { useToast } from '../ui/use-toast';

const PerformanceModal = ({ isOpen, onClose }) => {
  const { profile } = useProfile();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [performanceData, setPerformanceData] = useState({ points: [], total: 0 });
  const [feedbackData, setFeedbackData] = useState([]);
  const [bonusRate, setBonusRate] = useState(2.50); // Valor pode vir das configurações

  useEffect(() => {
    if (!isOpen || !profile) return;

    const fetchData = async () => {
      setLoading(true);
      try {
        const [performanceRes, feedbackRes] = await Promise.all([
          supabase.from('employee_performance').select('*').eq('profile_id', profile.id).order('created_at', { ascending: false }),
          supabase.from('peer_feedback').select('*, sender:sender_profile_id(full_name, id)').eq('recipient_profile_id', profile.id).order('created_at', { ascending: false })
        ]);
        
        if (performanceRes.error) throw performanceRes.error;
        if (feedbackRes.error) throw feedbackRes.error;

        const totalPoints = performanceRes.data.reduce((acc, curr) => acc + curr.points, 0);
        setPerformanceData({ points: performanceRes.data, total: totalPoints });
        setFeedbackData(feedbackRes.data);

      } catch (error) {
        toast({ title: "Erro ao buscar dados de desempenho", description: error.message, variant: "destructive" });
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [isOpen, profile, toast]);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-2xl">
            <Award className="text-amber-400" /> Meu Desempenho e Feedback
          </DialogTitle>
          <DialogDescription>
            Acompanhe suas conquistas, bônus e os feedbacks que você recebeu da equipe.
          </DialogDescription>
        </DialogHeader>
        {loading ? (
          <div className="flex justify-center items-center h-64"><Loader2 className="h-10 w-10 animate-spin text-violet-400" /></div>
        ) : (
          <Tabs defaultValue="overview" className="mt-4">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="overview">Visão Geral</TabsTrigger>
              <TabsTrigger value="feedback">Feedbacks Recebidos</TabsTrigger>
            </TabsList>
            <TabsContent value="overview" className="mt-4">
              <div className="grid gap-4 md:grid-cols-2">
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <CardTitle className="text-sm font-medium">Estrelinhas Atuais</CardTitle>
                    <Star className="h-4 w-4 text-amber-400" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{performanceData.total}</div>
                    <p className="text-xs text-muted-foreground">Total de pontos acumulados</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <CardTitle className="text-sm font-medium">Bônus Estimado</CardTitle>
                    <Coins className="h-4 w-4 text-green-400" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">R$ {(performanceData.total * bonusRate).toFixed(2)}</div>
                    <p className="text-xs text-muted-foreground">Com base em R$ {bonusRate.toFixed(2)} por estrelinha</p>
                  </CardContent>
                </Card>
              </div>
              <div className="mt-4">
                <h4 className="font-semibold mb-2">Histórico de Pontos</h4>
                <div className="max-h-64 overflow-y-auto pr-2">
                  {performanceData.points.map(p => (
                    <div key={p.id} className="mb-2 flex items-center justify-between rounded-lg bg-white/5 p-3">
                      <div className="flex items-center gap-3">
                        {p.points > 0 ? <TrendingUp className="h-5 w-5 text-green-500" /> : <TrendingDown className="h-5 w-5 text-red-500" />}
                        <div>
                          <p className="font-medium">{p.type}</p>
                          <p className="text-sm text-muted-foreground">{p.reason || 'Movimentação geral'}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className={`font-bold text-lg ${p.points > 0 ? 'text-green-400' : 'text-red-400'}`}>{p.points > 0 ? `+${p.points}` : p.points}</p>
                        <p className="text-xs text-muted-foreground">{formatDistanceToNow(new Date(p.created_at), { addSuffix: true, locale: ptBR })}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </TabsContent>
            <TabsContent value="feedback" className="mt-4">
              <div className="max-h-[28rem] overflow-y-auto space-y-4 pr-2">
                {feedbackData.length > 0 ? feedbackData.map(f => (
                   <div key={f.id} className="rounded-lg border border-white/10 bg-white/5 p-4">
                     <div className="flex items-center justify-between mb-2">
                       <div className="flex items-center gap-2 font-semibold text-violet-300">
                          {f.is_anonymous ? <UserCheck className="h-4 w-4" /> : null}
                          {f.is_anonymous ? "Colega Anônimo" : f.sender.full_name}
                       </div>
                       <p className="text-xs text-muted-foreground">{formatDistanceToNow(new Date(f.created_at), { addSuffix: true, locale: ptBR })}</p>
                     </div>
                     <p className="text-sm">"{f.message}"</p>
                   </div>
                )) : <p className="text-center text-muted-foreground py-10">Você ainda não recebeu nenhum feedback.</p>}
              </div>
            </TabsContent>
          </Tabs>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default PerformanceModal;