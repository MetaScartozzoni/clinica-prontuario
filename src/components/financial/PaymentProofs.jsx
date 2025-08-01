import React, { useState, useEffect, useCallback } from 'react';
    import { supabase } from '@/lib/supabaseClient';
    import { useToast } from '@/components/ui/use-toast';
    import { Button } from '@/components/ui/button';
    import { Input } from '@/components/ui/input';
    import { Textarea } from '@/components/ui/textarea';
    import { Label } from '@/components/ui/label';
    import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogClose } from '@/components/ui/dialog';
    import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
    import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
    import { UploadCloud, Eye, Trash2, PlusCircle, Loader2, AlertTriangle, Edit2, Search, FileImage as FileIcon, Info } from 'lucide-react';
    import { format, parseISO } from 'date-fns';
    import { useAuth } from '@/contexts/SupabaseAuthContext';
    import { motion } from 'framer-motion';
    import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';

    const BUCKET_NAME = 'financial-proofs';

    const relatedTypeOptions = [
      { value: 'account_payable', label: 'Conta a Pagar' },
      { value: 'transaction', label: 'Transação Financeira' },
      { value: 'provider_payment', label: 'Pagamento a Prestador' },
      { value: 'other', label: 'Outro' },
    ];

    const ProofForm = ({ currentProof, onSubmit, onFileChange, onDescriptionChange, onRelatedToTypeChange, onRelatedToIdChange, description, relatedToType, relatedToId, relatedEntities, isUploading, file }) => {
      return (
        <form onSubmit={onSubmit} className="space-y-4 py-2 max-h-[70vh] overflow-y-auto pr-2">
          <div>
            <Label htmlFor="proof-file-input" className="label-custom">Arquivo do Comprovante</Label>
            <Input id="proof-file-input" type="file" onChange={onFileChange} className="mt-1 input-light-theme" accept="image/*,application/pdf,.doc,.docx,.xls,.xlsx,.txt" />
            {currentProof?.file_name && !file && <p className="text-xs text-muted-foreground mt-1">Atual: {currentProof.file_name}. Selecione novo para substituir.</p>}
          </div>
          <div>
            <Label htmlFor="description" className="label-custom">Descrição</Label>
            <Textarea id="description" value={description} onChange={(e) => onDescriptionChange(e.target.value)} placeholder="Ex: Pagamento conta de luz Mar/2025" className="mt-1 input-light-theme" />
          </div>
          <div>
            <Label htmlFor="relatedToType" className="label-custom">Relacionado a</Label>
            <Select value={relatedToType} onValueChange={onRelatedToTypeChange}>
              <SelectTrigger className="mt-1 input-light-theme"><SelectValue placeholder="Selecione o tipo de vínculo" /></SelectTrigger>
              <SelectContent>
                {relatedTypeOptions.map(opt => <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          {relatedToType && relatedToType !== 'other' && (
            <div>
              <Label htmlFor="relatedToId" className="label-custom">Vincular a</Label>
              <Select value={relatedToId} onValueChange={onRelatedToIdChange} disabled={relatedEntities.length === 0}>
                <SelectTrigger className="mt-1 input-light-theme"><SelectValue placeholder={relatedEntities.length > 0 ? `Selecione ${relatedTypeOptions.find(o => o.value === relatedToType)?.label || 'item'}`: `Nenhum item de ${relatedTypeOptions.find(o => o.value === relatedToType)?.label || 'tipo'} encontrado`} /></SelectTrigger>
                <SelectContent>
                  {relatedEntities.map(entity => <SelectItem key={entity.value} value={entity.value}>{entity.label}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          )}
          <DialogFooter className="pt-4">
            <DialogClose asChild><Button type="button" variant="outline" disabled={isUploading}>Cancelar</Button></DialogClose>
            <Button type="submit" disabled={isUploading} className="btn-frutacor">
              {isUploading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {currentProof ? 'Salvar Alterações' : 'Enviar Comprovante'}
            </Button>
          </DialogFooter>
        </form>
      );
    };

    const ProofsTable = ({ proofs, onEdit, onDelete }) => {
      return (
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="text-card-foreground/90">Arquivo</TableHead>
                <TableHead className="text-card-foreground/90">Descrição</TableHead>
                <TableHead className="text-card-foreground/90">Relacionado a</TableHead>
                <TableHead className="text-card-foreground/90">Data Upload</TableHead>
                <TableHead className="text-right text-card-foreground/90">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {proofs.map((proof) => (
                <TableRow key={proof.id} className="hover:bg-card-foreground/5">
                  <TableCell className="font-medium truncate max-w-xs">
                    <a href={proof.file_url} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline flex items-center">
                      <FileIcon className="mr-2 h-4 w-4 opacity-70 flex-shrink-0"/> 
                      <span className="truncate" title={proof.file_name}>{proof.file_name}</span>
                    </a>
                  </TableCell>
                  <TableCell className="text-card-foreground/80">{proof.description || '-'}</TableCell>
                  <TableCell className="text-card-foreground/80">{relatedTypeOptions.find(o=>o.value === proof.related_to_type)?.label || proof.related_to_type || '-'}</TableCell>
                  <TableCell className="text-card-foreground/80">{format(parseISO(proof.upload_date), 'dd/MM/yyyy HH:mm')}</TableCell>
                  <TableCell className="text-right space-x-1">
                    <Button variant="ghost" size="icon" onClick={() => window.open(proof.file_url, '_blank')} title="Visualizar" className="text-blue-400 hover:text-blue-300">
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => onEdit(proof)} title="Editar" className="text-yellow-400 hover:text-yellow-300">
                      <Edit2 className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => onDelete(proof.id, proof.file_url)} className="text-red-400 hover:text-red-300" title="Excluir">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      );
    };

    const PaymentProofs = () => {
      const { toast } = useToast();
      const { user } = useAuth();
      const [proofs, setProofs] = useState([]);
      const [isLoading, setIsLoading] = useState(false);
      const [isUploading, setIsUploading] = useState(false);
      const [error, setError] = useState(null);
      const [isModalOpen, setIsModalOpen] = useState(false);
      const [currentProof, setCurrentProof] = useState(null);

      const [file, setFile] = useState(null);
      const [description, setDescription] = useState('');
      const [relatedToType, setRelatedToType] = useState('');
      const [relatedToId, setRelatedToId] = useState('');
      const [relatedEntities, setRelatedEntities] = useState([]);

      const [searchTerm, setSearchTerm] = useState('');
      const [filterType, setFilterTypeState] = useState('');

      const fetchProofs = useCallback(async () => {
        setIsLoading(true);
        setError(null);
        try {
          let query = supabase.from('financial_payment_proofs').select('*').order('upload_date', { ascending: false });
          
          if (searchTerm) {
            query = query.or(`description.ilike.%${searchTerm}%,file_name.ilike.%${searchTerm}%`);
          }
          if (filterType) {
            query = query.eq('related_to_type', filterType);
          }

          const { data, error: fetchError } = await query;
          if (fetchError) throw fetchError;
          setProofs(data || []);
        } catch (err) {
          console.error("Erro ao buscar comprovantes:", err);
          setError("Não foi possível carregar os comprovantes.");
          toast({ title: "Erro ao Carregar Comprovantes", description: err.message, variant: "destructive" });
        } finally {
          setIsLoading(false);
        }
      }, [toast, searchTerm, filterType]);

      useEffect(() => {
        fetchProofs();
      }, [fetchProofs]);

      useEffect(() => {
        const fetchRelated = async () => {
          setRelatedEntities([]); 
          setRelatedToId(''); 
          if (!relatedToType || relatedToType === 'other') return;

          let tableName, selectFields, labelFormatter;

          if (relatedToType === 'account_payable') {
            tableName = 'financial_accounts_payable';
            selectFields = 'id, description, amount, due_date';
            labelFormatter = (item) => `Conta: ${item.description} (R$ ${item.amount} - Venc: ${format(parseISO(item.due_date), 'dd/MM/yyyy')})`;
          } else if (relatedToType === 'transaction') {
            tableName = 'financial_transactions';
            selectFields = 'id, description, amount, transaction_date';
            labelFormatter = (item) => `Transação: ${item.description || 'Sem descrição'} (R$ ${item.amount} - Data: ${format(parseISO(item.transaction_date), 'dd/MM/yyyy')})`;
          } else if (relatedToType === 'provider_payment') {
            tableName = 'financial_service_provider_payments';
            selectFields = 'id, provider_name, service_description, amount, payment_date';
            labelFormatter = (item) => `Pgto Prestador: ${item.provider_name} - ${item.service_description} (R$ ${item.amount} - Data: ${format(parseISO(item.payment_date), 'dd/MM/yyyy')})`;
          }

          if (tableName) {
            const { data, error: fetchError } = await supabase.from(tableName).select(selectFields).order('created_at', { ascending: false }).limit(50);
            if (!fetchError && data) {
              setRelatedEntities(data.map(item => ({ value: item.id, label: labelFormatter(item) })));
            } else if (fetchError) {
              console.error(`Erro ao buscar ${relatedToType}:`, fetchError);
              toast({ title: "Erro ao buscar itens relacionados", description: fetchError.message, variant: "warning" });
            }
          }
        };
        if(isModalOpen) fetchRelated();
      }, [relatedToType, isModalOpen, toast]);

      const handleFileChange = (event) => {
        if (event.target.files && event.target.files[0]) {
          setFile(event.target.files[0]);
        }
      };

      const resetForm = () => {
        setFile(null);
        setDescription('');
        setRelatedToType('');
        setRelatedToId('');
        setCurrentProof(null);
        const fileInput = document.getElementById('proof-file-input');
        if (fileInput) fileInput.value = '';
      };

      const handleSubmit = async (event) => {
        event.preventDefault();
        if (!file && !currentProof?.file_url) {
          toast({ title: "Arquivo Faltando", description: "Por favor, selecione um arquivo para upload.", variant: "destructive" });
          return;
        }
        if (!user?.id) {
          toast({ title: "Erro de Autenticação", description: "Usuário não identificado.", variant: "destructive" });
          return;
        }

        setIsUploading(true);
        try {
          let filePath = currentProof?.file_url;
          let proofFileName = currentProof?.file_name;
          let proofFileSize = currentProof?.file_size;
          let proofFileType = currentProof?.file_type;

          if (file) {
            if (currentProof?.file_url) {
                const oldPathParts = new URL(currentProof.file_url).pathname.split('/');
                const oldFullPathInStorage = oldPathParts.slice(oldPathParts.indexOf(BUCKET_NAME) + 1).join('/');
                if (oldFullPathInStorage) {
                    await supabase.storage.from(BUCKET_NAME).remove([oldFullPathInStorage]);
                }
            }
            
            proofFileName = `${user.id}/${Date.now()}-${file.name}`;
            const { data: uploadData, error: uploadError } = await supabase.storage
              .from(BUCKET_NAME)
              .upload(proofFileName, file);

            if (uploadError) throw uploadError;
            
            const { data: urlData } = supabase.storage.from(BUCKET_NAME).getPublicUrl(uploadData.path);
            filePath = urlData.publicUrl;
            proofFileSize = file.size;
            proofFileType = file.type;
          }

          const proofData = {
            description,
            related_to_type: relatedToType || null,
            related_to_id: relatedToId || null,
            user_id: user.id,
            file_name: proofFileName,
            file_url: filePath,
            file_size: proofFileSize,
            file_type: proofFileType,
            upload_date: currentProof?.upload_date ? currentProof.upload_date : new Date().toISOString(),
            updated_at: new Date().toISOString(),
          };
          
          let operationPromise;
          if (currentProof) {
            operationPromise = supabase.from('financial_payment_proofs').update(proofData).eq('id', currentProof.id);
          } else {
            operationPromise = supabase.from('financial_payment_proofs').insert({ ...proofData, created_at: new Date().toISOString() });
          }

          const { error: dbError } = await operationPromise;
          if (dbError) throw dbError;

          toast({ title: "Sucesso!", description: `Comprovante ${currentProof ? 'atualizado' : 'enviado'} com sucesso.`, variant: "success" });
          setIsModalOpen(false);
          resetForm();
          fetchProofs();
        } catch (err) {
          console.error("Erro ao enviar/atualizar comprovante:", err);
          toast({ title: "Erro", description: err.message, variant: "destructive" });
        } finally {
          setIsUploading(false);
        }
      };
      
      const handleEdit = (proof) => {
        setCurrentProof(proof);
        setDescription(proof.description || '');
        setRelatedToType(proof.related_to_type || '');
        setTimeout(() => setRelatedToId(proof.related_to_id || ''), 150);
        
        setFile(null);
        const fileInput = document.getElementById('proof-file-input');
        if (fileInput) fileInput.value = '';
        setIsModalOpen(true);
      };

      const handleDelete = async (proofId, fileUrl) => {
        if (!window.confirm("Tem certeza que deseja excluir este comprovante? Esta ação não pode ser desfeita.")) return;

        setIsLoading(true);
        try {
          const { error: dbError } = await supabase.from('financial_payment_proofs').delete().eq('id', proofId);
          if (dbError) throw dbError;

          if (fileUrl) {
              const pathParts = new URL(fileUrl).pathname.split('/');
              const fullPathInStorage = pathParts.slice(pathParts.indexOf(BUCKET_NAME) + 1).join('/');
              if (fullPathInStorage) {
                 const { error: storageError } = await supabase.storage.from(BUCKET_NAME).remove([fullPathInStorage]);
                 if (storageError) console.warn("Could not delete from storage, but proceeding: ", storageError.message);
              }
          }
          
          toast({ title: "Sucesso", description: "Comprovante excluído.", variant: "success" });
          fetchProofs();
        } catch (err) {
          console.error("Erro ao excluir comprovante:", err);
          toast({ title: "Erro ao Excluir", description: err.message, variant: "destructive" });
        } finally {
          setIsLoading(false);
        }
      };

      return (
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="space-y-6"
        >
          <Card className="custom-card w-full min-h-[400px] flex flex-col">
            <CardHeader className="flex flex-col md:flex-row justify-between items-center p-6 bg-card-foreground/5">
              <div>
                <CardTitle className="text-2xl text-primary">Gerenciamento de Comprovantes</CardTitle>
                <CardDescription className="text-card-foreground/80">Adicione, visualize e gerencie comprovantes de pagamento.</CardDescription>
              </div>
              <Dialog open={isModalOpen} onOpenChange={(isOpen) => { setIsModalOpen(isOpen); if (!isOpen) resetForm(); }}>
                <DialogTrigger asChild>
                  <Button className="btn-primary-frutacor" onClick={() => {setCurrentProof(null); resetForm();}}>
                    <PlusCircle className="mr-2 h-4 w-4" /> Adicionar Comprovante
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[525px] modal-light-theme">
                  <DialogHeader>
                    <DialogTitle className="dialog-title-custom">{currentProof ? 'Editar' : 'Adicionar Novo'} Comprovante</DialogTitle>
                  </DialogHeader>
                  <ProofForm
                    currentProof={currentProof}
                    onSubmit={handleSubmit}
                    onFileChange={handleFileChange}
                    onDescriptionChange={setDescription}
                    onRelatedToTypeChange={setRelatedToType}
                    onRelatedToIdChange={setRelatedToId}
                    description={description}
                    relatedToType={relatedToType}
                    relatedToId={relatedToId}
                    relatedEntities={relatedEntities}
                    isUploading={isUploading}
                    file={file}
                  />
                </DialogContent>
              </Dialog>
            </CardHeader>

            <CardContent className="p-6 flex-grow">
              <div className="flex flex-col md:flex-row gap-2 mb-4">
                <Input
                  type="text"
                  placeholder="Buscar por descrição ou nome do arquivo..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="input-light-theme flex-grow"
                />
                <Select value={filterType} onValueChange={setFilterTypeState}>
                  <SelectTrigger className="w-full md:w-[200px] input-light-theme">
                    <SelectValue placeholder="Filtrar por tipo" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">Todos os Tipos</SelectItem>
                    {relatedTypeOptions.map(opt => <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>

              {isLoading && <div className="flex flex-col justify-center items-center h-full text-muted-foreground"><Loader2 className="h-12 w-12 animate-spin text-primary mb-4" /><p className="text-lg">Carregando comprovantes...</p></div>}
              {!isLoading && error && <div className="flex flex-col justify-center items-center h-full text-destructive text-center"><AlertTriangle className="h-12 w-12 mb-4" /><p className="text-lg font-semibold">Erro ao Carregar</p><p className="mb-4">{error}</p><Button onClick={fetchProofs} variant="outline">Tentar Novamente</Button></div>}
              {!isLoading && !error && proofs.length === 0 && <div className="flex flex-col justify-center items-center h-full text-muted-foreground text-center"><Info className="h-12 w-12 mb-4 text-primary" /><p className="text-lg font-semibold">Nenhum Comprovante</p><p>Adicione ou verifique os filtros aplicados.</p></div>}
              
              {!isLoading && !error && proofs.length > 0 && (
                <ProofsTable proofs={proofs} onEdit={handleEdit} onDelete={handleDelete} />
              )}
            </CardContent>
          </Card>
        </motion.div>
      );
    };

    export default PaymentProofs;