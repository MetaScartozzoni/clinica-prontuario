import React, { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { useToast } from '@/components/ui/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Loader2, UserCog, ShieldCheck } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/customSupabaseClient';

const SetupPage = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword) {
      toast({
        title: 'Erro de Validação',
        description: 'As senhas não coincidem.',
        variant: 'destructive',
      });
      return;
    }
    setIsSubmitting(true);

    const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
      email: formData.email,
      password: formData.password,
      options: {
        data: {
          first_name: formData.first_name,
          last_name: formData.last_name,
          is_setup_admin: true,
        },
      },
    });

    if (signUpError) {
      toast({
        title: 'Erro ao criar usuário',
        description: signUpError.message,
        variant: 'destructive',
      });
      setIsSubmitting(false);
      return;
    }

    if (!signUpData.user) {
        toast({
            title: 'Erro inesperado',
            description: 'Não foi possível obter os dados do usuário após o cadastro. Confirme seu e-mail e tente novamente.',
            variant: 'destructive',
        });
        setIsSubmitting(false);
        return;
    }

    const { error: rpcError } = await supabase.rpc('setup_initial_admin_and_policies', {
      admin_user_id: signUpData.user.id,
      admin_email: signUpData.user.email,
      admin_first_name: formData.first_name,
      admin_last_name: formData.last_name,
    });

    if (rpcError) {
      toast({
        title: 'Erro Crítico na Configuração',
        description: `Não foi possível configurar o perfil de administrador. Erro: ${rpcError.message}. Contacte o suporte.`,
        variant: 'destructive',
        duration: 10000,
      });
      setIsSubmitting(false);
      return;
    }

    toast({
      title: 'Sistema Configurado com Sucesso!',
      description: 'A conta de administrador foi criada. Por favor, confirme seu e-mail e depois faça o login.',
      variant: 'success',
      duration: 9000,
      action: <ShieldCheck className="h-5 w-5 text-white" />,
    });
    
    // Define a flag no localStorage para indicar que o setup foi concluído
    localStorage.setItem('isSetupComplete', 'true');
    setIsSubmitting(false);
    // Redireciona o usuário para a página de login
    navigate('/login');
  };

  return (
    <>
      <Helmet>
        <title>Configuração Inicial do Sistema</title>
        <meta name="description" content="Crie a conta de administrador principal." />
      </Helmet>
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#1B1446] to-[#472377] p-4">
        <Card className="w-full max-w-lg shadow-2xl bg-card/80 backdrop-blur-sm border-primary/20 text-white card-glass">
          <CardHeader className="text-center">
            <div className="mx-auto bg-primary/10 p-3 rounded-full w-fit">
              <UserCog className="h-10 w-10 text-primary" />
            </div>
            <CardTitle className="text-3xl font-bold mt-4">Configuração Inicial</CardTitle>
            <CardDescription className="text-violet-300">Crie a conta de administrador principal para o sistema.</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="first_name">Nome</Label>
                    <Input id="first_name" name="first_name" type="text" value={formData.first_name} onChange={handleChange} required placeholder="Seu primeiro nome" className="input-glass" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="last_name">Sobrenome</Label>
                    <Input id="last_name" name="last_name" type="text" value={formData.last_name} onChange={handleChange} required placeholder="Seu sobrenome" className="input-glass" />
                  </div>
                </div>
              <div className="space-y-2">
                <Label htmlFor="email">E-mail do Administrador</Label>
                <Input id="email" name="email" type="email" value={formData.email} onChange={handleChange} required placeholder="admin@suaclinica.com" className="input-glass" />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                 <div className="space-y-2">
                  <Label htmlFor="password">Senha</Label>
                  <Input id="password" name="password" type="password" value={formData.password} onChange={handleChange} required placeholder="********" className="input-glass" />
                </div>
                 <div className="space-y-2">
                  <Label htmlFor="confirmPassword">Confirmar Senha</Label>
                  <Input id="confirmPassword" name="confirmPassword" type="password" value={formData.confirmPassword} onChange={handleChange} required placeholder="********" className="input-glass" />
                </div>
              </div>
              
              <Button type="submit" className="w-full btn-primary-frutacor" disabled={isSubmitting}>
                {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                {isSubmitting ? 'Configurando...' : 'Criar Administrador e Finalizar'}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </>
  );
};

export default SetupPage;