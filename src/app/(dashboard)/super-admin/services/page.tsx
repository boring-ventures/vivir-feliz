"use client";

import { useState } from "react";
import { RoleGuard } from "@/components/auth/role-guard";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Plus,
  Search,
  Filter,
  RefreshCw,
  Settings,
  FileText,
  DollarSign,
  Clock,
  CheckCircle,
} from "lucide-react";
import {
  useServices,
  useCreateService,
  useUpdateService,
  useDeleteService,
} from "@/hooks/useServices";
import { ServiceForm } from "@/components/services/ServiceForm";
import { ServiceTable } from "@/components/services/ServiceTable";
import {
  Service,
  CreateServiceData,
  UpdateServiceData,
} from "@/hooks/useServices";
import { toast } from "@/components/ui/use-toast";

export default function SuperAdminServicesPage() {
  const [showForm, setShowForm] = useState(false);
  const [editingService, setEditingService] = useState<Service | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [specialtyFilter, setSpecialtyFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  const { data: services = [], isLoading, refetch } = useServices();
  const createServiceMutation = useCreateService();
  const updateServiceMutation = useUpdateService();
  const deleteServiceMutation = useDeleteService();

  // Filter services based on search and filters
  const filteredServices = services.filter((service) => {
    const matchesSearch =
      service.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      service.serviceName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (service.description &&
        service.description.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesType = typeFilter === "all" || service.type === typeFilter;
    const matchesSpecialty =
      specialtyFilter === "all" || service.specialty === specialtyFilter;
    const matchesStatus =
      statusFilter === "all" ||
      (statusFilter === "active" && service.status) ||
      (statusFilter === "inactive" && !service.status);

    return matchesSearch && matchesType && matchesSpecialty && matchesStatus;
  });

  const handleCreateService = async (data: CreateServiceData) => {
    try {
      await createServiceMutation.mutateAsync(data);
      toast({
        title: "Éxito",
        description: "Servicio creado exitosamente",
      });
      setShowForm(false);
    } catch (error) {
      toast({
        title: "Error",
        description:
          error instanceof Error ? error.message : "Error al crear servicio",
        variant: "destructive",
      });
    }
  };

  const handleUpdateService = async (data: UpdateServiceData) => {
    if (!editingService) return;

    try {
      await updateServiceMutation.mutateAsync({ id: editingService.id, data });
      toast({
        title: "Éxito",
        description: "Servicio actualizado exitosamente",
      });
      setEditingService(null);
    } catch (error) {
      toast({
        title: "Error",
        description:
          error instanceof Error
            ? error.message
            : "Error al actualizar servicio",
        variant: "destructive",
      });
    }
  };

  const handleDeleteService = async (id: string) => {
    try {
      await deleteServiceMutation.mutateAsync(id);
      toast({
        title: "Éxito",
        description: "Servicio eliminado exitosamente",
      });
    } catch (error) {
      toast({
        title: "Error",
        description:
          error instanceof Error ? error.message : "Error al eliminar servicio",
        variant: "destructive",
      });
    }
  };

  const handleEditService = (service: Service) => {
    setEditingService(service);
    setShowForm(true);
  };

  const handleCancelForm = () => {
    setShowForm(false);
    setEditingService(null);
  };

  const handleSubmit = (data: CreateServiceData | UpdateServiceData) => {
    if (editingService) {
      handleUpdateService(data as UpdateServiceData);
    } else {
      handleCreateService(data as CreateServiceData);
    }
  };

  // Calculate statistics
  const totalServices = services.length;
  const activeServices = services.filter((s) => s.status).length;
  const evaluationServices = services.filter(
    (s) => s.type === "EVALUATION"
  ).length;
  const treatmentServices = services.filter(
    (s) => s.type === "TREATMENT"
  ).length;

  return (
    <RoleGuard allowedRoles={["SUPER_ADMIN"]}>
      <main className="p-6">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <Settings className="h-8 w-8 text-blue-600" />
            <h1 className="text-3xl font-bold">Gestión de Servicios</h1>
          </div>
          <p className="text-muted-foreground">
            Gestionar servicios de evaluación y tratamiento ofrecidos por el
            centro
          </p>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">
                    Total de Servicios
                  </p>
                  <p className="text-2xl font-bold">{totalServices}</p>
                </div>
                <FileText className="h-8 w-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">
                    Servicios Activos
                  </p>
                  <p className="text-2xl font-bold">{activeServices}</p>
                </div>
                <CheckCircle className="h-8 w-8 text-green-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Evaluaciones</p>
                  <p className="text-2xl font-bold">{evaluationServices}</p>
                </div>
                <Clock className="h-8 w-8 text-purple-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Tratamientos</p>
                  <p className="text-2xl font-bold">{treatmentServices}</p>
                </div>
                <DollarSign className="h-8 w-8 text-amber-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Actions and Filters */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="flex-1 flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar servicios..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="w-[180px]">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Filtrar por tipo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos los Tipos</SelectItem>
                <SelectItem value="EVALUATION">Evaluaciones</SelectItem>
                <SelectItem value="TREATMENT">Tratamientos</SelectItem>
              </SelectContent>
            </Select>
            <Select value={specialtyFilter} onValueChange={setSpecialtyFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filtrar por especialidad" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas las Especialidades</SelectItem>
                <SelectItem value="SPEECH_THERAPIST">Fonoaudiólogo</SelectItem>
                <SelectItem value="OCCUPATIONAL_THERAPIST">
                  Terapeuta Ocupacional
                </SelectItem>
                <SelectItem value="PSYCHOPEDAGOGUE">Psicopedagogo</SelectItem>
                <SelectItem value="ASD_THERAPIST">Terapeuta TEA</SelectItem>
                <SelectItem value="NEUROPSYCHOLOGIST">
                  Neuropsicólogo
                </SelectItem>
                <SelectItem value="COORDINATOR">Coordinador</SelectItem>
                <SelectItem value="PSYCHOMOTRICIAN">Psicomotricista</SelectItem>
                <SelectItem value="PEDIATRIC_KINESIOLOGIST">
                  Kinesiólogo Pediátrico
                </SelectItem>
                <SelectItem value="PSYCHOLOGIST">Psicólogo</SelectItem>
                <SelectItem value="COORDINATION_ASSISTANT">
                  Asistente de Coordinación
                </SelectItem>
                <SelectItem value="BEHAVIORAL_THERAPIST">
                  Terapeuta Conductual
                </SelectItem>
              </SelectContent>
            </Select>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filtrar por estado" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos los Estados</SelectItem>
                <SelectItem value="active">Activo</SelectItem>
                <SelectItem value="inactive">Inactivo</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => refetch()}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Actualizar
            </Button>
            <Button onClick={() => setShowForm(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Agregar Servicio
            </Button>
          </div>
        </div>

        {/* Services Table */}
        <Card>
          <CardHeader>
            <CardTitle>Servicios ({filteredServices.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <ServiceTable
              services={filteredServices}
              onEdit={handleEditService}
              onDelete={handleDeleteService}
              isLoading={isLoading}
            />
          </CardContent>
        </Card>

        {/* Service Form Modal */}
        {showForm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg max-h-[90vh] overflow-y-auto">
              <ServiceForm
                service={editingService || undefined}
                onSubmit={handleSubmit}
                onCancel={handleCancelForm}
                isLoading={
                  createServiceMutation.isPending ||
                  updateServiceMutation.isPending
                }
              />
            </div>
          </div>
        )}
      </main>
    </RoleGuard>
  );
}
