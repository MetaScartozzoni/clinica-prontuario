import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/components/ui/use-toast';

const FinancialSettings = () => {
  const { toast } = useToast();

  const handleSaveFinancialSettings = () => {
    toast({ title: "Configurações Salvas", description: "As configurações financeiras foram salvas (simulado)." });
  };

  return (
    <Card className="shadow-lg">
      <CardHeader>
        <CardTitle>Configurações Financeiras</CardTitle>
        <CardDescription>Defina informações para faturamento, pagamentos e integração com Stripe (futuro).</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-4">
          <h4 className="font-medium text-foreground">Informações da Clínica para Faturamento</h4>
          <div>
            <Label htmlFor="clinic-name">Nome da Clínica</Label>
            <Input id="clinic-name" placeholder="Nome da Sua Clínica Ltda." />
          </div>
          <div>
            <Label htmlFor="clinic-cnpj">CNPJ</Label>
            <Input id="clinic-cnpj" placeholder="00.000.000/0001-00" />
          </div>
          <div>
            <Label htmlFor="clinic-address">Endereço</Label>
            <Input id="clinic-address" placeholder="Rua Exemplo, 123, Bairro, Cidade - UF" />
          </div>
        </div>
        
        <div className="space-y-4">
          <h4 className="font-medium text-foreground">Integração Stripe (Chaves API)</h4>
          <p className="text-sm text-muted-foreground">
            Estas chaves serão usadas para processar pagamentos. Obtenha-as no seu painel Stripe.
          </p>
          <div>
            <Label htmlFor="stripe-publishable-key">Chave Publicável (Publishable Key)</Label>
            <Input id="stripe-publishable-key" type="password" placeholder="pk_live_xxxxxxxxxxxx ou pk_test_xxxxxxxxxxxx" />
          </div>
          <div>
            <Label htmlFor="stripe-secret-key">Chave Secreta (Secret Key)</Label>
            <Input id="stripe-secret-key" type="password" placeholder="sk_live_xxxxxxxxxxxx ou sk_test_xxxxxxxxxxxx" />
            <p className="text-xs text-muted-foreground mt-1">A chave secreta é sensível e será armazenada de forma segura (simulado).</p>
          </div>
        </div>

        <Button onClick={handleSaveFinancialSettings} className="bg-gradient-to-r from-primary to-pink-500 hover:from-primary/90 hover:to-pink-500/90 text-white">Salvar Configurações Financeiras</Button>
      </CardContent>
    </Card>
  );
};

export default FinancialSettings;