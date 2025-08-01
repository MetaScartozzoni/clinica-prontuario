import React from 'react';
    import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
    import { Video } from 'lucide-react';
    import WherebyEmbed from './WherebyEmbed';

    const TelemedicineSession = ({ roomUrl, displayName }) => {
      return (
        <Card className="card-glass mb-6">
          <CardHeader className="flex flex-row items-center justify-between">
            <div className="flex items-center gap-3">
              <Video className="h-6 w-6 text-violet-400" />
              <CardTitle>Sessão de Telemedicina</CardTitle>
            </div>
            <span className="text-sm text-green-400 font-mono">CONECTADO</span>
          </CardHeader>
          <CardContent>
            <WherebyEmbed
              roomUrl={roomUrl}
              displayName={displayName}
            />
          </CardContent>
        </Card>
      );
    };

    export default TelemedicineSession;