
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Network, Database, MessageSquare, FileText, Calendar, Mail, Sheet, Zap, ArrowRight, CheckCircle, GitFork } from 'lucide-react';

const ToolCard = ({ icon: Icon, title, description, flow }) => (
  <Card>
    <CardHeader className="flex flex-row items-center gap-4 space-y-0 pb-2">
      <div className="p-3 bg-primary/10 rounded-full">
        <Icon className="h-6 w-6 text-primary" />
      </div>
      <CardTitle className="text-lg">{title}</CardTitle>
    </CardHeader>
    <CardContent>
      <p className="text-sm text-muted-foreground mb-4">{description}</p>
      <div className="flex flex-wrap items-center gap-x-3 gap-y-2 p-3 bg-muted rounded-lg">
        {flow.map((item, index) => (
          <React.Fragment key={index}>
            <div className="flex items-center gap-2">
              <item.icon className="h-5 w-5 text-gray-500" />
              <span className="text-sm font-medium">{item.name}</span>
            </div>
            {index < flow.length - 1 && <ArrowRight className="h-4 w-4 text-gray-400" />}
          </React.Fragment>
        ))}
      </div>
    </CardContent>
  </Card>
);

const DataEcosystemGuide = () => {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-3 text-xl">
            <Network className="h-7 w-7 text-primary" />
            Guia do Ecossistema de Dados
          </CardTitle>
          <CardDescription>
            A melhor estratégia para unificar suas ferramentas, usando o Supabase como o cérebro central da sua operação.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="p-6 bg-gradient-to-br from-blue-900/20 to-purple-900/20 rounded-xl border border-dashed border-white/20">
            <div className="flex flex-col lg:flex-row items-center gap-6 text-center lg:text-left">
              <div className="relative">
                <Database className="h-20 w-20 text-blue-400" />
                <div className="absolute -top-2 -right-2 p-2 bg-background rounded-full shadow-lg">
                   <CheckCircle className="h-6 w-6 text-green-400" />
                </div>
              </div>
              <div>
                <h3 className="text-2xl font-bold text-white">Supabase: Sua Fonte Única da Verdade</h3>
                <p className="mt-2 text-violet-300 max-w-2xl">
                  Ao invés de conectar cada ferramenta uma à outra, a arquitetura ideal é o modelo "Hub & Spoke". Todas as ferramentas enviam dados para o Supabase (os "spokes"), e o Supabase se torna seu hub central de dados, garantindo consistência e escalabilidade.
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid md:grid-cols-2 gap-6">
        <ToolCard
          icon={MessageSquare}
          title="BotConversa (WhatsApp)"
          description="Capture leads e interações do WhatsApp diretamente no seu banco de dados para iniciar o funil de atendimento."
          flow={[
            { name: 'BotConversa', icon: MessageSquare },
            { name: 'Webhook', icon: GitFork },
            { name: 'Supabase', icon: Database }
          ]}
        />
        
        <ToolCard
          icon={FileText}
          title="JotForm & Calendly"
          description="Fluxo já implementado e otimizado. Os dados de agendamento e formulários são sincronizados em tempo real."
          flow={[
            { name: 'Calendly', icon: Calendar },
            { name: 'JotForm', icon: FileText },
            { name: 'Supabase', icon: Database }
          ]}
        />
        
        <ToolCard
          icon={Mail}
          title="Outlook Calendar"
          description="Mantenha sua agenda do Outlook sincronizada com os eventos do sistema, como cirurgias e consultas."
          flow={[
            { name: 'Supabase', icon: Database },
            { name: 'Zapier / Make', icon: Zap },
            { name: 'Outlook', icon: Mail }
          ]}
        />

        <ToolCard
          icon={Sheet}
          title="Google Sheets"
          description="Ideal para relatórios, análises ou manipulação de dados por equipes não-técnicas. Mantenha planilhas atualizadas."
          flow={[
            { name: 'Supabase', icon: Database },
            { name: 'Zapier / Make', icon: Zap },
            { name: 'Google Sheets', icon: Sheet }
          ]}
        />
      </div>

       <Card className="bg-green-900/30 border-green-500/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-green-300">
             <Zap className="h-6 w-6" />
            Recomendação: Use uma Ponte de Automação
          </CardTitle>
        </CardHeader>
        <CardContent className="text-green-200">
          <p>
            Para conectar o Supabase com o **Outlook** e o **Google Sheets**, o uso de uma plataforma como <a href="https://zapier.com" target="_blank" rel="noopener noreferrer" className="font-bold underline hover:text-white">Zapier</a> ou <a href="https://make.com" target="_blank" rel="noopener noreferrer" className="font-bold underline hover:text-white">Make.com</a> é a solução mais profissional.
          </p>
          <ul className="list-disc pl-5 mt-2 space-y-1 text-sm">
            <li>**Confiabilidade:** Elas gerenciam autenticação, retentativas e erros automaticamente.</li>
            <li>**Simplicidade:** Você cria fluxos de trabalho visuais sem precisar escrever código de integração complexo.</li>
            <li>**Manutenção:** É muito mais fácil de manter e modificar do que uma API customizada.</li>
          </ul>
        </CardContent>
      </Card>

    </div>
  );
};

export default DataEcosystemGuide;
