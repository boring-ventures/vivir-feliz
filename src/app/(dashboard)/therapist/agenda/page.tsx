"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Heart,
  Calendar,
  FileText,
  Users,
  Clock,
  BarChart,
  LogOut,
  Bell,
  Stethoscope,
  ClipboardList,
} from "lucide-react";
import Link from "next/link";

export default function TherapistAgendaPage() {
  return (
    <div className="min-h-screen bg-gray-100">
      <div className="flex">
        {/* Sidebar */}
        <aside className="hidden md:flex flex-col w-64 bg-white border-r shadow-sm">
          <div className="p-6 border-b">
            <div className="flex items-center space-x-2">
              <Heart className="h-8 w-8 text-blue-600" />
              <span className="text-xl font-bold text-gray-900">
                Vivir Feliz
              </span>
            </div>
          </div>
          <nav className="flex-1 p-4">
            <ul className="space-y-1">
              <li>
                <Link
                  href="/therapist/dashboard"
                  className="flex items-center space-x-3 px-3 py-2 rounded-md text-gray-700 hover:bg-gray-100"
                >
                  <BarChart className="h-5 w-5" />
                  <span>Dashboard</span>
                </Link>
              </li>
              <li>
                <Link
                  href="/therapist/agenda"
                  className="flex items-center space-x-3 px-3 py-2 rounded-md bg-blue-50 text-blue-700"
                >
                  <Calendar className="h-5 w-5" />
                  <span>Mi Agenda</span>
                </Link>
              </li>
              <li>
                <Link
                  href="/therapist/pacientes"
                  className="flex items-center space-x-3 px-3 py-2 rounded-md text-gray-700 hover:bg-gray-100"
                >
                  <Users className="h-5 w-5" />
                  <span>Mis Pacientes</span>
                </Link>
              </li>
              <li>
                <Link
                  href="/therapist/sesiones"
                  className="flex items-center space-x-3 px-3 py-2 rounded-md text-gray-700 hover:bg-gray-100"
                >
                  <ClipboardList className="h-5 w-5" />
                  <span>Sesiones</span>
                </Link>
              </li>
              <li>
                <Link
                  href="/therapist/reportes"
                  className="flex items-center space-x-3 px-3 py-2 rounded-md text-gray-700 hover:bg-gray-100"
                >
                  <FileText className="h-5 w-5" />
                  <span>Reportes</span>
                </Link>
              </li>
              <li>
                <Link
                  href="/therapist/horarios"
                  className="flex items-center space-x-3 px-3 py-2 rounded-md text-gray-700 hover:bg-gray-100"
                >
                  <Clock className="h-5 w-5" />
                  <span>Horarios</span>
                </Link>
              </li>
            </ul>
          </nav>
          <div className="p-4 border-t">
            <Link href="/login">
              <Button
                variant="ghost"
                className="w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50"
              >
                <LogOut className="h-5 w-5 mr-2" />
                Cerrar Sesión
              </Button>
            </Link>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1">
          {/* Header */}
          <header className="bg-white shadow-sm p-4 flex justify-between items-center">
            <div className="flex items-center space-x-2">
              <Stethoscope className="h-5 w-5 text-blue-600" />
              <h1 className="text-xl font-semibold">Mi Agenda</h1>
            </div>
            <div className="flex items-center space-x-4">
              <Button variant="outline" size="icon">
                <Bell className="h-5 w-5" />
              </Button>
            </div>
          </header>

          {/* Page Content */}
          <div className="p-6">
            <div className="mb-6">
              <h1 className="text-2xl font-bold mb-2">Mi Agenda</h1>
              <p className="text-muted-foreground">
                Calendario y horarios de mis citas
              </p>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Agenda Profesional</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Esta página estará disponible próximamente. Aquí podrás ver tu
                  calendario completo, gestionar tus horarios y confirmar citas
                  con pacientes.
                </p>
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    </div>
  );
}
