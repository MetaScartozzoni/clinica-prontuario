import React from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Video } from 'lucide-react';
import WherebyEmbed from '@/components/medical-record/telemedicine/WherebyEmbed';

const TelemedicinePanel = ({ roomUrl, displayName }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.1 }}
      className="mb-6"
    >
      <Card className="card-glass">
        <CardHeader className="flex flex-row items-center justify-between">
          <div className="flex items-center gap-3">
            <Video className="h-6 w-6 text-violet-400" />
            <CardTitle>Sessão de Telemedicina</CardTitle>
          </div>
          <span className="text-sm text-green-400 font-mono">CONECTADO</span>
        </CardHeader>
        <CardContent>
          <WherebyEmbed roomUrl={roomUrl} displayName={displayName} />
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default TelemedicinePanel;