import React from 'react';
    import { useProfile } from '@/contexts/ProfileContext';
    import PatientChatView from './PatientChatView';
    import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
    import { Lock } from 'lucide-react';

    const PatientCommunication = ({ patientId }) => {
        const { profile } = useProfile();
        
        const isEmerald = profile?.loyalty_tier === 'Esmeralda';
        const currentUserId = profile?.user_id;

        if (!isEmerald) {
            return (
                <Card className="card-glass text-center">
                    <CardHeader>
                        <CardTitle className="flex items-center justify-center gap-2">
                            <Lock className="text-yellow-400" /> Canal de Comunicação VIP
                        </CardTitle>
                        <CardDescription>Exclusivo para membros do Cartão Esmeralda.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <p className="text-violet-300">
                            Torne-se um membro Esmeralda para ter acesso a este canal de comunicação direto com nossa equipe.
                        </p>
                    </CardContent>
                </Card>
            );
        }

        if (!patientId || !currentUserId) {
            return <p>Carregando informações do paciente...</p>;
        }
        
        return (
            <Card className="card-glass">
                <CardHeader>
                    <CardTitle>Canal de Comunicação Direto</CardTitle>
                    <CardDescription>Envie e receba mensagens e arquivos da nossa equipe.</CardDescription>
                </CardHeader>
                <CardContent>
                    <PatientChatView patientId={patientId} currentUserId={currentUserId} />
                </CardContent>
            </Card>
        );
    };

    export default PatientCommunication;