import React, { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { supabase } from '@/lib/customSupabaseClient';
import { useToast } from '@/components/ui/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Loader2, ShieldCheck, UserPlus } from 'lucide-react';
import { Link } from 'react-router-dom';

const PublicPatientRegistrationPage = () => {
  const { toast } = useToast();
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

    try {
      const { data: { user }, error } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          data: {
            first_name: formData.first_name,
            last_name: formData.last_name,
            // Definindo o 'role' como 'patient' para o gatilho funcionar corretamente.
            role: 'patient', 
          },
        },
      });

      if (error) throw error;
      
      // O trigger no Supabase irá criar o perfil e o paciente.

      toast({
        title: 'Cadastro quase completo!',
        description: 'Enviamos um e-mail de confirmação. Por favor, verifique sua caixa de entrada para ativar sua conta.',
        variant: 'success',
        duration: 8000,
      });
      
      setFormData({ first_name: '', last_name: '', email: '', password: '', confirmPassword: '' });

    } catch (error) {
      toast({
        title: 'Erro no cadastro',
        description: error.message || 'Não foi possível completar seu cadastro. Tente novamente.',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <Helmet>
        <title>Cadastro de Usuário</title>
        <meta name="description" content="Crie sua conta em nossa clínica." />
      </Helmet>
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 to-gray-800 p-4">
        <Card className="w-full max-w-lg shadow-2xl bg-card/80 backdrop-blur-sm border-primary/20">
          <CardHeader className="text-center">
            <div className="mx-auto bg-primary/10 p-3 rounded-full w-fit">
              <UserPlus className="h-10 w-10 text-primary" />
            </div>
            <CardTitle className="text-3xl font-bold mt-4">Crie sua Conta</CardTitle>
            <CardDescription>O acesso será liberado após aprovação administrativa.</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="first_name">Nome</Label>
                    <Input id="first_name" name="first_name" type="text" value={formData.first_name} onChange={handleChange} required placeholder="Seu primeiro nome" />
                  </div>
                   <div className="space-y-2">
                    <Label htmlFor="last_name">Sobrenome</Label>
                    <Input id="last_name" name="last_name" type="text" value={formData.last_name} onChange={handleChange} required placeholder="Seu sobrenome" />
                  </div>
                </div>
              <div className="space-y-2">
                <Label htmlFor="email">E-mail</Label>
                <Input id="email" name="email" type="email" value={formData.email} onChange={handleChange} required placeholder="seu.email@exemplo.com" />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                 <div className="space-y-2">
                  <Label htmlFor="password">Senha</Label>
                  <Input id="password" name="password" type="password" value={formData.password} onChange={handleChange} required placeholder="********" />
                </div>
                 <div className="space-y-2">
                  <Label htmlFor="confirmPassword">Confirmar Senha</Label>
                  <Input id="confirmPassword" name="confirmPassword" type="password" value={formData.confirmPassword} onChange={handleChange} required placeholder="********" />
                </div>
              </div>
              
              <Button type="submit" className="w-full btn-gradient" disabled={isSubmitting}>
                {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                {isSubmitting ? 'Enviando...' : 'Criar Conta'}
              </Button>
               <p className="mt-4 text-center text-sm">
                Já tem uma conta?{' '}
                <Link to="/login" className="underline font-semibold hover:text-primary">
                    Faça login aqui.
                </Link>
            </p>
            </form>
          </CardContent>
        </Card>
      </div>
    </>
  );
};

export default PublicPatientRegistrationPage;