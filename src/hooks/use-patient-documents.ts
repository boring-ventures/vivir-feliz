import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "@/components/ui/use-toast";
import type { PatientDocumentWithDetails } from "@/types/documents";

interface UsePatientDocumentsParams {
  patientId: string;
  therapistId?: string;
  enabled?: boolean;
}

interface UpdateDocumentParams {
  documentId: string;
  data: {
    title?: string;
    description?: string;
    documentType?: string;
  };
}

interface DeleteDocumentParams {
  documentId: string;
}

export function usePatientDocuments({
  patientId,
  therapistId,
  enabled = true,
}: UsePatientDocumentsParams) {
  const queryClient = useQueryClient();

  // Fetch documents
  const {
    data: documentsData,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ["patient-documents", patientId, therapistId],
    queryFn: async (): Promise<{ documents: PatientDocumentWithDetails[] }> => {
      const params = new URLSearchParams({ patientId });
      if (therapistId) {
        params.append("therapistId", therapistId);
      }

      const response = await fetch(`/api/patient-documents?${params}`);

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to fetch documents");
      }

      return response.json();
    },
    enabled: enabled && !!patientId,
  });

  // Update document
  const updateDocumentMutation = useMutation({
    mutationFn: async ({ documentId, data }: UpdateDocumentParams) => {
      const response = await fetch(
        `/api/therapist/patient-documents/${documentId}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(data),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to update document");
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["patient-documents", patientId],
      });
      toast({
        title: "Documento actualizado",
        description: "El documento se ha actualizado exitosamente",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description:
          error instanceof Error
            ? error.message
            : "Error al actualizar el documento",
        variant: "destructive",
      });
    },
  });

  // Delete document
  const deleteDocumentMutation = useMutation({
    mutationFn: async ({ documentId }: DeleteDocumentParams) => {
      const response = await fetch(
        `/api/therapist/patient-documents/${documentId}`,
        {
          method: "DELETE",
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to delete document");
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["patient-documents", patientId],
      });
      toast({
        title: "Documento eliminado",
        description: "El documento se ha eliminado exitosamente",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description:
          error instanceof Error
            ? error.message
            : "Error al eliminar el documento",
        variant: "destructive",
      });
    },
  });

  return {
    documents: documentsData?.documents || [],
    isLoading,
    error,
    refetch,
    updateDocument: updateDocumentMutation.mutateAsync,
    deleteDocument: deleteDocumentMutation.mutateAsync,
    isUpdating: updateDocumentMutation.isPending,
    isDeleting: deleteDocumentMutation.isPending,
  };
}
