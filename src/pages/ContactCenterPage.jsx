import React from 'react';
import { PhoneCall } from 'lucide-react';
import { motion } from 'framer-motion';
import ContactRequestPanel from '@/components/contact-center/ContactRequestPanel';

const ContactCenterPage = () => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="space-y-8"
    >
      <div>
        <h1 className="page-title flex items-center">
          <PhoneCall className="mr-3 h-10 w-10 text-pink-400" /> Central de Contato
        </h1>
        <p className="page-subtitle">Gerencie e agende as solicitações de contato entre pacientes e a equipe médica.</p>
      </div>
      <ContactRequestPanel />
    </motion.div>
  );
};

export default ContactCenterPage;