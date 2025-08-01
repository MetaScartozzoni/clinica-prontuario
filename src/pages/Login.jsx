import React, { useState } from 'react';
import { useNavigate, Link, Navigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/components/ui/use-toast';
import { Loader2, LogIn, HelpCircle } from 'lucide-react';
import { motion } from 'framer-motion';
import { useAuth } from '@/contexts/SupabaseAuthContext';
import { Helmet } from 'react-helmet-async';

const Login = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { signIn, signInWithGoogle } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    const { error } = await signIn(email, password);
    if (error) {
      let description = 'Verifique suas credenciais e tente novamente.';
      if (error.message.includes('Email not confirmed')) {
        description = 'Seu e-mail ainda não foi confirmado. Por favor, verifique sua caixa de entrada (e spam) e clique no link de confirmação.';
      } else if (error.message.includes('Invalid login credentials')) {
        description = 'E-mail ou senha inválidos. Por favor, verifique e tente novamente.';
      }
      toast({
        title: 'Falha no Login',
        description: description,
        variant: 'destructive',
      });
    } else {
      toast({
        title: 'Login bem-sucedido!',
        description: 'Redirecionando para o painel...',
        variant: 'success',
      });
      // A navegação será tratada pelo AppRouter
    }
    setLoading(false);
  };

  const handleGoogleLogin = async () => {
    setLoading(true);
    const { error } = await signInWithGoogle();
    if (error) {
      toast({
        title: 'Erro no Login com Google',
        description: error.message,
        variant: 'destructive',
      });
    }
    setLoading(false);
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-[#1B1446] to-[#472377] p-4">
      <Helmet>
        <title>Login</title>
        <meta name="description" content="Página de login da Clínica Prontuários." />
      </Helmet>
      <motion.div
        initial={{ opacity: 0, y: -50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Card className="w-full max-w-sm card-glass border-violet-500/50 text-white">
          <CardHeader>
            <CardTitle className="text-2xl text-center">Bem-vindo de volta!</CardTitle>
            <CardDescription className="text-center text-violet-300">
              Faça login para acessar seu painel.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="seu@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="input-glass"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Senha</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="input-glass"
                />
              </div>
              <div className="flex items-center justify-between">
                <Link
                  to="/forgot-password"
                  className="text-sm text-violet-300 hover:text-white underline"
                >
                  Esqueceu sua senha?
                </Link>
              </div>
              <Button type="submit" className="w-full btn-primary-frutacor" disabled={loading}>
                {loading ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <LogIn className="mr-2 h-4 w-4" />
                )}
                Entrar
              </Button>
              <Button variant="outline" type="button" className="w-full bg-white/10 hover:bg-white/20 text-white" onClick={handleGoogleLogin} disabled={loading}>
                <svg className="mr-2 h-4 w-4" aria-hidden="true" focusable="false" data-prefix="fab" data-icon="google" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 488 512"><path fill="currentColor" d="M488 261.8C488 403.3 391.1 504 248 504 110.8 504 0 393.2 0 256S110.8 8 248 8c66.8 0 126 21.2 172.9 60.2l-67.4 64.8C309.1 99.8 280.7 88 248 88c-73.2 0-133.1 59.9-133.1 133.1s59.9 133.1 133.1 133.1c82.7 0 121.3-56.2 125-102.8H248v-65.3h235.2c4.7 25.4 7.2 52.1 7.2 80.2z"></path></svg>
                Entrar com Google
              </Button>
            </form>
            <p className="mt-4 text-center text-sm text-violet-300">
              Não tem uma conta?{' '}
              <Link to="/signup" className="underline text-violet-200 hover:text-white">
                Cadastre-se
              </Link>
            </p>
            <p className="mt-2 text-center text-sm">
              <Link to="/ajuda" className="text-violet-300 hover:text-white underline flex items-center justify-center gap-1">
                <HelpCircle className="h-4 w-4" />
                Precisa de ajuda com a configuração?
              </Link>
            </p>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
};

export default Login;