import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { 
  Search, 
  Filter, 
  Download, 
  RefreshCw, 
  User, 
  Crown, 
  Calendar,
  ChevronLeft,
  ChevronRight,
  FileDown,
  Users,
  Activity
} from "lucide-react";
import { supabaseAdminService } from "@/services/supabase/adminService";
import { useErrorHandler } from "@/hooks/useErrorHandler";
import { logger } from "@/lib/logger";
import { useAuth } from "@/hooks/useAuth";
import { useNavigate } from "react-router-dom";

interface UserProfile {
  id: string;
  email: string;
  name: string | null;
  plan: string | null;
  created_at: string;
  is_online: boolean | null;
  last_activity: string | null;
  comparisons_made_this_month?: number;
}

interface FilterOptions {
  search: string;
  plan: string;
  status: string;
  dateRange: string;
  sortBy: string;
  sortOrder: 'asc' | 'desc';
}

export const UserManagementAdvanced: React.FC = () => {
  const { user: currentUser } = useAuth();
  const navigate = useNavigate();
  const { handleAsync } = useErrorHandler({ component: 'UserManagementAdvanced' });
  
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);
  
  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  
  // Filters
  const [filters, setFilters] = useState<FilterOptions>({
    search: '',
    plan: 'all',
    status: 'all',
    dateRange: 'all',
    sortBy: 'created_at',
    sortOrder: 'desc'
  });

  const fetchUsers = async () => {
    setLoading(true);
    const result = await handleAsync(
      async () => {
        logger.info('Fetching all users');
        const data = await supabaseAdminService.getAllUsers();
        logger.info('Users fetched', { count: data?.length || 0 });
        return data;
      },
      { action: 'fetch_users' },
      { showToast: true, severity: 'low' }
    );
    if (result) setUsers(result);
    setLoading(false);
  };

  // Apply filters and search
  useEffect(() => {
    let filtered = [...users];

    // Search filter
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      filtered = filtered.filter(user => 
        (user.name?.toLowerCase().includes(searchLower)) ||
        user.email.toLowerCase().includes(searchLower)
      );
    }

    // Plan filter
    if (filters.plan !== 'all') {
      filtered = filtered.filter(user => user.plan === filters.plan);
    }

    // Status filter
    if (filters.status !== 'all') {
      if (filters.status === 'online') {
        filtered = filtered.filter(user => user.is_online);
      } else if (filters.status === 'offline') {
        filtered = filtered.filter(user => !user.is_online);
      }
    }

    // Date range filter
    if (filters.dateRange !== 'all') {
      const now = new Date();
      const filterDate = new Date();
      
      switch (filters.dateRange) {
        case 'today':
          filterDate.setHours(0, 0, 0, 0);
          break;
        case 'week':
          filterDate.setDate(now.getDate() - 7);
          break;
        case 'month':
          filterDate.setMonth(now.getMonth() - 1);
          break;
      }

      filtered = filtered.filter(user => 
        new Date(user.created_at) >= filterDate
      );
    }

    // Sorting
    filtered.sort((a, b) => {
      let aVal: any = a[filters.sortBy as keyof UserProfile];
      let bVal: any = b[filters.sortBy as keyof UserProfile];

      if (filters.sortBy === 'created_at' || filters.sortBy === 'last_activity') {
        aVal = new Date(aVal || 0).getTime();
        bVal = new Date(bVal || 0).getTime();
      }

      if (typeof aVal === 'string') {
        aVal = aVal?.toLowerCase() || '';
        bVal = bVal?.toLowerCase() || '';
      }

      if (filters.sortOrder === 'asc') {
        return aVal > bVal ? 1 : -1;
      } else {
        return aVal < bVal ? 1 : -1;
      }
    });

    setFilteredUsers(filtered);
    setCurrentPage(1); // Reset to first page when filters change
  }, [users, filters]);

  // Pagination logic
  const totalPages = Math.ceil(filteredUsers.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedUsers = filteredUsers.slice(startIndex, startIndex + itemsPerPage);

  const handleExport = async (format: 'csv' | 'pdf') => {
    setExporting(true);
    await handleAsync(
      async () => {
        logger.info('Exporting users report', { format, count: filteredUsers.length });
        
        if (format === 'csv') {
          const csvContent = generateCSV(filteredUsers);
          downloadFile(csvContent, 'usuarios.csv', 'text/csv');
        } else {
          throw new Error('PDF export not implemented yet');
        }
        
        logger.info('Report exported successfully', { format });
      },
      { action: 'export_users' },
      { showToast: true, severity: 'low' }
    );
    setExporting(false);
  };

  const generateCSV = (data: UserProfile[]): string => {
    const headers = ['ID', 'Nome', 'Email', 'Plano', 'Status', 'Data de Cadastro', 'Última Atividade'];
    const rows = data.map(user => [
      user.id,
      user.name || 'N/A',
      user.email,
      user.plan || 'free',
      user.is_online ? 'Online' : 'Offline',
      new Date(user.created_at).toLocaleDateString('pt-BR'),
      user.last_activity ? new Date(user.last_activity).toLocaleDateString('pt-BR') : 'N/A'
    ]);

    return [headers, ...rows]
      .map(row => row.map(field => `"${field}"`).join(','))
      .join('\n');
  };

  const downloadFile = (content: string, fileName: string, mimeType: string) => {
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const getPlanBadge = (plan: string | null) => {
    switch (plan) {
      case "admin":
        return <Badge variant="destructive"><Crown className="w-3 h-3 mr-1" />Admin</Badge>;
      case "premium":
        return <Badge className="bg-blue-600">Premium</Badge>;
      case "pro":
        return <Badge className="bg-purple-600">Pro</Badge>;
      default:
        return <Badge variant="outline">Free</Badge>;
    }
  };

  const getStatusBadge = (isOnline: boolean | null) => {
    return isOnline ? (
      <Badge className="bg-green-600">
        <Activity className="w-3 h-3 mr-1" />Online
      </Badge>
    ) : (
      <Badge variant="outline">Offline</Badge>
    );
  };

  useEffect(() => {
    fetchUsers();
    
    // Auto-refresh every 30 seconds
    const interval = setInterval(fetchUsers, 30000);
    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Gerenciamento Avançado de Usuários</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <RefreshCw className="w-6 h-6 animate-spin mr-2" />
            Carregando usuários...
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total de Usuários</p>
                <p className="text-2xl font-bold">{users.length}</p>
              </div>
              <Users className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Usuários Online</p>
                <p className="text-2xl font-bold">{users.filter(u => u.is_online).length}</p>
              </div>
              <Activity className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Usuários Premium</p>
                <p className="text-2xl font-bold">
                  {users.filter(u => ['premium', 'pro', 'admin'].includes(u.plan || '')).length}
                </p>
              </div>
              <Crown className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Resultados Filtrados</p>
                <p className="text-2xl font-bold">{filteredUsers.length}</p>
              </div>
              <Filter className="h-8 w-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Search */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Filter className="w-5 h-5" />
              Filtros e Busca
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleExport('csv')}
                disabled={exporting}
              >
                <FileDown className="w-4 h-4 mr-2" />
                CSV
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={fetchUsers}
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                Atualizar
              </Button>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Buscar</label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Nome ou email..."
                  className="pl-10"
                  value={filters.search}
                  onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
                />
              </div>
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">Plano</label>
              <Select value={filters.plan} onValueChange={(value) => setFilters(prev => ({ ...prev, plan: value }))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos os planos</SelectItem>
                  <SelectItem value="free">Free</SelectItem>
                  <SelectItem value="premium">Premium</SelectItem>
                  <SelectItem value="pro">Pro</SelectItem>
                  <SelectItem value="admin">Admin</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">Status</label>
              <Select value={filters.status} onValueChange={(value) => setFilters(prev => ({ ...prev, status: value }))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos os status</SelectItem>
                  <SelectItem value="online">Online</SelectItem>
                  <SelectItem value="offline">Offline</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">Ordenar por</label>
              <Select value={filters.sortBy} onValueChange={(value) => setFilters(prev => ({ ...prev, sortBy: value }))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="created_at">Data de cadastro</SelectItem>
                  <SelectItem value="last_activity">Última atividade</SelectItem>
                  <SelectItem value="name">Nome</SelectItem>
                  <SelectItem value="email">Email</SelectItem>
                  <SelectItem value="plan">Plano</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Users Table */}
      <Card>
        <CardHeader>
          <CardTitle>
            Usuários ({filteredUsers.length} {filteredUsers.length !== users.length && `de ${users.length}`})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Usuário</TableHead>
                <TableHead>Plano</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Cadastro</TableHead>
                <TableHead>Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedUsers.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-8">
                    <User className="mx-auto h-12 w-12 text-gray-400 mb-2" />
                    <p className="text-gray-500">Nenhum usuário encontrado com os filtros aplicados.</p>
                  </TableCell>
                </TableRow>
              ) : (
                paginatedUsers.map((user) => (
                  <TableRow
                    key={user.id}
                    className="cursor-pointer hover:bg-muted/50"
                    onClick={() => navigate(`/admin/users/${user.id}`)}
                  >
                    <TableCell>
                      <div>
                        <p className="font-medium">{user.name || "Nome não informado"}</p>
                        <p className="text-sm text-muted-foreground">{user.email}</p>
                      </div>
                    </TableCell>
                    <TableCell>{getPlanBadge(user.plan)}</TableCell>
                    <TableCell>{getStatusBadge(user.is_online)}</TableCell>
                    <TableCell>
                      <div className="flex items-center text-sm">
                        <Calendar className="w-4 h-4 mr-1" />
                        {new Date(user.created_at).toLocaleDateString("pt-BR")}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          navigate(`/admin/users/${user.id}`);
                        }}
                      >
                        Ver Detalhes
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between mt-6">
              <p className="text-sm text-muted-foreground">
                Mostrando {startIndex + 1} a {Math.min(startIndex + itemsPerPage, filteredUsers.length)} de {filteredUsers.length} usuários
              </p>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                  disabled={currentPage === 1}
                >
                  <ChevronLeft className="w-4 h-4 mr-2" />
                  Anterior
                </Button>
                
                <div className="flex items-center gap-1">
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    const pageNum = Math.max(1, Math.min(totalPages - 4, currentPage - 2)) + i;
                    return (
                      <Button
                        key={pageNum}
                        variant={currentPage === pageNum ? "default" : "outline"}
                        size="sm"
                        onClick={() => setCurrentPage(pageNum)}
                        className="w-8 h-8 p-0"
                      >
                        {pageNum}
                      </Button>
                    );
                  })}
                </div>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                  disabled={currentPage === totalPages}
                >
                  Próximo
                  <ChevronRight className="w-4 h-4 ml-2" />
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};