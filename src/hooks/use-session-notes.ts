import { useMutation, useQueryClient } from "@tanstack/react-query";

interface SessionNoteData {
  appointmentId: string;
  sessionComment: string;
  parentMessage?: string;
}

interface SessionNoteResponse {
  message: string;
  sessionNote: {
    id: string;
    appointmentId: string;
    therapistId: string;
    sessionComment: string;
    parentMessage: string | null;
    createdAt: string;
    updatedAt: string;
  };
}

export function useCreateSessionNote() {
  const queryClient = useQueryClient();

  return useMutation<SessionNoteResponse, Error, SessionNoteData>({
    mutationFn: async (data: SessionNoteData) => {
      const response = await fetch("/api/therapist/session-notes", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to save session note");
      }

      return response.json();
    },
    onSuccess: () => {
      // Invalidate therapist patients data to refresh the comments
      queryClient.invalidateQueries({ queryKey: ["therapist-patients"] });
    },
  });
}
