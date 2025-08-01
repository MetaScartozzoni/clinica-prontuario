import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { BookOpen, Search, Video, FileQuestion, Lightbulb } from 'lucide-react';
import { motion } from 'framer-motion';

const mockContent = [
  { id: 1, type: 'Artigo', title: 'Entendendo a Rinoplastia: Um Guia Completo', category: 'Procedimentos', icon: <BookOpen className="h-8 w-8 text-blue-500" /> },
  { id: 2, type: 'Vídeo', title: 'Cuidados Pós-Operatórios da Mamoplastia', category: 'Pós-Operatório', icon: <Video className="h-8 w-8 text-red-500" /> },
  { id: 3, type: 'FAQ', title: 'Perguntas Frequentes sobre Lipoaspiração', category: 'Dúvidas', icon: <FileQuestion className="h-8 w-8 text-green-500" /> },
  { id: 4, type: 'Artigo', title: 'Benefícios da Medicina Integrativa na Recuperação', category: 'Bem-Estar', icon: <Lightbulb className="h-8 w-8 text-yellow-500" /> },
  { id: 5, type: 'Artigo', title: 'Mitos e Verdades sobre Cirurgia Plástica', category: 'Geral', icon: <BookOpen className="h-8 w-8 text-blue-500" /> },
  { id: 6, type: 'Vídeo', title: 'Animação 3D: O Processo da Abdominoplastia', category: 'Procedimentos', icon: <Video className="h-8 w-8 text-red-500" /> },
];

const EducationalContentPage = () => {
  const [searchTerm, setSearchTerm] = React.useState('');
  const filteredContent = mockContent.filter(item =>
    item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="space-y-8"
    >
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-primary to-pink-500">
            Conteúdo Educacional
          </h1>
          <p className="text-muted-foreground text-lg">Informe-se sobre procedimentos, cuidados e bem-estar.</p>
        </div>
      </div>

      <Card className="shadow-lg">
        <CardHeader>
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
            <CardTitle className="text-2xl">Navegar por Materiais</CardTitle>
            <div className="relative w-full sm:w-auto">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Buscar artigos, vídeos, FAQs..."
                className="pl-10 w-full sm:w-64 md:w-80 bg-background"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {filteredContent.length > 0 ? (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {filteredContent.map((item, index) => (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: index * 0.1 }}
                  whileHover={{ y: -5, boxShadow: "0px 10px 20px rgba(0,0,0,0.1)" }}
                  className="transform transition-all"
                >
                  <Card className="h-full flex flex-col overflow-hidden hover:border-primary transition-colors">
                    <CardHeader className="flex flex-row items-start gap-4 bg-muted/30 p-4">
                      {item.icon}
                      <div>
                        <p className="text-xs font-semibold uppercase tracking-wider text-primary">{item.type}</p>
                        <CardTitle className="text-lg mt-1">{item.title}</CardTitle>
                      </div>
                    </CardHeader>
                    <CardContent className="flex-grow p-4">
                      <CardDescription>Categoria: {item.category}</CardDescription>
                    </CardContent>
                    <div className="p-4 border-t">
                      <Button variant="outline" className="w-full">
                        Ler Mais / Assistir
                      </Button>
                    </div>
                  </Card>
                </motion.div>
              ))}
            </div>
          ) : (
            <p className="text-center text-muted-foreground py-8">Nenhum conteúdo encontrado para sua busca.</p>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default EducationalContentPage;