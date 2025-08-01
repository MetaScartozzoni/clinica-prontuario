import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { useAdminAuth } from '@/contexts/AdminAuthContext';
import { Shield, Loader2 } from 'lucide-react';
import { useToast } from "@/components/ui/use-toast";
import { Helmet } from 'react-helmet-async';
import { useLocation } from 'react-router-dom';

const AdminReAuthPage = () => {
  const { register, handleSubmit, formState: { errors } } = useForm();
  const { verifyPasswordAndGrantAccess } = useAdminAuth();
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const location = useLocation();

  useEffect(() => {
    if (location.state?.message) {
      toast({
        title: "Acesso Restrito",
        description: location.state.message,
        variant: "warning",
      });
    }
  }, [location.state?.message, toast]);

  const onSubmit = async (data) => {
    setIsLoading(true);
    try {
      await verifyPasswordAndGrantAccess(data.password);
      toast({
        title: "Acesso Autorizado!",
        description: "Bem-vindo de volta ao Painel de Administração.",
        variant: "success",
      });
    } catch (error) {
      toast({
        title: "Falha na Autenticação",
        description: error.message || "Ocorreu um erro. Por favor, tente novamente.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <Helmet>
        <title>Verificação de Segurança</title>
        <meta name="description" content="Página de verificação de segurança para acesso administrativo." />
      </Helmet>
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 p-4">
        <Card className="w-full max-w-md bg-gray-900/80 backdrop-blur-sm border-purple-500/30 text-white">
          <CardHeader className="text-center">
            <div className="mx-auto bg-purple-500/20 p-3 rounded-full w-fit mb-4">
              <Shield className="h-10 w-10 text-purple-400" />
            </div>
            <CardTitle className="text-2xl font-bold text-white">Acesso Restrito</CardTitle>
            <CardDescription className="text-gray-400">
              Por segurança, por favor, insira sua senha para continuar.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="password">Senha</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="********"
                  {...register('password', { required: 'A senha é obrigatória' })}
                  className="bg-gray-800 border-gray-700 focus:ring-purple-500"
                />
                {errors.password && <p className="text-red-500 text-sm mt-1">{errors.password.message}</p>}
              </div>
              <Button type="submit" className="w-full bg-purple-600 hover:bg-purple-700" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Verificando...
                  </>
                ) : (
                  'Confirmar Identidade'
                )}
              </Button>
            </form>
          </CardContent>
          <CardFooter>
            <p className="text-xs text-gray-500 text-center w-full">
              Esta verificação extra garante a segurança dos dados da clínica.
            </p>
          </CardFooter>
        </Card>
      </div>
    </>
  );
};

export default AdminReAuthPage;