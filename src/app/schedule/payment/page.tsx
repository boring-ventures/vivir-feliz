"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { ArrowLeft, Upload, X, Loader } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Header from "@/components/views/landing-page/Header";

interface AppointmentDetails {
  tipo?: string;
  childName?: string;
  nombre?: string;
  childFirstName?: string;
  childLastName?: string;
  fecha?: string;
  hora?: string;
  therapist?: {
    name?: string;
  };
  [key: string]: unknown;
}

export default function PaymentPage() {
  const [file, setFile] = useState<File | null>(null);
  const [comprobante, setComprobante] = useState("");
  const [pagado, setPagado] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [appointmentDetails, setAppointmentDetails] =
    useState<AppointmentDetails | null>(null);
  const router = useRouter();

  useEffect(() => {
    // Load appointment details from sessionStorage
    const savedDetails = sessionStorage.getItem("pendingAppointment");
    if (savedDetails) {
      setAppointmentDetails(JSON.parse(savedDetails));
    } else {
      // If no pending appointment, redirect back to schedule selection
      router.push("/schedule/select-time");
    }
  }, [router]);

  const formatDate = (dateString: string) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return date.toLocaleDateString("es-ES", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  };

  const getTipoDisplay = () => {
    return appointmentDetails?.tipo === "interview"
      ? "Entrevista con Derivación"
      : "Consulta Inicial";
  };

  const getCosto = () => {
    return appointmentDetails?.tipo === "interview" ? "Bs. 300" : "Bs. 250";
  };

  const getNombreNino = () => {
    if (appointmentDetails) {
      return (
        appointmentDetails.childName ||
        appointmentDetails.nombre ||
        `${appointmentDetails.childFirstName || ""} ${appointmentDetails.childLastName || ""}`.trim() ||
        "Paciente"
      );
    }
    return "Paciente";
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      // Validate file type and size
      const allowedTypes = [
        "image/jpeg",
        "image/jpg",
        "image/png",
        "image/webp",
      ];
      const maxSize = 10 * 1024 * 1024; // 10MB

      if (!allowedTypes.includes(selectedFile.type)) {
        alert("Por favor selecciona una imagen válida (JPG, PNG, WEBP)");
        return;
      }

      if (selectedFile.size > maxSize) {
        alert("El archivo es demasiado grande. El tamaño máximo es 10MB");
        return;
      }

      setFile(selectedFile);
    }
  };

  const removeFile = () => {
    setFile(null);
    const fileInput = document.getElementById(
      "receipt-file"
    ) as HTMLInputElement;
    if (fileInput) {
      fileInput.value = "";
    }
  };

  const handleConfirmarPago = async () => {
    if (!file) {
      alert("Por favor sube el comprobante de pago");
      return;
    }

    setIsLoading(true);

    try {
      // Here you would upload the file to your storage service (Supabase, etc.)
      // For now, we'll simulate the upload and continue with booking

      // Add payment info to appointment details
      const updatedDetails = {
        ...appointmentDetails,
        paymentConfirmed: true,
        receiptFile: file.name,
        referenceNumber: comprobante,
        paymentDate: new Date().toISOString(),
      };

      // Store updated details
      sessionStorage.setItem(
        "appointmentDetails",
        JSON.stringify(updatedDetails)
      );

      // Remove pending appointment data
      sessionStorage.removeItem("pendingAppointment");

      // Redirect to booking confirmation API
      const response = await fetch("/api/schedule/book-appointment", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...appointmentDetails,
          paymentConfirmed: true,
          receiptImageName: file.name,
          referenceNumber: comprobante,
        }),
      });

      if (response.ok) {
        const result = await response.json();

        // Update appointment details with booking result
        sessionStorage.setItem(
          "appointmentDetails",
          JSON.stringify({
            ...updatedDetails,
            appointmentId: result.appointment.appointmentId,
            appointment: result.appointment,
          })
        );

        // Redirect to success page
        const successPath =
          appointmentDetails?.tipo === "interview"
            ? "/schedule/interview/success"
            : "/schedule/appointment/success";
        router.push(successPath);
      } else {
        throw new Error("Error al confirmar la cita");
      }
    } catch (error) {
      console.error("Error confirming payment:", error);
      alert("Hubo un error al procesar el pago. Por favor intenta nuevamente.");
    } finally {
      setIsLoading(false);
    }
  };

  const getBackUrl = () => {
    return (
      "/schedule/select-time" +
      (appointmentDetails?.tipo === "interview"
        ? "?type=interview"
        : "?type=consultation")
    );
  };

  if (!appointmentDetails) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Cargando...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6">
          <Link
            href={getBackUrl()}
            className="flex items-center space-x-2 text-gray-600 hover:text-gray-900"
          >
            <ArrowLeft className="h-5 w-5" />
            <span>Volver al calendario</span>
          </Link>
        </div>

        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="text-2xl font-bold text-center">
              Confirmar Pago
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            {/* Resumen de la cita */}
            <div className="mb-6 p-4 bg-gray-50 rounded-lg">
              <h3 className="text-lg font-semibold mb-4">Resumen de la Cita</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                <div>
                  <span className="text-gray-600">Tipo:</span>
                  <span className="font-medium ml-2">{getTipoDisplay()}</span>
                </div>
                <div>
                  <span className="text-gray-600">Niño/a:</span>
                  <span className="font-medium ml-2">{getNombreNino()}</span>
                </div>
                <div>
                  <span className="text-gray-600">Fecha:</span>
                  <span className="font-medium ml-2">
                    {formatDate(appointmentDetails.fecha || "")}
                  </span>
                </div>
                <div>
                  <span className="text-gray-600">Hora:</span>
                  <span className="font-medium ml-2">
                    {appointmentDetails.hora || ""} hrs
                  </span>
                </div>
                <div>
                  <span className="text-gray-600">Terapeuta:</span>
                  <span className="font-medium ml-2">
                    {appointmentDetails.therapist?.name}
                  </span>
                </div>
                <div className="md:col-span-2">
                  <span className="text-gray-600">Costo:</span>
                  <span className="font-medium ml-2">{getCosto()}</span>
                </div>
              </div>
            </div>

            {/* Método de pago */}
            <div className="mb-6">
              <h3 className="text-lg font-semibold mb-4">Método de Pago</h3>
              <div className="flex flex-col items-center p-6 border rounded-lg">
                <h4 className="text-center font-medium mb-4">CÓDIGO QR</h4>
                <div className="bg-white p-4 border rounded-md mb-4">
                  <div className="w-48 h-48 bg-gray-100 border-2 border-dashed border-gray-300 rounded-md flex items-center justify-center">
                    <div className="text-center text-gray-500">
                      <div className="mb-2">📱</div>
                      <div className="text-sm">Código QR</div>
                      <div className="text-xs">para pago</div>
                    </div>
                  </div>
                </div>
                <p className="text-center text-gray-600 mb-2">
                  Escanea con tu app bancaria
                </p>
                <p className="text-center font-semibold">Monto: {getCosto()}</p>
              </div>
            </div>

            {/* Upload del comprobante */}
            <div className="mb-6">
              <h3 className="text-lg font-semibold mb-4">
                Subir Comprobante de Pago
              </h3>

              <div className="space-y-4">
                <div>
                  <Label htmlFor="receipt-file">
                    Comprobante de Pago (Imagen) *
                  </Label>
                  <div className="mt-2">
                    {!file ? (
                      <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-gray-400 transition-colors">
                        <Upload className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                        <div className="text-sm text-gray-600 mb-2">
                          Haz clic para subir o arrastra el archivo aquí
                        </div>
                        <div className="text-xs text-gray-500">
                          PNG, JPG, WEBP hasta 10MB
                        </div>
                        <input
                          id="receipt-file"
                          type="file"
                          accept="image/*"
                          onChange={handleFileChange}
                          className="hidden"
                        />
                        <Button
                          type="button"
                          variant="outline"
                          className="mt-4"
                          onClick={() =>
                            document.getElementById("receipt-file")?.click()
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
                  <Label htmlFor="comprobante">
                    Número de Comprobante (opcional):
                  </Label>
                  <Input
                    id="comprobante"
                    value={comprobante}
                    onChange={(e) => setComprobante(e.target.value)}
                    placeholder="Ingresa el número de comprobante"
                    className="mt-1"
                  />
                </div>
              </div>
            </div>

            {/* Confirmación de pago */}
            <div className="mb-6">
              <RadioGroup
                value={pagado ? "pagado" : "no-pagado"}
                onValueChange={(v) => setPagado(v === "pagado")}
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="pagado" id="pagado" />
                  <Label htmlFor="pagado">
                    Confirmo que he realizado el pago y he subido el comprobante
                  </Label>
                </div>
              </RadioGroup>
            </div>

            {/* Botón de confirmación */}
            <Button
              onClick={handleConfirmarPago}
              className="w-full bg-blue-600 hover:bg-blue-700"
              disabled={!pagado || !file || isLoading}
            >
              {isLoading ? (
                <>
                  <Loader className="h-4 w-4 mr-2 animate-spin" />
                  Procesando...
                </>
              ) : (
                "CONFIRMAR PAGO Y AGENDAR CITA"
              )}
            </Button>

            {/* Soporte */}
            <div className="mt-6 text-center">
              <p className="text-gray-600 mb-2">¿Problemas con el pago?</p>
              <Button
                variant="link"
                className="text-blue-600 hover:text-blue-700"
              >
                Contactar Soporte
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
