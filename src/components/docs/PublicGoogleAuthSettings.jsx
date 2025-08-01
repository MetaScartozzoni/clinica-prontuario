
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Lock, ExternalLink, Copy, Check } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';

const PublicGoogleAuthSettings = () => {
  const { toast } = useToast();
  const [copied, setCopied] = React.useState(false);
  
  const redirectUriPlaceholder = `https://<SEU-PROJECT-REF>.supabase.co/auth/v1/callback`;

  const copyToClipboard = () => {
    navigator.clipboard.writeText(redirectUriPlaceholder);
    toast({ 
      title: 'URL de Exemplo Copiada!', 
      description: 'Cole-a e substitua <SEU-PROJECT-REF> pelo ID do seu projeto Supabase.',
      duration: 5000
    });
    setCopied(true);
    setTimeout(() => setCopied(false), 3000);
  };
  
  return (
    <Card className="shadow-lg border-t-4 border-blue-500">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Lock /> Configuração de Login com Google
        </CardTitle>
        <CardDescription>
          Siga os passos abaixo para habilitar a autenticação via Google no seu projeto.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <Alert>
          <AlertTitle className="flex items-center gap-2">Passo 1: Obtenha suas Credenciais do Google Cloud</AlertTitle>
          <AlertDescription>
            <p className="mb-2">
              Você precisa criar um projeto no Google Cloud Console e gerar um "ID do cliente OAuth 2.0".
            </p>
            <Button asChild variant="outline">
              <a href="https://console.cloud.google.com/apis/credentials" target="_blank" rel="noopener noreferrer">
                Ir para o Google Cloud Console <ExternalLink className="ml-2 h-4 w-4" />
              </a>
            </Button>
          </AlertDescription>
        </Alert>
        
        <div className="space-y-2">
          <h3 className="font-semibold">Passo 2: Adicione a URL de Redirecionamento</h3>
          <p className="text-sm text-muted-foreground">
            Ao criar suas credenciais no Google, você precisará adicionar a seguinte URL no campo "URIs de redirecionamento autorizados". Você pode encontrar o seu `PROJECT_REF` na URL do seu painel Supabase.
          </p>
          <div className="flex items-center gap-2 p-2 bg-muted rounded-md">
            <code className="text-sm break-all flex-grow">{redirectUriPlaceholder}</code>
            <Button variant="ghost" size="icon" onClick={copyToClipboard}>
              {copied ? <Check className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
            </Button>
          </div>
        </div>

        <div className="space-y-2">
          <h3 className="font-semibold">Passo 3: Configure no Supabase</h3>
          <p className="text-sm text-muted-foreground">
            Com seu Client ID e Client Secret em mãos, vá para o painel do Supabase, em <strong>Authentication &gt; Providers</strong>, ative o Google e cole as chaves.
          </p>
           <Button asChild variant="outline">
              <a href="https://supabase.com/dashboard" target="_blank" rel="noopener noreferrer">
                Abrir Painel do Supabase <ExternalLink className="ml-2 h-4 w-4" />
              </a>
            </Button>
        </div>
        
        <Alert variant="destructive">
          <AlertTitle>Importante</AlertTitle>
          <AlertDescription>
            <p>As chaves (Client ID e Client Secret) que você colar no Supabase devem ser mantidas em segredo e nunca expostas no código do seu site.</p>
          </AlertDescription>
        </Alert>

      </CardContent>
    </Card>
  );
};

export default PublicGoogleAuthSettings;
