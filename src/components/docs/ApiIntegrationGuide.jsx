
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Share2, ArrowRight, Database, Cloud, FileJson, Key, Webhook } from 'lucide-react';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';

const CodeBlock = ({ code, language }) => (
  <div className="my-4 rounded-lg overflow-hidden bg-[#1e1e1e]">
    <SyntaxHighlighter language={language} style={vscDarkPlus} customStyle={{ margin: 0, background: 'transparent' }}>
      {code.trim()}
    </SyntaxHighlighter>
  </div>
);

const ApiIntegrationGuide = () => {
  const insertCode = `
import { supabase } from '@/lib/supabaseClient';

async function addPatient(patientData) {
  const { data, error } = await supabase
    .from('patients') // Nome da sua tabela
    .insert([
      { 
        first_name: patientData.firstName, 
        last_name: patientData.lastName,
        email: patientData.email,
        phone: patientData.phone,
        // ...outros campos
      },
    ])
    .select();

  if (error) {
    console.error('Erro ao inserir paciente:', error);
    return null;
  }

  console.log('Paciente inserido:', data);
  return data;
}
  `;

  const fetchCode = `
import { supabase } from '@/lib/supabaseClient';

async function getPatientById(patientId) {
  const { data, error } = await supabase
    .from('patients') // Nome da sua tabela
    .select('*') // Seleciona todas as colunas
    .eq('id', patientId) // Filtra pelo ID
    .single(); // Espera um único resultado

  if (error) {
    console.error('Erro ao buscar paciente:', error);
    return null;
  }

  console.log('Paciente encontrado:', data);
  return data;
}
  `;

  const webhookPayload = `
{
  "submissionID": "5432154321543215432",
  "formID": "123451234512345123",
  "formTitle": "Formulário de Anamnese",
  "answers": {
    "3": {
      "name": "queixaPrincipal",
      "text": "Queixa Principal",
      "answer": "Dor de cabeça constante."
    },
    "4": {
      "name": "nomeCompleto",
      "text": "Nome Completo",
      "answer": "Maria da Silva"
    },
    // ...outras respostas
  },
  "rawRequest": {
    "q_calendly_uuid": "EVENTO-CALENDLY-12345" // Campo oculto crucial
  }
}
  `;

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-xl">
            <Share2 className="h-6 w-6 text-primary" />
            Guia de Integração de API com Supabase
          </CardTitle>
          <p className="text-muted-foreground">
            Como enviar e receber dados entre sua aplicação e o Supabase.
          </p>
        </CardHeader>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Cloud className="h-5 w-5" />
            Arquitetura: Webhook (JotForm) para Supabase
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="mb-4">
            A forma mais robusta de integrar formulários externos (como JotForm) é via Webhooks. Quando um formulário é preenchido, ele envia os dados para um endpoint seguro na Supabase, que então processa e armazena as informações.
          </p>
          <div className="flex flex-col md:flex-row items-center justify-around gap-4 p-4 bg-muted rounded-lg">
            <div className="text-center">
              <FileJson className="h-8 w-8 mx-auto mb-2 text-blue-400" />
              <p className="font-semibold">1. JotForm</p>
              <p className="text-sm">Usuário preenche</p>
            </div>
            <ArrowRight className="h-6 w-6 text-muted-foreground hidden md:block" />
            <div className="text-center">
              <Webhook className="h-8 w-8 mx-auto mb-2 text-purple-400" />
              <p className="font-semibold">2. Webhook</p>
              <p className="text-sm">Envia os dados</p>
            </div>
            <ArrowRight className="h-6 w-6 text-muted-foreground hidden md:block" />
            <div className="text-center">
              <Cloud className="h-8 w-8 mx-auto mb-2 text-green-400" />
              <p className="font-semibold">3. Supabase Edge Function</p>
              <p className="text-sm">Recebe e processa</p>
            </div>
            <ArrowRight className="h-6 w-6 text-muted-foreground hidden md:block" />
            <div className="text-center">
              <Database className="h-8 w-8 mx-auto mb-2 text-red-400" />
              <p className="font-semibold">4. Banco de Dados</p>
              <p className="text-sm">Armazena os dados</p>
            </div>
          </div>
          <p className="mt-4 text-sm text-muted-foreground">
            Esta arquitetura já está implementada. Você pode ver a URL do Webhook na aba "JotForm".
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileJson className="h-5 w-5" />
            Estrutura do Payload (Dados Enviados)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p>
            Quando um formulário JotForm envia dados para o nosso webhook, ele o faz em um formato JSON específico. O mais importante é o objeto `answers`, que contém as respostas, e o campo oculto `q_calendly_uuid` que usamos para vincular a submissão ao agendamento do paciente.
          </p>
          <CodeBlock code={webhookPayload} language="json" />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="h-5 w-5" />
            Endpoints da API Supabase (Exemplos)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="mb-2">
            Para interagir diretamente com o banco de dados a partir da sua aplicação (frontend), você usará o cliente JavaScript do Supabase. Ele constrói as chamadas de API para você.
          </p>
          <h4 className="font-semibold mt-4">1. Enviando Dados (INSERT)</h4>
          <p>Para criar um novo registro em uma tabela (ex: `patients`):</p>
          <CodeBlock code={insertCode} language="javascript" />

          <h4 className="font-semibold mt-6">2. Recebendo Dados (SELECT)</h4>
          <p>Para buscar um registro específico de uma tabela:</p>
          <CodeBlock code={fetchCode} language="javascript" />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Key className="h-5 w-5" />
            Autenticação e Segurança
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="list-disc space-y-2 pl-5">
            <li>
              <strong>Chamadas do Frontend:</strong> O cliente Supabase (`supabase-js`) gerencia a autenticação automaticamente. Ele anexa o token (JWT) do usuário logado a cada requisição, e o Supabase aplica as Políticas de Segurança a Nível de Linha (RLS) para garantir que o usuário só acesse os dados que tem permissão.
            </li>
            <li>
              <strong>Chamadas do Webhook:</strong> A Edge Function é executada em um ambiente seguro no servidor do Supabase. Ela usa uma chave especial (`SERVICE_ROLE_KEY`), que tem permissões de administrador, para inserir os dados no banco. Isso é seguro porque a chave nunca é exposta no navegador.
            </li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
};

export default ApiIntegrationGuide;
