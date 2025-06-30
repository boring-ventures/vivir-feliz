"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  User,
  Bell,
  Search,
  Eye,
  MoreVertical,
  MessageSquare,
  Upload,
  Target,
  Plus,
  FileText,
  Calendar,
  CheckCircle,
  Clock,
  AlertCircle,
  Edit,
  Trash2,
} from "lucide-react";

export default function TerapeutaPacientesPage() {
  const [filtro, setFiltro] = useState("activos");
  const [busqueda, setBusqueda] = useState("");
  const [selectedPaciente, setSelectedPaciente] = useState<any>(null);
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState<
    "expediente" | "comentario" | "documento" | "objetivos"
  >("expediente");

  // Estados para formularios
  const [comentarioSesion, setComentarioSesion] = useState("");
  const [comentarioPadre, setComentarioPadre] = useState("");
  const [tituloDocumento, setTituloDocumento] = useState("");
  const [tipoDocumento, setTipoDocumento] = useState("");
  const [nuevoObjetivo, setNuevoObjetivo] = useState("");
  const [progresoObjetivo, setProgresoObjetivo] = useState(0);

  const pacientesActivos = [
    {
      id: 1,
      nombre: "Juan Pérez González",
      edad: 8,
      genero: "masculino",
      fechaInicio: "20/01/2025",
      sesiones: { completadas: 8, totales: 24 },
      diagnostico: "Déficit de Atención",
      proximaCita: "22/01/2025 - 2:00 PM",
      progreso: 33,
      estado: "En tratamiento",
      estadoColor: "bg-green-100 text-green-800",
      padre: "María González",
      telefono: "+591-7-123-4567",
      email: "maria.gonzalez@email.com",
      colegio: "Colegio San José",
      observaciones:
        "Paciente colaborativo, muestra interés en las actividades propuestas.",
      objetivos: [
        {
          id: 1,
          titulo: "Mejorar atención sostenida",
          progreso: 75,
          estado: "completado",
        },
        {
          id: 2,
          titulo: "Desarrollar habilidades sociales",
          progreso: 40,
          estado: "en progreso",
        },
        {
          id: 3,
          titulo: "Control de impulsos",
          progreso: 0,
          estado: "pendiente",
        },
      ],
      comentarios: [
        {
          id: 1,
          fecha: "20/01/2025",
          sesion: 8,
          comentario: "Excelente participación en actividades de concentración",
          paraPadre:
            "Juan mostró gran mejora en su capacidad de atención durante la sesión.",
        },
      ],
      documentos: [
        {
          id: 1,
          titulo: "Evaluación Inicial",
          tipo: "Evaluación",
          fecha: "20/01/2025",
          archivo: "evaluacion_inicial.pdf",
        },
      ],
    },
    {
      id: 2,
      nombre: "Ana García López",
      edad: 6,
      genero: "femenino",
      fechaInicio: "15/12/2024",
      sesiones: { completadas: 12, totales: 24 },
      diagnostico: "Retraso del Lenguaje",
      proximaCita: "23/01/2025 - 3:00 PM",
      progreso: 50,
      estado: "En tratamiento",
      estadoColor: "bg-green-100 text-green-800",
      padre: "Carlos García",
      telefono: "+591-7-234-5678",
      email: "carlos.garcia@email.com",
      colegio: "Jardín Infantil Los Ángeles",
      observaciones: "Progreso constante en desarrollo del vocabulario.",
      objetivos: [
        {
          id: 1,
          titulo: "Ampliar vocabulario básico",
          progreso: 60,
          estado: "en progreso",
        },
        {
          id: 2,
          titulo: "Mejorar pronunciación",
          progreso: 30,
          estado: "en progreso",
        },
      ],
      comentarios: [],
      documentos: [],
    },
    {
      id: 3,
      nombre: "Luis Morales Vega",
      edad: 7,
      genero: "masculino",
      fechaInicio: "10/01/2025",
      sesiones: { completadas: 4, totales: 16 },
      diagnostico: "Trastorno del Espectro Autista",
      proximaCita: "24/01/2025 - 10:00 AM",
      progreso: 25,
      estado: "En tratamiento",
      estadoColor: "bg-green-100 text-green-800",
      padre: "Ana Morales",
      telefono: "+591-7-345-6789",
      email: "ana.morales@email.com",
      colegio: "Centro Educativo Especial",
      observaciones: "Requiere ambiente estructurado y rutinas claras.",
      objetivos: [
        {
          id: 1,
          titulo: "Establecer rutinas diarias",
          progreso: 20,
          estado: "en progreso",
        },
      ],
      comentarios: [],
      documentos: [],
    },
    {
      id: 4,
      nombre: "Carmen Silva Rojas",
      edad: 9,
      genero: "femenino",
      fechaInicio: "05/01/2025",
      sesiones: { completadas: 6, totales: 20 },
      diagnostico: "Dificultades de Aprendizaje",
      proximaCita: "25/01/2025 - 4:00 PM",
      progreso: 30,
      estado: "En tratamiento",
      estadoColor: "bg-green-100 text-green-800",
      padre: "Roberto Silva",
      telefono: "+591-7-456-7890",
      email: "roberto.silva@email.com",
      colegio: "Escuela Primaria Central",
      observaciones: "Necesita refuerzo en matemáticas y comprensión lectora.",
      objetivos: [
        {
          id: 1,
          titulo: "Mejorar comprensión lectora",
          progreso: 35,
          estado: "en progreso",
        },
      ],
      comentarios: [],
      documentos: [],
    },
  ];

  const pacientesEvaluacion = [
    {
      id: 5,
      nombre: "Pedro Mamani Flores",
      edad: 7,
      genero: "masculino",
      fechaConsulta: "25/01/2025",
      estado: "Consulta programada",
      estadoColor: "bg-blue-100 text-blue-800",
      tipo: "Evaluación inicial",
    },
    {
      id: 6,
      nombre: "María Quispe Torres",
      edad: 5,
      genero: "femenino",
      fechaConsulta: "26/01/2025",
      estado: "Pendiente propuesta",
      estadoColor: "bg-yellow-100 text-yellow-800",
      tipo: "Evaluación neuropsicológica",
    },
  ];

  const getGenderIcon = (genero: string) => {
    return genero === "masculino" ? "👦" : "👧";
  };

  const getEstadoIcon = (estado: string) => {
    switch (estado) {
      case "completado":
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case "en progreso":
        return <Clock className="h-4 w-4 text-yellow-600" />;
      case "pendiente":
        return <AlertCircle className="h-4 w-4 text-gray-400" />;
      default:
        return <Clock className="h-4 w-4 text-gray-400" />;
    }
  };

  const getEstadoColor = (estado: string) => {
    switch (estado) {
      case "completado":
        return "bg-green-100 text-green-800";
      case "en progreso":
        return "bg-yellow-100 text-yellow-800";
      case "pendiente":
        return "bg-gray-100 text-gray-600";
      default:
        return "bg-gray-100 text-gray-600";
    }
  };

  const filteredPacientes = pacientesActivos.filter((paciente) =>
    paciente.nombre.toLowerCase().includes(busqueda.toLowerCase())
  );

  const handleOpenModal = (
    paciente: any,
    type: "expediente" | "comentario" | "documento" | "objetivos"
  ) => {
    setSelectedPaciente(paciente);
    setModalType(type);
    setShowModal(true);
  };

  const handleGuardarComentario = () => {
    console.log("Guardando comentario:", { comentarioSesion, comentarioPadre });
    setComentarioSesion("");
    setComentarioPadre("");
    setShowModal(false);
  };

  const handleSubirDocumento = () => {
    console.log("Subiendo documento:", { tituloDocumento, tipoDocumento });
    setTituloDocumento("");
    setTipoDocumento("");
    setShowModal(false);
  };

  const handleGuardarObjetivo = () => {
    console.log("Guardando objetivo:", { nuevoObjetivo, progresoObjetivo });
    setNuevoObjetivo("");
    setProgresoObjetivo(0);
  };

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Mis Pacientes</h1>
          <p className="text-gray-600">
            Gestiona la información y progreso de tus pacientes
          </p>
        </div>
        <div className="flex items-center space-x-4">
          <Button variant="outline" size="icon">
            <Bell className="h-5 w-5" />
          </Button>
          <Button variant="outline" size="icon">
            <User className="h-5 w-5" />
          </Button>
        </div>
      </div>

      {/* Filtros y Búsqueda */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="flex space-x-2">
          <Button
            variant={filtro === "activos" ? "default" : "outline"}
            onClick={() => setFiltro("activos")}
            size="sm"
          >
            Activos
          </Button>
          <Button
            variant={filtro === "evaluacion" ? "default" : "outline"}
            onClick={() => setFiltro("evaluacion")}
            size="sm"
          >
            En evaluación
          </Button>
          <Button
            variant={filtro === "completados" ? "default" : "outline"}
            onClick={() => setFiltro("completados")}
            size="sm"
          >
            Completados
          </Button>
        </div>
        <div className="flex-1 max-w-md">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Buscar paciente..."
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>
      </div>

      {/* Pacientes Activos */}
      {filtro === "activos" && (
        <div>
          <h2 className="text-xl font-semibold mb-4">
            Pacientes Activos ({filteredPacientes.length})
          </h2>

          <Card>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b">
                    <tr>
                      <th className="text-left p-4 font-medium text-gray-600">
                        Paciente
                      </th>
                      <th className="text-left p-4 font-medium text-gray-600">
                        Diagnóstico
                      </th>
                      <th className="text-left p-4 font-medium text-gray-600">
                        Progreso
                      </th>
                      <th className="text-left p-4 font-medium text-gray-600">
                        Próxima Cita
                      </th>
                      <th className="text-left p-4 font-medium text-gray-600">
                        Estado
                      </th>
                      <th className="text-center p-4 font-medium text-gray-600">
                        Acciones
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {filteredPacientes.map((paciente) => (
                      <tr key={paciente.id} className="hover:bg-gray-50">
                        <td className="p-4">
                          <div className="flex items-center space-x-3">
                            <div className="text-2xl">
                              {getGenderIcon(paciente.genero)}
                            </div>
                            <div>
                              <p className="font-medium">{paciente.nombre}</p>
                              <p className="text-sm text-gray-600">
                                {paciente.edad} años
                              </p>
                            </div>
                          </div>
                        </td>
                        <td className="p-4">
                          <p className="text-sm">{paciente.diagnostico}</p>
                        </td>
                        <td className="p-4">
                          <div className="space-y-1">
                            <div className="flex justify-between text-sm">
                              <span>
                                {paciente.sesiones.completadas}/
                                {paciente.sesiones.totales}
                              </span>
                              <span>{paciente.progreso}%</span>
                            </div>
                            <Progress
                              value={paciente.progreso}
                              className="h-2 w-24"
                            />
                          </div>
                        </td>
                        <td className="p-4">
                          <p className="text-sm">{paciente.proximaCita}</p>
                        </td>
                        <td className="p-4">
                          <Badge className={paciente.estadoColor}>
                            {paciente.estado}
                          </Badge>
                        </td>
                        <td className="p-4 text-center">
                          <div className="flex items-center justify-center space-x-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() =>
                                handleOpenModal(paciente, "expediente")
                              }
                            >
                              <Eye className="h-4 w-4 mr-1" />
                              Ver Expediente
                            </Button>

                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="outline" size="sm">
                                  <MoreVertical className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem
                                  onClick={() =>
                                    handleOpenModal(paciente, "comentario")
                                  }
                                >
                                  <MessageSquare className="h-4 w-4 mr-2" />
                                  Comentar Sesión
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  onClick={() =>
                                    handleOpenModal(paciente, "documento")
                                  }
                                >
                                  <Upload className="h-4 w-4 mr-2" />
                                  Subir Documento
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  onClick={() =>
                                    handleOpenModal(paciente, "objetivos")
                                  }
                                >
                                  <Target className="h-4 w-4 mr-2" />
                                  Gestionar Objetivos
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Pacientes en Evaluación */}
      {filtro === "evaluacion" && (
        <div>
          <h2 className="text-xl font-semibold mb-4">
            En Evaluación ({pacientesEvaluacion.length})
          </h2>
          <Card>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b">
                    <tr>
                      <th className="text-left p-4 font-medium text-gray-600">
                        Paciente
                      </th>
                      <th className="text-left p-4 font-medium text-gray-600">
                        Tipo de Evaluación
                      </th>
                      <th className="text-left p-4 font-medium text-gray-600">
                        Fecha
                      </th>
                      <th className="text-left p-4 font-medium text-gray-600">
                        Estado
                      </th>
                      <th className="text-center p-4 font-medium text-gray-600">
                        Acciones
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {pacientesEvaluacion.map((paciente) => (
                      <tr key={paciente.id} className="hover:bg-gray-50">
                        <td className="p-4">
                          <div className="flex items-center space-x-3">
                            <div className="text-2xl">
                              {getGenderIcon(paciente.genero)}
                            </div>
                            <div>
                              <p className="font-medium">{paciente.nombre}</p>
                              <p className="text-sm text-gray-600">
                                {paciente.edad} años
                              </p>
                            </div>
                          </div>
                        </td>
                        <td className="p-4">
                          <p className="text-sm">{paciente.tipo}</p>
                        </td>
                        <td className="p-4">
                          <p className="text-sm">{paciente.fechaConsulta}</p>
                        </td>
                        <td className="p-4">
                          <Badge className={paciente.estadoColor}>
                            {paciente.estado}
                          </Badge>
                        </td>
                        <td className="p-4 text-center">
                          <Button variant="outline" size="sm">
                            <Eye className="h-4 w-4 mr-1" />
                            Ver Detalles
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Pacientes Completados */}
      {filtro === "completados" && (
        <div>
          <h2 className="text-xl font-semibold mb-4">
            Tratamientos Completados
          </h2>
          <Card>
            <CardContent className="p-8 text-center">
              <div className="text-gray-400 mb-4">
                <User className="h-12 w-12 mx-auto" />
              </div>
              <p className="text-gray-600">
                No hay tratamientos completados aún
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Modal Universal - Part 1 */}
      <Dialog open={showModal} onOpenChange={setShowModal}>
        <DialogContent className="sm:max-w-[700px] max-h-[80vh] overflow-y-auto">
          {/* Modal de Expediente */}
          {modalType === "expediente" && selectedPaciente && (
            <>
              <DialogHeader>
                <DialogTitle>Expediente del Paciente</DialogTitle>
                <DialogDescription>
                  Información detallada del paciente y su tratamiento
                </DialogDescription>
              </DialogHeader>

              <Tabs defaultValue="informacion" className="w-full">
                <TabsList className="grid w-full grid-cols-4">
                  <TabsTrigger value="informacion">Información</TabsTrigger>
                  <TabsTrigger value="comentarios">Comentarios</TabsTrigger>
                  <TabsTrigger value="documentos">Documentos</TabsTrigger>
                  <TabsTrigger value="objetivos">Objetivos</TabsTrigger>
                </TabsList>

                <TabsContent value="informacion" className="space-y-6">
                  {/* Información Personal */}
                  <div>
                    <h3 className="text-lg font-semibold mb-3">
                      Información Personal
                    </h3>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm font-medium text-gray-600">
                          Nombre completo
                        </label>
                        <p className="text-sm">{selectedPaciente.nombre}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-600">
                          Edad
                        </label>
                        <p className="text-sm">{selectedPaciente.edad} años</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-600">
                          Padre/Madre
                        </label>
                        <p className="text-sm">{selectedPaciente.padre}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-600">
                          Teléfono
                        </label>
                        <p className="text-sm">{selectedPaciente.telefono}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-600">
                          Email
                        </label>
                        <p className="text-sm">{selectedPaciente.email}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-600">
                          Colegio
                        </label>
                        <p className="text-sm">{selectedPaciente.colegio}</p>
                      </div>
                    </div>
                  </div>

                  {/* Información del Tratamiento */}
                  <div>
                    <h3 className="text-lg font-semibold mb-3">Tratamiento</h3>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm font-medium text-gray-600">
                          Diagnóstico
                        </label>
                        <p className="text-sm">
                          {selectedPaciente.diagnostico}
                        </p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-600">
                          Fecha de inicio
                        </label>
                        <p className="text-sm">
                          {selectedPaciente.fechaInicio}
                        </p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-600">
                          Sesiones
                        </label>
                        <p className="text-sm">
                          {selectedPaciente.sesiones.completadas}/
                          {selectedPaciente.sesiones.totales}
                        </p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-600">
                          Próxima cita
                        </label>
                        <p className="text-sm">
                          {selectedPaciente.proximaCita}
                        </p>
                      </div>
                    </div>

                    <div className="mt-4">
                      <label className="text-sm font-medium text-gray-600">
                        Progreso del tratamiento
                      </label>
                      <div className="mt-2">
                        <div className="flex justify-between text-sm mb-1">
                          <span>Progreso</span>
                          <span>{selectedPaciente.progreso}%</span>
                        </div>
                        <Progress
                          value={selectedPaciente.progreso}
                          className="h-2"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Observaciones */}
                  <div>
                    <h3 className="text-lg font-semibold mb-3">
                      Observaciones
                    </h3>
                    <div className="bg-gray-50 p-3 rounded-md">
                      <p className="text-sm text-gray-700">
                        {selectedPaciente.observaciones}
                      </p>
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="comentarios" className="space-y-4">
                  <div className="flex justify-between items-center">
                    <h3 className="text-lg font-semibold">
                      Comentarios de Sesiones
                    </h3>
                    <Button
                      onClick={() =>
                        handleOpenModal(selectedPaciente, "comentario")
                      }
                      size="sm"
                    >
                      <Plus className="h-4 w-4 mr-1" />
                      Nuevo Comentario
                    </Button>
                  </div>

                  {selectedPaciente.comentarios.length > 0 ? (
                    <div className="space-y-3">
                      {selectedPaciente.comentarios.map((comentario: any) => (
                        <Card key={comentario.id}>
                          <CardContent className="p-4">
                            <div className="flex justify-between items-start mb-2">
                              <div className="flex items-center space-x-2">
                                <Calendar className="h-4 w-4 text-gray-500" />
                                <span className="text-sm font-medium">
                                  Sesión {comentario.sesion}
                                </span>
                                <span className="text-sm text-gray-500">
                                  {comentario.fecha}
                                </span>
                              </div>
                            </div>
                            <div className="space-y-2">
                              <div>
                                <label className="text-xs font-medium text-gray-600">
                                  Comentario de sesión:
                                </label>
                                <p className="text-sm">
                                  {comentario.comentario}
                                </p>
                              </div>
                              <div>
                                <label className="text-xs font-medium text-gray-600">
                                  Mensaje para el padre:
                                </label>
                                <p className="text-sm text-blue-700">
                                  {comentario.paraPadre}
                                </p>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8 text-gray-500">
                      <MessageSquare className="h-12 w-12 mx-auto mb-2 text-gray-300" />
                      <p>No hay comentarios de sesiones aún</p>
                    </div>
                  )}
                </TabsContent>

                <TabsContent value="documentos" className="space-y-4">
                  <div className="flex justify-between items-center">
                    <h3 className="text-lg font-semibold">Documentos</h3>
                    <Button
                      onClick={() =>
                        handleOpenModal(selectedPaciente, "documento")
                      }
                      size="sm"
                    >
                      <Plus className="h-4 w-4 mr-1" />
                      Subir Documento
                    </Button>
                  </div>

                  {selectedPaciente.documentos.length > 0 ? (
                    <div className="space-y-3">
                      {selectedPaciente.documentos.map((documento: any) => (
                        <Card key={documento.id}>
                          <CardContent className="p-4">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center space-x-3">
                                <FileText className="h-8 w-8 text-blue-600" />
                                <div>
                                  <p className="font-medium">
                                    {documento.titulo}
                                  </p>
                                  <p className="text-sm text-gray-600">
                                    {documento.tipo} • {documento.fecha}
                                  </p>
                                </div>
                              </div>
                              <Button variant="outline" size="sm">
                                <Eye className="h-4 w-4 mr-1" />
                                Ver
                              </Button>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8 text-gray-500">
                      <FileText className="h-12 w-12 mx-auto mb-2 text-gray-300" />
                      <p>No hay documentos subidos aún</p>
                    </div>
                  )}
                </TabsContent>

                <TabsContent value="objetivos" className="space-y-4">
                  <div className="flex justify-between items-center">
                    <h3 className="text-lg font-semibold">Objetivos y Metas</h3>
                    <Button
                      onClick={() =>
                        handleOpenModal(selectedPaciente, "objetivos")
                      }
                      size="sm"
                    >
                      <Plus className="h-4 w-4 mr-1" />
                      Nuevo Objetivo
                    </Button>
                  </div>

                  {selectedPaciente.objetivos.length > 0 ? (
                    <div className="space-y-3">
                      {selectedPaciente.objetivos.map((objetivo: any) => (
                        <Card key={objetivo.id}>
                          <CardContent className="p-4">
                            <div className="flex items-center justify-between mb-3">
                              <div className="flex items-center space-x-2">
                                {getEstadoIcon(objetivo.estado)}
                                <span className="font-medium">
                                  {objetivo.titulo}
                                </span>
                              </div>
                              <div className="flex items-center space-x-2">
                                <Badge
                                  className={getEstadoColor(objetivo.estado)}
                                >
                                  {objetivo.estado}
                                </Badge>
                                <Button variant="ghost" size="sm">
                                  <Edit className="h-4 w-4" />
                                </Button>
                              </div>
                            </div>
                            <div className="space-y-2">
                              <div className="flex justify-between text-sm">
                                <span>Progreso</span>
                                <span>{objetivo.progreso}%</span>
                              </div>
                              <Progress
                                value={objetivo.progreso}
                                className="h-2"
                              />
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8 text-gray-500">
                      <Target className="h-12 w-12 mx-auto mb-2 text-gray-300" />
                      <p>No hay objetivos definidos aún</p>
                    </div>
                  )}
                </TabsContent>
              </Tabs>

              <div className="flex justify-end space-x-2 pt-4 border-t">
                <Button variant="outline" onClick={() => setShowModal(false)}>
                  Cerrar
                </Button>
                <Button className="bg-blue-600 hover:bg-blue-700">
                  Editar Expediente
                </Button>
              </div>
            </>
          )}

          {/* Modal de Comentario de Sesión */}
          {modalType === "comentario" && selectedPaciente && (
            <>
              <DialogHeader>
                <DialogTitle>
                  Comentar Sesión - {selectedPaciente.nombre}
                </DialogTitle>
                <DialogDescription>
                  Agrega comentarios sobre la sesión y un mensaje para el padre
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-4">
                <div>
                  <Label htmlFor="comentario-sesion">
                    Comentario de la sesión
                  </Label>
                  <Textarea
                    id="comentario-sesion"
                    placeholder="Describe cómo fue la sesión, actividades realizadas, comportamiento del paciente..."
                    value={comentarioSesion}
                    onChange={(e) => setComentarioSesion(e.target.value)}
                    className="mt-1"
                  />
                </div>

                <div>
                  <Label htmlFor="comentario-padre">
                    Mensaje para el padre
                  </Label>
                  <Textarea
                    id="comentario-padre"
                    placeholder="Mensaje que verá el padre sobre el progreso y recomendaciones..."
                    value={comentarioPadre}
                    onChange={(e) => setComentarioPadre(e.target.value)}
                    className="mt-1"
                  />
                </div>

                <div className="flex justify-end space-x-2 pt-4 border-t">
                  <Button variant="outline" onClick={() => setShowModal(false)}>
                    Cancelar
                  </Button>
                  <Button
                    onClick={handleGuardarComentario}
                    className="bg-blue-600 hover:bg-blue-700"
                  >
                    Guardar Comentario
                  </Button>
                </div>
              </div>
            </>
          )}

          {/* Modal de Subir Documento */}
          {modalType === "documento" && selectedPaciente && (
            <>
              <DialogHeader>
                <DialogTitle>
                  Subir Documento - {selectedPaciente.nombre}
                </DialogTitle>
                <DialogDescription>
                  Sube evaluaciones, exámenes u otros documentos importantes
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-4">
                <div>
                  <Label htmlFor="titulo-documento">Título del documento</Label>
                  <Input
                    id="titulo-documento"
                    placeholder="Ej: Evaluación neuropsicológica, Examen médico..."
                    value={tituloDocumento}
                    onChange={(e) => setTituloDocumento(e.target.value)}
                    className="mt-1"
                  />
                </div>

                <div>
                  <Label htmlFor="tipo-documento">Tipo de documento</Label>
                  <Select
                    value={tipoDocumento}
                    onValueChange={setTipoDocumento}
                  >
                    <SelectTrigger className="mt-1">
                      <SelectValue placeholder="Selecciona el tipo de documento" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="evaluacion">Evaluación</SelectItem>
                      <SelectItem value="examen">Examen Médico</SelectItem>
                      <SelectItem value="informe">Informe</SelectItem>
                      <SelectItem value="reporte">
                        Reporte de Progreso
                      </SelectItem>
                      <SelectItem value="otro">Otro</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="archivo">Archivo</Label>
                  <div className="mt-1 border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                    <Upload className="h-8 w-8 mx-auto text-gray-400 mb-2" />
                    <p className="text-sm text-gray-600">
                      Arrastra y suelta tu archivo aquí, o
                    </p>
                    <Button variant="outline" size="sm" className="mt-2">
                      Seleccionar archivo
                    </Button>
                  </div>
                </div>

                <div className="flex justify-end space-x-2 pt-4 border-t">
                  <Button variant="outline" onClick={() => setShowModal(false)}>
                    Cancelar
                  </Button>
                  <Button
                    onClick={handleSubirDocumento}
                    className="bg-blue-600 hover:bg-blue-700"
                  >
                    Subir Documento
                  </Button>
                </div>
              </div>
            </>
          )}

          {/* Modal de Gestionar Objetivos */}
          {modalType === "objetivos" && selectedPaciente && (
            <>
              <DialogHeader>
                <DialogTitle>
                  Gestionar Objetivos - {selectedPaciente.nombre}
                </DialogTitle>
                <DialogDescription>
                  Crea y edita objetivos terapéuticos para el paciente
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-6">
                {/* Formulario para nuevo objetivo */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Nuevo Objetivo</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <Label htmlFor="nuevo-objetivo">
                        Descripción del objetivo
                      </Label>
                      <Input
                        id="nuevo-objetivo"
                        placeholder="Ej: Mejorar atención sostenida, Desarrollar habilidades sociales..."
                        value={nuevoObjetivo}
                        onChange={(e) => setNuevoObjetivo(e.target.value)}
                        className="mt-1"
                      />
                    </div>

                    <div>
                      <Label htmlFor="progreso-objetivo">
                        Progreso inicial (%)
                      </Label>
                      <div className="mt-1 space-y-2">
                        <Input
                          id="progreso-objetivo"
                          type="number"
                          min="0"
                          max="100"
                          value={progresoObjetivo}
                          onChange={(e) =>
                            setProgresoObjetivo(Number(e.target.value))
                          }
                        />
                        <Progress value={progresoObjetivo} className="h-2" />
                      </div>
                    </div>

                    <Button onClick={handleGuardarObjetivo} className="w-full">
                      <Plus className="h-4 w-4 mr-2" />
                      Agregar Objetivo
                    </Button>
                  </CardContent>
                </Card>

                {/* Lista de objetivos existentes */}
                <div>
                  <h4 className="font-semibold mb-3">Objetivos Actuales</h4>
                  {selectedPaciente.objetivos.length > 0 ? (
                    <div className="space-y-3">
                      {selectedPaciente.objetivos.map((objetivo: any) => (
                        <Card key={objetivo.id}>
                          <CardContent className="p-4">
                            <div className="flex items-center justify-between mb-3">
                              <div className="flex items-center space-x-2">
                                {getEstadoIcon(objetivo.estado)}
                                <span className="font-medium">
                                  {objetivo.titulo}
                                </span>
                              </div>
                              <div className="flex items-center space-x-2">
                                <Badge
                                  className={getEstadoColor(objetivo.estado)}
                                >
                                  {objetivo.estado}
                                </Badge>
                                <Button variant="ghost" size="sm">
                                  <Edit className="h-4 w-4" />
                                </Button>
                                <Button variant="ghost" size="sm">
                                  <Trash2 className="h-4 w-4 text-red-500" />
                                </Button>
                              </div>
                            </div>
                            <div className="space-y-2">
                              <div className="flex justify-between text-sm">
                                <span>Progreso</span>
                                <span>{objetivo.progreso}%</span>
                              </div>
                              <Progress
                                value={objetivo.progreso}
                                className="h-2"
                              />
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8 text-gray-500">
                      <Target className="h-12 w-12 mx-auto mb-2 text-gray-300" />
                      <p>No hay objetivos definidos aún</p>
                    </div>
                  )}
                </div>

                <div className="flex justify-end space-x-2 pt-4 border-t">
                  <Button variant="outline" onClick={() => setShowModal(false)}>
                    Cerrar
                  </Button>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
