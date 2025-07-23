import { useQuery } from "@tanstack/react-query";

export interface ParentDocument {
  id: string;
  title: string;
  description: string;
  fileName: string;
  fileUrl: string;
  fileSize: number;
  fileSizeFormatted: string;
  fileType: string;
  documentType: string;
  patientName: string;
  therapistName: string;
  therapistSpecialty: string;
  uploadedAt: string;
  createdAt: string;
  updatedAt: string;
}

export interface ParentDocumentsResponse {
  documents: ParentDocument[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

interface FetchDocumentsParams {
  documentType?: string;
  page?: number;
  limit?: number;
}

export const useParentDocuments = (params: FetchDocumentsParams = {}) => {
  const searchParams = new URLSearchParams();

  if (params.documentType)
    searchParams.set("documentType", params.documentType);
  if (params.page) searchParams.set("page", params.page.toString());
  if (params.limit) searchParams.set("limit", params.limit.toString());

  return useQuery<ParentDocumentsResponse>({
    queryKey: ["parent-documents", params],
    queryFn: async () => {
      const response = await fetch(`/api/parent/documents?${searchParams}`);
      if (!response.ok) {
        throw new Error("Failed to fetch parent documents");
      }
      return response.json();
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchOnWindowFocus: false,
  });
};
