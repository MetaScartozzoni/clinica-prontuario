import React, { useState } from 'react';
    import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
    import { Button } from '@/components/ui/button';
    import { Input } from '@/components/ui/input';
    import { Label } from '@/components/ui/label';
    import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
    import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
    import { useToast } from '@/components/ui/use-toast';
    import Papa from 'papaparse';
    import { supabase } from '@/lib/customSupabaseClient';
    import { useAuth } from '@/contexts/SupabaseAuthContext';
    import { FileUp, Loader2, CheckCircle, AlertTriangle, Upload } from 'lucide-react';

    const tableOptions = [
      { value: 'patients', label: 'Pacientes', requiredFields: ['name', 'email'] },
      { value: 'quotes', label: 'Orçamentos', requiredFields: ['patient_name', 'total_value'] },
      { value: 'appointments', label: 'Agendamentos', requiredFields: ['title', 'start_time', 'end_time'] },
    ];

    const DataImport = () => {
      const { session } = useAuth();
      const { toast } = useToast();
      const [selectedTable, setSelectedTable] = useState('');
      const [file, setFile] = useState(null);
      const [parsedData, setParsedData] = useState([]);
      const [headers, setHeaders] = useState([]);
      const [isLoading, setIsLoading] = useState(false);
      const [isUploading, setIsUploading] = useState(false);
      const [error, setError] = useState('');
      const [fieldMapping, setFieldMapping] = useState({});

      const handleFileChange = (e) => {
        const selectedFile = e.target.files[0];
        if (!selectedFile || !selectedTable) {
          toast({ title: "Atenção", description: "Selecione uma tabela de destino antes de escolher o arquivo.", variant: "warning" });
          return;
        }
        setFile(selectedFile);
        setIsLoading(true);
        setError('');

        Papa.parse(selectedFile, {
          header: true,
          skipEmptyLines: true,
          complete: (results) => {
            if (results.errors.length > 0) {
              setError(`Erro ao processar o CSV: ${results.errors[0].message}`);
              setParsedData([]);
              setHeaders([]);
            } else {
              setParsedData(results.data);
              const detectedHeaders = results.meta.fields;
              setHeaders(detectedHeaders);
              
              const newMapping = {};
              const targetColumns = Object.keys(results.data[0] || {});
              
              detectedHeaders.forEach(header => {
                const cleanHeader = header.toLowerCase().replace(/ /g, '_');
                if(targetColumns.includes(cleanHeader)){
                  newMapping[header] = cleanHeader;
                }
              });
              setFieldMapping(newMapping);
            }
            setIsLoading(false);
          },
        });
      };

      const handleImport = async () => {
        if (parsedData.length === 0) {
          toast({ title: 'Nenhum dado para importar', variant: 'warning' });
          return;
        }
        setIsUploading(true);

        const dataToInsert = parsedData.map(row => {
          const newRow = {};
          for (const key in row) {
            if (fieldMapping[key]) {
              newRow[fieldMapping[key]] = row[key];
            }
          }
          return newRow;
        });

        try {
          const { error: insertError } = await supabase.from(selectedTable).insert(dataToInsert);
          if (insertError) throw insertError;
          
          await supabase.rpc('log_audit_trail', {
            p_action: 'data_import_successful',
            p_details: {
              table: selectedTable,
              rowCount: dataToInsert.length,
              fileName: file.name
            }
          });

          toast({ title: 'Importação Concluída!', description: `${dataToInsert.length} registros foram importados para a tabela ${selectedTable}.`, variant: 'success' });
          setParsedData([]);
          setHeaders([]);
          setFile(null);
        } catch (err) {
          setError(`Erro na importação: ${err.message}`);
          toast({ title: 'Erro na Importação', description: err.message, variant: 'destructive' });
          await supabase.rpc('log_audit_trail', {
            p_action: 'data_import_failed',
            p_details: {
              table: selectedTable,
              fileName: file.name,
              error: err.message
            }
          });
        } finally {
          setIsUploading(false);
        }
      };

      return (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileUp className="h-6 w-6 text-primary" /> Importação de Dados
            </CardTitle>
            <CardDescription>Faça upload de planilhas CSV para popular tabelas do sistema. Garanta que a primeira linha do seu arquivo contenha os nomes das colunas.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <Label htmlFor="table-select">1. Tabela de Destino</Label>
                <Select onValueChange={setSelectedTable} value={selectedTable}>
                  <SelectTrigger id="table-select"><SelectValue placeholder="Selecione uma tabela..." /></SelectTrigger>
                  <SelectContent>
                    {tableOptions.map(opt => <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex-1">
                <Label htmlFor="csv-upload">2. Arquivo CSV</Label>
                <Input id="csv-upload" type="file" accept=".csv" onChange={handleFileChange} disabled={!selectedTable || isLoading} />
              </div>
            </div>

            {isLoading && <div className="flex justify-center items-center py-4"><Loader2 className="mr-2 h-5 w-5 animate-spin" />Processando arquivo...</div>}
            {error && <div className="text-destructive p-3 bg-destructive/10 rounded-md flex items-center gap-2"><AlertTriangle className="h-4 w-4" />{error}</div>}

            {parsedData.length > 0 && (
              <div className="space-y-4">
                <h3 className="font-semibold">Pré-visualização e Mapeamento de Campos</h3>
                <p className="text-sm text-muted-foreground">Revise os primeiros registros e confirme o mapeamento das colunas do seu arquivo para os campos da tabela.</p>
                <div className="overflow-x-auto border rounded-lg">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        {headers.map(header => <TableHead key={header}>{header}</TableHead>)}
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {parsedData.slice(0, 3).map((row, rowIndex) => (
                        <TableRow key={rowIndex}>
                          {headers.map(header => <TableCell key={header}>{row[header]}</TableCell>)}
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
                
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 p-4 border rounded-lg">
                  {headers.map(header => (
                    <div key={header} className="space-y-1">
                      <Label>{header}</Label>
                      <Input value={fieldMapping[header] || ''} onChange={e => setFieldMapping({...fieldMapping, [header]: e.target.value})} placeholder="Campo da tabela" />
                    </div>
                  ))}
                </div>

                <Button onClick={handleImport} disabled={isUploading} className="w-full md:w-auto btn-primary-frutacor">
                  {isUploading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Upload className="mr-2 h-4 w-4" />}
                  Importar {parsedData.length} Registros
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      );
    };

    export default DataImport;