import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Filter, Search, Download } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const CashFlowFilters = ({ 
  searchTerm, 
  setSearchTerm, 
  typeFilter, 
  handleTypeFilterChange, 
  subtypeFilter, 
  handleSubtypeFilterChange,
  transactionTypes,
  transactionSubtypes
}) => {
  return (
    <div className="flex flex-col sm:flex-row gap-2 w-full md:w-auto">
      <div className="relative w-full sm:w-auto">
        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input
          type="search"
          placeholder="Buscar transações..."
          className="pl-8 sm:w-[200px] md:w-[250px]"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" className="gap-1 w-full sm:w-auto">
            <Filter className="h-3.5 w-3.5" /> Tipo
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="bg-popover text-popover-foreground">
          <DropdownMenuLabel>Filtrar por Tipo</DropdownMenuLabel>
          <DropdownMenuSeparator />
          {transactionTypes.map((type) => (
            <DropdownMenuCheckboxItem key={type} checked={typeFilter.includes(type)} onCheckedChange={() => handleTypeFilterChange(type)}>
              {type}
            </DropdownMenuCheckboxItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" className="gap-1 w-full sm:w-auto">
            <Filter className="h-3.5 w-3.5" /> Subtipo
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="bg-popover text-popover-foreground">
          <DropdownMenuLabel>Filtrar por Subtipo</DropdownMenuLabel>
          <DropdownMenuSeparator />
          {transactionSubtypes.map((subtype) => (
            <DropdownMenuCheckboxItem key={subtype} checked={subtypeFilter.includes(subtype)} onCheckedChange={() => handleSubtypeFilterChange(subtype)}>
              {subtype}
            </DropdownMenuCheckboxItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
      <Button variant="outline" className="w-full sm:w-auto">
        <Download className="mr-2 h-4 w-4" /> Exportar
      </Button>
    </div>
  );
};

export default CashFlowFilters;