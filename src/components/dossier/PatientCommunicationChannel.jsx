import React, { useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { useToast } from '@/components/ui/use-toast';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Loader2, Send, CornerDownLeft } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '@/contexts/SupabaseAuthContext';

const PatientCommunicationChannel = ({ patientId }) => {
  const { toast } = useToast();
  const { user } = useAuth();
  const [notes, setNotes] = useState([]);
  const [newNote, setNewNote] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const notesEndRef = useRef(null);

  const scrollToBottom = () => {
    notesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };
  
  const fetchNotes = useCallback(async () => {
    if (!patientId) return;
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('patient_notes')
        .select('*, author:author_id(full_name, avatar_url)')
        .eq('patient_id', patientId)
        .order('created_at', { ascending: true });
      if (error) throw error;
      setNotes(data || []);
    } catch (error) {
      toast({ title: "Erro ao buscar notas", description: error.message, variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  }, [patientId, toast]);

  useEffect(() => {
    fetchNotes();
  }, [fetchNotes]);

  useEffect(() => {
    if (!patientId) return;
    const channel = supabase.channel(`patient-notes:${patientId}`)
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'patient_notes',
        filter: `patient_id=eq.${patientId}`
      }, (payload) => {
         const getNewNoteWithAuthor = async () => {
          const { data, error } = await supabase
            .from('profiles')
            .select('full_name, avatar_url')
            .eq('user_id', payload.new.author_id)
            .single();

          if (!error) {
            const enrichedNote = { ...payload.new, author: data };
            setNotes(currentNotes => [...currentNotes, enrichedNote]);
          }
        };
        getNewNoteWithAuthor();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [patientId]);
  
  useEffect(() => {
    scrollToBottom();
  }, [notes]);

  const handleSubmit = async () => {
    if (newNote.trim() === '' || !user) return;
    setIsSending(true);

    try {
      const { error } = await supabase
        .from('patient_notes')
        .insert({
          patient_id: patientId,
          author_id: user.id,
          content: newNote.trim()
        });
      
      if (error) throw error;
      setNewNote('');
    } catch (error) {
      toast({ title: "Erro ao enviar nota", description: error.message, variant: "destructive" });
    } finally {
      setIsSending(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  return (
    <div className="flex flex-col h-[60vh]">
      <div className="flex-grow overflow-y-auto pr-4 space-y-4">
        {isLoading ? (
          <div className="flex justify-center items-center h-full"><Loader2 className="h-8 w-8 animate-spin text-violet-400" /></div>
        ) : notes.length === 0 ? (
          <div className="text-center py-10">
            <p className="text-violet-300">Nenhuma nota interna para este paciente ainda.</p>
          </div>
        ) : (
          <AnimatePresence>
            {notes.map((note) => (
              <motion.div
                key={note.id}
                layout
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="flex items-start gap-3"
              >
                <div className="flex-grow p-3 rounded-lg bg-black/30">
                  <div className="flex justify-between items-center">
                    <p className="font-semibold text-pink-300 text-sm">{note.author?.full_name || 'Usuário'}</p>
                    <p className="text-xs text-violet-400">{new Date(note.created_at).toLocaleString()}</p>
                  </div>
                  <p className="mt-1 text-violet-200 whitespace-pre-wrap">{note.content}</p>
                </div>
              </motion.div>
            ))}
            <div ref={notesEndRef} />
          </AnimatePresence>
        )}
      </div>
      <div className="mt-4 pt-4 border-t border-white/10">
        <div className="relative">
          <Textarea
            value={newNote}
            onChange={(e) => setNewNote(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Digite uma nota para a equipe... (Shift + Enter para nova linha)"
            className="pr-24"
            disabled={isSending}
          />
          <Button
            onClick={handleSubmit}
            disabled={isSending || newNote.trim() === ''}
            className="absolute right-2 bottom-2"
            size="sm"
          >
            {isSending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
            <span className="ml-2 hidden sm:inline">Enviar</span>
            <CornerDownLeft className="ml-1 h-3 w-3 hidden sm:inline" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default PatientCommunicationChannel;