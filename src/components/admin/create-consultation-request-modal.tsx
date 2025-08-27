"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Heart, Plus, Trash2, X } from "lucide-react";
import {
  useCreateConsultationRequest,
  type ConsultationRequestFormData,
  type ConsultationChild,
  type ConsultationReasonsData,
} from "@/hooks/use-consultation-requests";
import { toast } from "@/components/ui/use-toast";

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

interface CreateConsultationRequestModalProps {
  onSuccess?: () => void;
}

export function CreateConsultationRequestModal({
  onSuccess,
}: CreateConsultationRequestModalProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [, setErrors] = useState<ValidationErrors>({});
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

  // Helper function to capitalize text in real-time
  const capitalizeText = (text: string) => {
    return text
      .split(" ")
      .map((word) => {
        if (word.length === 0) return word;
        return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
      })
      .join(" ");
  };

  // Helper function to handle input changes with real-time capitalization
  const handleTextInputChange = <T extends Record<string, unknown>>(
    setter: React.Dispatch<React.SetStateAction<T>>,
    field: string,
    value: string,
    shouldCapitalize: boolean = true
  ) => {
    const processedValue = shouldCapitalize ? capitalizeText(value) : value;
    setter((prev: T) => {
      if (field.includes(".")) {
        const [parent, child] = field.split(".");
        return {
          ...prev,
          [parent]: {
            ...(prev[parent] as Record<string, unknown>),
            [child]: processedValue,
          },
        };
      }
      return {
        ...prev,
        [field]: processedValue,
      };
    });
  };

  const resetForm = () => {
    setDatosNino({
      nombre: "",
      sexo: "",
      fechaNacimiento: "",
      vivecon: "",
      otroViveCon: "",
      domicilio: "",
    });
    setDatosPadres({
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
    setDatosEscolares({
      institucion: "",
      telefono: "",
      direccion: "",
      nivelEscolar: "",
      maestra: "",
    });
    setHijos([
      {
        id: "1",
        nombre: "",
        fechaNacimiento: "",
        gradoEscolar: "",
        problemas: false,
        descripcionProblemas: "",
      },
    ]);
    setMotivosConsulta({
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
    setCurrentStep(1);
    setErrors({});
  };

  const handleSubmit = async () => {
    // Prepare data for submission (no need to capitalize again since it's already done in real-time)
    const formData: ConsultationRequestFormData = {
      // Child data
      childName: datosNino.nombre,
      childGender: datosNino.sexo,
      childDateOfBirth: datosNino.fechaNacimiento,
      childLivesWith: datosNino.vivecon,
      childOtherLivesWith: datosNino.otroViveCon || undefined,
      childAddress: datosNino.domicilio,

      // Parent data
      motherName: datosPadres.madre.nombre || undefined,
      motherAge: datosPadres.madre.edad,
      motherPhone: datosPadres.madre.celular,
      motherEmail: datosPadres.madre.email,
      motherEducation: datosPadres.madre.gradoEscolar || undefined,
      motherOccupation: datosPadres.madre.ocupacion || undefined,
      fatherName: datosPadres.padre.nombre || undefined,
      fatherAge: datosPadres.padre.edad,
      fatherPhone: datosPadres.padre.celular,
      fatherEmail: datosPadres.padre.email,
      fatherEducation: datosPadres.padre.gradoEscolar || undefined,
      fatherOccupation: datosPadres.padre.ocupacion || undefined,

      // School data
      schoolName: datosEscolares.institucion || undefined,
      schoolPhone: datosEscolares.telefono,
      schoolAddress: datosEscolares.direccion || undefined,
      schoolLevel: datosEscolares.nivelEscolar || undefined,
      teacherName: datosEscolares.maestra || undefined,

      // Children array (convert to expected format)
      children: hijos.map(
        (hijo): ConsultationChild => ({
          nombre: hijo.nombre,
          fechaNacimiento: hijo.fechaNacimiento,
          gradoEscolar: hijo.gradoEscolar,
          problemas: hijo.problemas,
          descripcionProblemas: hijo.descripcionProblemas || "",
        })
      ),

      // Consultation reasons
      consultationReasons: motivosConsulta,
      referredBy: motivosConsulta.quienDeriva || undefined,
    };

    try {
      await createConsultationRequest.mutateAsync(formData);
      toast({
        title: "¡Solicitud creada exitosamente!",
        description:
          "La solicitud de consulta ha sido creada desde el panel administrativo.",
      });
      resetForm();
      setIsOpen(false);
      onSuccess?.();
    } catch (error) {
      console.error("Error submitting consultation request:", error);
    }
  };

  const renderStep1 = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-4">Datos del Niño</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="nombre">Nombre completo *</Label>
            <Input
              id="nombre"
              value={datosNino.nombre}
              onChange={(e) =>
                handleTextInputChange(setDatosNino, "nombre", e.target.value)
              }
              placeholder="Nombre y apellidos"
            />
          </div>
          <div>
            <Label>Sexo *</Label>
            <RadioGroup
              value={datosNino.sexo}
              onValueChange={(value) =>
                setDatosNino({ ...datosNino, sexo: value })
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
          <div>
            <Label htmlFor="fechaNacimiento">Fecha de nacimiento *</Label>
            <Input
              id="fechaNacimiento"
              type="date"
              value={datosNino.fechaNacimiento}
              onChange={(e) =>
                setDatosNino({ ...datosNino, fechaNacimiento: e.target.value })
              }
            />
          </div>
          <div>
            <Label htmlFor="vivecon">Vive con *</Label>
            <RadioGroup
              value={datosNino.vivecon}
              onValueChange={(value) =>
                setDatosNino({ ...datosNino, vivecon: value })
              }
              className="flex gap-4"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="ambos padres" id="ambos" />
                <Label htmlFor="ambos">Ambos padres</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="solo madre" id="madre" />
                <Label htmlFor="madre">Solo madre</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="solo padre" id="padre" />
                <Label htmlFor="padre">Solo padre</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="otros" id="otros" />
                <Label htmlFor="otros">Otros</Label>
              </div>
            </RadioGroup>
          </div>
          {datosNino.vivecon === "otros" && (
            <div>
              <Label htmlFor="otroViveCon">Especifique con quién vive</Label>
              <Input
                id="otroViveCon"
                value={datosNino.otroViveCon}
                onChange={(e) =>
                  handleTextInputChange(
                    setDatosNino,
                    "otroViveCon",
                    e.target.value
                  )
                }
                placeholder="Ej: abuelos, tíos, etc."
              />
            </div>
          )}
          <div className="md:col-span-2">
            <Label htmlFor="domicilio">Domicilio *</Label>
            <Input
              id="domicilio"
              value={datosNino.domicilio}
              onChange={(e) =>
                handleTextInputChange(setDatosNino, "domicilio", e.target.value)
              }
              placeholder="Dirección completa"
            />
          </div>
        </div>
      </div>
    </div>
  );

  const renderStep2 = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-4">Datos de la Madre</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="madreNombre">Nombre completo</Label>
            <Input
              id="madreNombre"
              value={datosPadres.madre.nombre}
              onChange={(e) =>
                handleTextInputChange(
                  setDatosPadres,
                  "madre.nombre",
                  e.target.value
                )
              }
              placeholder="Nombre y apellidos"
            />
          </div>
          <div>
            <Label htmlFor="madreEdad">Edad</Label>
            <Input
              id="madreEdad"
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
            <Label htmlFor="madreCelular">Celular</Label>
            <Input
              id="madreCelular"
              value={datosPadres.madre.celular}
              onChange={(e) =>
                setDatosPadres({
                  ...datosPadres,
                  madre: { ...datosPadres.madre, celular: e.target.value },
                })
              }
              placeholder="Número de celular"
            />
          </div>
          <div>
            <Label htmlFor="madreEmail">Email</Label>
            <Input
              id="madreEmail"
              type="email"
              value={datosPadres.madre.email}
              onChange={(e) =>
                setDatosPadres({
                  ...datosPadres,
                  madre: { ...datosPadres.madre, email: e.target.value },
                })
              }
              placeholder="Correo electrónico"
            />
          </div>
          <div>
            <Label htmlFor="madreGradoEscolar">Grado escolar</Label>
            <Input
              id="madreGradoEscolar"
              value={datosPadres.madre.gradoEscolar}
              onChange={(e) =>
                handleTextInputChange(
                  setDatosPadres,
                  "madre.gradoEscolar",
                  e.target.value
                )
              }
              placeholder="Ej: Primaria, Secundaria, Universidad"
            />
          </div>
          <div>
            <Label htmlFor="madreOcupacion">Ocupación</Label>
            <Input
              id="madreOcupacion"
              value={datosPadres.madre.ocupacion}
              onChange={(e) =>
                handleTextInputChange(
                  setDatosPadres,
                  "madre.ocupacion",
                  e.target.value
                )
              }
              placeholder="Profesión u ocupación"
            />
          </div>
        </div>
      </div>

      <div>
        <h3 className="text-lg font-semibold mb-4">Datos del Padre</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="padreNombre">Nombre completo</Label>
            <Input
              id="padreNombre"
              value={datosPadres.padre.nombre}
              onChange={(e) =>
                handleTextInputChange(
                  setDatosPadres,
                  "padre.nombre",
                  e.target.value
                )
              }
              placeholder="Nombre y apellidos"
            />
          </div>
          <div>
            <Label htmlFor="padreEdad">Edad</Label>
            <Input
              id="padreEdad"
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
            <Label htmlFor="padreCelular">Celular</Label>
            <Input
              id="padreCelular"
              value={datosPadres.padre.celular}
              onChange={(e) =>
                setDatosPadres({
                  ...datosPadres,
                  padre: { ...datosPadres.padre, celular: e.target.value },
                })
              }
              placeholder="Número de celular"
            />
          </div>
          <div>
            <Label htmlFor="padreEmail">Email</Label>
            <Input
              id="padreEmail"
              type="email"
              value={datosPadres.padre.email}
              onChange={(e) =>
                setDatosPadres({
                  ...datosPadres,
                  padre: { ...datosPadres.padre, email: e.target.value },
                })
              }
              placeholder="Correo electrónico"
            />
          </div>
          <div>
            <Label htmlFor="padreGradoEscolar">Grado escolar</Label>
            <Input
              id="padreGradoEscolar"
              value={datosPadres.padre.gradoEscolar}
              onChange={(e) =>
                handleTextInputChange(
                  setDatosPadres,
                  "padre.gradoEscolar",
                  e.target.value
                )
              }
              placeholder="Ej: Primaria, Secundaria, Universidad"
            />
          </div>
          <div>
            <Label htmlFor="padreOcupacion">Ocupación</Label>
            <Input
              id="padreOcupacion"
              value={datosPadres.padre.ocupacion}
              onChange={(e) =>
                handleTextInputChange(
                  setDatosPadres,
                  "padre.ocupacion",
                  e.target.value
                )
              }
              placeholder="Profesión u ocupación"
            />
          </div>
        </div>
      </div>
    </div>
  );

  const renderStep3 = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-4">Datos Escolares</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="institucion">Institución educativa</Label>
            <Input
              id="institucion"
              value={datosEscolares.institucion}
              onChange={(e) =>
                handleTextInputChange(
                  setDatosEscolares,
                  "institucion",
                  e.target.value
                )
              }
              placeholder="Nombre del colegio"
            />
          </div>
          <div>
            <Label htmlFor="telefono">Teléfono</Label>
            <Input
              id="telefono"
              value={datosEscolares.telefono}
              onChange={(e) =>
                setDatosEscolares({
                  ...datosEscolares,
                  telefono: e.target.value,
                })
              }
              placeholder="Teléfono del colegio"
            />
          </div>
          <div className="md:col-span-2">
            <Label htmlFor="direccion">Dirección</Label>
            <Input
              id="direccion"
              value={datosEscolares.direccion}
              onChange={(e) =>
                handleTextInputChange(
                  setDatosEscolares,
                  "direccion",
                  e.target.value
                )
              }
              placeholder="Dirección del colegio"
            />
          </div>
          <div>
            <Label htmlFor="nivelEscolar">Nivel escolar</Label>
            <Input
              id="nivelEscolar"
              value={datosEscolares.nivelEscolar}
              onChange={(e) =>
                handleTextInputChange(
                  setDatosEscolares,
                  "nivelEscolar",
                  e.target.value
                )
              }
              placeholder="Ej: Inicial, Primaria, Secundaria"
            />
          </div>
          <div>
            <Label htmlFor="maestra">Maestra/o</Label>
            <Input
              id="maestra"
              value={datosEscolares.maestra}
              onChange={(e) =>
                handleTextInputChange(
                  setDatosEscolares,
                  "maestra",
                  e.target.value
                )
              }
              placeholder="Nombre de la maestra/o"
            />
          </div>
        </div>
      </div>
    </div>
  );

  const renderStep4 = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-4">Historial Familiar</h3>
        <p className="text-sm text-muted-foreground mb-4">
          Información sobre otros hijos en la familia
        </p>
        {hijos.map((hijo, index) => (
          <Card key={hijo.id} className="mb-4">
            <CardContent className="pt-6">
              <div className="flex justify-between items-center mb-4">
                <h4 className="font-medium">Hijo {index + 1}</h4>
                {hijos.length > 1 && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      setHijos(hijos.filter((_, i) => i !== index))
                    }
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                )}
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor={`hijo-nombre-${index}`}>Nombre</Label>
                  <Input
                    id={`hijo-nombre-${index}`}
                    value={hijo.nombre}
                    onChange={(e) => {
                      const newHijos = [...hijos];
                      newHijos[index].nombre = capitalizeText(e.target.value);
                      setHijos(newHijos);
                    }}
                    placeholder="Nombre completo"
                  />
                </div>
                <div>
                  <Label htmlFor={`hijo-fecha-${index}`}>
                    Fecha de nacimiento
                  </Label>
                  <Input
                    id={`hijo-fecha-${index}`}
                    type="date"
                    value={hijo.fechaNacimiento}
                    onChange={(e) => {
                      const newHijos = [...hijos];
                      newHijos[index].fechaNacimiento = e.target.value;
                      setHijos(newHijos);
                    }}
                  />
                </div>
                <div>
                  <Label htmlFor={`hijo-grado-${index}`}>Grado escolar</Label>
                  <Input
                    id={`hijo-grado-${index}`}
                    value={hijo.gradoEscolar}
                    onChange={(e) => {
                      const newHijos = [...hijos];
                      newHijos[index].gradoEscolar = capitalizeText(
                        e.target.value
                      );
                      setHijos(newHijos);
                    }}
                    placeholder="Grado escolar"
                  />
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id={`hijo-problemas-${index}`}
                    checked={hijo.problemas}
                    onCheckedChange={(checked) => {
                      const newHijos = [...hijos];
                      newHijos[index].problemas = checked as boolean;
                      setHijos(newHijos);
                    }}
                  />
                  <Label htmlFor={`hijo-problemas-${index}`}>
                    ¿Tiene problemas?
                  </Label>
                </div>
                {hijo.problemas && (
                  <div className="md:col-span-2">
                    <Label htmlFor={`hijo-descripcion-${index}`}>
                      Descripción de problemas
                    </Label>
                    <Textarea
                      id={`hijo-descripcion-${index}`}
                      value={hijo.descripcionProblemas}
                      onChange={(e) => {
                        const newHijos = [...hijos];
                        newHijos[index].descripcionProblemas = capitalizeText(
                          e.target.value
                        );
                        setHijos(newHijos);
                      }}
                      placeholder="Describa los problemas que presenta"
                    />
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
        <Button
          type="button"
          variant="outline"
          onClick={() =>
            setHijos([
              ...hijos,
              {
                id: Date.now().toString(),
                nombre: "",
                fechaNacimiento: "",
                gradoEscolar: "",
                problemas: false,
                descripcionProblemas: "",
              },
            ])
          }
          className="w-full"
        >
          <Plus className="h-4 w-4 mr-2" />
          Agregar otro hijo
        </Button>
      </div>
    </div>
  );

  const renderStep5 = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-4">Motivos de Consulta</h3>
        <p className="text-sm text-muted-foreground mb-4">
          Seleccione todos los motivos que apliquen
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[
            { key: "problemasAtencion", label: "Problemas de atención" },
            {
              key: "problemasComportamiento",
              label: "Problemas de comportamiento",
            },
            { key: "dificultadesLenguaje", label: "Dificultades de lenguaje" },
            {
              key: "dificultadesAprendizaje",
              label: "Dificultades de aprendizaje",
            },
            { key: "retrasoMotor", label: "Retraso motor" },
            {
              key: "problemasCoordinacion",
              label: "Problemas de coordinación",
            },
            {
              key: "dificultadesInteraccion",
              label: "Dificultades de interacción",
            },
            {
              key: "indicadoresComportamiento",
              label: "Indicadores de comportamiento",
            },
            { key: "dificultadesSueno", label: "Dificultades de sueño" },
            {
              key: "dificultadesAlimentacion",
              label: "Dificultades de alimentación",
            },
            {
              key: "dificultadesControl",
              label: "Dificultades de control",
            },
            {
              key: "dificultadesAutonomia",
              label: "Dificultades de autonomía",
            },
            { key: "sensibilidadEstimulos", label: "Sensibilidad a estímulos" },
            { key: "bajaAutoestima", label: "Baja autoestima" },
            { key: "diagnosticoPrevio", label: "Diagnóstico previo" },
            { key: "otro", label: "Otro" },
            { key: "necesitaOrientacion", label: "Necesita orientación" },
            { key: "noSeguroDificultad", label: "No seguro de la dificultad" },
            { key: "quiereValoracion", label: "Quiere valoración" },
            { key: "derivacionColegio", label: "Derivación del colegio" },
            { key: "evaluacionReciente", label: "Evaluación reciente" },
            { key: "evaluacionMedica", label: "Evaluación médica" },
          ].map(({ key, label }) => (
            <div key={key} className="flex items-center space-x-2">
              <Checkbox
                id={key}
                checked={
                  motivosConsulta[
                    key as keyof ConsultationReasonsData
                  ] as boolean
                }
                onCheckedChange={(checked) =>
                  setMotivosConsulta({
                    ...motivosConsulta,
                    [key]: checked,
                  })
                }
              />
              <Label htmlFor={key} className="text-sm">
                {label}
              </Label>
            </div>
          ))}
        </div>
        <div className="mt-6">
          <Label htmlFor="quienDeriva">¿Quién deriva al niño?</Label>
          <Input
            id="quienDeriva"
            value={motivosConsulta.quienDeriva}
            onChange={(e) =>
              setMotivosConsulta({
                ...motivosConsulta,
                quienDeriva: capitalizeText(e.target.value),
              })
            }
            placeholder="Ej: Pediatra, Maestra, Psicólogo, etc."
          />
        </div>
      </div>
    </div>
  );

  const nextStep = () => {
    setCurrentStep(currentStep + 1);
    setErrors({});
  };

  const prevStep = () => {
    setCurrentStep(currentStep - 1);
    setErrors({});
  };

  const renderCurrentStep = () => {
    switch (currentStep) {
      case 1:
        return renderStep1();
      case 2:
        return renderStep2();
      case 3:
        return renderStep3();
      case 4:
        return renderStep4();
      case 5:
        return renderStep5();
      default:
        return renderStep1();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button onClick={() => setIsOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Crear Solicitud de Consulta
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center">
            <Heart className="h-5 w-5 mr-2 text-red-500" />
            Crear Nueva Solicitud de Consulta
          </DialogTitle>
          <DialogDescription>
            Complete el formulario para crear una nueva solicitud de consulta
            desde el panel administrativo.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Progress indicator */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              {[1, 2, 3, 4, 5].map((step) => (
                <div
                  key={step}
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                    step <= currentStep
                      ? "bg-blue-600 text-white"
                      : "bg-gray-200 text-gray-600"
                  }`}
                >
                  {step}
                </div>
              ))}
            </div>
            <Button variant="ghost" size="sm" onClick={() => setIsOpen(false)}>
              <X className="h-4 w-4" />
            </Button>
          </div>

          {/* Step content */}
          {renderCurrentStep()}

          {/* Navigation buttons */}
          <div className="flex justify-between pt-4">
            <Button
              variant="outline"
              onClick={prevStep}
              disabled={currentStep === 1}
            >
              Anterior
            </Button>
            <div className="flex space-x-2">
              {currentStep < 5 ? (
                <Button onClick={nextStep}>Siguiente</Button>
              ) : (
                <Button
                  onClick={handleSubmit}
                  disabled={createConsultationRequest.isPending}
                >
                  {createConsultationRequest.isPending
                    ? "Creando..."
                    : "Crear Solicitud"}
                </Button>
              )}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
