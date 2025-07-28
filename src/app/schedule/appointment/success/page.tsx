"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Heart,
  CheckCircle,
  Calendar,
  FileText,
  AlertTriangle,
  FileCheck,
  Clock,
  Phone,
  Mail,
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
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
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

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
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

              {/* Payment Status (if confirmed) */}
              {data.paymentConfirmed && (
                <div className="border-t border-green-200 pt-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm font-medium text-green-700">
                        Estado del Pago
                      </p>
                      <Badge className="bg-green-600 text-white">
                        ✓ Pago Confirmado
                      </Badge>
                      <p className="text-sm text-green-600 mt-1">
                        Tu pago ha sido recibido y confirmado
                      </p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-green-700">
                        Monto Pagado
                      </p>
                      <p className="text-lg font-semibold text-green-900">
                        Bs. 250
                      </p>
                      <p className="text-sm text-green-600">Consulta Inicial</p>
                    </div>
                  </div>
                  {data.referenceNumber && (
                    <div className="mt-3">
                      <p className="text-sm font-medium text-green-700">
                        Número de Referencia
                      </p>
                      <p className="text-sm text-green-900 font-mono">
                        {data.referenceNumber}
                      </p>
                    </div>
                  )}
                </div>
              )}

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

        {/* Medical Form Action Card - Only show for consultations with appointments */}
        {data.appointmentId && data.paymentConfirmed && (
          <Card className="mb-6 border-purple-200 bg-purple-50">
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
                      detallado con información sobre su hijo/a.
                    </p>
                  </div>
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
        <Card className="mb-6 bg-blue-50 border-blue-200">
          <CardHeader>
            <CardTitle className="flex items-center text-blue-800">
              <Clock className="h-5 w-5 mr-2" />
              Próximos Pasos
            </CardTitle>
          </CardHeader>
          <CardContent className="text-blue-700">
            <div className="space-y-3">
              {!data.appointmentId ? (
                <>
                  <p className="flex items-center">
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Nuestro equipo revisará tu solicitud en las próximas 24
                    horas
                  </p>
                  <p className="flex items-center">
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Te contactaremos para coordinar la cita de consulta
                  </p>
                  <p className="flex items-center">
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Recibirás confirmación por teléfono o email
                  </p>
                </>
              ) : (
                <>
                  <p className="flex items-center">
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Completa el formulario médico antes de tu cita
                  </p>
                  <p className="flex items-center">
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Llega 10 minutos antes de tu cita programada
                  </p>
                  <p className="flex items-center">
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Trae documentos médicos relevantes si los tienes
                  </p>
                </>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Contact Information */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Phone className="h-5 w-5 mr-2 text-blue-600" />
              Información de Contacto
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="font-medium text-gray-900">Centro Vivir Feliz</p>
                <div className="space-y-1 text-sm text-gray-600 mt-2">
                  <p className="flex items-center">
                    <Phone className="h-4 w-4 mr-2" />
                    +591 123 456 789
                  </p>
                  <p className="flex items-center">
                    <Mail className="h-4 w-4 mr-2" />
                    info@vivirfeliz.com
                  </p>
                </div>
              </div>
              <div>
                <p className="text-sm text-gray-600">
                  Si tienes alguna pregunta o necesitas reprogramar tu cita, no
                  dudes en contactarnos.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <div className="flex justify-center space-x-4">
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
