import { useQuery } from "@tanstack/react-query";

export interface ParentObjective {
  id: string;
  patientId: string;
  patientName: string;
  therapistId: string;
  therapistName: string;
  proposalId: string | null;
  name: string;
  status: "COMPLETED" | "IN_PROGRESS" | "PAUSED" | "CANCELLED" | "PENDING";
  type: string | null;
  progressPercentage: number;
  createdAt: string;
  updatedAt: string;
  progressEntries: ParentObjectiveProgress[];
}

export interface ParentObjectiveProgress {
  id: string;
  objectiveId: string;
  appointmentId: string;
  therapistId: string;
  percentage: number;
  comment: string | null;
  createdAt: string;
  updatedAt: string;
  appointment: {
    id: string;
    date: string;
    startTime: string;
    endTime: string;
  };
}

export interface ParentSessionNote {
  id: string;
  appointmentId: string;
  therapistId: string;
  therapistName: string;
  patientName: string;
  sessionComment: string;
  parentMessage: string | null;
  appointmentDate: string;
  createdAt: string;
  updatedAt: string;
}

export interface ParentProgressResponse {
  objectives: ParentObjective[];
  sessionNotes: ParentSessionNote[];
  evaluations: ParentEvaluation[];
}

export interface ParentEvaluation {
  id: string;
  patientId: string;
  patientName: string;
  area: string;
  score: number;
  maxScore: number;
  percentage: number;
  date: string;
  therapistName: string;
}

export const useParentProgress = () => {
  return useQuery<ParentProgressResponse>({
    queryKey: ["parent-progress"],
    queryFn: async () => {
      const response = await fetch("/api/parent/progress");
      if (!response.ok) {
        throw new Error("Failed to fetch parent progress");
      }
      return response.json();
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchOnWindowFocus: false,
  });
};
