import type { UserRole } from "@prisma/client";

export interface Profile {
  id: string;
  userId: string;
  avatarUrl?: string;
  phone?: string;
  acceptWhatsApp: boolean;
  createdAt: Date;
  updatedAt: Date;
  active: boolean;
  firstName?: string;
  lastName?: string;
  role: UserRole;
}
