import React from 'react';
import { motion } from 'framer-motion';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'; // Card já usa .custom-card
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';

const StatCard = ({ title, value, icon, color, actionLabel, onAction, isLoading }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.5 }}
    whileHover={{ 
      scale: 1.03, 
      // A sombra já é gerenciada pela classe .custom-card, mas pode ser ajustada aqui se necessário
      // boxShadow: "0px 12px 30px hsla(var(--shadow-color-hsl), 0.35)" 
    }}
    className="transform transition-all h-full"
  >
    {/* A classe .custom-card já é aplicada pelo componente Card.
        A borda colorida é aplicada via style para permitir dinamismo. */}
    <Card className={`h-full flex flex-col justify-between`} style={{ borderLeftColor: color, borderLeftWidth: '4px' }}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        {/* CardTitle já usa --card-foreground-hsl (branco/claro) */}
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        {React.cloneElement(icon, { className: `${icon.props.className} text-primary-foreground/70`})} {/* Ícone com cor clara */}
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        ) : (
          // Valor do card usa --foreground-hsl (branco/claro)
          <div className="text-2xl font-bold text-foreground">{value}</div>
        )}
        {actionLabel && onAction && (
          // Botão link usa --primary-hsl (violeta/lilás) para o texto
          <Button onClick={onAction} variant="link" className="p-0 h-auto text-sm mt-2 text-[hsl(var(--accent-hsl))] hover:text-[hsl(var(--accent-hsl))]/80">
            {actionLabel}
          </Button>
        )}
      </CardContent>
    </Card>
  </motion.div>
);

export default StatCard;