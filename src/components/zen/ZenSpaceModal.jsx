import React, { useState, useEffect, useRef } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { useProfile } from '@/contexts/ProfileContext';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Loader2, Send, Sparkles, HelpCircle, ClipboardCheck } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useToast } from '../ui/use-toast';
import { useNavigate } from 'react-router-dom';

const inspirationalMessages = [
  "Acredite no seu potencial. Você é mais forte do que imagina.",
  "Cada pequeno passo na direção certa é um grande progresso.",
  "A gentileza é uma linguagem que o surdo pode ouvir e o cego pode ver.",
  "O sucesso é a soma de pequenos esforços repetidos dia após dia.",
  "Não tenha medo de desistir do bom para perseguir o ótimo.",
  "Sua atitude, não sua aptidão, determinará sua altitude."
];

const ZenSpaceModal = ({ isOpen, onClose }) => {
  const { profile } = useProfile();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const scrollAreaRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      const randomMessage = inspirationalMessages[Math.floor(Math.random() * inspirationalMessages.length)];
      const greeting = `Olá, ${profile?.first_name || 'pessoa incrível'}! Como você está se sentindo hoje? ✨ Lembre-se: ${randomMessage}`;
      setMessages([{ sender: 'ai', content: greeting, id: 1 }]);
    }
  }, [isOpen, profile]);

  const scrollToBottom = () => {
    // Implement scroll logic if needed in the future
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;
    
    toast({
      title: "🚧 IA em treinamento!",
      description: "Nosso guia virtual ainda está aprendendo. Por enquanto, as respostas são limitadas. Use os botões abaixo para ações rápidas!",
    });
    setInput('');
  };

  const handleQuickAction = (action) => {
    switch (action) {
      case 'help':
        navigate('/ajuda');
        onClose();
        break;
      case 'tasks':
        navigate('/central-de-tarefas');
        onClose();
        break;
      default:
        break;
    }
  };


  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl h-[70vh] flex flex-col p-0">
        <DialogHeader className="p-6 pb-2">
          <DialogTitle className="flex items-center gap-2 text-2xl">
            <Sparkles className="text-sky-400" /> Espaço Zen
          </DialogTitle>
          <DialogDescription>
            Seu guia virtual para dúvidas, inspiração e bem-estar.
          </DialogDescription>
        </DialogHeader>
        <ScrollArea className="flex-grow px-6">
            <AnimatePresence>
              <div className="space-y-4">
              {messages.map((msg) => (
                <motion.div
                  key={msg.id}
                  layout
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3 }}
                  className={`flex items-end gap-2 ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div className={`rounded-lg px-4 py-2 max-w-sm md:max-w-md ${
                      msg.sender === 'user' 
                        ? 'bg-violet-600 text-white' 
                        : 'bg-gray-700 text-white'
                    }`}
                  >
                    {msg.content}
                  </div>
                </motion.div>
              ))}
              </div>
            </AnimatePresence>
        </ScrollArea>
        <DialogFooter className="p-4 border-t border-white/10 flex-col sm:flex-col items-stretch space-y-2">
          <div className="flex gap-2 justify-center">
            <Button variant="outline" size="sm" onClick={() => handleQuickAction('help')}><HelpCircle className="mr-2 h-4 w-4" /> Dúvida sobre o sistema</Button>
            <Button variant="outline" size="sm" onClick={() => handleQuickAction('tasks')}><ClipboardCheck className="mr-2 h-4 w-4" /> Preciso de ajuda com tarefas</Button>
          </div>
          <form onSubmit={handleSendMessage} className="flex items-center gap-2">
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Digite sua mensagem..."
              disabled={isLoading}
              className="flex-grow"
            />
            <Button type="submit" disabled={isLoading || !input.trim()}>
              {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
            </Button>
          </form>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ZenSpaceModal;