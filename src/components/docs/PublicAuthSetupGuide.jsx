
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Lightbulb, Link as LinkIcon, AlertTriangle } from 'lucide-react';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';

const PublicAuthSetupGuide = () => {
  const currentOrigin = typeof window !== 'undefined' ? window.location.origin : 'https://sua-url-de-publicacao.com';

  const codeBlockStyle = {
    borderRadius: '0.5rem',
    padding: '1rem',
    fontSize: '0.9rem',
    backgroundColor: '#1e1e1e',
  };

  return (
    <Card className="shadow-lg border-t-4 border-primary">
      <CardHeader>
        <CardTitle className="flex items-center gap-2"><LinkIcon /> Guia de Configuração de Autenticação</CardTitle>
        <CardDescription>
          Para garantir que o login, cadastro e recuperação de senha funcionem corretamente após a publicação,
          siga estes passos no seu painel do Supabase.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Ação Obrigatória Pós-Publicação</AlertTitle>
          <AlertDescription>
            Esta configuração é **obrigatória** para que a autenticação de usuários funcione no seu domínio publicado.
          </AlertDescription>
        </Alert>

        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Passo 1: Navegue até as Configurações de URL</h3>
          <p className="text-sm text-muted-foreground">
            No seu projeto Supabase, vá para a seção <Badge variant="secondary">Authentication</Badge> e depois clique em <Badge variant="secondary">URL Configuration</Badge> no menu lateral.
          </p>
        </div>

        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Passo 2: Configure a URL do Site</h3>
          <p className="text-sm text-muted-foreground">
            No campo <Badge>Site URL</Badge>, insira a URL principal do seu site, que você recebeu após a publicação.
          </p>
          <SyntaxHighlighter language="bash" style={vscDarkPlus} customStyle={codeBlockStyle}>
            {currentOrigin}
          </SyntaxHighlighter>
        </div>

        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Passo 3: Adicione as URLs de Redirecionamento</h3>
          <p className="text-sm text-muted-foreground">
            No campo <Badge>Redirect URLs</Badge>, você precisa adicionar a mesma URL principal do seu site. Use o botão "Add URL" e insira a URL do passo anterior.
          </p>
          <SyntaxHighlighter language="bash" style={vscDarkPlus} customStyle={codeBlockStyle}>
            {currentOrigin}
          </SyntaxHighlighter>
          <Alert>
            <Lightbulb className="h-4 w-4" />
            <AlertTitle>Dica Importante</AlertTitle>
            <AlertDescription>
              O Supabase permite o uso de wildcards (coringas). Se você planeja ter múltiplas pré-visualizações ou ambientes de teste, pode usar um padrão como <code className="font-mono bg-muted px-1 py-0.5 rounded">https://*.seu-dominio.com</code>.
            </AlertDescription>
          </Alert>
        </div>

        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Passo 4: Salve as Alterações</h3>
          <p className="text-sm text-muted-foreground">
            Após preencher os campos, clique no botão <Badge variant="success">Save</Badge> no final da página para aplicar as configurações.
          </p>
        </div>

        <Alert variant="success">
          <AlertTitle>Pronto!</AlertTitle>
          <AlertDescription>
            Com essas configurações, o Supabase saberá para onde redirecionar seus usuários com segurança após o login, confirmação de e-mail e recuperação de senha.
          </AlertDescription>
        </Alert>
      </CardContent>
    </Card>
  );
};

export default PublicAuthSetupGuide;
