"use client";

import type React from "react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Textarea } from "@/components/ui/textarea";
import { ArrowLeft, Upload, X } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Header from "@/components/views/landing-page/Header";
import { useCreateInterviewRequest } from "@/hooks/use-interview-requests";
import type { InterviewRequestFormData } from "@/hooks/use-interview-requests";

export default function ScheduleInterviewPage() {
  const [file, setFile] = useState<File | null>(null);
  const router = useRouter();
  const createInterviewRequest = useCreateInterviewRequest();

  const [formData, setFormData] = useState<InterviewRequestFormData>({
    // Child data
    childFirstName: "",
    childLastName: "",
    childDateOfBirth: "",
    childGender: "masculino",

    // Parent data
    parentName: "",
    parentPhone: "",
    parentEmail: "",

    // School derivation
    schoolName: "",
    derivationDescription: "",
  });

  const calculateAge = (birthDate: string) => {
    if (!birthDate) return "";
    const today = new Date();
    const birth = new Date(birthDate);
    const age = today.getFullYear() - birth.getFullYear();
    const month = today.getMonth() - birth.getMonth();
    if (month < 0 || (month === 0 && today.getDate() < birth.getDate())) {
      return (age - 1).toString();
    }
    return age.toString();
  };

  const handleInputChange = (
    field: keyof InterviewRequestFormData,
    value: string
  ) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
    }
  };

  const removeFile = () => {
    setFile(null);
    const fileInput = document.getElementById(
      "derivation-file"
    ) as HTMLInputElement;
    if (fileInput) {
      fileInput.value = "";
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // For now, we'll submit without file upload
    // In a real implementation, you'd upload the file to Supabase Storage first
    const submitData: InterviewRequestFormData = {
      ...formData,
      derivationFileUrl: file ? `placeholder-url-${file.name}` : undefined,
    };

    try {
      const result = await createInterviewRequest.mutateAsync(submitData);

      // Store data in sessionStorage for schedule selection page
      sessionStorage.setItem(
        "interviewData",
        JSON.stringify({
          ...formData,
          derivationFileUrl: file ? `placeholder-url-${file.name}` : undefined,
          type: "interview",
        })
      );

      // Store the request ID for appointment booking
      sessionStorage.setItem("interviewData_requestId", result.data.id);

      // Redirect to schedule selection page
      router.push("/schedule/select-time?type=interview");
    } catch (error) {
      // Error is handled by the hook's onError callback
      console.error("Error submitting interview request:", error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6">
          <Link
            href="/"
            className="flex items-center space-x-2 text-gray-600 hover:text-gray-900"
          >
            <ArrowLeft className="h-5 w-5" />
            <span>Volver al inicio</span>
          </Link>
        </div>

        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="text-2xl font-bold text-center">
              Entrevista con Derivación
            </CardTitle>
            <p className="text-center text-gray-600">
              Para niños derivados por instituciones educativas
            </p>
          </CardHeader>
          <CardContent className="p-8">
            <form onSubmit={handleSubmit} className="space-y-8">
              {/* Child Basic Data */}
              <div>
                <h3 className="text-lg font-semibold mb-4">
                  DATOS BÁSICOS DEL NIÑO/A
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="childFirstName">Nombre</Label>
                    <Input
                      id="childFirstName"
                      value={formData.childFirstName}
                      onChange={(e) =>
                        handleInputChange("childFirstName", e.target.value)
                      }
                      placeholder="Nombre del niño/a"
                      className="capitalize"
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor="childLastName">Apellido</Label>
                    <Input
                      id="childLastName"
                      value={formData.childLastName}
                      onChange={(e) =>
                        handleInputChange("childLastName", e.target.value)
                      }
                      placeholder="Apellido del niño/a"
                      className="capitalize"
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor="childDateOfBirth">
                      Fecha de Nacimiento
                    </Label>
                    <Input
                      id="childDateOfBirth"
                      type="date"
                      value={formData.childDateOfBirth}
                      onChange={(e) =>
                        handleInputChange("childDateOfBirth", e.target.value)
                      }
                      required
                    />
                    {formData.childDateOfBirth && (
                      <p className="text-sm text-gray-600 mt-1">
                        Edad: {calculateAge(formData.childDateOfBirth)} años
                      </p>
                    )}
                  </div>

                  <div>
                    <Label>Sexo</Label>
                    <RadioGroup
                      value={formData.childGender}
                      onValueChange={(value: "masculino" | "femenino") =>
                        handleInputChange("childGender", value)
                      }
                      className="flex space-x-4 mt-2"
                    >
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="masculino" id="masculino" />
                        <Label htmlFor="masculino">Masculino</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="femenino" id="femenino" />
                        <Label htmlFor="femenino">Femenino</Label>
                      </div>
                    </RadioGroup>
                  </div>
                </div>
              </div>

              {/* Parent Data */}
              <div>
                <h3 className="text-lg font-semibold mb-4">
                  DATOS DEL PADRE/MADRE RESPONSABLE
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="md:col-span-2">
                    <Label htmlFor="parentName">Nombre Completo</Label>
                    <Input
                      id="parentName"
                      value={formData.parentName}
                      onChange={(e) =>
                        handleInputChange("parentName", e.target.value)
                      }
                      placeholder="Nombre del padre/madre responsable"
                      className="capitalize"
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor="parentPhone">Celular</Label>
                    <Input
                      id="parentPhone"
                      value={formData.parentPhone}
                      onChange={(e) =>
                        handleInputChange("parentPhone", e.target.value)
                      }
                      placeholder="+591-7-123-4567"
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor="parentEmail">Email</Label>
                    <Input
                      id="parentEmail"
                      type="email"
                      value={formData.parentEmail}
                      onChange={(e) =>
                        handleInputChange("parentEmail", e.target.value)
                      }
                      placeholder="email@ejemplo.com"
                      required
                    />
                  </div>
                </div>
              </div>

              {/* School Derivation */}
              <div>
                <h3 className="text-lg font-semibold mb-4">
                  DERIVACIÓN DEL COLEGIO
                </h3>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="schoolName">Nombre del Colegio</Label>
                    <Input
                      id="schoolName"
                      value={formData.schoolName}
                      onChange={(e) =>
                        handleInputChange("schoolName", e.target.value)
                      }
                      placeholder="Nombre de la institución educativa"
                      className="capitalize"
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor="derivation-file">
                      Foto de la Derivación *
                    </Label>
                    <div className="mt-2">
                      {!file ? (
                        <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-gray-400 transition-colors">
                          <Upload className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                          <div className="text-sm text-gray-600 mb-2">
                            Haz clic para subir o arrastra el archivo aquí
                          </div>
                          <div className="text-xs text-gray-500">
                            PNG, JPG, PDF hasta 10MB
                          </div>
                          <input
                            id="derivation-file"
                            type="file"
                            accept="image/*,.pdf"
                            onChange={handleFileChange}
                            className="hidden"
                            required
                          />
                          <Button
                            type="button"
                            variant="outline"
                            className="mt-4"
                            onClick={() =>
                              document
                                .getElementById("derivation-file")
                                ?.click()
                            }
                          >
                            Seleccionar Archivo
                          </Button>
                        </div>
                      ) : (
                        <div className="border border-gray-300 rounded-lg p-4 bg-gray-50">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-3">
                              <div className="bg-blue-100 p-2 rounded">
                                <Upload className="h-5 w-5 text-blue-600" />
                              </div>
                              <div>
                                <p className="text-sm font-medium text-gray-900">
                                  {file.name}
                                </p>
                                <p className="text-xs text-gray-500">
                                  {(file.size / 1024 / 1024).toFixed(2)} MB
                                </p>
                              </div>
                            </div>
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={removeFile}
                              className="text-red-600 hover:text-red-700"
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="derivationDescription">
                      Descripción del Motivo
                    </Label>
                    <Textarea
                      id="derivationDescription"
                      value={formData.derivationDescription}
                      onChange={(e) =>
                        handleInputChange(
                          "derivationDescription",
                          e.target.value
                        )
                      }
                      placeholder="Describe brevemente el motivo de la derivación..."
                      rows={4}
                      maxLength={500}
                      required
                    />
                    <div className="text-right text-xs text-gray-500 mt-1">
                      {formData.derivationDescription.length}/500 caracteres
                    </div>
                  </div>
                </div>
              </div>

              {/* Submit Button */}
              <Button
                type="submit"
                className="w-full bg-blue-600 hover:bg-blue-700 text-lg py-3"
                disabled={createInterviewRequest.isPending}
              >
                {createInterviewRequest.isPending
                  ? "Procesando..."
                  : "ENVIAR SOLICITUD DE ENTREVISTA"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
