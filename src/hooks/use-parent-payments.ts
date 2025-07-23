import { useQuery } from "@tanstack/react-query";

export interface ParentPayment {
  id: string;
  amount: number;
  paymentMethod: string;
  referenceNumber: string;
  status: string;
  paymentDate: string;
  confirmedAt?: string;
  notes: string;
  createdAt: string;
}

export interface ParentProposal {
  id: string;
  title: string;
  description: string;
  patientName: string;
  therapistName: string;
  therapistSpecialty: string;
  totalAmount: number;
  totalPaid: number;
  pendingAmount: number;
  paymentPercentage: number;
  status: string;
  totalSessions: number;
  sessionPrice: number;
  createdAt: string;
  updatedAt: string;
  payments: ParentPayment[];
}

export interface ParentPaymentsResponse {
  proposals: ParentProposal[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
  stats: {
    totalPaid: number;
    totalPending: number;
    totalProposals: number;
    activeProposals: number;
  };
}

interface FetchPaymentsParams {
  page?: number;
  limit?: number;
}

export const useParentPayments = (params: FetchPaymentsParams = {}) => {
  const searchParams = new URLSearchParams();

  if (params.page) searchParams.set("page", params.page.toString());
  if (params.limit) searchParams.set("limit", params.limit.toString());

  return useQuery<ParentPaymentsResponse>({
    queryKey: ["parent-payments", params],
    queryFn: async () => {
      const response = await fetch(`/api/parent/payments?${searchParams}`);
      if (!response.ok) {
        throw new Error("Failed to fetch parent payments");
      }
      return response.json();
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchOnWindowFocus: false,
  });
};
