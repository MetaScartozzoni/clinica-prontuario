import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { PlusCircle, Loader2 } from 'lucide-react';
import useContactRequests from '@/hooks/useContactRequests';
import useAuthRole from '@/hooks/useAuthRole';
import CreateRequestModal from './CreateRequestModal';
import RequestsDataTable from './RequestsDataTable';

const ContactRequestPanel = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { requests, patients, doctors, loading, addRequest, updateRequestStatus, deleteRequest } = useContactRequests();
  const { hasRole } = useAuthRole();

  const canCreate = hasRole(['admin_financeiro', 'comercial']);

  return (
    <>
      <Card className="shadow-lg">
        <CardHeader className="flex flex-col md:flex-row md:items-center md:justify-between">
          <div>
            <CardTitle>Painel de Solicitações</CardTitle>
            <CardDescription>Visualize e gerencie todas as solicitações de contato.</CardDescription>
          </div>
          {canCreate && (
            <Button onClick={() => setIsModalOpen(true)} className="mt-4 md:mt-0">
              <PlusCircle className="mr-2 h-4 w-4" />
              Nova Solicitação
            </Button>
          )}
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center h-64">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : (
            <RequestsDataTable 
              data={requests} 
              onStatusChange={updateRequestStatus}
              onDelete={deleteRequest}
            />
          )}
        </CardContent>
      </Card>
      {isModalOpen && (
        <CreateRequestModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onSave={addRequest}
          patients={patients}
          doctors={doctors}
        />
      )}
    </>
  );
};

export default ContactRequestPanel;