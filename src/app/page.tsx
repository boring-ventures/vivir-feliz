"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Heart,
  Brain,
  BrainCircuit,
  MessageCircle,
  Activity,
  Users,
  Star,
  Phone,
  Mail,
  MapPin,
  Clock,
  Stethoscope,
  Accessibility,
  Puzzle,
  ArrowRight,
} from "lucide-react";
import Link from "next/link";
import { useAuth } from "@/providers/auth-provider";
import Header from "@/components/views/landing-page/Header";

export default function LandingPage() {
  const [selectedService, setSelectedService] = useState<
    "consulta" | "entrevista" | null
  >(null);
  const { user, isLoading } = useAuth();

  const services = [
    {
      icon: Users,
      title: "Psicología Infantil",
      description:
        "Evaluación y tratamiento especializado para el desarrollo emocional y cognitivo",
    },
    {
      icon: MessageCircle,
      title: "Fonoaudiología",
      description:
        "Terapia del lenguaje y comunicación para mejorar las habilidades verbales",
    },
    {
      icon: Activity,
      title: "Terapia Ocupacional",
      description:
        "Desarrollo de habilidades motoras y de integración sensorial",
    },
    {
      icon: Heart,
      title: "Fisioterapia",
      description: "Rehabilitación física y desarrollo motor para niños",
    },
    {
      icon: Star,
      title: "Psicopedagogía",
      description: "Apoyo en dificultades de aprendizaje y rendimiento escolar",
    },
    {
      icon: Brain,
      title: "Neuropsicología",
      description: "Evaluación y rehabilitación de funciones cognitivas",
    },
    // Additional specialties (excluding Coordination roles)
    {
      icon: Puzzle,
      title: "Terapia para TEA",
      description:
        "Intervención especializada en habilidades sociales, comunicación y conductas adaptativas",
    },
    {
      icon: Accessibility,
      title: "Psicomotricidad",
      description:
        "Trabajo corporal para mejorar el equilibrio, la coordinación y la planificación motora",
    },
    {
      icon: Stethoscope,
      title: "Kinesiología Pediátrica",
      description:
        "Rehabilitación motora y respiratoria enfocada en población infantil",
    },
    {
      icon: BrainCircuit,
      title: "Terapia Conductual",
      description:
        "Apoyo en regulación emocional y modificación de conductas para favorecer la autonomía",
    },
  ];

  const testimonials = [
    {
      name: "María González",
      text: "Mi hijo mejoró muchísimo con el tratamiento. El equipo es muy profesional y dedicado.",
      rating: 5,
    },
    {
      name: "Carlos Pérez",
      text: "Excelente atención. Los terapeutas son muy pacientes y comprensivos con los niños.",
      rating: 5,
    },
    {
      name: "Ana López",
      text: "Recomiendo totalmente Vivir Feliz. Han ayudado mucho a mi hija con sus dificultades de aprendizaje.",
      rating: 5,
    },
  ];

  const process = [
    {
      step: 1,
      title: "Agenda tu consulta",
      description:
        "Selecciona el tipo de atención y horario que mejor te convenga",
    },
    {
      step: 2,
      title: "Evaluación especializada",
      description: "Nuestros profesionales realizan una evaluación integral",
    },
    {
      step: 3,
      title: "Propuesta personalizada",
      description:
        "Recibe un plan de tratamiento adaptado a las necesidades específicas",
    },
    {
      step: 4,
      title: "Inicio de tratamiento",
      description: "Comenzamos el proceso terapéutico con seguimiento continuo",
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      <Header setSelectedService={setSelectedService} />

      {/* Hero Section */}
      <section id="inicio" className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto text-center">
          <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
            Atención Especializada
            <span className="block text-blue-600">para Niños</span>
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
            Ayudamos a tu hijo a alcanzar su máximo potencial a través de
            terapias especializadas y un enfoque integral del desarrollo
            infantil
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              size="lg"
              className="bg-blue-600 hover:bg-blue-700 text-lg px-8 py-3"
              onClick={() => setSelectedService("consulta")}
            >
              AGENDAR CONSULTA AHORA
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="text-lg px-8 py-3"
              onClick={() =>
                document
                  .getElementById("servicios")
                  ?.scrollIntoView({ behavior: "smooth" })
              }
            >
              Ver Servicios
            </Button>
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section id="servicios" className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Nuestras Especialidades
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Contamos con un equipo multidisciplinario de profesionales
              especializados en el desarrollo infantil
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:flex lg:flex-wrap lg:justify-center">
            {services.map((service, index) => (
              <Card
                key={index}
                className="hover:shadow-lg transition-shadow w-full max-w-sm lg:max-w-none lg:basis-1/4"
              >
                <CardHeader>
                  <service.icon className="h-12 w-12 text-blue-600 mb-4" />
                  <CardTitle className="text-xl">{service.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-gray-600">
                    {service.description}
                  </CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Process Section */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Proceso de Atención
            </h2>
            <p className="text-xl text-gray-600">
              Un proceso simple y efectivo para el cuidado de tu hijo
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {process.map((item, index) => (
              <div key={index} className="text-center">
                <div className="bg-blue-600 text-white rounded-full w-12 h-12 flex items-center justify-center text-xl font-bold mx-auto mb-4">
                  {item.step}
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  {item.title}
                </h3>
                <p className="text-gray-600">{item.description}</p>
                {index < process.length - 1 && (
                  <ArrowRight className="h-6 w-6 text-blue-600 mx-auto mt-4 hidden lg:block" />
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Lo que dicen nuestros padres
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <Card key={index} className="bg-white">
                <CardContent className="p-6">
                  <div className="flex mb-4">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star
                        key={i}
                        className="h-5 w-5 text-yellow-400 fill-current"
                      />
                    ))}
                  </div>
                  <p className="text-gray-600 mb-4">
                    &ldquo;{testimonial.text}&rdquo;
                  </p>
                  <p className="font-semibold text-gray-900">
                    - {testimonial.name}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section id="contacto" className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Contáctanos
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <Phone className="h-12 w-12 text-blue-600 mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">Teléfono</h3>
              <p className="text-gray-600">+591-4-123-4567</p>
            </div>
            <div className="text-center">
              <Mail className="h-12 w-12 text-blue-600 mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">Email</h3>
              <p className="text-gray-600">info@vivirfeliz.com</p>
            </div>
            <div className="text-center">
              <MapPin className="h-12 w-12 text-blue-600 mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">Dirección</h3>
              <p className="text-gray-600">Av. América #123, Cochabamba</p>
            </div>
          </div>
          <div className="text-center mt-12">
            <div className="flex items-center justify-center space-x-2 text-gray-600 mb-4">
              <Clock className="h-5 w-5" />
              <span>Horarios de Atención</span>
            </div>
            <p className="text-gray-600">Lunes a Viernes: 8:00 AM - 6:00 PM</p>
            <p className="text-gray-600">Sábados: 9:00 AM - 1:00 PM</p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <Heart className="h-8 w-8 text-blue-400" />
                <span className="text-2xl font-bold">Vivir Feliz</span>
              </div>
              <p className="text-gray-400">
                Centro especializado en terapias infantiles para el desarrollo
                integral de los niños.
              </p>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-4">Servicios</h3>
              <ul className="space-y-2 text-gray-400">
                <li>Psicología Infantil</li>
                <li>Fonoaudiología</li>
                <li>Terapia Ocupacional</li>
                <li>Fisioterapia</li>
              </ul>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-4">Contacto</h3>
              <ul className="space-y-2 text-gray-400">
                <li>+591-4-123-4567</li>
                <li>info@vivirfeliz.com</li>
                <li>Av. América #123</li>
                <li>Cochabamba, Bolivia</li>
              </ul>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-4">Horarios</h3>
              <ul className="space-y-2 text-gray-400">
                <li>Lun - Vie: 8:00 AM - 6:00 PM</li>
                <li>Sábados: 9:00 AM - 1:00 PM</li>
                <li>Domingos: Cerrado</li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-8 pt-8 text-center">
            <p className="text-gray-400">
              © 2025 Vivir Feliz. Todos los derechos reservados.
            </p>
            <div className="flex justify-center space-x-4 mt-2">
              {!isLoading && !user && (
                <Link
                  href="/sign-in"
                  className="text-blue-400 hover:text-blue-300 text-sm inline-block"
                >
                  Iniciar Sesión
                </Link>
              )}
              {!isLoading && user && (
                <Link
                  href="/dashboard"
                  className="text-blue-400 hover:text-blue-300 text-sm inline-block"
                >
                  Ir al Dashboard
                </Link>
              )}
            </div>
          </div>
        </div>
      </footer>

      {/* Modal de Selección de Tipo de Cita */}
      {selectedService && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full p-6">
            <h2 className="text-2xl font-bold text-center mb-6">
              ¿Qué tipo de atención necesitas?
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card className="cursor-pointer hover:shadow-lg transition-shadow border-2 hover:border-blue-500">
                <CardHeader className="text-center">
                  <CardTitle className="text-xl">CONSULTA</CardTitle>
                </CardHeader>
                <CardContent className="text-center">
                  <p className="text-gray-600 mb-4">
                    Primera visita
                    <br />
                    Evaluación inicial
                  </p>
                  <Badge variant="secondary" className="text-lg px-4 py-2 mb-4">
                    Bs. 250
                  </Badge>
                  <Link href="/schedule/appointment">
                    <Button className="w-full bg-blue-600 hover:bg-blue-700">
                      SELECCIONAR
                    </Button>
                  </Link>
                </CardContent>
              </Card>

              <Card className="cursor-pointer hover:shadow-lg transition-shadow border-2 hover:border-blue-500">
                <CardHeader className="text-center">
                  <CardTitle className="text-xl">ENTREVISTA</CardTitle>
                </CardHeader>
                <CardContent className="text-center">
                  <p className="text-gray-600 mb-4">
                    Con derivación del colegio
                    <br />
                    derivación médica o diagnóstico emitido en los últimos 6
                    meses
                  </p>
                  <div className="mb-4 h-10"></div>{" "}
                  {/* Espacio para mantener la alineación */}
                  <Link href="/schedule/interview">
                    <Button className="w-full bg-blue-600 hover:bg-blue-700">
                      SELECCIONAR
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            </div>
            <div className="text-center mt-6">
              <Button
                variant="outline"
                onClick={() => setSelectedService(null)}
              >
                Cancelar
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
