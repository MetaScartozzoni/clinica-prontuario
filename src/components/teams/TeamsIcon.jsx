import React from 'react';
import { cn } from '@/lib/utils';

const TeamsIcon = ({ className }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="currentColor"
    className={cn("h-5 w-5", className)}
  >
    <path d="M12.55,12.55A3.18,3.18,0,0,0,14.63,9V5.5A1.5,1.5,0,0,0,13.13,4H6.5a1.5,1.5,0,0,0-1.5,1.5v7.62a3.18,3.18,0,0,0,2.08,3.08L12.55,17.45V12.55Z" />
    <path d="M11.63,12.5V17a2.5,2.5,0,0,0,4-2V8.5a1.5,1.5,0,0,0-1-1.41L11.63,6Z" />
    <path d="M16.5,8H19a1.5,1.5,0,0,1,1.5,1.5v3a1.5,1.5,0,0,1-1.5,1.5H16.5Z" />
  </svg>
);

export default TeamsIcon;