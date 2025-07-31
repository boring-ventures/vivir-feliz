"use client";

import { useState } from "react";
import { RoleGuard } from "@/components/auth/role-guard";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
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
  Shield,
  Lock,
  AlertTriangle,
  Eye,
  Key,
  Users,
  Activity,
  AlertCircle,
  Clock,
  MapPin,
  Monitor,
  Settings,
  Save,
  RefreshCw,
} from "lucide-react";

interface SecurityEvent {
  id: string;
  timestamp: string;
  type:
    | "LOGIN_ATTEMPT"
    | "PASSWORD_CHANGE"
    | "ROLE_CHANGE"
    | "SUSPICIOUS_ACTIVITY"
    | "ACCESS_DENIED";
  severity: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
  description: string;
  userId?: string;
  userEmail?: string;
  ipAddress: string;
  userAgent?: string;
  location?: string;
}

export default function SuperAdminSecurityPage() {
  const [securityConfig, setSecurityConfig] = useState({
    twoFactorAuth: true,
    passwordExpiration: 90,
    sessionTimeout: 30,
    maxLoginAttempts: 5,
    lockoutDuration: 15,
    ipWhitelist: false,
    suspiciousActivityDetection: true,
    auditLogging: true,
  });

  const [activeSessions] = useState([
    {
      id: "1",
      userId: "user-123",
      userEmail: "admin@vivirfeliz.com",
      ipAddress: "192.168.1.100",
      location: "La Paz, Bolivia",
      userAgent: "Chrome 120.0.0.0",
      lastActivity: "2024-01-15T10:30:00Z",
      isCurrent: true,
    },
    {
      id: "2",
      userId: "user-456",
      userEmail: "therapist@vivirfeliz.com",
      ipAddress: "192.168.1.101",
      location: "Cochabamba, Bolivia",
      userAgent: "Firefox 121.0",
      lastActivity: "2024-01-15T09:45:00Z",
      isCurrent: false,
    },
  ]);

  const [securityEvents] = useState<SecurityEvent[]>([
    {
      id: "1",
      timestamp: "2024-01-15T10:30:00Z",
      type: "LOGIN_ATTEMPT",
      severity: "LOW",
      description: "Login exitoso desde IP conocida",
      userId: "user-123",
      userEmail: "admin@vivirfeliz.com",
      ipAddress: "192.168.1.100",
      location: "La Paz, Bolivia",
    },
    {
      id: "2",
      timestamp: "2024-01-15T10:25:00Z",
      type: "SUSPICIOUS_ACTIVITY",
      severity: "HIGH",
      description: "Múltiples intentos de login fallidos",
      userEmail: "unknown@example.com",
      ipAddress: "192.168.1.103",
      location: "Unknown",
    },
    {
      id: "3",
      timestamp: "2024-01-15T10:20:00Z",
      type: "PASSWORD_CHANGE",
      severity: "MEDIUM",
      description: "Contraseña cambiada exitosamente",
      userId: "user-456",
      userEmail: "therapist@vivirfeliz.com",
      ipAddress: "192.168.1.101",
      location: "Cochabamba, Bolivia",
    },
    {
      id: "4",
      timestamp: "2024-01-15T10:15:00Z",
      type: "ACCESS_DENIED",
      severity: "MEDIUM",
      description: "Acceso denegado a recurso protegido",
      userId: "user-789",
      userEmail: "parent@vivirfeliz.com",
      ipAddress: "192.168.1.102",
      location: "Santa Cruz, Bolivia",
    },
  ]);

  const handleConfigChange = (key: string, value: unknown) => {
    setSecurityConfig((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "CRITICAL":
        return "bg-red-100 text-red-800";
      case "HIGH":
        return "bg-orange-100 text-orange-800";
      case "MEDIUM":
        return "bg-yellow-100 text-yellow-800";
      case "LOW":
        return "bg-green-100 text-green-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getEventTypeIcon = (type: string) => {
    switch (type) {
      case "LOGIN_ATTEMPT":
        return <Key className="h-4 w-4" />;
      case "PASSWORD_CHANGE":
        return <Lock className="h-4 w-4" />;
      case "ROLE_CHANGE":
        return <Users className="h-4 w-4" />;
      case "SUSPICIOUS_ACTIVITY":
        return <AlertTriangle className="h-4 w-4" />;
      case "ACCESS_DENIED":
        return <AlertCircle className="h-4 w-4" />;
      default:
        return <Activity className="h-4 w-4" />;
    }
  };

  const formatTimestamp = (timestamp: string) => {
    return new Date(timestamp).toLocaleString("es-BO", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const securityStats = {
    totalEvents: securityEvents.length,
    critical: securityEvents.filter((e) => e.severity === "CRITICAL").length,
    high: securityEvents.filter((e) => e.severity === "HIGH").length,
    activeSessions: activeSessions.length,
  };

  return (
    <RoleGuard allowedRoles={["SUPER_ADMIN"]}>
      <main className="p-6">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <Shield className="h-8 w-8 text-purple-600" />
            <h1 className="text-3xl font-bold">Seguridad del Sistema</h1>
          </div>
          <p className="text-muted-foreground">
            Gestión avanzada de seguridad, autenticación y control de acceso
          </p>
        </div>

        {/* Security Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">
                    Eventos de Seguridad
                  </p>
                  <p className="text-2xl font-bold">
                    {securityStats.totalEvents}
                  </p>
                </div>
                <Shield className="h-6 w-6 text-blue-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">
                    Alertas Críticas
                  </p>
                  <p className="text-2xl font-bold text-red-600">
                    {securityStats.critical}
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
                  <p className="text-sm text-muted-foreground">Alertas Altas</p>
                  <p className="text-2xl font-bold text-orange-600">
                    {securityStats.high}
                  </p>
                </div>
                <AlertTriangle className="h-6 w-6 text-orange-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">
                    Sesiones Activas
                  </p>
                  <p className="text-2xl font-bold text-green-600">
                    {securityStats.activeSessions}
                  </p>
                </div>
                <Users className="h-6 w-6 text-green-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Security Configuration */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Authentication Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Lock className="h-5 w-5 mr-2 text-blue-600" />
                Configuración de Autenticación
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="two-factor">
                    Autenticación de Dos Factores
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    Requerir 2FA para todos los usuarios
                  </p>
                </div>
                <Switch
                  id="two-factor"
                  checked={securityConfig.twoFactorAuth}
                  onCheckedChange={(checked) =>
                    handleConfigChange("twoFactorAuth", checked)
                  }
                />
              </div>

              <div>
                <Label htmlFor="password-expiration">
                  Expiración de Contraseña (días)
                </Label>
                <Select
                  value={securityConfig.passwordExpiration.toString()}
                  onValueChange={(value) =>
                    handleConfigChange("passwordExpiration", parseInt(value))
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="30">30 días</SelectItem>
                    <SelectItem value="60">60 días</SelectItem>
                    <SelectItem value="90">90 días</SelectItem>
                    <SelectItem value="180">180 días</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="session-timeout">
                  Tiempo de Sesión (minutos)
                </Label>
                <Select
                  value={securityConfig.sessionTimeout.toString()}
                  onValueChange={(value) =>
                    handleConfigChange("sessionTimeout", parseInt(value))
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="15">15 minutos</SelectItem>
                    <SelectItem value="30">30 minutos</SelectItem>
                    <SelectItem value="60">1 hora</SelectItem>
                    <SelectItem value="120">2 horas</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="max-login-attempts">
                  Intentos Máximos de Login
                </Label>
                <Select
                  value={securityConfig.maxLoginAttempts.toString()}
                  onValueChange={(value) =>
                    handleConfigChange("maxLoginAttempts", parseInt(value))
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="3">3 intentos</SelectItem>
                    <SelectItem value="5">5 intentos</SelectItem>
                    <SelectItem value="10">10 intentos</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="lockout-duration">
                  Duración del Bloqueo (minutos)
                </Label>
                <Select
                  value={securityConfig.lockoutDuration.toString()}
                  onValueChange={(value) =>
                    handleConfigChange("lockoutDuration", parseInt(value))
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="5">5 minutos</SelectItem>
                    <SelectItem value="15">15 minutos</SelectItem>
                    <SelectItem value="30">30 minutos</SelectItem>
                    <SelectItem value="60">1 hora</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Security Monitoring */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Monitor className="h-5 w-5 mr-2 text-green-600" />
                Monitoreo de Seguridad
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="ip-whitelist">Lista Blanca de IPs</Label>
                  <p className="text-sm text-muted-foreground">
                    Restringir acceso a IPs específicas
                  </p>
                </div>
                <Switch
                  id="ip-whitelist"
                  checked={securityConfig.ipWhitelist}
                  onCheckedChange={(checked) =>
                    handleConfigChange("ipWhitelist", checked)
                  }
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="suspicious-detection">
                    Detección de Actividad Sospechosa
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    Monitorear patrones anómalos
                  </p>
                </div>
                <Switch
                  id="suspicious-detection"
                  checked={securityConfig.suspiciousActivityDetection}
                  onCheckedChange={(checked) =>
                    handleConfigChange("suspiciousActivityDetection", checked)
                  }
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="audit-logging">Registro de Auditoría</Label>
                  <p className="text-sm text-muted-foreground">
                    Registrar todas las acciones de seguridad
                  </p>
                </div>
                <Switch
                  id="audit-logging"
                  checked={securityConfig.auditLogging}
                  onCheckedChange={(checked) =>
                    handleConfigChange("auditLogging", checked)
                  }
                />
              </div>

              <div>
                <Label htmlFor="security-level">Nivel de Seguridad</Label>
                <Select defaultValue="high">
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Bajo</SelectItem>
                    <SelectItem value="medium">Medio</SelectItem>
                    <SelectItem value="high">Alto</SelectItem>
                    <SelectItem value="very-high">Muy Alto</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="encryption-level">Nivel de Encriptación</Label>
                <Select defaultValue="aes-256">
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="aes-128">AES-128</SelectItem>
                    <SelectItem value="aes-256">AES-256</SelectItem>
                    <SelectItem value="chacha20">ChaCha20</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Active Sessions */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Users className="h-5 w-5 mr-2 text-blue-600" />
              Sesiones Activas
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Usuario</TableHead>
                    <TableHead>IP</TableHead>
                    <TableHead>Ubicación</TableHead>
                    <TableHead>Navegador</TableHead>
                    <TableHead>Última Actividad</TableHead>
                    <TableHead>Estado</TableHead>
                    <TableHead>Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {activeSessions.map((session) => (
                    <TableRow key={session.id}>
                      <TableCell>
                        <div>
                          <div className="font-medium">{session.userEmail}</div>
                          <div className="text-sm text-muted-foreground">
                            ID: {session.userId}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className="font-mono text-sm">
                          {session.ipAddress}
                        </span>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <MapPin className="h-4 w-4 text-gray-400" />
                          <span className="text-sm">{session.location}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className="text-sm">{session.userAgent}</span>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Clock className="h-4 w-4 text-gray-400" />
                          <span className="text-sm">
                            {formatTimestamp(session.lastActivity)}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        {session.isCurrent ? (
                          <Badge className="bg-green-100 text-green-800">
                            Sesión Actual
                          </Badge>
                        ) : (
                          <Badge variant="outline">Activa</Badge>
                        )}
                      </TableCell>
                      <TableCell>
                        <Button variant="ghost" size="sm">
                          <Eye className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>

        {/* Security Events */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Activity className="h-5 w-5 mr-2 text-red-600" />
              Eventos de Seguridad Recientes
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Timestamp</TableHead>
                    <TableHead>Tipo</TableHead>
                    <TableHead>Severidad</TableHead>
                    <TableHead>Descripción</TableHead>
                    <TableHead>Usuario</TableHead>
                    <TableHead>IP</TableHead>
                    <TableHead>Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {securityEvents.map((event) => (
                    <TableRow key={event.id}>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Clock className="h-4 w-4 text-gray-400" />
                          <span className="text-sm">
                            {formatTimestamp(event.timestamp)}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {getEventTypeIcon(event.type)}
                          <span className="text-sm">
                            {event.type.replace("_", " ")}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge className={getSeverityColor(event.severity)}>
                          {event.severity}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="max-w-md">
                          <p className="text-sm">{event.description}</p>
                        </div>
                      </TableCell>
                      <TableCell>
                        {event.userEmail ? (
                          <span className="text-sm">{event.userEmail}</span>
                        ) : (
                          <span className="text-sm text-muted-foreground">
                            -
                          </span>
                        )}
                      </TableCell>
                      <TableCell>
                        <span className="font-mono text-sm">
                          {event.ipAddress}
                        </span>
                      </TableCell>
                      <TableCell>
                        <Button variant="ghost" size="sm">
                          <Eye className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>

        {/* Actions */}
        <div className="flex gap-4 mt-8">
          <Button>
            <Save className="h-4 w-4 mr-2" />
            Guardar Configuración
          </Button>
          <Button variant="outline">
            <RefreshCw className="h-4 w-4 mr-2" />
            Actualizar Eventos
          </Button>
          <Button variant="outline">
            <Settings className="h-4 w-4 mr-2" />
            Configuración Avanzada
          </Button>
        </div>
      </main>
    </RoleGuard>
  );
}
