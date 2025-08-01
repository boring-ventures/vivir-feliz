"use client";

import { useState } from "react";
import { RoleGuard } from "@/components/auth/role-guard";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
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
  FileText,
  Search,
  Download,
  RefreshCw,
  AlertCircle,
  Info,
  AlertTriangle,
  Clock,
  User,
  Activity,
  Database,
  Shield,
} from "lucide-react";

interface LogEntry {
  id: string;
  timestamp: string;
  level: "INFO" | "WARNING" | "ERROR" | "DEBUG";
  category: "AUTH" | "DATABASE" | "API" | "SYSTEM" | "USER" | "SECURITY";
  message: string;
  userId?: string;
  userEmail?: string;
  ipAddress?: string;
  userAgent?: string;
  details?: Record<string, unknown>;
}

export default function SuperAdminLogsPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [levelFilter, setLevelFilter] = useState<string>("all");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [timeFilter, setTimeFilter] = useState<string>("24h");

  // Mock log data

  // Mock log data
  const mockLogs: LogEntry[] = [
    {
      id: "1",
      timestamp: "2024-01-15T10:30:00Z",
      level: "INFO",
      category: "AUTH",
      message: "Usuario autenticado exitosamente",
      userId: "user-123",
      userEmail: "admin@vivirfeliz.com",
      ipAddress: "192.168.1.100",
      userAgent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
    },
    {
      id: "2",
      timestamp: "2024-01-15T10:25:00Z",
      level: "WARNING",
      category: "DATABASE",
      message: "Consulta lenta detectada en tabla appointments",
      userId: "user-456",
      userEmail: "therapist@vivirfeliz.com",
      ipAddress: "192.168.1.101",
    },
    {
      id: "3",
      timestamp: "2024-01-15T10:20:00Z",
      level: "ERROR",
      category: "API",
      message: "Error al procesar solicitud de cita",
      userId: "user-789",
      userEmail: "parent@vivirfeliz.com",
      ipAddress: "192.168.1.102",
      details: {
        endpoint: "/api/appointments",
        error: "Validation failed",
        stack: "...",
      },
    },
    {
      id: "4",
      timestamp: "2024-01-15T10:15:00Z",
      level: "INFO",
      category: "USER",
      message: "Nuevo usuario creado",
      userId: "user-123",
      userEmail: "admin@vivirfeliz.com",
      ipAddress: "192.168.1.100",
    },
    {
      id: "5",
      timestamp: "2024-01-15T10:10:00Z",
      level: "DEBUG",
      category: "SYSTEM",
      message: "Respaldo automático completado",
      ipAddress: "system",
    },
    {
      id: "6",
      timestamp: "2024-01-15T10:05:00Z",
      level: "WARNING",
      category: "SECURITY",
      message: "Múltiples intentos de login fallidos",
      userEmail: "unknown@example.com",
      ipAddress: "192.168.1.103",
    },
  ];

  const getLevelColor = (level: string) => {
    switch (level) {
      case "ERROR":
        return "bg-red-100 text-red-800";
      case "WARNING":
        return "bg-yellow-100 text-yellow-800";
      case "INFO":
        return "bg-blue-100 text-blue-800";
      case "DEBUG":
        return "bg-gray-100 text-gray-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case "AUTH":
        return <Shield className="h-4 w-4" />;
      case "DATABASE":
        return <Database className="h-4 w-4" />;
      case "API":
        return <Activity className="h-4 w-4" />;
      case "SYSTEM":
        return <Activity className="h-4 w-4" />;
      case "USER":
        return <User className="h-4 w-4" />;
      case "SECURITY":
        return <Shield className="h-4 w-4" />;
      default:
        return <Info className="h-4 w-4" />;
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case "AUTH":
        return "text-blue-600";
      case "DATABASE":
        return "text-green-600";
      case "API":
        return "text-purple-600";
      case "SYSTEM":
        return "text-amber-600";
      case "USER":
        return "text-indigo-600";
      case "SECURITY":
        return "text-red-600";
      default:
        return "text-gray-600";
    }
  };

  const formatTimestamp = (timestamp: string) => {
    return new Date(timestamp).toLocaleString("es-BO", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });
  };

  const filteredLogs = mockLogs.filter((log) => {
    const matchesSearch =
      log.message.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (log.userEmail &&
        log.userEmail.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesLevel = levelFilter === "all" || log.level === levelFilter;
    const matchesCategory =
      categoryFilter === "all" || log.category === categoryFilter;

    return matchesSearch && matchesLevel && matchesCategory;
  });

  const logStats = {
    total: mockLogs.length,
    error: mockLogs.filter((log) => log.level === "ERROR").length,
    warning: mockLogs.filter((log) => log.level === "WARNING").length,
    info: mockLogs.filter((log) => log.level === "INFO").length,
  };

  return (
    <RoleGuard allowedRoles={["SUPER_ADMIN"]}>
      <main className="p-6">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <FileText className="h-8 w-8 text-blue-600" />
            <h1 className="text-3xl font-bold">Logs del Sistema</h1>
          </div>
          <p className="text-muted-foreground">
            Registro de eventos y actividad del sistema
          </p>
        </div>

        {/* Log Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total de Logs</p>
                  <p className="text-2xl font-bold">{logStats.total}</p>
                </div>
                <FileText className="h-6 w-6 text-blue-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Errores</p>
                  <p className="text-2xl font-bold text-red-600">
                    {logStats.error}
                  </p>
                </div>
                <AlertCircle className="h-6 w-6 text-red-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Advertencias</p>
                  <p className="text-2xl font-bold text-yellow-600">
                    {logStats.warning}
                  </p>
                </div>
                <AlertTriangle className="h-6 w-6 text-yellow-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Información</p>
                  <p className="text-2xl font-bold text-blue-600">
                    {logStats.info}
                  </p>
                </div>
                <Info className="h-6 w-6 text-blue-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Controls */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Buscar en logs..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
          <div className="flex gap-2">
            <Select value={levelFilter} onValueChange={setLevelFilter}>
              <SelectTrigger className="w-32">
                <SelectValue placeholder="Nivel" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                <SelectItem value="ERROR">Error</SelectItem>
                <SelectItem value="WARNING">Advertencia</SelectItem>
                <SelectItem value="INFO">Info</SelectItem>
                <SelectItem value="DEBUG">Debug</SelectItem>
              </SelectContent>
            </Select>
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Categoría" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas</SelectItem>
                <SelectItem value="AUTH">Autenticación</SelectItem>
                <SelectItem value="DATABASE">Base de Datos</SelectItem>
                <SelectItem value="API">API</SelectItem>
                <SelectItem value="SYSTEM">Sistema</SelectItem>
                <SelectItem value="USER">Usuario</SelectItem>
                <SelectItem value="SECURITY">Seguridad</SelectItem>
              </SelectContent>
            </Select>
            <Select value={timeFilter} onValueChange={setTimeFilter}>
              <SelectTrigger className="w-32">
                <SelectValue placeholder="Tiempo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1h">Última hora</SelectItem>
                <SelectItem value="24h">Últimas 24h</SelectItem>
                <SelectItem value="7d">Últimos 7 días</SelectItem>
                <SelectItem value="30d">Últimos 30 días</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline">
              <RefreshCw className="h-4 w-4 mr-2" />
              Actualizar
            </Button>
            <Button variant="outline">
              <Download className="h-4 w-4 mr-2" />
              Exportar
            </Button>
          </div>
        </div>

        {/* Logs Table */}
        <Card>
          <CardHeader>
            <CardTitle>Registro de Eventos ({filteredLogs.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Timestamp</TableHead>
                    <TableHead>Nivel</TableHead>
                    <TableHead>Categoría</TableHead>
                    <TableHead>Mensaje</TableHead>
                    <TableHead>Usuario</TableHead>
                    <TableHead>IP</TableHead>
                    <TableHead>Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredLogs.map((log) => (
                    <TableRow key={log.id}>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Clock className="h-4 w-4 text-gray-400" />
                          <span className="text-sm">
                            {formatTimestamp(log.timestamp)}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge className={getLevelColor(log.level)}>
                          {log.level}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <div className={getCategoryColor(log.category)}>
                            {getCategoryIcon(log.category)}
                          </div>
                          <span className="text-sm">{log.category}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="max-w-md">
                          <p className="text-sm font-medium">{log.message}</p>
                          {log.details && (
                            <p className="text-xs text-muted-foreground mt-1">
                              {JSON.stringify(log.details)}
                            </p>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        {log.userEmail ? (
                          <div className="text-sm">
                            <div className="font-medium">{log.userEmail}</div>
                            {log.userId && (
                              <div className="text-xs text-muted-foreground">
                                ID: {log.userId}
                              </div>
                            )}
                          </div>
                        ) : (
                          <span className="text-sm text-muted-foreground">
                            -
                          </span>
                        )}
                      </TableCell>
                      <TableCell>
                        <span className="text-sm font-mono">
                          {log.ipAddress || "-"}
                        </span>
                      </TableCell>
                      <TableCell>
                        <Button variant="ghost" size="sm">
                          <Info className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>

        {/* Log Details Modal Placeholder */}
        <div className="mt-8">
          <Card>
            <CardHeader>
              <CardTitle>Información Adicional</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Selecciona un log para ver detalles completos, incluyendo stack
                traces, contexto de usuario, y metadatos adicionales.
              </p>
            </CardContent>
          </Card>
        </div>
      </main>
    </RoleGuard>
  );
}
