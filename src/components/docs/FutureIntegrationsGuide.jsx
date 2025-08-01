
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ClipboardCopy, Database, Users, KeyRound, Share2, Server, UserCheck } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';

const CodeBlock = ({ code }) => {
  const { toast } = useToast();
  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    toast({
      title: "Copiado!",
      description: "O prompt foi copiado para a área de transferência.",
    });
  };

  return (
    <div className="relative bg-gray-800 text-white rounded-lg p-4 font-mono text-sm my-2">
      <pre><code>{code}</code></pre>
      <button
        onClick={handleCopy}
        className="absolute top-2 right-2 p-1.5 bg-gray-700 rounded-md hover:bg-gray-600 transition-colors"
        aria-label="Copiar código"
      >
        <ClipboardCopy className="h-4 w-4" />
      </button>
    </div>
  );
};

const FutureIntegrationsGuide = () => {
  const secretaryPrompt = `Olá, Horizon! Estou pronto para criar o Dashboard da Secretaria como um novo projeto. Vamos usar a base de dados e a autenticação do projeto principal da clínica. O objetivo é ter uma interface focada em agendamentos, cadastro de pacientes e comunicação.`;
  const patientPrompt = `Olá, Horizon! Vamos agora criar o Canal do Paciente em um projeto separado. Ele deve se conectar à nossa base de dados existente. O portal deve permitir que os pacientes vejam seus agendamentos, resultados de exames e se comuniquem com a clínica.`;

  return (
    <div className="space-y-6">
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Share2 className="h-6 w-6 text-primary" />
            Guia para Expansão Futura
          </CardTitle>
          <CardDescription>
            Planejando a criação de portais dedicados para a Secretaria e Pacientes.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <p>
            A decisão de criar portais separados para diferentes perfis de usuário é uma estratégia excelente para escalar sua operação. Abaixo estão os prompts que você pode usar quando estiver pronto para criar esses novos projetos, garantindo uma integração perfeita com o sistema atual.
          </p>
        </CardContent>
      </Card>

      <div className="grid md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Portal da Secretaria</CardTitle>
            <CardDescription>Um dashboard focado nas tarefas diárias da equipe de atendimento.</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="mb-2">Use este prompt para iniciar o projeto do Portal da Secretaria:</p>
            <CodeBlock code={secretaryPrompt} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Canal do Paciente</CardTitle>
            <CardDescription>Uma área segura para o paciente acessar suas informações.</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="mb-2">Use este prompt para iniciar o projeto do Canal do Paciente:</p>
            <CodeBlock code={patientPrompt} />
          </CardContent>
        </Card>
      </div>

      <Card className="bg-blue-900/30 border-blue-500/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-blue-300">
            <Server className="h-6 w-6" />
            Como a Integração Funcionará
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 text-blue-200">
          <div className="flex items-start gap-3">
            <Database className="h-5 w-5 mt-1 flex-shrink-0" />
            <div>
              <h4 className="font-semibold">Banco de Dados Unificado</h4>
              <p className="text-sm">Todos os projetos (Clínica, Secretaria, Paciente) acessarão a mesma base de dados do Supabase. Isso garante que a informação esteja sempre sincronizada e consistente.</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <KeyRound className="h-5 w-5 mt-1 flex-shrink-0" />
            <div>
              <h4 className="font-semibold">Autenticação Centralizada</h4>
              <p className="text-sm">O login será o mesmo para todos os portais. Um usuário (ex: secretaria@email.com) usará a mesma senha para acessar tanto o portal principal quanto o da secretaria, com as permissões corretas aplicadas automaticamente.</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <UserCheck className="h-5 w-5 mt-1 flex-shrink-0" />
            <div>
              <h4 className="font-semibold">Perfis de Acesso (Roles)</h4>
              <p className="text-sm">A sua base de dados já está preparada com os perfis 'receptionist' (secretaria) e 'patient' (paciente). Quando criarmos os novos portais, eles já saberão qual interface e quais funcionalidades mostrar para cada tipo de usuário.</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default FutureIntegrationsGuide;
