"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Heart,
  CheckCircle,
  Calendar,
  Phone,
  Mail,
  MapPin,
  School,
  Users,
  FileText,
  AlertTriangle,
  FileCheck,
  Clock,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

interface ConsultationData {
  // Child data
  nombre: string;
  sexo: string;
  fechaNacimiento: string;
  vivecon: string;
  otroViveCon?: string;
  domicilio: string;

  // Optional appointment data (added when scheduled)
  appointmentId?: string;
  fecha?: string;
  hora?: string;
  therapist?: {
    name: string;
  };

  // Payment data (added when payment is confirmed)
  paymentConfirmed?: boolean;
  receiptFile?: string;
  referenceNumber?: string;
  paymentDate?: string;

  // Parents data
  madre: {
    nombre: string;
    edad: string;
    celular: string;
    email: string;
    gradoEscolar: string;
    ocupacion: string;
  };
  padre: {
    nombre: string;
    edad: string;
    celular: string;
    email: string;
    gradoEscolar: string;
    ocupacion: string;
  };

  // School data
  institucion: string;
  telefono: string;
  direccion: string;
  nivelEscolar: string;
  maestra: string;

  // Family history
  hijos: Array<{
    nombre: string;
    fechaNacimiento: string;
    gradoEscolar: string;
    problemas: boolean;
    descripcionProblemas: string;
  }>;

  // Consultation reasons
  motivosConsulta: Record<string, unknown>;
  quienDeriva: string;

  tipo: string;
  costo: number;
}

export default function ConsultationSuccessPage() {
  const [data, setData] = useState<ConsultationData | null>(null);
  const router = useRouter();

  useEffect(() => {
    // Try to get appointment details first (new flow)
    const appointmentDetails = sessionStorage.getItem("appointmentDetails");
    if (appointmentDetails) {
      setData(JSON.parse(appointmentDetails));
    } else {
      // Fall back to old flow for backward compatibility
      const storedData = sessionStorage.getItem("consultaData");
      if (storedData) {
        setData(JSON.parse(storedData));
      } else {
        // If no data found, redirect to home
        router.push("/");
      }
    }
  }, [router]);

  const calcularEdad = (fechaNacimiento: string) => {
    if (!fechaNacimiento) return "";
    const hoy = new Date();
    const nacimiento = new Date(fechaNacimiento);
    const edad = hoy.getFullYear() - nacimiento.getFullYear();
    const mes = hoy.getMonth() - nacimiento.getMonth();
    if (mes < 0 || (mes === 0 && hoy.getDate() < nacimiento.getDate())) {
      return (edad - 1).toString();
    }
    return edad.toString();
  };

  const formatLivingWith = (vivecon: string, otro?: string): string => {
    const options: { [key: string]: string } = {
      "ambos-padres": "Ambos padres",
      "solo-madre": "Solo madre",
      "solo-padre": "Solo padre",
      "padres-adoptivos": "Padres adoptivos",
      "algun-pariente": "Algún pariente",
      "padre-madrastra": "Padre y madrastra",
      "madre-padrastro": "Madre y padrastro",
      otros: `Otros: ${otro || "No especificado"}`,
    };
    return options[vivecon] || vivecon;
  };

  const getSelectedReasons = (motivosConsulta: Record<string, unknown>) => {
    const reasons: string[] = [];
    const reasonLabels: { [key: string]: string } = {
      dificultadesLenguaje: "Dificultades en el lenguaje/comunicación",
      retrasoMotor: "Retraso en el desarrollo motor",
      problemasCoordinacion: "Problemas de coordinación motora",
      dificultadesAprendizaje:
        "Dificultades en el aprendizaje y desarrollo escolar",
      problemasAtencion: "Problemas de atención/concentración",
      dificultadesInteraccion: "Dificultades en la interacción social",
      indicadoresComportamiento:
        "Presenta indicadores específicos de comportamiento",
      problemasComportamiento:
        "Problemas de comportamiento (rabietas, impulsividad)",
      dificultadesAlimentacion: "Dificultades en la alimentación",
      dificultadesSueno: "Dificultades en el sueño",
      sensibilidadEstimulos:
        "Sensibilidad a estímulos (ruidos, texturas, luces)",
      bajaAutoestima: "Baja autoestima, timidez, introversión",
      dificultadesControl: "Dificultades en el control de esfínteres",
      dificultadesAutonomia:
        "Dificultades en la autonomía y actividades diarias",
      diagnosticoPrevio: `Diagnóstico previo: ${motivosConsulta.diagnosticoTexto || "No especificado"}`,
      otro: `Otro motivo: ${motivosConsulta.otroTexto || "No especificado"}`,
      necesitaOrientacion: "Necesita orientación general",
      noSeguroDificultad: "No está seguro de la dificultad principal",
      quiereValoracion: "Quiere una valoración general",
      derivacionColegio: "Derivación del colegio",
      evaluacionReciente: "Evaluación reciente (menos de 6 meses)",
      evaluacionMedica: "Evaluación médica reciente",
    };

    Object.entries(motivosConsulta).forEach(([key, value]) => {
      if (value === true && reasonLabels[key]) {
        reasons.push(reasonLabels[key]);
      }
    });

    return reasons;
  };

  if (!data) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando información...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link href="/" className="flex items-center space-x-2">
              <Heart className="h-8 w-8 text-blue-600" />
              <span className="text-2xl font-bold text-gray-900">
                Vivir Feliz
              </span>
            </Link>
          </div>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Success Header */}
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <div className="bg-green-100 rounded-full p-3">
              <CheckCircle className="h-12 w-12 text-green-600" />
            </div>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            {data.appointmentId
              ? "¡Cita Agendada Exitosamente!"
              : "¡Solicitud de Consulta Enviada!"}
          </h1>
          <p className="text-lg text-gray-600 mb-4">
            {data.appointmentId
              ? "Tu consulta ha sido agendada y confirmada."
              : "Hemos recibido tu solicitud de consulta exitosamente."}
          </p>
          <div className="flex justify-center space-x-4">
            {data.appointmentId ? (
              <>
                <Badge variant="default" className="text-sm bg-green-600">
                  <Calendar className="h-4 w-4 mr-1" />
                  Agendada
                </Badge>
                <Badge variant="outline" className="text-sm">
                  ID: {data.appointmentId}
                </Badge>
              </>
            ) : (
              <>
                <Badge variant="secondary" className="text-sm">
                  <Calendar className="h-4 w-4 mr-1" />
                  Procesándose
                </Badge>
                <Badge variant="outline" className="text-sm">
                  Costo: Bs. {data.costo}
                </Badge>
              </>
            )}
          </div>
        </div>

        {/* Appointment Details Card (if scheduled) */}
        {data.appointmentId && data.fecha && data.hora && data.therapist && (
          <Card className="mb-6 border-green-200 bg-green-50">
            <CardHeader>
              <CardTitle className="flex items-center text-green-800">
                <Calendar className="h-5 w-5 mr-2" />
                Detalles de la Cita
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-green-700">
                    Fecha y Hora
                  </p>
                  <p className="text-lg text-green-900">
                    {new Date(data.fecha).toLocaleDateString("es-ES", {
                      weekday: "long",
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </p>
                  <p className="text-lg font-semibold text-green-900">
                    {data.hora} hrs
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium text-green-700">
                    Terapeuta Asignado
                  </p>
                  <p className="text-lg text-green-900">
                    {data.therapist.name}
                  </p>
                  <p className="text-sm text-green-600">
                    Especialista en Terapia Infantil
                  </p>
                </div>
              </div>
              <div className="p-4 bg-white rounded-md border border-green-200">
                <p className="text-sm text-green-700">
                  <strong>Importante:</strong> Te contactaremos 24 horas antes
                  de tu cita para confirmar la asistencia. Si necesitas
                  reprogramar, contacta con nosotros al menos 48 horas antes.
                </p>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Payment Confirmation Card (if payment was confirmed) */}
        {data.paymentConfirmed && (
          <Card className="mb-6 border-blue-200 bg-blue-50">
            <CardHeader>
              <CardTitle className="flex items-center text-blue-800">
                <CheckCircle className="h-5 w-5 mr-2" />
                Confirmación de Pago
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-blue-700">
                    Estado del Pago
                  </p>
                  <Badge className="bg-green-600 text-white">
                    ✓ Pago Confirmado
                  </Badge>
                  <p className="text-sm text-blue-600 mt-1">
                    Tu pago ha sido recibido y confirmado
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium text-blue-700">
                    Monto Pagado
                  </p>
                  <p className="text-lg font-semibold text-blue-900">Bs. 250</p>
                  <p className="text-sm text-blue-600">Consulta Inicial</p>
                </div>
              </div>
              {data.referenceNumber && (
                <div>
                  <p className="text-sm font-medium text-blue-700">
                    Número de Referencia
                  </p>
                  <p className="text-sm text-blue-900 font-mono">
                    {data.referenceNumber}
                  </p>
                </div>
              )}
              {data.paymentDate && (
                <div>
                  <p className="text-sm font-medium text-blue-700">
                    Fecha de Pago
                  </p>
                  <p className="text-sm text-blue-900">
                    {new Date(data.paymentDate).toLocaleDateString("es-ES", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </p>
                </div>
              )}
              <div className="p-4 bg-white rounded-md border border-blue-200">
                <p className="text-sm text-blue-700">
                  <strong>Comprobante:</strong> Hemos registrado tu comprobante
                  de pago. En caso de necesitar una factura o recibo oficial,
                  contacta con nosotros después de tu cita.
                </p>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Summary Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Child Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Users className="h-5 w-5 mr-2 text-blue-600" />
                Información del Niño/a
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <p className="font-medium text-gray-900">{data.nombre}</p>
                <p className="text-sm text-gray-600">
                  {data.sexo === "masculino" ? "Masculino" : "Femenino"} •{" "}
                  {calcularEdad(data.fechaNacimiento)} años
                </p>
                <p className="text-sm text-gray-600">
                  Nacimiento:{" "}
                  {new Date(data.fechaNacimiento).toLocaleDateString()}
                </p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-700">Vive con:</p>
                <p className="text-sm text-gray-600">
                  {formatLivingWith(data.vivecon, data.otroViveCon)}
                </p>
              </div>
              <div className="flex items-start">
                <MapPin className="h-4 w-4 mr-2 text-gray-400 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-gray-700">
                    Domicilio:
                  </p>
                  <p className="text-sm text-gray-600">{data.domicilio}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Parents Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Users className="h-5 w-5 mr-2 text-blue-600" />
                Información de los Padres
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {data.madre.nombre && (
                <div>
                  <p className="font-medium text-gray-900">
                    Madre: {data.madre.nombre}
                  </p>
                  {data.madre.edad && (
                    <p className="text-sm text-gray-600">
                      Edad: {data.madre.edad} años
                    </p>
                  )}
                  <div className="flex items-center space-x-4 text-sm text-gray-600">
                    {data.madre.celular && (
                      <span className="flex items-center">
                        <Phone className="h-3 w-3 mr-1" />
                        {data.madre.celular}
                      </span>
                    )}
                    {data.madre.email && (
                      <span className="flex items-center">
                        <Mail className="h-3 w-3 mr-1" />
                        {data.madre.email}
                      </span>
                    )}
                  </div>
                  {data.madre.gradoEscolar && (
                    <p className="text-sm text-gray-600">
                      Educación: {data.madre.gradoEscolar}
                    </p>
                  )}
                  {data.madre.ocupacion && (
                    <p className="text-sm text-gray-600">
                      Ocupación: {data.madre.ocupacion}
                    </p>
                  )}
                </div>
              )}

              {data.padre.nombre && (
                <div>
                  <p className="font-medium text-gray-900">
                    Padre: {data.padre.nombre}
                  </p>
                  {data.padre.edad && (
                    <p className="text-sm text-gray-600">
                      Edad: {data.padre.edad} años
                    </p>
                  )}
                  <div className="flex items-center space-x-4 text-sm text-gray-600">
                    {data.padre.celular && (
                      <span className="flex items-center">
                        <Phone className="h-3 w-3 mr-1" />
                        {data.padre.celular}
                      </span>
                    )}
                    {data.padre.email && (
                      <span className="flex items-center">
                        <Mail className="h-3 w-3 mr-1" />
                        {data.padre.email}
                      </span>
                    )}
                  </div>
                  {data.padre.gradoEscolar && (
                    <p className="text-sm text-gray-600">
                      Educación: {data.padre.gradoEscolar}
                    </p>
                  )}
                  {data.padre.ocupacion && (
                    <p className="text-sm text-gray-600">
                      Ocupación: {data.padre.ocupacion}
                    </p>
                  )}
                </div>
              )}
            </CardContent>
          </Card>

          {/* School Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <School className="h-5 w-5 mr-2 text-blue-600" />
                Información Escolar
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <p className="font-medium text-gray-900">{data.institucion}</p>
                <p className="text-sm text-gray-600">
                  Nivel: {data.nivelEscolar}
                </p>
              </div>
              {data.maestra && (
                <div>
                  <p className="text-sm font-medium text-gray-700">Maestra:</p>
                  <p className="text-sm text-gray-600">{data.maestra}</p>
                </div>
              )}
              {data.telefono && (
                <div className="flex items-center">
                  <Phone className="h-4 w-4 mr-2 text-gray-400" />
                  <p className="text-sm text-gray-600">{data.telefono}</p>
                </div>
              )}
              {data.direccion && (
                <div className="flex items-start">
                  <MapPin className="h-4 w-4 mr-2 text-gray-400 mt-0.5" />
                  <p className="text-sm text-gray-600">{data.direccion}</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Family History */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Users className="h-5 w-5 mr-2 text-blue-600" />
                Historial Familiar
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {data.hijos
                .filter((hijo) => hijo.nombre)
                .map((hijo, index) => (
                  <div key={index} className="border-l-2 border-blue-200 pl-3">
                    <p className="font-medium text-gray-900">{hijo.nombre}</p>
                    {hijo.fechaNacimiento && (
                      <p className="text-sm text-gray-600">
                        Edad: {calcularEdad(hijo.fechaNacimiento)} años
                      </p>
                    )}
                    {hijo.gradoEscolar && (
                      <p className="text-sm text-gray-600">
                        Grado: {hijo.gradoEscolar}
                      </p>
                    )}
                    {hijo.problemas && hijo.descripcionProblemas && (
                      <div className="mt-1">
                        <Badge variant="destructive" className="text-xs mb-1">
                          Presenta problemas
                        </Badge>
                        <p className="text-sm text-gray-600">
                          {hijo.descripcionProblemas}
                        </p>
                      </div>
                    )}
                  </div>
                ))}
            </CardContent>
          </Card>
        </div>

        {/* Consultation Reasons */}
        <Card className="mt-6">
          <CardHeader>
            <CardTitle className="flex items-center">
              <FileText className="h-5 w-5 mr-2 text-blue-600" />
              Motivos de Consulta
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {getSelectedReasons(data.motivosConsulta).map((reason, index) => (
                <div key={index} className="flex items-center">
                  <CheckCircle className="h-4 w-4 text-green-500 mr-2 flex-shrink-0" />
                  <span className="text-sm text-gray-700">{reason}</span>
                </div>
              ))}
            </div>
            {data.quienDeriva && (
              <div className="mt-4 pt-4 border-t">
                <p className="text-sm font-medium text-gray-700">
                  Derivado por:
                </p>
                <p className="text-sm text-gray-600">{data.quienDeriva}</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Medical Form Action Card - Only show for consultations with appointments */}
        {data.appointmentId && data.paymentConfirmed && (
          <Card className="mt-6 border-purple-200 bg-purple-50">
            <CardHeader>
              <CardTitle className="flex items-center text-purple-800">
                <FileText className="h-5 w-5 mr-2" />
                Formulario Pre-Consulta Requerido
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="bg-amber-100 border border-amber-300 rounded-lg p-4">
                <div className="flex items-start space-x-3">
                  <AlertTriangle className="h-5 w-5 text-amber-600 mt-0.5" />
                  <div>
                    <p className="font-medium text-amber-800 mb-2">
                      ⚠️ IMPORTANTE
                    </p>
                    <p className="text-amber-700 text-sm">
                      Antes de su consulta, debe completar un formulario médico
                      detallado con información sobre su hijo/a. Este formulario
                      incluye información médica detallada que el terapeuta
                      necesitará para la evaluación.
                    </p>
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-center space-x-2 text-purple-700">
                  <CheckCircle className="h-4 w-4" />
                  <span className="text-sm">
                    Debe completar TODOS los datos del formulario
                  </span>
                </div>
                <div className="flex items-center space-x-2 text-purple-700">
                  <CheckCircle className="h-4 w-4" />
                  <span className="text-sm">
                    El formulario incluye información médica detallada
                  </span>
                </div>
                <div className="flex items-center space-x-2 text-purple-700">
                  <CheckCircle className="h-4 w-4" />
                  <span className="text-sm">
                    Guarde este ID para continuar más tarde si es necesario
                  </span>
                </div>
                <div className="flex items-center space-x-2 text-purple-700">
                  <CheckCircle className="h-4 w-4" />
                  <span className="text-sm">
                    El terapeuta necesitará esta información para la evaluación
                  </span>
                </div>
              </div>

              <div className="pt-4">
                <Link href={`/schedule/medical-form/${data.appointmentId}`}>
                  <Button className="w-full bg-purple-600 hover:bg-purple-700 text-lg py-3">
                    <FileCheck className="h-5 w-5 mr-2" />
                    INICIAR FORMULARIO
                  </Button>
                </Link>

                <p className="text-center text-xs text-purple-600 mt-2">
                  Su ID de formulario es:{" "}
                  <span className="font-mono font-bold">
                    {data.appointmentId}
                  </span>
                </p>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Next Steps */}
        <Card className="mt-6 bg-blue-50 border-blue-200">
          <CardHeader>
            <CardTitle className="flex items-center text-blue-800">
              <Clock className="h-5 w-5 mr-2" />
              Próximos Pasos
            </CardTitle>
          </CardHeader>
          <CardContent className="text-blue-700">
            <div className="space-y-2">
              <p className="flex items-center">
                <CheckCircle className="h-4 w-4 mr-2" />
                Nuestro equipo revisará tu solicitud en las próximas 24 horas
              </p>
              <p className="flex items-center">
                <CheckCircle className="h-4 w-4 mr-2" />
                Te contactaremos para coordinar la cita de consulta
              </p>
              <p className="flex items-center">
                <CheckCircle className="h-4 w-4 mr-2" />
                Recibirás confirmación por teléfono o email
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <div className="flex justify-center space-x-4 mt-8">
          <Button asChild variant="outline">
            <Link href="/">Volver al Inicio</Link>
          </Button>
          <Button asChild>
            <Link href="/contact">Contactar Centro</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
