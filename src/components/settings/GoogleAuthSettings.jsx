import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Lock, Key, Link as LinkIcon, AlertTriangle } from 'lucide-react';

const GoogleAuthSettings = () => {
  const currentOrigin = typeof window !== 'undefined' ? window.location.origin : 'https://seu-dominio.com';

  return (
    <Card className="shadow-lg">
      <CardHeader>
        <CardTitle className="flex items-center gap-2"><img src="https://www.google.com/s2/favicons?sz=32&domain=google.com" alt="Google icon" className="h-6 w-6" /> Guia de Configuração - Login com Google</CardTitle>
        <CardDescription>
          Para permitir que usuários façam login com suas contas Google, você precisa configurar um provedor OAuth no seu painel do Supabase.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Ação Necessária</AlertTitle>
          <AlertDescription>
            O Login com Google **não funcionará** até que estes passos sejam concluídos no seu projeto Supabase.
          </AlertDescription>
        </Alert>

        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Passo 1: Ative o Provedor Google</h3>
          <p className="text-sm text-muted-foreground">
            No seu projeto Supabase, vá para a seção <Badge variant="secondary">Authentication</Badge> e depois clique em <Badge variant="secondary">Providers</Badge>. Encontre <Badge>Google</Badge> na lista e ative-o.
          </p>
        </div>
        
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Passo 2: Obtenha as Credenciais no Google Cloud</h3>
          <p className="text-sm text-muted-foreground">
            Você precisará criar um projeto no <a href="https://console.cloud.google.com/" target="_blank" rel="noopener noreferrer" className="text-primary underline">Google Cloud Console</a>, habilitar a API do Google Identity e criar as credenciais de OAuth 2.0.
          </p>
          <ul className="list-disc pl-5 text-sm space-y-1">
            <li>Em "URIs de redirecionamento autorizados", você **deve** adicionar a URL de callback do Supabase.</li>
            <li>Você a encontrará no painel do Supabase, na mesma tela de configuração do provedor Google. Geralmente, ela se parece com: <code className="bg-muted px-1 py-0.5 rounded text-xs">https://&lt;YOUR_PROJECT_ID&gt;.supabase.co/auth/v1/callback</code>.</li>
          </ul>
        </div>

        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Passo 3: Insira as Credenciais no Supabase</h3>
          <p className="text-sm text-muted-foreground">
            Copie o <Badge>ID do Cliente</Badge> e a <Badge>Chave secreta do cliente</Badge> do Google Cloud e cole-os nos campos correspondentes no painel de configuração do provedor Google no Supabase.
          </p>
          <div className="flex items-start gap-4 p-4 border rounded-lg bg-muted/50">
            <Key className="h-5 w-5 mt-1 text-yellow-500" />
            <div>
              <Label>Client ID</Label>
              <p className="text-xs text-muted-foreground">Cole aqui o ID do Cliente obtido no Google Cloud.</p>
            </div>
          </div>
          <div className="flex items-start gap-4 p-4 border rounded-lg bg-muted/50">
            <Lock className="h-5 w-5 mt-1 text-red-500" />
            <div>
              <Label>Client Secret</Label>
              <p className="text-xs text-muted-foreground">Cole aqui a Chave Secreta do Cliente obtida no Google Cloud.</p>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Passo 4: Salve as Alterações</h3>
          <p className="text-sm text-muted-foreground">
            Após preencher os campos, clique no botão <Badge variant="success">Save</Badge> no Supabase para ativar a integração.
          </p>
        </div>

        <Alert variant="success">
          <AlertTitle>Pronto!</AlertTitle>
          <AlertDescription>
            Com essas configurações, o botão "Entrar com Google" na sua página de login estará totalmente funcional.
          </AlertDescription>
        </Alert>
      </CardContent>
    </Card>
  );
};

export default GoogleAuthSettings;