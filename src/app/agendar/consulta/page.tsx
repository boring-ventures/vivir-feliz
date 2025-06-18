"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Calendar, Clock, Heart } from "lucide-react";
import Link from "next/link";

export default function AgendarConsultaPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link href="/" className="flex items-center space-x-2">
              <Heart className="h-8 w-8 text-blue-600" />
              <span className="text-2xl font-bold text-gray-900">
                Vivir Feliz
              </span>
            </Link>
            <Link href="/">
              <Button variant="outline" className="flex items-center gap-2">
                <ArrowLeft className="h-4 w-4" />
                Volver al Inicio
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Agendar Consulta
          </h1>
          <p className="text-xl text-gray-600">
            Primera visita - Evaluación inicial
          </p>
        </div>

        <Card className="max-w-2xl mx-auto">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl flex items-center justify-center gap-2">
              <Calendar className="h-6 w-6 text-blue-600" />
              Sistema de Agendamiento
            </CardTitle>
            <CardDescription className="text-lg">
              Pronto podrás agendar tu consulta en línea
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="bg-blue-50 p-6 rounded-lg text-center">
              <Clock className="h-12 w-12 text-blue-600 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Sistema en Desarrollo
              </h3>
              <p className="text-gray-600 mb-4">
                Estamos trabajando en nuestro sistema de agendamiento en línea.
                Pronto podrás seleccionar fecha, hora y especialista de forma
                fácil y rápida.
              </p>
            </div>

            <div className="border-t pt-6">
              <h4 className="font-semibold text-gray-900 mb-4">
                Mientras tanto, puedes contactarnos:
              </h4>
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                  <span className="text-gray-600">
                    Teléfono: +591-4-123-4567
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                  <span className="text-gray-600">
                    Email: info@vivirfeliz.com
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                  <span className="text-gray-600">
                    Horarios: Lunes a Viernes 8:00 AM - 6:00 PM
                  </span>
                </div>
              </div>
            </div>

            <div className="bg-gray-50 p-4 rounded-lg">
              <h5 className="font-medium text-gray-900 mb-2">
                Información de la Consulta:
              </h5>
              <div className="space-y-1 text-sm text-gray-600">
                <p>• Duración: 60 minutos</p>
                <p>• Costo: Bs. 250</p>
                <p>• Incluye: Evaluación inicial completa</p>
                <p>• Modalidad: Presencial</p>
              </div>
            </div>

            <div className="text-center">
              <Link href="/">
                <Button className="bg-blue-600 hover:bg-blue-700">
                  Volver al Inicio
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
