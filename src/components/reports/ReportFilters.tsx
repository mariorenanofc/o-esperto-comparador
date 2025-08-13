import React from "react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Calendar, Filter, Download, BarChart3 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

export interface ReportFilters {
  period: "last3months" | "last6months" | "lastyear" | "all";
  sortBy: "date" | "savings" | "spending" | "comparisons";
  sortOrder: "asc" | "desc";
  showEmpty: boolean;
  minComparisons: number;
}

interface ReportFiltersProps {
  filters: ReportFilters;
  onFiltersChange: (filters: ReportFilters) => void;
  onExport: () => void;
  totalReports: number;
  totalComparisons: number;
  totalSavings: number;
}

const ReportFilters: React.FC<ReportFiltersProps> = ({
  filters,
  onFiltersChange,
  onExport,
  totalReports,
  totalComparisons,
  totalSavings,
}) => {
  const updateFilter = (key: keyof ReportFilters, value: any) => {
    onFiltersChange({ ...filters, [key]: value });
  };

  const getPeriodLabel = (period: string) => {
    switch (period) {
      case "last3months": return "Últimos 3 meses";
      case "last6months": return "Últimos 6 meses";
      case "lastyear": return "Último ano";
      case "all": return "Todos os períodos";
      default: return "Selecionar período";
    }
  };

  const getSortLabel = (sort: string) => {
    switch (sort) {
      case "date": return "Data";
      case "savings": return "Economia";
      case "spending": return "Gastos";
      case "comparisons": return "Comparações";
      default: return "Ordenar por";
    }
  };

  return (
    <div className="space-y-4">
      {/* Estatísticas Resumidas */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <Card className="p-3">
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-primary" />
            <div>
              <p className="text-xs text-muted-foreground">Relatórios</p>
              <p className="text-lg font-semibold">{totalReports}</p>
            </div>
          </div>
        </Card>
        <Card className="p-3">
          <div className="flex items-center gap-2">
            <BarChart3 className="w-4 h-4 text-blue-500" />
            <div>
              <p className="text-xs text-muted-foreground">Comparações</p>
              <p className="text-lg font-semibold">{totalComparisons}</p>
            </div>
          </div>
        </Card>
        <Card className="p-3">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-green-500 rounded-full" />
            <div>
              <p className="text-xs text-muted-foreground">Economia Total</p>
              <p className="text-lg font-semibold text-green-600">
                R$ {totalSavings.toFixed(2).replace(".", ",")}
              </p>
            </div>
          </div>
        </Card>
        <Card className="p-3">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-orange-500 rounded-full" />
            <div>
              <p className="text-xs text-muted-foreground">Média/Mês</p>
              <p className="text-lg font-semibold text-orange-600">
                R$ {totalReports > 0 ? (totalSavings / totalReports).toFixed(2).replace(".", ",") : "0,00"}
              </p>
            </div>
          </div>
        </Card>
      </div>

      {/* Filtros */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4" />
              <span className="text-sm font-medium">Filtros:</span>
            </div>

            <Select
              value={filters.period}
              onValueChange={(value) => updateFilter("period", value)}
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder={getPeriodLabel(filters.period)} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="last3months">Últimos 3 meses</SelectItem>
                <SelectItem value="last6months">Últimos 6 meses</SelectItem>
                <SelectItem value="lastyear">Último ano</SelectItem>
                <SelectItem value="all">Todos os períodos</SelectItem>
              </SelectContent>
            </Select>

            <Select
              value={filters.sortBy}
              onValueChange={(value) => updateFilter("sortBy", value)}
            >
              <SelectTrigger className="w-[140px]">
                <SelectValue placeholder={getSortLabel(filters.sortBy)} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="date">Por Data</SelectItem>
                <SelectItem value="savings">Por Economia</SelectItem>
                <SelectItem value="spending">Por Gastos</SelectItem>
                <SelectItem value="comparisons">Por Comparações</SelectItem>
              </SelectContent>
            </Select>

            <Button
              variant="outline"
              size="sm"
              onClick={() => updateFilter("sortOrder", filters.sortOrder === "asc" ? "desc" : "asc")}
            >
              {filters.sortOrder === "asc" ? "↑ Crescente" : "↓ Decrescente"}
            </Button>

            <Button
              variant="outline"
              size="sm"
              onClick={() => updateFilter("showEmpty", !filters.showEmpty)}
            >
              {filters.showEmpty ? "Ocultar vazios" : "Mostrar vazios"}
            </Button>

            <div className="ml-auto">
              <Button variant="outline" size="sm" onClick={onExport}>
                <Download className="w-4 h-4 mr-2" />
                Exportar
              </Button>
            </div>
          </div>

          {/* Filtros Ativos */}
          <div className="flex flex-wrap gap-2 mt-3">
            {filters.period !== "all" && (
              <Badge variant="secondary" className="text-xs">
                {getPeriodLabel(filters.period)}
              </Badge>
            )}
            {filters.sortBy !== "date" && (
              <Badge variant="secondary" className="text-xs">
                Ordenado por {getSortLabel(filters.sortBy).toLowerCase()}
              </Badge>
            )}
            {!filters.showEmpty && (
              <Badge variant="secondary" className="text-xs">
                Ocultando meses vazios
              </Badge>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ReportFilters;