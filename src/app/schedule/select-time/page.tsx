"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  ArrowLeft,
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  Loader,
} from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import Header from "@/components/views/landing-page/Header";
import {
  useAvailableSlots,
  useBookAppointment,
} from "@/hooks/use-available-slots";
import { getSpecialtyLabelEs } from "@/lib/specialties";
import { useRequestStatus } from "@/hooks/use-request-status";

function SelectTimePageContent() {
  const [selectedDate, setSelectedDate] = useState<string>("");
  const [selectedTime, setSelectedTime] = useState<string>("");
  const [selectedTherapist, setSelectedTherapist] = useState<{
    id: string;
    name: string;
    specialty?: string;
  } | null>(null);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [requestData, setRequestData] = useState<{
    childName?: string;
    childFirstName?: string;
    childLastName?: string;
    parentName?: string;
    parentPhone?: string;
    parentEmail?: string;
    type?: string;
    isScheduled?: boolean;
    motivosConsulta?: Record<string, boolean>;
  } | null>(null);
  const [requestId, setRequestId] = useState<string>("");

  const router = useRouter();
  const searchParams = useSearchParams();
  const type = searchParams.get("type") || "consultation";

  const appointmentType = type === "interview" ? "INTERVIEW" : "CONSULTATION";

  // Helper function to format date without timezone issues
  const formatDateLocal = (date: Date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  // Helper function to create Date object from date string without timezone issues
  const createDateFromString = (dateString: string): Date => {
    const [year, month, day] = dateString.split("-").map(Number);
    return new Date(year, month - 1, day); // month is 0-indexed
  };

  // Calculate date range for fetching slots (current month)
  const startDate = formatDateLocal(
    new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1)
  );
  const endDate = formatDateLocal(
    new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0)
  );

  const {
    data: slotsData,
    isLoading,
    error,
  } = useAvailableSlots(
    appointmentType,
    startDate,
    endDate,
    type === "consultation" ? requestData?.motivosConsulta : undefined
  );
  const bookAppointment = useBookAppointment();

  // Check if the request is already scheduled
  const requestType = type === "interview" ? "interview" : "consultation";
  const { data: requestStatus } = useRequestStatus(requestId, requestType);

  useEffect(() => {
    // Load request data from sessionStorage
    const dataKey = type === "interview" ? "interviewData" : "consultaData";
    const savedData = sessionStorage.getItem(dataKey);
    const savedRequestId = sessionStorage.getItem(`${dataKey}_requestId`);

    if (savedData && savedRequestId) {
      const parsedData = JSON.parse(savedData);

      // Check if this request is already scheduled
      if (
        parsedData.isScheduled ||
        sessionStorage.getItem(`${dataKey}_scheduled`)
      ) {
        // Clear the session data and redirect to success page
        sessionStorage.removeItem(dataKey);
        sessionStorage.removeItem(`${dataKey}_requestId`);
        sessionStorage.removeItem(`${dataKey}_scheduled`);

        const successPath =
          type === "interview"
            ? "/schedule/interview/success"
            : "/schedule/appointment/success";
        router.push(successPath);
        return;
      }

      setRequestData(parsedData);
      setRequestId(savedRequestId);
    } else {
      // If no data found, redirect back to form
      router.push(
        type === "interview" ? "/schedule/interview" : "/schedule/appointment"
      );
    }
  }, [type, router]);

  // Check if request is already scheduled in database
  useEffect(() => {
    if (requestStatus && requestStatus.status === "SCHEDULED") {
      // Clear session data and redirect to success page
      const dataKey = type === "interview" ? "interviewData" : "consultaData";
      sessionStorage.removeItem(dataKey);
      sessionStorage.removeItem(`${dataKey}_requestId`);
      sessionStorage.removeItem(`${dataKey}_scheduled`);

      const successPath =
        type === "interview"
          ? "/schedule/interview/success"
          : "/schedule/appointment/success";
      router.push(successPath);
    }
  }, [requestStatus, type, router]);

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay(); // Sunday = 0, Monday = 1, etc.

    const days = [];

    // Previous month days
    for (let i = startingDayOfWeek; i > 0; i--) {
      const prevDate = new Date(year, month, 1 - i);
      days.push({
        date: prevDate.getDate(),
        isCurrentMonth: false,
        fullDate: formatDateLocal(prevDate),
      });
    }

    // Current month days
    for (let day = 1; day <= daysInMonth; day++) {
      const currentDate = new Date(year, month, day);
      const fullDate = formatDateLocal(currentDate);
      const hasSlots = (slotsData?.availableSlots?.[fullDate]?.length ?? 0) > 0;
      const isPast = currentDate < new Date(new Date().setHours(0, 0, 0, 0));

      days.push({
        date: day,
        isCurrentMonth: true,
        fullDate,
        hasSlots: hasSlots && !isPast,
        isPast,
      });
    }

    // Next month days
    const remainingDays = 42 - days.length;
    for (let day = 1; day <= remainingDays; day++) {
      const nextDate = new Date(year, month + 1, day);
      days.push({
        date: day,
        isCurrentMonth: false,
        fullDate: formatDateLocal(nextDate),
      });
    }

    return days;
  };

  const days = getDaysInMonth(currentMonth);

  const formatMonthYear = (date: Date) => {
    return date
      .toLocaleDateString("es-ES", { month: "long", year: "numeric" })
      .toUpperCase();
  };

  const prevMonth = () => {
    setCurrentMonth(
      new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1)
    );
    setSelectedDate("");
    setSelectedTime("");
    setSelectedTherapist(null);
  };

  const nextMonth = () => {
    setCurrentMonth(
      new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1)
    );
    setSelectedDate("");
    setSelectedTime("");
    setSelectedTherapist(null);
  };

  const handleDateClick = (fullDate: string, hasSlots: boolean) => {
    if (hasSlots) {
      setSelectedDate(fullDate);
      setSelectedTime("");
      setSelectedTherapist(null);
    }
  };

  const handleTimeClick = (
    time: string,
    therapistId: string,
    therapistName: string,
    therapistSpecialty?: string
  ) => {
    setSelectedTime(time);
    setSelectedTherapist({
      id: therapistId,
      name: therapistName,
      specialty: therapistSpecialty,
    });
  };

  const handleConfirm = async () => {
    if (selectedDate && selectedTime && selectedTherapist && requestId) {
      // For appointments (consultations), redirect to payment page
      if (type === "consultation") {
        // Store pending appointment details for payment page
        const pendingAppointment = {
          ...requestData,
          fecha: selectedDate,
          hora: selectedTime,
          tipo: type,
          therapist: selectedTherapist,
          requestId,
          appointmentType,
          appointmentDate: selectedDate,
          appointmentTime: selectedTime,
          therapistId: selectedTherapist.id,
        };

        sessionStorage.setItem(
          "pendingAppointment",
          JSON.stringify(pendingAppointment)
        );

        // Redirect to payment page
        router.push("/schedule/payment");
        return;
      }

      // For interviews, continue with direct booking (no payment required)
      try {
        const result = await bookAppointment.mutateAsync({
          appointmentType,
          appointmentDate: selectedDate,
          appointmentTime: selectedTime,
          therapistId: selectedTherapist.id,
          requestId,
        });

        // Store appointment details for success page
        const appointmentDetails = {
          ...requestData,
          fecha: selectedDate,
          hora: selectedTime,
          tipo: type,
          therapist: selectedTherapist,
          appointmentId: result.appointment.appointmentId,
          appointment: result.appointment,
        };

        sessionStorage.setItem(
          "appointmentDetails",
          JSON.stringify(appointmentDetails)
        );

        // Mark this request as scheduled and clear original data
        const dataKey = "interviewData";
        sessionStorage.setItem(`${dataKey}_scheduled`, "true");
        sessionStorage.removeItem(dataKey);
        sessionStorage.removeItem(`${dataKey}_requestId`);

        // Redirect to success page
        router.push("/schedule/interview/success");
      } catch (error) {
        console.error("Error booking appointment:", error);
      }
    }
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return "";
    const date = createDateFromString(dateString);
    return date.toLocaleDateString("es-ES", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  };

  const getAvailableSlots = () => {
    if (!selectedDate || !slotsData?.availableSlots?.[selectedDate]) return [];
    return slotsData.availableSlots[selectedDate];
  };

  const getMorningSlots = () => {
    return getAvailableSlots().filter((slot) => {
      const hour = parseInt(slot.time.split(":")[0]);
      return hour < 12;
    });
  };

  const getAfternoonSlots = () => {
    return getAvailableSlots().filter((slot) => {
      const hour = parseInt(slot.time.split(":")[0]);
      return hour >= 12;
    });
  };

  const getBackUrl = () => {
    return type === "interview"
      ? "/schedule/interview"
      : "/schedule/appointment";
  };

  const getTipoDisplay = () => {
    return type === "interview"
      ? "Entrevista con Derivación"
      : "Consulta Inicial";
  };

  const getCosto = () => {
    return type === "interview" ? "Bs. 300" : "Bs. 250";
  };

  if (!requestData) {
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
            <span>Volver al formulario</span>
          </Link>
        </div>

        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="text-2xl font-bold text-center">
              Seleccionar Fecha y Hora
            </CardTitle>
            <div className="text-center">
              <span className="text-gray-600">{getTipoDisplay()}</span>
              {type !== "interview" && (
                <>
                  <span className="text-gray-600"> - </span>
                  <span className="font-semibold text-blue-600">
                    {getCosto()}
                  </span>
                </>
              )}
            </div>
          </CardHeader>
          <CardContent className="p-6">
            {/* Error State */}
            {error && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-md">
                <p className="text-red-600">
                  Error al cargar horarios disponibles. Por favor, intenta
                  nuevamente.
                </p>
              </div>
            )}

            {/* Loading State */}
            {isLoading && (
              <div className="mb-6 flex items-center justify-center py-8">
                <Loader className="h-6 w-6 animate-spin mr-2" />
                <span className="text-gray-600">
                  Cargando horarios disponibles...
                </span>
              </div>
            )}

            {/* Calendar */}
            {!isLoading && !error && (
              <div className="mb-8">
                <div className="flex justify-between items-center mb-4">
                  <Button variant="outline" size="sm" onClick={prevMonth}>
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <h3 className="text-lg font-semibold">
                    {formatMonthYear(currentMonth)}
                  </h3>
                  <Button variant="outline" size="sm" onClick={nextMonth}>
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>

                <div className="grid grid-cols-7 gap-1 text-center">
                  <div className="text-sm font-medium text-gray-500">D</div>
                  <div className="text-sm font-medium text-gray-500">L</div>
                  <div className="text-sm font-medium text-gray-500">M</div>
                  <div className="text-sm font-medium text-gray-500">M</div>
                  <div className="text-sm font-medium text-gray-500">J</div>
                  <div className="text-sm font-medium text-gray-500">V</div>
                  <div className="text-sm font-medium text-gray-500">S</div>

                  {days.map((day, index) => (
                    <div
                      key={index}
                      className={cn(
                        "h-10 flex items-center justify-center rounded-md text-sm",
                        day.isCurrentMonth ? "text-gray-900" : "text-gray-400",
                        day.isPast && "text-gray-300 cursor-not-allowed",
                        day.hasSlots && day.isCurrentMonth && !day.isPast
                          ? "cursor-pointer hover:bg-blue-100 border border-blue-200"
                          : "cursor-not-allowed",
                        selectedDate === day.fullDate &&
                          "bg-blue-600 text-white hover:bg-blue-700"
                      )}
                      onClick={() =>
                        day.hasSlots &&
                        day.isCurrentMonth &&
                        !day.isPast &&
                        handleDateClick(day.fullDate, day.hasSlots)
                      }
                    >
                      {day.date}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Available Times */}
            {selectedDate && !isLoading && (
              <div className="space-y-6">
                <h3 className="text-lg font-semibold">
                  Horarios disponibles ({formatDate(selectedDate)})
                </h3>

                {/* Morning Slots */}
                {getMorningSlots().length > 0 && (
                  <div>
                    <h4 className="font-medium mb-2">MAÑANA</h4>
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
                      {getMorningSlots().map((slot) => (
                        <Button
                          key={`${slot.time}-${slot.therapistId}`}
                          variant={
                            selectedTime === slot.time &&
                            selectedTherapist?.id === slot.therapistId
                              ? "default"
                              : "outline"
                          }
                          className={cn(
                            "text-sm",
                            selectedTime === slot.time &&
                              selectedTherapist?.id === slot.therapistId
                              ? "bg-blue-600 hover:bg-blue-700"
                              : ""
                          )}
                          aria-label={`${slot.time} - ${slot.therapistName}${slot.therapistSpecialty ? `, ${getSpecialtyLabelEs(slot.therapistSpecialty)}` : ""}`}
                          onClick={() =>
                            handleTimeClick(
                              slot.time,
                              slot.therapistId,
                              slot.therapistName,
                              slot.therapistSpecialty
                            )
                          }
                        >
                          {slot.time}
                        </Button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Afternoon Slots */}
                {getAfternoonSlots().length > 0 && (
                  <div>
                    <h4 className="font-medium mb-2">TARDE</h4>
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
                      {getAfternoonSlots().map((slot) => (
                        <Button
                          key={`${slot.time}-${slot.therapistId}`}
                          variant={
                            selectedTime === slot.time &&
                            selectedTherapist?.id === slot.therapistId
                              ? "default"
                              : "outline"
                          }
                          className={cn(
                            "text-sm",
                            selectedTime === slot.time &&
                              selectedTherapist?.id === slot.therapistId
                              ? "bg-blue-600 hover:bg-blue-700"
                              : ""
                          )}
                          aria-label={`${slot.time} - ${slot.therapistName}${slot.therapistSpecialty ? `, ${getSpecialtyLabelEs(slot.therapistSpecialty)}` : ""}`}
                          onClick={() =>
                            handleTimeClick(
                              slot.time,
                              slot.therapistId,
                              slot.therapistName,
                              slot.therapistSpecialty
                            )
                          }
                        >
                          {slot.time}
                        </Button>
                      ))}
                    </div>
                  </div>
                )}

                {/* No slots available */}
                {getAvailableSlots().length === 0 && (
                  <div className="text-center py-6">
                    <p className="text-gray-500">
                      No hay horarios disponibles para esta fecha.
                    </p>
                    <p className="text-sm text-gray-400 mt-1">
                      Selecciona otra fecha.
                    </p>
                  </div>
                )}

                {/* Selected Time Display */}
                {selectedTime && selectedTherapist && (
                  <div className="mt-6 p-4 bg-blue-50 rounded-md">
                    <p className="font-medium">Horario Seleccionado:</p>
                    <p className="text-lg">
                      {formatDate(selectedDate)} - {selectedTime} hrs
                    </p>
                    <p className="text-sm text-gray-600">
                      Terapeuta: {selectedTherapist.name}
                      <span>
                        {" "}
                        - {getSpecialtyLabelEs(selectedTherapist.specialty)}
                      </span>
                    </p>
                    <p className="text-sm text-gray-600 mt-1">
                      {getTipoDisplay()}
                      {type !== "interview" && ` - ${getCosto()}`}
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* Navigation Buttons */}
            <div className="flex justify-between mt-8 pt-6 border-t">
              <Button variant="outline" onClick={() => router.back()}>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Atrás
              </Button>

              <Button
                onClick={handleConfirm}
                className="bg-blue-600 hover:bg-blue-700"
                disabled={
                  !selectedDate ||
                  !selectedTime ||
                  !selectedTherapist ||
                  bookAppointment.isPending
                }
              >
                {bookAppointment.isPending ? (
                  <>
                    <Loader className="h-4 w-4 mr-2 animate-spin" />
                    Agendando...
                  </>
                ) : (
                  <>
                    {type === "consultation"
                      ? "Continuar a Pago"
                      : "Confirmar Cita"}
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default function SelectTimePage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <Loader className="h-8 w-8 animate-spin mx-auto mb-4" />
            <p className="text-gray-600">Cargando...</p>
          </div>
        </div>
      }
    >
      <SelectTimePageContent />
    </Suspense>
  );
}
