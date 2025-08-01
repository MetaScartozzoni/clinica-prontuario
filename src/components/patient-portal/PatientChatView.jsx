import React, { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { supabase } from '@/lib/supabaseClient';
import { useToast } from '@/components/ui/use-toast';
import { Loader2, Send, Paperclip, FileText } from 'lucide-react';
import { useChat } from '@/hooks/useChat';

const PatientChatView = ({ patientId, currentUserId }) => {
  const { toast } = useToast();
  const { messages, isLoading, isSending, sendMessage } = useChat(patientId, 'patient');
  const [newMessage, setNewMessage] = useState('');
  const [file, setFile] = useState(null);
  const messagesEndRef = useRef(null);
  const fileInputRef = useRef(null);

  React.useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleFileUpload = async () => {
    if (!file) return null;

    const filePath = `patient-documents/${patientId}/${Date.now()}-${file.name}`;
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('medical-record-attachments')
      .upload(filePath, file);

    if (uploadError) {
      toast({ title: "Erro no Upload", description: uploadError.message, variant: "destructive" });
      throw uploadError;
    }

    const { data: urlData } = supabase.storage
      .from('medical-record-attachments')
      .getPublicUrl(uploadData.path);

    return { url: urlData.publicUrl, name: file.name };
  };

  const handleSendMessage = async () => {
    if ((!newMessage.trim() && !file) || !patientId || !currentUserId) return;
    
    let attachment = null;
    if (file) {
      attachment = await handleFileUpload();
    }

    const success = await sendMessage({
      content: newMessage,
      senderId: currentUserId,
      senderType: 'patient',
      patientId: patientId,
      channel: 'patient_portal',
      context: 'suporte_geral',
      attachment: attachment,
    });

    if (success) {
      setNewMessage('');
      setFile(null);
      if(fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const getSenderName = (message) => {
    if (message.sender_type === 'clinic') return 'Clínica';
    if (message.sender_type === 'patient') return 'Você';
    return 'Sistema';
  };

  return (
    <div className="h-[60vh] flex flex-col border rounded-lg">
      <div className="flex-grow overflow-y-auto p-4 space-y-4 bg-muted/30">
        {isLoading ? <div className="flex justify-center items-center h-full"><Loader2 className="mx-auto h-8 w-8 animate-spin text-primary" /></div> : 
          messages.length === 0 ? <p className="text-center text-muted-foreground pt-10">Nenhuma mensagem ainda. Inicie a conversa!</p> :
          messages.map(msg => (
            <div key={msg.id} className={`flex ${msg.sender_type === 'patient' ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[70%] p-3 rounded-lg shadow-md ${msg.sender_type === 'patient' ? 'bg-primary text-primary-foreground' : 'bg-background border'}`}>
                <p className="text-xs font-semibold mb-1">{getSenderName(msg)}</p>
                {msg.type === 'file' && msg.attachment_url ? (
                  <a href={msg.attachment_url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 p-2 bg-black/10 rounded-md hover:bg-black/20 transition-colors">
                    <FileText className="h-5 w-5" />
                    <div>
                      <p className="text-sm font-medium">{msg.attachment_name}</p>
                      <p className="text-xs opacity-80">Clique para ver/baixar</p>
                    </div>
                  </a>
                ) : (
                  <p className="text-sm whitespace-pre-wrap">{msg.message_content}</p>
                )}
                <p className="text-xs text-muted-foreground/80 mt-1 text-right">{new Date(msg.sent_at).toLocaleString()}</p>
              </div>
            </div>
          ))
        }
        <div ref={messagesEndRef} />
      </div>
      <div className="p-4 border-t bg-background">
        <div className="w-full space-y-2">
          <Textarea 
            placeholder="Digite sua mensagem..." 
            value={newMessage} 
            onChange={(e) => setNewMessage(e.target.value)}
            className="min-h-[80px] focus-visible:ring-primary"
            disabled={isSending}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSendMessage();
              }
            }}
          />
          {file && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground p-2 border rounded-md">
              <FileText className="h-4 w-4" />
              <span>{file.name}</span>
              <button onClick={() => { setFile(null); if(fileInputRef.current) fileInputRef.current.value = ''; }} className="ml-auto text-red-500 hover:text-red-700">&times;</button>
            </div>
          )}
          <div className="flex flex-wrap justify-between items-center gap-2">
            <Button variant="ghost" size="icon" onClick={() => fileInputRef.current.click()} disabled={isSending}>
              <Paperclip className="h-5 w-5" />
            </Button>
            <Input type="file" ref={fileInputRef} onChange={(e) => setFile(e.target.files[0])} className="hidden" />
            <Button onClick={handleSendMessage} disabled={isSending || (!newMessage.trim() && !file)} size="sm">
              {isSending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />} <Send className="mr-2 h-4 w-4" /> Enviar
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PatientChatView;