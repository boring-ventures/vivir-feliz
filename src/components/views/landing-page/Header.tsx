"use client";

import { Button } from "@/components/ui/button";
import { Heart } from "lucide-react";
import Link from "next/link";
import { useAuth } from "@/providers/auth-provider";

interface HeaderProps {
  setSelectedService?: (service: "consulta" | "entrevista" | null) => void;
}

export default function Header({ setSelectedService }: HeaderProps) {
  const { user, isLoading } = useAuth();

  return (
    <header className="bg-white shadow-sm border-b">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center space-x-2">
            <Heart className="h-8 w-8 text-blue-600" />
            <Link href="/" className="text-2xl font-bold text-gray-900">
              Vivir Feliz
            </Link>
          </div>
          <nav className="hidden md:flex space-x-8">
            <a
              href="#inicio"
              className="text-gray-700 hover:text-blue-600 font-medium"
            >
              Inicio
            </a>
            <a
              href="#servicios"
              className="text-gray-700 hover:text-blue-600 font-medium"
            >
              Servicios
            </a>
            <a
              href="#nosotros"
              className="text-gray-700 hover:text-blue-600 font-medium"
            >
              Nosotros
            </a>
            <a
              href="#contacto"
              className="text-gray-700 hover:text-blue-600 font-medium"
            >
              Contacto
            </a>
          </nav>
          <div className="flex items-center space-x-4">
            {!isLoading && (
              <>
                {user ? (
                  <Link href="/dashboard">
                    <Button variant="outline" className="hidden md:flex">
                      Ir al Dashboard
                    </Button>
                  </Link>
                ) : (
                  <Link href="/sign-in">
                    <Button variant="outline" className="hidden md:flex">
                      Iniciar Sesión
                    </Button>
                  </Link>
                )}
              </>
            )}
            {setSelectedService && (
              <Button
                className="bg-blue-600 hover:bg-blue-700"
                onClick={() => setSelectedService("consulta")}
              >
                AGENDAR CONSULTA
              </Button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
