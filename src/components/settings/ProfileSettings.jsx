import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/components/ui/use-toast';
import { useAuth } from '@/contexts/SupabaseAuthContext';
import { supabase } from '@/lib/customSupabaseClient';
import { Loader2, User } from 'lucide-react';
import { useProfile } from '@/contexts/ProfileContext';

const ProfileSettings = () => {
  const { session } = useAuth();
  const { profile, loadingProfile, refetchProfile } = useProfile();
  const { toast } = useToast();
  
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (profile) {
      setFirstName(profile.first_name || '');
      setLastName(profile.last_name || '');
      setEmail(profile.email || '');
    }
  }, [profile]);

  const handleSaveChanges = async (e) => {
    e.preventDefault();
    if (!session?.user) return;
    setIsLoading(true);

    const { error: profileError } = await supabase
      .from('profiles')
      .update({ first_name: firstName, last_name: lastName })
      .eq('user_id', session.user.id);

    if (profileError) {
      toast({
        title: "Erro ao salvar perfil",
        description: profileError.message,
        variant: "destructive",
      });
      setIsLoading(false);
      return;
    }

    if (email !== session.user.email) {
      const { error: userError } = await supabase.auth.updateUser({ email });
      if (userError) {
        toast({
          title: "Erro ao atualizar email",
          description: "Não foi possível alterar o email. " + userError.message,
          variant: "destructive",
        });
        setIsLoading(false);
        return;
      }
    }

    toast({
      title: "Perfil Atualizado!",
      description: "Suas informações foram salvas com sucesso.",
      variant: "success",
    });
    refetchProfile();
    setIsLoading(false);
  };

  if (loadingProfile) {
    return (
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><User /> Informações do Perfil</CardTitle>
          <CardDescription>Atualize suas informações pessoais.</CardDescription>
        </CardHeader>
        <CardContent className="flex justify-center items-center h-48">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="shadow-lg">
      <CardHeader>
        <CardTitle className="flex items-center gap-2"><User /> Informações do Perfil</CardTitle>
        <CardDescription>Atualize suas informações pessoais. A alteração de e-mail requer confirmação.</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSaveChanges} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="profile-first-name">Nome</Label>
              <Input 
                id="profile-first-name" 
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                disabled={isLoading}
              />
            </div>
            <div>
              <Label htmlFor="profile-last-name">Sobrenome</Label>
              <Input 
                id="profile-last-name" 
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                disabled={isLoading}
              />
            </div>
          </div>
          <div>
            <Label htmlFor="profile-email">Email</Label>
            <Input 
              id="profile-email" 
              type="email" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={isLoading}
            />
          </div>
          <Button type="submit" className="bg-gradient-to-r from-primary to-pink-500 hover:from-primary/90 hover:to-pink-500/90 text-white" disabled={isLoading}>
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {isLoading ? 'Salvando...' : 'Salvar Alterações'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

export default ProfileSettings;