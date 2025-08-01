import React, { useRef } from 'react';
import { Loader2 } from 'lucide-react';

const WherebyEmbed = ({ roomUrl, displayName }) => {
  const embedRef = useRef(null);

  if (!roomUrl) {
    return (
      <div className="flex items-center justify-center h-full bg-muted rounded-lg">
        <p>URL da sala de telemedicina não fornecida.</p>
      </div>
    );
  }

  const embedUrl = `${roomUrl}?embed&screenshare=on&chat=on&background=off&lang=pt&displayName=${encodeURIComponent(displayName || 'Profissional')}`;

  return (
    <div className="w-full aspect-video bg-gray-900 rounded-lg overflow-hidden shadow-lg border border-violet-700/50">
      <iframe
        ref={embedRef}
        src={embedUrl}
        allow="camera; microphone; fullscreen; speaker; display-capture"
        className="w-full h-full border-0"
        title="Whereby Video Call"
      >
        <div className="flex items-center justify-center h-full text-white">
          <Loader2 className="mr-2 h-5 w-5 animate-spin" />
          Carregando vídeo...
        </div>
      </iframe>
    </div>
  );
};

export default WherebyEmbed;