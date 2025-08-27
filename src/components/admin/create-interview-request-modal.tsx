"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { MessageSquare, Plus, X } from "lucide-react";
import {
  useCreateInterviewRequest,
  type InterviewRequestFormData,
} from "@/hooks/use-interview-requests";
import { toast } from "@/components/ui/use-toast";

interface CreateInterviewRequestModalProps {
  onSuccess?: () => void;
}

export function CreateInterviewRequestModal({
  onSuccess,
}: CreateInterviewRequestModalProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [file, setFile] = useState<File | null>(null);
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

  const resetForm = () => {
    setFormData({
      childFirstName: "",
      childLastName: "",
      childDateOfBirth: "",
      childGender: "masculino",
      parentName: "",
      parentPhone: "",
      parentEmail: "",
      schoolName: "",
      derivationDescription: "",
    });
    setFile(null);
  };

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

  // Helper function to capitalize text
  const capitalizeText = (text: string) => {
    return text
      .split(" ")
      .map((word) => {
        if (word.length === 0) return word;
        return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
      })
      .join(" ");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // For now, we'll submit without file upload
    // In a real implementation, you'd upload the file to Supabase Storage first
    const submitData: InterviewRequestFormData = {
      childFirstName: formData.childFirstName,
      childLastName: formData.childLastName,
      childDateOfBirth: formData.childDateOfBirth,
      childGender: formData.childGender,
      parentName: formData.parentName,
      parentPhone: formData.parentPhone,
      parentEmail: formData.parentEmail,
      schoolName: formData.schoolName,
      derivationDescription: formData.derivationDescription,
      derivationFileUrl: file ? `placeholder-url-${file.name}` : undefined,
    };

    try {
      await createInterviewRequest.mutateAsync(submitData);
      toast({
        title: "¡Solicitud creada exitosamente!",
        description:
          "La solicitud de entrevista ha sido creada desde el panel administrativo.",
      });
      resetForm();
      setIsOpen(false);
      onSuccess?.();
    } catch (error) {
      console.error("Error submitting interview request:", error);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" onClick={() => setIsOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Crear Solicitud de Entrevista
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center">
            <MessageSquare className="h-5 w-5 mr-2 text-green-500" />
            Crear Nueva Solicitud de Entrevista
          </DialogTitle>
          <DialogDescription>
            Complete el formulario para crear una nueva solicitud de entrevista
            desde el panel administrativo.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Child Information */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Datos del Niño</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="childFirstName">Nombre *</Label>
                <Input
                  id="childFirstName"
                  value={formData.childFirstName}
                  onChange={(e) =>
                    handleInputChange(
                      "childFirstName",
                      capitalizeText(e.target.value)
                    )
                  }
                  placeholder="Nombre del niño"
                  required
                />
              </div>
              <div>
                <Label htmlFor="childLastName">Apellido *</Label>
                <Input
                  id="childLastName"
                  value={formData.childLastName}
                  onChange={(e) =>
                    handleInputChange(
                      "childLastName",
                      capitalizeText(e.target.value)
                    )
                  }
                  placeholder="Apellido del niño"
                  required
                />
              </div>
              <div>
                <Label htmlFor="childDateOfBirth">Fecha de nacimiento *</Label>
                <Input
                  id="childDateOfBirth"
                  type="date"
                  value={formData.childDateOfBirth}
                  onChange={(e) =>
                    handleInputChange("childDateOfBirth", e.target.value)
                  }
                  required
                />
              </div>
              <div>
                <Label>Edad</Label>
                <Input
                  value={calculateAge(formData.childDateOfBirth)}
                  placeholder="Se calcula automáticamente"
                  disabled
                />
              </div>
              <div>
                <Label>Sexo *</Label>
                <RadioGroup
                  value={formData.childGender}
                  onValueChange={(value) =>
                    handleInputChange("childGender", value)
                  }
                  className="flex gap-4"
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

          {/* Parent Information */}
          <div>
            <h3 className="text-lg font-semibold mb-4">
              Datos del Responsable
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="parentName">Nombre completo *</Label>
                <Input
                  id="parentName"
                  value={formData.parentName}
                  onChange={(e) =>
                    handleInputChange(
                      "parentName",
                      capitalizeText(e.target.value)
                    )
                  }
                  placeholder="Nombre y apellidos del responsable"
                  required
                />
              </div>
              <div>
                <Label htmlFor="parentPhone">Teléfono *</Label>
                <Input
                  id="parentPhone"
                  value={formData.parentPhone}
                  onChange={(e) =>
                    handleInputChange("parentPhone", e.target.value)
                  }
                  placeholder="Número de teléfono"
                  required
                />
              </div>
              <div className="md:col-span-2">
                <Label htmlFor="parentEmail">Email *</Label>
                <Input
                  id="parentEmail"
                  type="email"
                  value={formData.parentEmail}
                  onChange={(e) =>
                    handleInputChange("parentEmail", e.target.value)
                  }
                  placeholder="Correo electrónico"
                  required
                />
              </div>
            </div>
          </div>

          {/* School Information */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Derivación Escolar</h3>
            <div className="space-y-4">
              <div>
                <Label htmlFor="schoolName">Nombre del colegio *</Label>
                <Input
                  id="schoolName"
                  value={formData.schoolName}
                  onChange={(e) =>
                    handleInputChange(
                      "schoolName",
                      capitalizeText(e.target.value)
                    )
                  }
                  placeholder="Nombre de la institución educativa"
                  required
                />
              </div>
              <div>
                <Label htmlFor="derivationDescription">
                  Descripción del motivo *
                </Label>
                <Textarea
                  id="derivationDescription"
                  value={formData.derivationDescription}
                  onChange={(e) =>
                    handleInputChange(
                      "derivationDescription",
                      capitalizeText(e.target.value)
                    )
                  }
                  placeholder="Describa el motivo de la derivación y las observaciones del colegio"
                  rows={4}
                  required
                />
              </div>
              <div>
                <Label htmlFor="derivation-file">
                  Archivo de derivación (opcional)
                </Label>
                <div className="flex items-center space-x-2">
                  <Input
                    id="derivation-file"
                    type="file"
                    onChange={handleFileChange}
                    accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                    className="flex-1"
                  />
                  {file && (
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={removeFile}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  )}
                </div>
                {file && (
                  <p className="text-sm text-muted-foreground mt-1">
                    Archivo seleccionado: {file.name}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <div className="flex justify-end space-x-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsOpen(false)}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={createInterviewRequest.isPending}>
              {createInterviewRequest.isPending
                ? "Creando..."
                : "Crear Solicitud"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
