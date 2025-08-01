
import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { format } from 'date-fns';

export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

export const normalizePhoneNumber = (phone) => {
  if (!phone) return null;
  let normalized = phone.replace(/\D/g, ''); 
  
  if (normalized.startsWith('0')) {
    normalized = normalized.substring(1);
  }
  
  if (phone.startsWith('+')) {
    normalized = `+${normalized}`;
  } else if (normalized.length === 11 && normalized.startsWith('55')) { 
    normalized = `+${normalized}`;
  } else if (normalized.length === 10 && !normalized.startsWith('1') && !normalized.startsWith('55')) { 
     normalized = `+55${normalized}`;
  } else if (normalized.length === 11 && !normalized.startsWith('55') && !normalized.startsWith('+')) {
    normalized = `+55${normalized}`;
  } else if (normalized.length >= 10 && !normalized.startsWith('+')) {
    normalized = `+55${normalized}`;
  } else if (!normalized.startsWith('+')) {
     normalized = `+${normalized}`;
  }
  return normalized;
};

export const formatDateForSupabase = (date) => {
  if (!date) return null;
  return format(new Date(date), "yyyy-MM-dd'T'HH:mm:ss.SSSxxx");
};
