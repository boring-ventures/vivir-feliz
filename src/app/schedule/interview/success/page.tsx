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
  FileText,
  School,
  Users,
  Upload,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

interface InterviewData {
  // Child data
  childFirstName: string;
  childLastName: string;
  childDateOfBirth: string;
  childGender: string;

  // Parent data
  parentName: string;
  parentPhone: string;
  parentEmail: string;

  // School data
  schoolName: string;
  derivationDescription: string;
  derivationFileUrl?: string;

  type: string;
}

export default function InterviewSuccessPage() {
  const [data, setData] = useState<InterviewData | null>(null);
  const router = useRouter();

  useEffect(() => {
    const storedData = sessionStorage.getItem("interviewData");
    if (storedData) {
      setData(JSON.parse(storedData));
    } else {
      // If no data found, redirect to home
      router.push("/");
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

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Success Header */}
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <div className="bg-green-100 rounded-full p-3">
              <CheckCircle className="h-12 w-12 text-green-600" />
            </div>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            ¡Solicitud de Entrevista Enviada!
          </h1>
          <p className="text-lg text-gray-600 mb-4">
            Hemos recibido tu solicitud de entrevista con derivación
            exitosamente.
          </p>
          <div className="flex justify-center space-x-4">
            <Badge variant="secondary" className="text-sm">
              <Calendar className="h-4 w-4 mr-1" />
              Procesándose
            </Badge>
            <Badge variant="outline" className="text-sm">
              Con Derivación Escolar
            </Badge>
          </div>
        </div>

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
                <p className="font-medium text-gray-900">
                  {data.childFirstName} {data.childLastName}
                </p>
                <p className="text-sm text-gray-600">
                  {data.childGender === "masculino" ? "Masculino" : "Femenino"}{" "}
                  • {calcularEdad(data.childDateOfBirth)} años
                </p>
                <p className="text-sm text-gray-600">
                  Fecha de nacimiento:{" "}
                  {new Date(data.childDateOfBirth).toLocaleDateString()}
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Parent Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Users className="h-5 w-5 mr-2 text-blue-600" />
                Padre/Madre Responsable
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <p className="font-medium text-gray-900">{data.parentName}</p>
              </div>
              <div className="space-y-2">
                <div className="flex items-center">
                  <Phone className="h-4 w-4 mr-2 text-gray-400" />
                  <p className="text-sm text-gray-600">{data.parentPhone}</p>
                </div>
                <div className="flex items-center">
                  <Mail className="h-4 w-4 mr-2 text-gray-400" />
                  <p className="text-sm text-gray-600">{data.parentEmail}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* School Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <School className="h-5 w-5 mr-2 text-blue-600" />
                Información del Colegio
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <p className="font-medium text-gray-900">{data.schoolName}</p>
                <p className="text-sm text-gray-600">Institución educativa</p>
              </div>
            </CardContent>
          </Card>

          {/* Derivation Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <FileText className="h-5 w-5 mr-2 text-blue-600" />
                Derivación
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <p className="text-sm font-medium text-gray-700">
                  Motivo de la derivación:
                </p>
                <p className="text-sm text-gray-600">
                  {data.derivationDescription}
                </p>
              </div>
              {data.derivationFileUrl && (
                <div className="flex items-center">
                  <Upload className="h-4 w-4 mr-2 text-gray-400" />
                  <p className="text-sm text-gray-600">
                    Archivo de derivación adjunto
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Next Steps */}
        <Card className="mt-6 bg-blue-50 border-blue-200">
          <CardHeader>
            <CardTitle className="text-blue-800">Próximos Pasos</CardTitle>
          </CardHeader>
          <CardContent className="text-blue-700">
            <div className="space-y-2">
              <p className="flex items-center">
                <CheckCircle className="h-4 w-4 mr-2" />
                Nuestro equipo revisará la derivación en las próximas 24 horas
              </p>
              <p className="flex items-center">
                <CheckCircle className="h-4 w-4 mr-2" />
                Te contactaremos para coordinar la entrevista inicial
              </p>
              <p className="flex items-center">
                <CheckCircle className="h-4 w-4 mr-2" />
                Recibirás confirmación por teléfono o email
              </p>
              <p className="flex items-center">
                <CheckCircle className="h-4 w-4 mr-2" />
                Nos coordinaremos con la institución educativa
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Important Note */}
        <Card className="mt-6 bg-yellow-50 border-yellow-200">
          <CardHeader>
            <CardTitle className="text-yellow-800">
              Información Importante
            </CardTitle>
          </CardHeader>
          <CardContent className="text-yellow-700">
            <p className="text-sm">
              Esta entrevista está dirigida específicamente a niños derivados
              por instituciones educativas. Nuestro equipo trabajará en
              coordinación con el colegio para brindar el mejor apoyo posible.
            </p>
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
