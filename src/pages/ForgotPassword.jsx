import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/components/ui/use-toast';
import { Loader2, Mail } from 'lucide-react';
import { motion } from 'framer-motion';
import { Helmet } from 'react-helmet-async';
import { useAuth } from '@/contexts/SupabaseAuthContext';

const ForgotPassword = () => {
  const { toast } = useToast();
  const { resetPasswordForEmail } = useAuth();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSendResetLink = async (e) => {
    e.preventDefault();
    setLoading(true);
    setSubmitted(false);

    const { error } = await resetPasswordForEmail(email);

    if (error) {
      toast({
        title: 'Erro ao Enviar Link',
        description: "Não foi possível processar sua solicitação. Verifique o e-mail e tente novamente.",
        variant: 'destructive',
      });
    } else {
      toast({
        title: 'Link de Recuperação Enviado!',
        description: 'Verifique sua caixa de entrada (e spam) para o link de redefinição de senha.',
        variant: 'success',
        duration: 8000,
      });
      setSubmitted(true);
    }
    setLoading(false);
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-[#1B1446] to-[#472377] p-4">
      <Helmet>
        <title>Esqueceu a Senha</title>
        <meta name="description" content="Página de recuperação de senha da Clínica Prontuários." />
      </Helmet>
      <motion.div
        initial={{ opacity: 0, y: -50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Card className="w-full max-w-sm card-glass border-violet-500/50 text-white">
          <CardHeader>
            <CardTitle className="text-2xl text-center">Recuperar Senha</CardTitle>
            <CardDescription className="text-center text-violet-300">
              {submitted 
                ? "Se o e-mail estiver correto, você receberá um link."
                : "Insira seu e-mail para receber o link de redefinição."
              }
            </CardDescription>
          </CardHeader>
          <CardContent>
            {submitted ? (
                 <div className="text-center p-4 bg-green-900/50 rounded-lg">
                    <Mail className="mx-auto h-10 w-10 text-green-400 mb-2" />
                    <p className="text-green-200">Link enviado com sucesso! Verifique seu e-mail.</p>
                 </div>
            ) : (
                <form onSubmit={handleSendResetLink} className="space-y-4">
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
                  <Button type="submit" className="w-full btn-primary-frutacor" disabled={loading}>
                    {loading ? (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                      <Mail className="mr-2 h-4 w-4" />
                    )}
                    Enviar Link de Recuperação
                  </Button>
                </form>
            )}
            <p className="mt-4 text-center text-sm text-violet-300">
              Lembrou da senha?{' '}
              <Link to="/login" className="underline text-violet-200 hover:text-white">
                Voltar para o Login
              </Link>
            </p>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
};

export default ForgotPassword;