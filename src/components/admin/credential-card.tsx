"use client";

import { useRef } from "react";
import { Button } from "@/components/ui/button";
import { Download, User, Mail, Lock, Building } from "lucide-react";
import html2canvas from "html2canvas";
import { useActiveSpecialties } from "@/hooks/use-specialties";

interface CredentialCardProps {
  user: {
    firstName: string;
    lastName: string;
    email: string;
    password: string;
    role: string;
    specialty?: string;
  };
  onClose: () => void;
}

export function CredentialCard({ user, onClose }: CredentialCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);

  // Fetch specialties for dynamic display
  const { data: specialties = [] } = useActiveSpecialties();

  const downloadAsImage = async () => {
    if (!cardRef.current) return;

    try {
      const canvas = await html2canvas(cardRef.current, {
        backgroundColor: "#ffffff",
        scale: 2,
        logging: false,
        useCORS: true,
      });

      const link = document.createElement("a");
      link.download = `credenciales-${user.firstName}-${user.lastName}.png`;
      link.href = canvas.toDataURL();
      link.click();
    } catch (error) {
      console.error("Error generating image:", error);
    }
  };

  const getRoleLabel = (role: string) => {
    switch (role) {
      case "ADMIN":
        return "Administrador";
      case "THERAPIST":
        return "Terapeuta";
      case "PARENT":
        return "Padre";
      default:
        return role;
    }
  };

  const getSpecialtyLabel = (
    specialty?: string | { specialtyId: string; name: string }
  ) => {
    if (!specialty) return "";

    // If specialty is an object (new structure), use the name directly
    if (typeof specialty === "object" && specialty.name) {
      return specialty.name;
    }

    // If specialty is a string (old structure or specialtyId), use the mapping
    if (typeof specialty === "string") {
      const specialtyObj = specialties.find(
        (spec) => spec.specialtyId === specialty
      );
      return specialtyObj?.name || specialty;
    }

    return "";
  };

  return (
    <div className="space-y-4">
      <div ref={cardRef} className="bg-white p-8 border rounded-lg shadow-lg">
        <div className="text-center mb-6">
          <Building className="w-12 h-12 mx-auto mb-2 text-blue-600" />
          <h2 className="text-2xl font-bold text-gray-800">Vivir Feliz</h2>
          <p className="text-gray-600">Centro de Terapia Infantil</p>
        </div>

        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-6 rounded-lg border">
          <h3 className="text-lg font-semibold mb-4 text-center text-gray-800">
            Credenciales de Acceso
          </h3>

          <div className="space-y-4">
            <div className="flex items-center space-x-3">
              <User className="w-5 h-5 text-gray-600" />
              <div>
                <p className="text-sm text-gray-600">Usuario</p>
                <p className="font-semibold text-gray-800">
                  {user.firstName} {user.lastName}
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              <Mail className="w-5 h-5 text-gray-600" />
              <div>
                <p className="text-sm text-gray-600">Email</p>
                <p className="font-semibold text-gray-800">{user.email}</p>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              <Lock className="w-5 h-5 text-gray-600" />
              <div>
                <p className="text-sm text-gray-600">Contraseña</p>
                <p className="font-mono font-semibold text-gray-800 bg-gray-100 px-2 py-1 rounded">
                  {user.password}
                </p>
              </div>
            </div>

            <div className="border-t pt-4">
              <p className="text-sm text-gray-600">
                Rol: {getRoleLabel(user.role)}
              </p>
              {user.specialty && (
                <p className="text-sm text-gray-600">
                  Especialidad: {getSpecialtyLabel(user.specialty)}
                </p>
              )}
            </div>
          </div>

          <div className="mt-6 p-3 bg-yellow-50 border border-yellow-200 rounded">
            <p className="text-xs text-yellow-800 text-center">
              ⚠️ Guarde estas credenciales de forma segura. Esta información no
              se volverá a mostrar.
            </p>
          </div>
        </div>

        <div className="mt-6 text-center text-xs text-gray-500">
          Generado el {new Date().toLocaleDateString("es-ES")}
        </div>
      </div>

      <div className="flex justify-center space-x-3">
        <Button
          onClick={downloadAsImage}
          className="bg-blue-600 hover:bg-blue-700"
        >
          <Download className="w-4 h-4 mr-2" />
          Descargar como Imagen
        </Button>
        <Button variant="outline" onClick={onClose}>
          Cerrar
        </Button>
      </div>
    </div>
  );
}
