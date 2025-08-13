"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import {
  Heart,
  ArrowLeft,
  ArrowRight,
  Plus,
  Trash2,
  AlertCircle,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  useCreateConsultationRequest,
  type ConsultationRequestFormData,
  type ConsultationChild,
  type ConsultationReasonsData,
} from "@/hooks/use-consultation-requests";
import { cn } from "@/lib/utils";

interface Hijo {
  id: string;
  nombre: string;
  fechaNacimiento: string;
  gradoEscolar: string;
  problemas: boolean;
  descripcionProblemas: string;
}

interface ValidationErrors {
  [key: string]: string;
}

export default function ScheduleAppointmentPage() {
  const [currentStep, setCurrentStep] = useState(1);
  const [errors, setErrors] = useState<ValidationErrors>({});
  const router = useRouter();
  const createConsultationRequest = useCreateConsultationRequest();

  // Child data
  const [datosNino, setDatosNino] = useState({
    nombre: "",
    sexo: "",
    fechaNacimiento: "",
    vivecon: "",
    otroViveCon: "",
    domicilio: "",
  });

  // Parents data
  const [datosPadres, setDatosPadres] = useState({
    madre: {
      nombre: "",
      edad: "",
      celular: "",
      email: "",
      gradoEscolar: "",
      ocupacion: "",
    },
    padre: {
      nombre: "",
      edad: "",
      celular: "",
      email: "",
      gradoEscolar: "",
      ocupacion: "",
    },
  });

  // School data
  const [datosEscolares, setDatosEscolares] = useState({
    institucion: "",
    telefono: "",
    direccion: "",
    nivelEscolar: "",
    maestra: "",
  });

  // Family history
  const [hijos, setHijos] = useState<Hijo[]>([
    {
      id: "1",
      nombre: "",
      fechaNacimiento: "",
      gradoEscolar: "",
      problemas: false,
      descripcionProblemas: "",
    },
  ]);

  // Consultation reasons
  const [motivosConsulta, setMotivosConsulta] =
    useState<ConsultationReasonsData>({
      dificultadesLenguaje: false,
      retrasoMotor: false,
      problemasCoordinacion: false,
      dificultadesAprendizaje: false,
      problemasAtencion: false,
      dificultadesInteraccion: false,
      indicadoresComportamiento: false,
      problemasComportamiento: false,
      dificultadesAlimentacion: false,
      dificultadesSueno: false,
      sensibilidadEstimulos: false,
      bajaAutoestima: false,
      dificultadesControl: false,
      dificultadesAutonomia: false,
      diagnosticoPrevio: false,
      diagnosticoTexto: "",
      otro: false,
      otroTexto: "",
      necesitaOrientacion: false,
      noSeguroDificultad: false,
      quiereValoracion: false,
      derivacionColegio: false,
      evaluacionReciente: false,
      evaluacionMedica: false,
      quienDeriva: "",
    });

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

  // Clear errors when user starts typing
  const clearError = (field: string) => {
    if (errors[field]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  // Validation functions for each step
  const validateStep1 = (): boolean => {
    const newErrors: ValidationErrors = {};

    if (!datosNino.nombre.trim()) {
      newErrors.childName = "El nombre del niño/a es requerido";
    }
    if (!datosNino.sexo) {
      newErrors.childGender = "El sexo del niño/a es requerido";
    }
    if (!datosNino.fechaNacimiento) {
      newErrors.childDateOfBirth = "La fecha de nacimiento es requerida";
    }
    if (!datosNino.vivecon) {
      newErrors.childLivesWith = "Debe seleccionar con quién vive el niño/a";
    }
    if (datosNino.vivecon === "otros" && !datosNino.otroViveCon.trim()) {
      newErrors.childOtherLivesWith =
        "Debe especificar con quién vive el niño/a";
    }
    if (!datosNino.domicilio.trim()) {
      newErrors.childAddress = "El domicilio es requerido";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateStep2 = (): boolean => {
    const newErrors: ValidationErrors = {};

    // At least one parent should have a name
    if (!datosPadres.madre.nombre.trim() && !datosPadres.padre.nombre.trim()) {
      newErrors.parentRequired =
        "Debe ingresar al menos el nombre de la madre o del padre";
    }

    // If mother's name is provided, phone should be required
    if (datosPadres.madre.nombre.trim() && !datosPadres.madre.celular.trim()) {
      newErrors.motherPhone = "El celular de la madre es requerido";
    }

    // If father's name is provided, phone should be required
    if (datosPadres.padre.nombre.trim() && !datosPadres.padre.celular.trim()) {
      newErrors.fatherPhone = "El celular del padre es requerido";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateStep3 = (): boolean => {
    const newErrors: ValidationErrors = {};

    if (!datosEscolares.institucion.trim()) {
      newErrors.schoolName = "El nombre de la institución es requerido";
    }
    if (!datosEscolares.nivelEscolar.trim()) {
      newErrors.schoolLevel = "El nivel escolar es requerido";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateStep4 = (): boolean => {
    const newErrors: ValidationErrors = {};

    // At least one child should have a name
    const hijosConNombre = hijos.filter((hijo) => hijo.nombre.trim());
    if (hijosConNombre.length === 0) {
      newErrors.familyHistory =
        "Debe ingresar al menos un nombre en el historial familiar";
    }

    // If a child has problems checked, description is required
    hijos.forEach((hijo) => {
      if (hijo.problemas && !hijo.descripcionProblemas.trim()) {
        newErrors[`child_${hijo.id}_problems`] = "Debe describir los problemas";
      }
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateStep5 = (): boolean => {
    const newErrors: ValidationErrors = {};

    // At least one consultation reason should be selected
    const reasonsSelected = Object.entries(motivosConsulta).some(
      ([key, value]) => {
        // Skip text fields and quienDeriva in this check
        if (
          key === "diagnosticoTexto" ||
          key === "otroTexto" ||
          key === "quienDeriva"
        ) {
          return false;
        }
        return value === true;
      }
    );

    if (!reasonsSelected) {
      newErrors.consultationReasons =
        "Debe seleccionar al menos un motivo de consulta";
    }

    // If diagnostic previo is checked, text is required
    if (
      motivosConsulta.diagnosticoPrevio &&
      !motivosConsulta.diagnosticoTexto.trim()
    ) {
      newErrors.diagnosticoTexto = "Debe especificar el diagnóstico previo";
    }

    // If otro is checked, text is required
    if (motivosConsulta.otro && !motivosConsulta.otroTexto.trim()) {
      newErrors.otroTexto = "Debe especificar el otro motivo de consulta";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const agregarHijo = () => {
    const nuevoHijo: Hijo = {
      id: Date.now().toString(),
      nombre: "",
      fechaNacimiento: "",
      gradoEscolar: "",
      problemas: false,
      descripcionProblemas: "",
    };
    setHijos([...hijos, nuevoHijo]);
  };

  const eliminarHijo = (id: string) => {
    if (hijos.length > 1) {
      setHijos(hijos.filter((hijo) => hijo.id !== id));
      // Clear any errors for this child
      const newErrors = { ...errors };
      Object.keys(newErrors).forEach((key) => {
        if (key.includes(`child_${id}`)) {
          delete newErrors[key];
        }
      });
      setErrors(newErrors);
    }
  };

  const actualizarHijo = (
    id: string,
    campo: string,
    valor: string | boolean
  ) => {
    setHijos(
      hijos.map((hijo) => (hijo.id === id ? { ...hijo, [campo]: valor } : hijo))
    );

    // Clear errors when user updates field
    if (campo === "descripcionProblemas") {
      clearError(`child_${id}_problems`);
    }
  };

  const nextStep = () => {
    let isValid = false;

    switch (currentStep) {
      case 1:
        isValid = validateStep1();
        break;
      case 2:
        isValid = validateStep2();
        break;
      case 3:
        isValid = validateStep3();
        break;
      case 4:
        isValid = validateStep4();
        break;
      case 5:
        isValid = validateStep5();
        break;
      default:
        isValid = true;
    }

    if (!isValid) {
      return;
    }

    if (currentStep < 5) {
      setCurrentStep(currentStep + 1);
      setErrors({}); // Clear errors when moving to next step
    } else {
      handleSubmit();
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
      setErrors({}); // Clear errors when going back
    }
  };

  const handleSubmit = async () => {
    // Prepare data for submission
    const formData: ConsultationRequestFormData = {
      // Child data
      childName: datosNino.nombre,
      childGender: datosNino.sexo,
      childDateOfBirth: datosNino.fechaNacimiento,
      childLivesWith: datosNino.vivecon,
      childOtherLivesWith: datosNino.otroViveCon,
      childAddress: datosNino.domicilio,

      // Parent data
      motherName: datosPadres.madre.nombre,
      motherAge: datosPadres.madre.edad,
      motherPhone: datosPadres.madre.celular,
      motherEmail: datosPadres.madre.email,
      motherEducation: datosPadres.madre.gradoEscolar,
      motherOccupation: datosPadres.madre.ocupacion,
      fatherName: datosPadres.padre.nombre,
      fatherAge: datosPadres.padre.edad,
      fatherPhone: datosPadres.padre.celular,
      fatherEmail: datosPadres.padre.email,
      fatherEducation: datosPadres.padre.gradoEscolar,
      fatherOccupation: datosPadres.padre.ocupacion,

      // School data
      schoolName: datosEscolares.institucion,
      schoolPhone: datosEscolares.telefono,
      schoolAddress: datosEscolares.direccion,
      schoolLevel: datosEscolares.nivelEscolar,
      teacherName: datosEscolares.maestra,

      // Children array (convert to expected format)
      children: hijos.map(
        (hijo): ConsultationChild => ({
          nombre: hijo.nombre,
          fechaNacimiento: hijo.fechaNacimiento,
          gradoEscolar: hijo.gradoEscolar,
          problemas: hijo.problemas,
          descripcionProblemas: hijo.descripcionProblemas,
        })
      ),

      // Consultation reasons
      consultationReasons: motivosConsulta,
      referredBy: motivosConsulta.quienDeriva,
    };

    try {
      const result = await createConsultationRequest.mutateAsync(formData);

      // Store data in sessionStorage for schedule selection page
      sessionStorage.setItem(
        "consultaData",
        JSON.stringify({
          // Child data
          nombre: datosNino.nombre,
          sexo: datosNino.sexo,
          fechaNacimiento: datosNino.fechaNacimiento,
          vivecon: datosNino.vivecon,
          otroViveCon: datosNino.otroViveCon,
          domicilio: datosNino.domicilio,

          // Parents data
          madre: datosPadres.madre,
          padre: datosPadres.padre,

          // School data
          institucion: datosEscolares.institucion,
          telefono: datosEscolares.telefono,
          direccion: datosEscolares.direccion,
          nivelEscolar: datosEscolares.nivelEscolar,
          maestra: datosEscolares.maestra,

          // Family history
          hijos: hijos,

          // Consultation reasons
          motivosConsulta: motivosConsulta,
          quienDeriva: motivosConsulta.quienDeriva,

          tipo: "consulta",
          costo: 250,
        })
      );

      // Store the request ID for appointment booking
      sessionStorage.setItem("consultaData_requestId", result.id);

      // Redirect to schedule selection page
      router.push("/schedule/select-time?type=consultation");
    } catch (error) {
      console.error("Error submitting consultation request:", error);
    }
  };

  const renderStep1 = () => (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-6">
          Datos del Niño/a
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="md:col-span-2">
            <Label
              htmlFor="nombre"
              className={cn(errors.childName && "text-red-600")}
            >
              Nombre Completo {errors.childName && "*"}
            </Label>
            <Input
              id="nombre"
              value={datosNino.nombre}
              onChange={(e) => {
                setDatosNino({ ...datosNino, nombre: e.target.value });
                clearError("childName");
              }}
              placeholder="Nombre completo del niño/a"
              className={cn(
                "capitalize",
                errors.childName && "border-red-500 focus:border-red-500"
              )}
              required
            />
            {errors.childName && (
              <p className="text-sm text-red-600 mt-1 flex items-center">
                <AlertCircle className="h-4 w-4 mr-1" />
                {errors.childName}
              </p>
            )}
          </div>

          <div>
            <Label className={cn(errors.childGender && "text-red-600")}>
              Sexo {errors.childGender && "*"}
            </Label>
            <RadioGroup
              value={datosNino.sexo}
              onValueChange={(value) => {
                setDatosNino({ ...datosNino, sexo: value });
                clearError("childGender");
              }}
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
            {errors.childGender && (
              <p className="text-sm text-red-600 mt-1 flex items-center">
                <AlertCircle className="h-4 w-4 mr-1" />
                {errors.childGender}
              </p>
            )}
          </div>

          <div>
            <Label
              htmlFor="fechaNacimiento"
              className={cn(errors.childDateOfBirth && "text-red-600")}
            >
              Fecha de Nacimiento {errors.childDateOfBirth && "*"}
            </Label>
            <Input
              id="fechaNacimiento"
              type="date"
              value={datosNino.fechaNacimiento}
              onChange={(e) => {
                setDatosNino({ ...datosNino, fechaNacimiento: e.target.value });
                clearError("childDateOfBirth");
              }}
              className={cn(
                errors.childDateOfBirth && "border-red-500 focus:border-red-500"
              )}
              required
            />
            {datosNino.fechaNacimiento && (
              <p className="text-sm text-gray-600 mt-1">
                Edad: {calcularEdad(datosNino.fechaNacimiento)} años
              </p>
            )}
            {errors.childDateOfBirth && (
              <p className="text-sm text-red-600 mt-1 flex items-center">
                <AlertCircle className="h-4 w-4 mr-1" />
                {errors.childDateOfBirth}
              </p>
            )}
          </div>

          <div className="md:col-span-2">
            <Label className={cn(errors.childLivesWith && "text-red-600")}>
              Vive con: {errors.childLivesWith && "*"}
            </Label>
            <RadioGroup
              value={datosNino.vivecon}
              onValueChange={(value) => {
                setDatosNino({ ...datosNino, vivecon: value });
                clearError("childLivesWith");
              }}
              className="grid grid-cols-2 gap-2 mt-2"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="ambos-padres" id="ambos-padres" />
                <Label htmlFor="ambos-padres">Ambos padres</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="solo-madre" id="solo-madre" />
                <Label htmlFor="solo-madre">Solo madre</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="solo-padre" id="solo-padre" />
                <Label htmlFor="solo-padre">Solo padre</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem
                  value="padres-adoptivos"
                  id="padres-adoptivos"
                />
                <Label htmlFor="padres-adoptivos">Padres adoptivos</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="algun-pariente" id="algun-pariente" />
                <Label htmlFor="algun-pariente">Algún pariente</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="padre-madrastra" id="padre-madrastra" />
                <Label htmlFor="padre-madrastra">Padre y madrastra</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="madre-padrastro" id="madre-padrastro" />
                <Label htmlFor="madre-padrastro">Madre y padrastro</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="otros" id="otros" />
                <Label htmlFor="otros">Otros</Label>
              </div>
            </RadioGroup>
            {errors.childLivesWith && (
              <p className="text-sm text-red-600 mt-1 flex items-center">
                <AlertCircle className="h-4 w-4 mr-1" />
                {errors.childLivesWith}
              </p>
            )}

            {datosNino.vivecon === "otros" && (
              <div className="mt-2">
                <Input
                  placeholder="Especificar..."
                  value={datosNino.otroViveCon}
                  onChange={(e) => {
                    setDatosNino({ ...datosNino, otroViveCon: e.target.value });
                    clearError("childOtherLivesWith");
                  }}
                  className={cn(
                    errors.childOtherLivesWith &&
                      "border-red-500 focus:border-red-500"
                  )}
                />
                {errors.childOtherLivesWith && (
                  <p className="text-sm text-red-600 mt-1 flex items-center">
                    <AlertCircle className="h-4 w-4 mr-1" />
                    {errors.childOtherLivesWith}
                  </p>
                )}
              </div>
            )}
          </div>

          <div className="md:col-span-2">
            <Label
              htmlFor="domicilio"
              className={cn(errors.childAddress && "text-red-600")}
            >
              Domicilio {errors.childAddress && "*"}
            </Label>
            <Input
              id="domicilio"
              value={datosNino.domicilio}
              onChange={(e) => {
                setDatosNino({ ...datosNino, domicilio: e.target.value });
                clearError("childAddress");
              }}
              placeholder="Dirección completa"
              className={cn(
                errors.childAddress && "border-red-500 focus:border-red-500"
              )}
              required
            />
            {errors.childAddress && (
              <p className="text-sm text-red-600 mt-1 flex items-center">
                <AlertCircle className="h-4 w-4 mr-1" />
                {errors.childAddress}
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );

  const renderStep2 = () => (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">
        Datos de los Padres
      </h2>

      {errors.parentRequired && (
        <div className="bg-red-50 border border-red-200 rounded-md p-3 mb-4">
          <p className="text-sm text-red-600 flex items-center">
            <AlertCircle className="h-4 w-4 mr-1" />
            {errors.parentRequired}
          </p>
        </div>
      )}

      {/* Mother's Data */}
      <Card>
        <CardHeader>
          <CardTitle>Datos de la Madre</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="md:col-span-2">
            <Label htmlFor="madre-nombre">Nombre Completo</Label>
            <Input
              id="madre-nombre"
              value={datosPadres.madre.nombre}
              onChange={(e) => {
                setDatosPadres({
                  ...datosPadres,
                  madre: { ...datosPadres.madre, nombre: e.target.value },
                });
                clearError("parentRequired");
              }}
              placeholder="Nombre completo de la madre"
              className="capitalize"
            />
          </div>
          <div>
            <Label htmlFor="madre-edad">Edad</Label>
            <Input
              id="madre-edad"
              type="number"
              value={datosPadres.madre.edad}
              onChange={(e) =>
                setDatosPadres({
                  ...datosPadres,
                  madre: { ...datosPadres.madre, edad: e.target.value },
                })
              }
              placeholder="Edad"
            />
          </div>
          <div>
            <Label
              htmlFor="madre-celular"
              className={cn(errors.motherPhone && "text-red-600")}
            >
              Celular {errors.motherPhone && "*"}
            </Label>
            <Input
              id="madre-celular"
              value={datosPadres.madre.celular}
              onChange={(e) => {
                setDatosPadres({
                  ...datosPadres,
                  madre: { ...datosPadres.madre, celular: e.target.value },
                });
                clearError("motherPhone");
              }}
              placeholder="+591-7-123-4567"
              className={cn(
                errors.motherPhone && "border-red-500 focus:border-red-500"
              )}
            />
            {errors.motherPhone && (
              <p className="text-sm text-red-600 mt-1 flex items-center">
                <AlertCircle className="h-4 w-4 mr-1" />
                {errors.motherPhone}
              </p>
            )}
          </div>
          <div>
            <Label htmlFor="madre-email">Email</Label>
            <Input
              id="madre-email"
              type="email"
              value={datosPadres.madre.email}
              onChange={(e) =>
                setDatosPadres({
                  ...datosPadres,
                  madre: { ...datosPadres.madre, email: e.target.value },
                })
              }
              placeholder="email@ejemplo.com"
            />
          </div>
          <div>
            <Label htmlFor="madre-grado">Máximo Grado Escolar</Label>
            <Input
              id="madre-grado"
              value={datosPadres.madre.gradoEscolar}
              onChange={(e) =>
                setDatosPadres({
                  ...datosPadres,
                  madre: { ...datosPadres.madre, gradoEscolar: e.target.value },
                })
              }
              placeholder="Ej: Universitario, Secundaria, etc."
            />
          </div>
          <div>
            <Label htmlFor="madre-ocupacion">Ocupación</Label>
            <Input
              id="madre-ocupacion"
              value={datosPadres.madre.ocupacion}
              onChange={(e) =>
                setDatosPadres({
                  ...datosPadres,
                  madre: { ...datosPadres.madre, ocupacion: e.target.value },
                })
              }
              placeholder="Ocupación actual"
            />
          </div>
        </CardContent>
      </Card>

      {/* Father's Data */}
      <Card>
        <CardHeader>
          <CardTitle>Datos del Padre</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="md:col-span-2">
            <Label htmlFor="padre-nombre">Nombre Completo</Label>
            <Input
              id="padre-nombre"
              value={datosPadres.padre.nombre}
              onChange={(e) => {
                setDatosPadres({
                  ...datosPadres,
                  padre: { ...datosPadres.padre, nombre: e.target.value },
                });
                clearError("parentRequired");
              }}
              placeholder="Nombre completo del padre"
              className="capitalize"
            />
          </div>
          <div>
            <Label htmlFor="padre-edad">Edad</Label>
            <Input
              id="padre-edad"
              type="number"
              value={datosPadres.padre.edad}
              onChange={(e) =>
                setDatosPadres({
                  ...datosPadres,
                  padre: { ...datosPadres.padre, edad: e.target.value },
                })
              }
              placeholder="Edad"
            />
          </div>
          <div>
            <Label
              htmlFor="padre-celular"
              className={cn(errors.fatherPhone && "text-red-600")}
            >
              Celular {errors.fatherPhone && "*"}
            </Label>
            <Input
              id="padre-celular"
              value={datosPadres.padre.celular}
              onChange={(e) => {
                setDatosPadres({
                  ...datosPadres,
                  padre: { ...datosPadres.padre, celular: e.target.value },
                });
                clearError("fatherPhone");
              }}
              placeholder="+591-7-123-4567"
              className={cn(
                errors.fatherPhone && "border-red-500 focus:border-red-500"
              )}
            />
            {errors.fatherPhone && (
              <p className="text-sm text-red-600 mt-1 flex items-center">
                <AlertCircle className="h-4 w-4 mr-1" />
                {errors.fatherPhone}
              </p>
            )}
          </div>
          <div>
            <Label htmlFor="padre-email">Email</Label>
            <Input
              id="padre-email"
              type="email"
              value={datosPadres.padre.email}
              onChange={(e) =>
                setDatosPadres({
                  ...datosPadres,
                  padre: { ...datosPadres.padre, email: e.target.value },
                })
              }
              placeholder="email@ejemplo.com"
            />
          </div>
          <div>
            <Label htmlFor="padre-grado">Máximo Grado Escolar</Label>
            <Input
              id="padre-grado"
              value={datosPadres.padre.gradoEscolar}
              onChange={(e) =>
                setDatosPadres({
                  ...datosPadres,
                  padre: { ...datosPadres.padre, gradoEscolar: e.target.value },
                })
              }
              placeholder="Ej: Universitario, Secundaria, etc."
            />
          </div>
          <div>
            <Label htmlFor="padre-ocupacion">Ocupación</Label>
            <Input
              id="padre-ocupacion"
              value={datosPadres.padre.ocupacion}
              onChange={(e) =>
                setDatosPadres({
                  ...datosPadres,
                  padre: { ...datosPadres.padre, ocupacion: e.target.value },
                })
              }
              placeholder="Ocupación actual"
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const renderStep3 = () => (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">
        Datos Escolares del Niño/a
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="md:col-span-2">
          <Label
            htmlFor="institucion"
            className={cn(errors.schoolName && "text-red-600")}
          >
            Nombre de la Institución {errors.schoolName && "*"}
          </Label>
          <Input
            id="institucion"
            value={datosEscolares.institucion}
            onChange={(e) => {
              setDatosEscolares({
                ...datosEscolares,
                institucion: e.target.value,
              });
              clearError("schoolName");
            }}
            placeholder="Nombre del colegio o institución educativa"
            className={cn(
              errors.schoolName && "border-red-500 focus:border-red-500"
            )}
          />
          {errors.schoolName && (
            <p className="text-sm text-red-600 mt-1 flex items-center">
              <AlertCircle className="h-4 w-4 mr-1" />
              {errors.schoolName}
            </p>
          )}
        </div>

        <div>
          <Label htmlFor="telefono-colegio">Teléfono del Colegio</Label>
          <Input
            id="telefono-colegio"
            value={datosEscolares.telefono}
            onChange={(e) =>
              setDatosEscolares({ ...datosEscolares, telefono: e.target.value })
            }
            placeholder="+591-4-123-4567"
          />
        </div>

        <div>
          <Label
            htmlFor="nivel-escolar"
            className={cn(errors.schoolLevel && "text-red-600")}
          >
            Nivel Escolar que Cursa {errors.schoolLevel && "*"}
          </Label>
          <Input
            id="nivel-escolar"
            value={datosEscolares.nivelEscolar}
            onChange={(e) => {
              setDatosEscolares({
                ...datosEscolares,
                nivelEscolar: e.target.value,
              });
              clearError("schoolLevel");
            }}
            placeholder="Ej: 3ro de Primaria, Kinder, etc."
            className={cn(
              errors.schoolLevel && "border-red-500 focus:border-red-500"
            )}
          />
          {errors.schoolLevel && (
            <p className="text-sm text-red-600 mt-1 flex items-center">
              <AlertCircle className="h-4 w-4 mr-1" />
              {errors.schoolLevel}
            </p>
          )}
        </div>

        <div className="md:col-span-2">
          <Label htmlFor="direccion-colegio">Dirección del Colegio</Label>
          <Input
            id="direccion-colegio"
            value={datosEscolares.direccion}
            onChange={(e) =>
              setDatosEscolares({
                ...datosEscolares,
                direccion: e.target.value,
              })
            }
            placeholder="Dirección completa del colegio"
          />
        </div>

        <div className="md:col-span-2">
          <Label htmlFor="maestra">Nombre de la Maestra</Label>
          <Input
            id="maestra"
            value={datosEscolares.maestra}
            onChange={(e) =>
              setDatosEscolares({ ...datosEscolares, maestra: e.target.value })
            }
            placeholder="Nombre completo de la maestra"
            className="capitalize"
          />
        </div>
      </div>
    </div>
  );

  const renderStep4 = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">Historial Familiar</h2>
        <Button onClick={agregarHijo} variant="outline" size="sm">
          <Plus className="h-4 w-4 mr-2" />
          Agregar Hijo/a
        </Button>
      </div>
      <p className="text-gray-600">Registrar embarazos en orden cronológico</p>

      {errors.familyHistory && (
        <div className="bg-red-50 border border-red-200 rounded-md p-3 mb-4">
          <p className="text-sm text-red-600 flex items-center">
            <AlertCircle className="h-4 w-4 mr-1" />
            {errors.familyHistory}
          </p>
        </div>
      )}

      {hijos.map((hijo, index) => (
        <Card key={hijo.id}>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Hijo/a #{index + 1}</CardTitle>
            {hijos.length > 1 && (
              <Button
                onClick={() => eliminarHijo(hijo.id)}
                variant="outline"
                size="sm"
                className="text-red-600 hover:text-red-700"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            )}
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor={`hijo-nombre-${hijo.id}`}>Nombre</Label>
                <Input
                  id={`hijo-nombre-${hijo.id}`}
                  value={hijo.nombre}
                  onChange={(e) => {
                    actualizarHijo(hijo.id, "nombre", e.target.value);
                    clearError("familyHistory");
                  }}
                  placeholder="Nombre del hijo/a"
                  className="capitalize"
                />
              </div>
              <div>
                <Label htmlFor={`hijo-fecha-${hijo.id}`}>
                  Fecha de Nacimiento
                </Label>
                <Input
                  id={`hijo-fecha-${hijo.id}`}
                  type="date"
                  value={hijo.fechaNacimiento}
                  onChange={(e) =>
                    actualizarHijo(hijo.id, "fechaNacimiento", e.target.value)
                  }
                />
              </div>
              <div className="md:col-span-2">
                <Label htmlFor={`hijo-grado-${hijo.id}`}>Grado Escolar</Label>
                <Input
                  id={`hijo-grado-${hijo.id}`}
                  value={hijo.gradoEscolar}
                  onChange={(e) =>
                    actualizarHijo(hijo.id, "gradoEscolar", e.target.value)
                  }
                  placeholder="Grado escolar actual"
                />
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id={`hijo-problemas-${hijo.id}`}
                checked={hijo.problemas}
                onCheckedChange={(checked) =>
                  actualizarHijo(hijo.id, "problemas", checked)
                }
              />
              <Label htmlFor={`hijo-problemas-${hijo.id}`}>
                Ha presentado problemas
              </Label>
            </div>

            {hijo.problemas && (
              <div>
                <Label
                  htmlFor={`hijo-descripcion-${hijo.id}`}
                  className={cn(
                    errors[`child_${hijo.id}_problems`] && "text-red-600"
                  )}
                >
                  Descripción de los problemas{" "}
                  {errors[`child_${hijo.id}_problems`] && "*"}
                </Label>
                <Textarea
                  id={`hijo-descripcion-${hijo.id}`}
                  value={hijo.descripcionProblemas}
                  onChange={(e) =>
                    actualizarHijo(
                      hijo.id,
                      "descripcionProblemas",
                      e.target.value
                    )
                  }
                  placeholder="Describe los problemas presentados..."
                  rows={3}
                  className={cn(
                    errors[`child_${hijo.id}_problems`] &&
                      "border-red-500 focus:border-red-500"
                  )}
                />
                {errors[`child_${hijo.id}_problems`] && (
                  <p className="text-sm text-red-600 mt-1 flex items-center">
                    <AlertCircle className="h-4 w-4 mr-1" />
                    {errors[`child_${hijo.id}_problems`]}
                  </p>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );

  const renderStep5 = () => (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">
        Motivo de Consulta Principal
      </h2>
      <p className="text-gray-600 mb-6">
        ¿Cuál es la principal preocupación que los trae a la consulta? (Marcar
        las opciones que apliquen)
      </p>

      {errors.consultationReasons && (
        <div className="bg-red-50 border border-red-200 rounded-md p-3 mb-4">
          <p className="text-sm text-red-600 flex items-center">
            <AlertCircle className="h-4 w-4 mr-1" />
            {errors.consultationReasons}
          </p>
        </div>
      )}

      <div className="space-y-4">
        <div className="grid grid-cols-1 gap-3">
          <div className="flex items-center space-x-2">
            <Checkbox
              id="dificultadesLenguaje"
              checked={motivosConsulta.dificultadesLenguaje}
              onCheckedChange={(checked) => {
                setMotivosConsulta({
                  ...motivosConsulta,
                  dificultadesLenguaje: checked as boolean,
                });
                clearError("consultationReasons");
              }}
            />
            <Label htmlFor="dificultadesLenguaje" className="text-sm">
              1. Dificultades en el lenguaje/comunicación
            </Label>
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox
              id="retrasoMotor"
              checked={motivosConsulta.retrasoMotor}
              onCheckedChange={(checked) => {
                setMotivosConsulta({
                  ...motivosConsulta,
                  retrasoMotor: checked as boolean,
                });
                clearError("consultationReasons");
              }}
            />
            <Label htmlFor="retrasoMotor" className="text-sm">
              2. Retraso en el desarrollo motor (gateo, caminar, equilibrio,
              agarrar de lápiz)
            </Label>
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox
              id="problemasCoordinacion"
              checked={motivosConsulta.problemasCoordinacion}
              onCheckedChange={(checked) => {
                setMotivosConsulta({
                  ...motivosConsulta,
                  problemasCoordinacion: checked as boolean,
                });
                clearError("consultationReasons");
              }}
            />
            <Label htmlFor="problemasCoordinacion" className="text-sm">
              3. Problemas de coordinación motora (llora, salidas frecuentes)
            </Label>
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox
              id="dificultadesAprendizaje"
              checked={motivosConsulta.dificultadesAprendizaje}
              onCheckedChange={(checked) => {
                setMotivosConsulta({
                  ...motivosConsulta,
                  dificultadesAprendizaje: checked as boolean,
                });
                clearError("consultationReasons");
              }}
            />
            <Label htmlFor="dificultadesAprendizaje" className="text-sm">
              4. Dificultades en el aprendizaje y desarrollo escolar
            </Label>
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox
              id="problemasAtencion"
              checked={motivosConsulta.problemasAtencion}
              onCheckedChange={(checked) => {
                setMotivosConsulta({
                  ...motivosConsulta,
                  problemasAtencion: checked as boolean,
                });
                clearError("consultationReasons");
              }}
            />
            <Label htmlFor="problemasAtencion" className="text-sm">
              5. Problemas de atención/concentración
            </Label>
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox
              id="dificultadesInteraccion"
              checked={motivosConsulta.dificultadesInteraccion}
              onCheckedChange={(checked) => {
                setMotivosConsulta({
                  ...motivosConsulta,
                  dificultadesInteraccion: checked as boolean,
                });
                clearError("consultationReasons");
              }}
            />
            <Label htmlFor="dificultadesInteraccion" className="text-sm">
              6. Dificultades en la interacción social
            </Label>
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox
              id="indicadoresComportamiento"
              checked={motivosConsulta.indicadoresComportamiento}
              onCheckedChange={(checked) => {
                setMotivosConsulta({
                  ...motivosConsulta,
                  indicadoresComportamiento: checked as boolean,
                });
                clearError("consultationReasons");
              }}
            />
            <Label htmlFor="indicadoresComportamiento" className="text-sm">
              7. Mi hijo presenta uno o más de los siguientes indicadores
              (escaso contacto visual, no responde al llamado por su nombre,
              camina de puntillas, hace aleteos con las manos, le cuesta
              socializar)
            </Label>
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox
              id="problemasComportamiento"
              checked={motivosConsulta.problemasComportamiento}
              onCheckedChange={(checked) => {
                setMotivosConsulta({
                  ...motivosConsulta,
                  problemasComportamiento: checked as boolean,
                });
                clearError("consultationReasons");
              }}
            />
            <Label htmlFor="problemasComportamiento" className="text-sm">
              8. Problemas de comportamiento (rabietas, impulsividad,
              desobediencia)
            </Label>
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox
              id="dificultadesAlimentacion"
              checked={motivosConsulta.dificultadesAlimentacion}
              onCheckedChange={(checked) => {
                setMotivosConsulta({
                  ...motivosConsulta,
                  dificultadesAlimentacion: checked as boolean,
                });
                clearError("consultationReasons");
              }}
            />
            <Label htmlFor="dificultadesAlimentacion" className="text-sm">
              9. Dificultades en la alimentación (selectividad, problemas para
              masticar/tragar)
            </Label>
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox
              id="dificultadesSueno"
              checked={motivosConsulta.dificultadesSueno}
              onCheckedChange={(checked) => {
                setMotivosConsulta({
                  ...motivosConsulta,
                  dificultadesSueno: checked as boolean,
                });
                clearError("consultationReasons");
              }}
            />
            <Label htmlFor="dificultadesSueno" className="text-sm">
              10. Dificultades en el sueño
            </Label>
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox
              id="sensibilidadEstimulos"
              checked={motivosConsulta.sensibilidadEstimulos}
              onCheckedChange={(checked) => {
                setMotivosConsulta({
                  ...motivosConsulta,
                  sensibilidadEstimulos: checked as boolean,
                });
                clearError("consultationReasons");
              }}
            />
            <Label htmlFor="sensibilidadEstimulos" className="text-sm">
              11. Sensibilidad a estímulos (ruidos, texturas, luces)
            </Label>
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox
              id="bajaAutoestima"
              checked={motivosConsulta.bajaAutoestima}
              onCheckedChange={(checked) => {
                setMotivosConsulta({
                  ...motivosConsulta,
                  bajaAutoestima: checked as boolean,
                });
                clearError("consultationReasons");
              }}
            />
            <Label htmlFor="bajaAutoestima" className="text-sm">
              12. Baja autoestima, timidez, introversión
            </Label>
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox
              id="dificultadesControl"
              checked={motivosConsulta.dificultadesControl}
              onCheckedChange={(checked) => {
                setMotivosConsulta({
                  ...motivosConsulta,
                  dificultadesControl: checked as boolean,
                });
                clearError("consultationReasons");
              }}
            />
            <Label htmlFor="dificultadesControl" className="text-sm">
              13. Dificultades en el control de esfínteres
            </Label>
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox
              id="dificultadesAutonomia"
              checked={motivosConsulta.dificultadesAutonomia}
              onCheckedChange={(checked) => {
                setMotivosConsulta({
                  ...motivosConsulta,
                  dificultadesAutonomia: checked as boolean,
                });
                clearError("consultationReasons");
              }}
            />
            <Label htmlFor="dificultadesAutonomia" className="text-sm">
              14. Dificultades en la autonomía y actividades diarias (vestirse,
              comer, ir al baño solo, etc)
            </Label>
          </div>

          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="diagnosticoPrevio"
                checked={motivosConsulta.diagnosticoPrevio}
                onCheckedChange={(checked) => {
                  setMotivosConsulta({
                    ...motivosConsulta,
                    diagnosticoPrevio: checked as boolean,
                  });
                  clearError("consultationReasons");
                }}
              />
              <Label htmlFor="diagnosticoPrevio" className="text-sm">
                15. Diagnóstico previo (especificar):
              </Label>
            </div>
            {motivosConsulta.diagnosticoPrevio && (
              <div className="ml-6">
                <Input
                  value={motivosConsulta.diagnosticoTexto}
                  onChange={(e) => {
                    setMotivosConsulta({
                      ...motivosConsulta,
                      diagnosticoTexto: e.target.value,
                    });
                    clearError("diagnosticoTexto");
                  }}
                  placeholder="Especificar diagnóstico previo..."
                  className={cn(
                    errors.diagnosticoTexto &&
                      "border-red-500 focus:border-red-500"
                  )}
                />
                {errors.diagnosticoTexto && (
                  <p className="text-sm text-red-600 mt-1 flex items-center">
                    <AlertCircle className="h-4 w-4 mr-1" />
                    {errors.diagnosticoTexto}
                  </p>
                )}
              </div>
            )}
          </div>

          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="otro"
                checked={motivosConsulta.otro}
                onCheckedChange={(checked) => {
                  setMotivosConsulta({
                    ...motivosConsulta,
                    otro: checked as boolean,
                  });
                  clearError("consultationReasons");
                }}
              />
              <Label htmlFor="otro" className="text-sm">
                16. Otro (especificar):
              </Label>
            </div>
            {motivosConsulta.otro && (
              <div className="ml-6">
                <Input
                  value={motivosConsulta.otroTexto}
                  onChange={(e) => {
                    setMotivosConsulta({
                      ...motivosConsulta,
                      otroTexto: e.target.value,
                    });
                    clearError("otroTexto");
                  }}
                  placeholder="Especificar otro motivo..."
                  className={cn(
                    errors.otroTexto && "border-red-500 focus:border-red-500"
                  )}
                />
                {errors.otroTexto && (
                  <p className="text-sm text-red-600 mt-1 flex items-center">
                    <AlertCircle className="h-4 w-4 mr-1" />
                    {errors.otroTexto}
                  </p>
                )}
              </div>
            )}
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox
              id="necesitaOrientacion"
              checked={motivosConsulta.necesitaOrientacion}
              onCheckedChange={(checked) => {
                setMotivosConsulta({
                  ...motivosConsulta,
                  necesitaOrientacion: checked as boolean,
                });
                clearError("consultationReasons");
              }}
            />
            <Label htmlFor="necesitaOrientacion" className="text-sm">
              17. Necesito orientación general
            </Label>
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox
              id="noSeguroDificultad"
              checked={motivosConsulta.noSeguroDificultad}
              onCheckedChange={(checked) => {
                setMotivosConsulta({
                  ...motivosConsulta,
                  noSeguroDificultad: checked as boolean,
                });
                clearError("consultationReasons");
              }}
            />
            <Label htmlFor="noSeguroDificultad" className="text-sm">
              18. No estoy seguro/a de cuál es la dificultad principal, pero
              observo que mi hijo/a necesita apoyo
            </Label>
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox
              id="quiereValoracion"
              checked={motivosConsulta.quiereValoracion}
              onCheckedChange={(checked) => {
                setMotivosConsulta({
                  ...motivosConsulta,
                  quiereValoracion: checked as boolean,
                });
                clearError("consultationReasons");
              }}
            />
            <Label htmlFor="quiereValoracion" className="text-sm">
              19. Me gustaría una valoración general para entender mejor las
              necesidades de mi hijo/a
            </Label>
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox
              id="derivacionColegio"
              checked={motivosConsulta.derivacionColegio}
              onCheckedChange={(checked) => {
                setMotivosConsulta({
                  ...motivosConsulta,
                  derivacionColegio: checked as boolean,
                });
                clearError("consultationReasons");
              }}
            />
            <Label htmlFor="derivacionColegio" className="text-sm">
              20. Fui referido directamente con derivación del Colegio para
              realizar una evaluación o tratamiento y necesito orientación
            </Label>
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox
              id="evaluacionReciente"
              checked={motivosConsulta.evaluacionReciente}
              onCheckedChange={(checked) => {
                setMotivosConsulta({
                  ...motivosConsulta,
                  evaluacionReciente: checked as boolean,
                });
                clearError("consultationReasons");
              }}
            />
            <Label htmlFor="evaluacionReciente" className="text-sm">
              21. Recientemente hace menos de 6 meses, realice una evaluación
              integral y quisiera iniciar terapias con mi hijo/a, y necesito
              orientación
            </Label>
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox
              id="evaluacionMedica"
              checked={motivosConsulta.evaluacionMedica}
              onCheckedChange={(checked) => {
                setMotivosConsulta({
                  ...motivosConsulta,
                  evaluacionMedica: checked as boolean,
                });
                clearError("consultationReasons");
              }}
            />
            <Label htmlFor="evaluacionMedica" className="text-sm">
              22. Recientemente hace menos de 6 meses, realice una evaluación
              médica y quisiera iniciar evaluación con mi hijo/a, y necesito
              orientación
            </Label>
          </div>
        </div>
      </div>
      <div className="mt-6 pt-4 border-t">
        <Label htmlFor="quienDeriva" className="text-sm font-medium">
          ¿Quién deriva al niño o niña?
        </Label>
        <Input
          id="quienDeriva"
          value={motivosConsulta.quienDeriva || ""}
          onChange={(e) =>
            setMotivosConsulta({
              ...motivosConsulta,
              quienDeriva: e.target.value,
            })
          }
          placeholder="Especificar quién deriva al niño/a (ej: pediatra, colegio, psicólogo, etc.)"
          className="mt-2"
        />
      </div>
    </div>
  );

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
            <Link
              href="/"
              className="flex items-center space-x-2 text-gray-600 hover:text-gray-900"
            >
              <ArrowLeft className="h-5 w-5" />
              <span>Volver al inicio</span>
            </Link>
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-700">
              Paso {currentStep} de 5
            </span>
            <span className="text-sm text-gray-500">
              {currentStep === 1 && "Datos del Niño"}
              {currentStep === 2 && "Datos de los Padres"}
              {currentStep === 3 && "Datos Escolares"}
              {currentStep === 4 && "Historial Familiar"}
              {currentStep === 5 && "Motivo de Consulta"}
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${(currentStep / 5) * 100}%` }}
            />
          </div>
        </div>

        <Card className="shadow-lg">
          <CardContent className="p-8">
            {currentStep === 1 && renderStep1()}
            {currentStep === 2 && renderStep2()}
            {currentStep === 3 && renderStep3()}
            {currentStep === 4 && renderStep4()}
            {currentStep === 5 && renderStep5()}

            {/* Navigation Buttons */}
            <div className="flex justify-between mt-8 pt-6 border-t">
              <Button
                onClick={prevStep}
                variant="outline"
                disabled={currentStep === 1}
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Anterior
              </Button>

              <Button
                onClick={nextStep}
                className="bg-blue-600 hover:bg-blue-700"
                disabled={createConsultationRequest.isPending}
              >
                {createConsultationRequest.isPending
                  ? "Procesando..."
                  : currentStep === 5
                    ? "ENVIAR SOLICITUD"
                    : "Siguiente Sección"}
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
