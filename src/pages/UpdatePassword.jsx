import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/components/ui/use-toast';
import { Loader2, Lock, ShieldAlert, ShieldCheck } from 'lucide-react';
import { motion } from 'framer-motion';
import { Helmet } from 'react-helmet-async';
import { useAuth } from '@/contexts/SupabaseAuthContext';

const UpdatePassword = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { updateUserPassword, signOut } = useAuth();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState('validating'); // validating, valid, invalid

  const location = useLocation();

  useEffect(() => {
    // A validação é feita pela presença de 'access_token' e 'type=recovery' na URL hash
    // O onAuthStateChange é uma forma mais robusta de lidar com isso.
    const hash = location.hash.substring(1);
    const params = new URLSearchParams(hash);
    if (params.get('type') === 'recovery') {
      setStatus('valid');
    } else {
       // Se o onAuthStateChange não pegar, invalidamos manualmente.
       // Isso ajuda a evitar que usuários acessem a página diretamente.
       setTimeout(() => {
        if (status === 'validating') {
          setStatus('invalid');
        }
       }, 1500);
    }
  }, [location, status]);


  const handleUpdatePassword = async (e) => {
    e.preventDefault();
    
    if (password.length < 8) {
      toast({
        title: 'Senha muito curta',
        description: 'A senha deve ter pelo menos 8 caracteres.',
        variant: 'destructive',
      });
      return;
    }

    if (password !== confirmPassword) {
      toast({
        title: 'Erro de Validação',
        description: 'As senhas não coincidem.',
        variant: 'destructive',
      });
      return;
    }

    setLoading(true);

    const { error } = await updateUserPassword(password);

    if (error) {
      toast({
        title: 'Erro ao Atualizar Senha',
        description: error.message,
        variant: 'destructive',
      });
      if (error.message.includes("Token has expired or is invalid")) {
        setStatus('invalid');
      }
    } else {
      toast({
        title: 'Senha Atualizada com Sucesso!',
        description: 'Você será redirecionado para a tela de login.',
        variant: 'success',
        duration: 5000,
        action: (
          <Button onClick={() => navigate('/login', { replace: true })}>Login</Button>
        ),
      });
      await signOut(); // Garante que a sessão de recuperação seja encerrada.
      setTimeout(() => navigate('/login', { replace: true }), 3000);
    }
    setLoading(false);
  };

  const renderContent = () => {
    switch (status) {
      case 'validating':
        return (
          <div className="flex items-center justify-center h-40">
            <div className="text-white text-lg flex items-center">
              <Loader2 className="animate-spin h-6 w-6 mr-3" />
              Verificando autorização...
            </div>
          </div>
        );
      case 'invalid':
        return (
          <div className="flex flex-col items-center justify-center text-center p-6">
            <ShieldAlert className="h-12 w-12 mb-4 text-red-400" />
            <p className="font-semibold text-lg text-white">Acesso Negado</p>
            <p className="text-sm text-red-300 mb-6">Link inválido ou expirado. Por favor, solicite um novo link de recuperação.</p>
            <Button onClick={() => navigate('/forgot-password', { replace: true })}>
                Solicitar Novo Link
            </Button>
          </div>
        );
      case 'valid':
        return (
          <form onSubmit={handleUpdatePassword} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="password">Nova Senha</Label>
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
            <div className="space-y-2">
              <Label htmlFor="confirm-password">Confirmar Nova Senha</Label>
              <Input
                id="confirm-password"
                type="password"
                placeholder="••••••••"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                className="input-glass"
              />
            </div>
            <Button type="submit" className="w-full btn-primary-frutacor" disabled={loading}>
              {loading ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Lock className="mr-2 h-4 w-4" />
              )}
              Redefinir Senha
            </Button>
          </form>
        );
      default:
        return null;
    }
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-[#1B1446] to-[#472377] p-4">
      <Helmet>
        <title>Atualizar Senha</title>
        <meta name="description" content="Página para atualizar a senha da Clínica Prontuários." />
      </Helmet>
      <motion.div
        initial={{ opacity: 0, y: -50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Card className="w-full max-w-sm card-glass border-violet-500/50 text-white">
          <CardHeader>
            <CardTitle className="text-2xl text-center">Criar Nova Senha</CardTitle>
            <CardDescription className="text-center text-violet-300">
              {status === 'valid' ? "Defina sua nova senha abaixo." : "Aguarde a validação da sua identidade."}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {renderContent()}
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
};

export default UpdatePassword;