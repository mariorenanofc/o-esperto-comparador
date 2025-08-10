import React, { useEffect, useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Database, RefreshCw } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface DbUsage {
  db_size_bytes: number;
  limit_bytes: number;
  percent_used: number; // already rounded in RPC
  tables: { table: string; size_bytes: number }[];
}

const LIMIT_BYTES = 500 * 1024 * 1024; // 500MB

function formatBytes(bytes: number) {
  if (bytes === 0) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB", "TB"]; 
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  const value = parseFloat((bytes / Math.pow(k, i)).toFixed(2));
  return `${value} ${sizes[i]}`;
}

export const DbUsageCard: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [usage, setUsage] = useState<DbUsage | null>(null);

  const percent = useMemo(() => {
    return usage?.percent_used ?? 0;
  }, [usage]);

  const fetchUsage = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase.rpc("get_db_usage", { limit_bytes: LIMIT_BYTES });
      if (error) throw error;
      setUsage(data as unknown as DbUsage);
    } catch (err: any) {
      console.error("Erro ao buscar uso do banco:", err);
      toast.error("Falha ao buscar uso do banco de dados");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsage();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">Uso do Banco (500MB)</CardTitle>
        <Database className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        {loading && <div className="text-sm text-muted-foreground">Carregando...</div>}
        {!loading && usage && (
          <div className="space-y-3">
            <div className="flex items-end justify-between">
              <div className="text-2xl font-bold">
                {formatBytes(usage.db_size_bytes)} / {formatBytes(usage.limit_bytes)}
              </div>
              <div className="text-sm text-muted-foreground">{percent}%</div>
            </div>
            <Progress value={Math.min(100, percent)} />
            <div className="space-y-1">
              <div className="text-xs text-muted-foreground">Maiores tabelas</div>
              <ul className="text-sm space-y-1">
                {usage.tables.slice(0, 5).map((t) => (
                  <li key={t.table} className="flex items-center justify-between">
                    <span className="truncate mr-2">{t.table}</span>
                    <span className="text-muted-foreground">{formatBytes(t.size_bytes)}</span>
                  </li>
                ))}
              </ul>
            </div>
            <Button onClick={fetchUsage} variant="outline" size="sm" className="mt-2">
              <RefreshCw className={`w-4 h-4 mr-2 ${loading ? "animate-spin" : ""}`} />
              Atualizar
            </Button>
          </div>
        )}
        {!loading && !usage && (
          <div className="space-y-2">
            <div className="text-sm text-destructive">Não foi possível carregar o uso do banco</div>
            <Button onClick={fetchUsage} variant="outline" size="sm">
              <RefreshCw className="w-4 h-4 mr-2" /> Tentar novamente
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default DbUsageCard;
