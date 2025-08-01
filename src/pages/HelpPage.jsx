import React from 'react';
import { Helmet } from 'react-helmet-async';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { LifeBuoy, BookOpen, Mail } from 'lucide-react';

const faqItems = [
  {
    question: "Como eu reseto minha senha?",
    answer: "Para resetar sua senha, clique no link 'Esqueceu sua senha?' na página de login e siga as instruções enviadas para o seu e-mail."
  },
  {
    question: "Como posso adicionar um novo paciente?",
    answer: "Navegue até a seção 'Pacientes' no menu lateral e clique no botão 'Adicionar Paciente'. Preencha os detalhes necessários e salve."
  },
  {
    question: "Onde encontro os orçamentos gerados?",
    answer: "Todos os orçamentos estão disponíveis na seção 'Orçamentos'. Você pode filtrar por status, paciente ou data de criação."
  },
  {
    question: "É possível integrar com meu calendário do Google?",
    answer: "Sim, a integração com o Google Calendar está disponível. Vá para 'Configurações' > 'Integrações' e siga os passos para conectar sua conta."
  },
  {
    question: "Como funciona o Módulo Financeiro?",
    answer: "O módulo Financeiro oferece uma visão completa do fluxo de caixa, contas a pagar e a receber, e relatórios detalhados. Você pode adicionar transações manualmente ou vinculá-las a orçamentos e cirurgias."
  }
];

const HelpPage = () => {
  return (
    <>
      <Helmet>
        <title>Ajuda e Suporte</title>
      </Helmet>
      <div className="container mx-auto p-4 md:p-8 text-white">
        <header className="mb-8">
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <LifeBuoy className="h-8 w-8 text-violet-400" />
            Central de Ajuda
          </h1>
          <p className="text-violet-200 mt-2">
            Encontre respostas para suas perguntas ou entre em contato com nosso suporte.
          </p>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <Card className="card-glass">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-lg font-medium">Documentação</CardTitle>
              <BookOpen className="h-6 w-6 text-violet-400" />
            </CardHeader>
            <CardContent>
              <p className="text-sm text-violet-300">
                Explore nossos guias e tutoriais completos para tirar o máximo proveito do sistema.
              </p>
              <a href="/documentation" className="text-pink-400 font-semibold mt-4 inline-block hover:underline">
                Acessar Documentação
              </a>
            </CardContent>
          </Card>
          <Card className="card-glass">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-lg font-medium">Suporte por E-mail</CardTitle>
              <Mail className="h-6 w-6 text-violet-400" />
            </CardHeader>
            <CardContent>
              <p className="text-sm text-violet-300">
                Nossa equipe de suporte está pronta para ajudar. Envie-nos um e-mail para obter assistência.
              </p>
              <a href="mailto:suporte@horizons.hostinger.com" className="text-pink-400 font-semibold mt-4 inline-block hover:underline">
                suporte@horizons.hostinger.com
              </a>
            </CardContent>
          </Card>
           <Card className="card-glass">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-lg font-medium">Status do Sistema</CardTitle>
              <LifeBuoy className="h-6 w-6 text-violet-400" />
            </CardHeader>
            <CardContent>
              <p className="text-sm text-violet-300">
                Verifique o status operacional de todos os nossos serviços e integrações.
              </p>
              <a href="/settings?tab=system-health" className="text-pink-400 font-semibold mt-4 inline-block hover:underline">
                Verificar Status
              </a>
            </CardContent>
          </Card>
        </div>

        <Card className="card-glass">
          <CardHeader>
            <CardTitle>Perguntas Frequentes (FAQ)</CardTitle>
          </CardHeader>
          <CardContent>
            <Accordion type="single" collapsible className="w-full">
              {faqItems.map((item, index) => (
                <AccordionItem value={`item-${index}`} key={index} className="border-b-white/20">
                  <AccordionTrigger className="text-left text-white hover:text-pink-300">{item.question}</AccordionTrigger>
                  <AccordionContent className="text-violet-200">
                    {item.answer}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </CardContent>
        </Card>
      </div>
    </>
  );
};

export default HelpPage;