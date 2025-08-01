import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, ExternalLink } from 'lucide-react';
import TeamsIcon from './TeamsIcon';

const TeamsChannelsDropdown = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [channels, setChannels] = useState([]);

  useEffect(() => {
    const fetchChannels = () => {
      try {
        const storedChannels = localStorage.getItem('teamsChannels');
        if (storedChannels) {
          setChannels(JSON.parse(storedChannels));
        }
      } catch (error) {
        console.error("Failed to parse Teams channels from localStorage", error);
        setChannels([]);
      }
    };

    fetchChannels();
    
    // Listen for storage changes to update in real-time
    window.addEventListener('storage', fetchChannels);
    return () => {
      window.removeEventListener('storage', fetchChannels);
    };
  }, []);

  if (channels.length === 0) {
    return null; // Don't render if no channels are configured
  }

  const dropdownVariants = {
    hidden: { opacity: 0, height: 0, marginTop: 0 },
    visible: { opacity: 1, height: 'auto', marginTop: '8px' },
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="nav-item-base flex items-center justify-between w-full px-3 py-2.5 text-sm font-medium group nav-item-inactive"
      >
        <div className="flex items-center">
          <TeamsIcon className="nav-item-icon mr-3" />
          <span>Canais do Teams</span>
        </div>
        <ChevronDown
          className={`h-4 w-4 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
        />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial="hidden"
            animate="visible"
            exit="hidden"
            variants={dropdownVariants}
            transition={{ duration: 0.2, ease: "easeInOut" }}
            className="pl-8 overflow-hidden"
          >
            <ul className="py-2 space-y-1 border-l-2 border-primary-foreground/20">
              {channels.map((channel) => (
                <li key={channel.id}>
                  <a
                    href={channel.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-between w-full px-4 py-2 text-sm rounded-md text-primary-foreground/80 hover:text-primary-foreground hover:bg-white/10"
                  >
                    <span>{channel.name}</span>
                    <ExternalLink className="h-3.5 w-3.5 text-primary-foreground/50" />
                  </a>
                </li>
              ))}
            </ul>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default TeamsChannelsDropdown;