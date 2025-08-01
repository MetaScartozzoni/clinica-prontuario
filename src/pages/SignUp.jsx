import React, { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { useToast } from '@/components/ui/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Loader2, UserPlus, Shield, ShieldAlert, ShieldCheck, ShieldX } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/customSupabaseClient';

const PasswordStrengthIndicator = ({ password }) => {
  const getStrength = (pass) => {
    let score = 0;
    if (!pass) return 0;
    if (pass.length >= 8) score++;
    if (/[a-z]/.test(pass)) score++;
    if (/[A-Z]/.test(pass)) score++;
    if (/[0-9]/.test(pass)) score++;
    if (/[^a-zA-Z0-9]/.test(pass)) score++;
    return score;
  };

  const strength = getStrength(password);

  const levels = [
    { text: 'Muito Fraca', color: 'bg-red-500', icon: <ShieldX className="h-4 w-4 mr-2" /> },
    { text: 'Fraca', color: 'bg-red-500', icon: <ShieldX className="h-4 w-4 mr-2" /> },
    { text: 'Razoável', color: 'bg-orange-500', icon: <ShieldAlert className="h-4 w-4 mr-2" /> },
    { text: 'Boa', color: 'bg-yellow-500', icon: <Shield className="h-4 w-4 mr-2" /> },
    { text: 'Forte', color: 'bg-green-500', icon: <ShieldCheck className="h-4 w-4 mr-2" /> },
    { text: 'Muito Forte', color: 'bg-green-600', icon: <ShieldCheck className="h-4 w-4 mr-2" /> }
  ];

  const currentLevel = levels[strength];
  const progressWidth = `${(strength / (levels.length - 1)) * 100}%`;

  if (!password) return null;

  return (
    <div className="mt-2 space-y-2">
      <div className="w-full bg-gray-600 rounded-full h-2.5">
        <div className={`${currentLevel.color} h-2.5 rounded-full transition-all duration-300`} style={{ width: progressWidth }}></div>
      </div>
      <div className={`flex items-center text-sm ${currentLevel.color.replace('bg-', 'text-')}`}>
        {currentLevel.icon}
        <span>Força da senha: {currentLevel.text}</span>
      </div>
    </div>
  );
};


const SignUp = () => {
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

    const { error } = await supabase.auth.signUp({
      email: formData.email,
      password: formData.password,
      options: {
        data: {
          first_name: formData.first_name,
          last_name: formData.last_name,
        }
      }
    });

    if (error) {
       let description = 'Não foi possível completar seu cadastro. Tente novamente.';
       if (error.message.includes('weak_password')) {
         description = 'A senha escolhida é muito fraca ou comum. Por favor, escolha uma senha mais forte.';
       } else if (error.message.includes('User already registered')) {
         description = 'Este e-mail já está cadastrado. Tente fazer login ou recuperar sua senha.';
       } else {
         description = error.message;
       }
       toast({
        title: 'Erro no cadastro',
        description: description,
        variant: 'destructive',
      });
    } else {
       toast({
        title: 'Quase lá! Verifique seu e-mail.',
        description: 'Enviamos um link de confirmação para o seu e-mail. Clique nele para ativar sua conta.',
        variant: 'success',
        duration: 10000,
      });
      navigate('/login');
    }
    
    setIsSubmitting(false);
  };

  return (
    <>
      <Helmet>
        <title>Cadastro de Usuário</title>
        <meta name="description" content="Crie sua conta em nossa clínica." />
      </Helmet>
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#1B1446] to-[#472377] p-4">
        <Card className="w-full max-w-lg shadow-2xl bg-card/80 backdrop-blur-sm border-primary/20 text-white card-glass">
          <CardHeader className="text-center">
            <div className="mx-auto bg-primary/10 p-3 rounded-full w-fit">
              <UserPlus className="h-10 w-10 text-primary" />
            </div>
            <CardTitle className="text-3xl font-bold mt-4">Crie sua Conta</CardTitle>
            <CardDescription className="text-violet-300">Complete o formulário para iniciar seu cadastro.</CardDescription>
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
                <Label htmlFor="email">E-mail</Label>
                <Input id="email" name="email" type="email" value={formData.email} onChange={handleChange} required placeholder="seu.email@exemplo.com" className="input-glass" />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                 <div className="space-y-2">
                  <Label htmlFor="password">Senha</Label>
                  <Input id="password" name="password" type="password" value={formData.password} onChange={handleChange} required placeholder="********" className="input-glass" />
                   <p className="text-xs text-violet-300 mt-2">Use 8+ caracteres com letras, números e símbolos.</p>
                </div>
                 <div className="space-y-2">
                  <Label htmlFor="confirmPassword">Confirmar Senha</Label>
                  <Input id="confirmPassword" name="confirmPassword" type="password" value={formData.confirmPassword} onChange={handleChange} required placeholder="********" className="input-glass" />
                </div>
              </div>
               <PasswordStrengthIndicator password={formData.password} />
              
              <Button type="submit" className="w-full btn-primary-frutacor" disabled={isSubmitting}>
                {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                {isSubmitting ? 'Enviando...' : 'Criar Conta'}
              </Button>
               <p className="mt-4 text-center text-sm text-violet-300">
                Já tem uma conta?{' '}
                <Link to="/login" className="underline text-violet-200 hover:text-white">
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

export default SignUp;