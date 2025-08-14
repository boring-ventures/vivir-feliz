"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
// Removed unused import: useToast
import {
  Specialty,
  CreateSpecialtyData,
  UpdateSpecialtyData,
} from "@/hooks/use-specialties";

const specialtySchema = z.object({
  specialtyId: z.string().min(1, "Specialty ID is required"),
  name: z.string().min(1, "Specialty name is required"),
  description: z.string().optional(),
  isActive: z.boolean().default(true),
});

type SpecialtyFormData = z.infer<typeof specialtySchema>;

interface SpecialtyFormProps {
  specialty?: Specialty;
  onSubmit: (data: CreateSpecialtyData | UpdateSpecialtyData) => void;
  onCancel: () => void;
  isLoading?: boolean;
}

export const SpecialtyForm = ({
  specialty,
  onSubmit,
  onCancel,
  isLoading = false,
}: SpecialtyFormProps) => {
  // Removed unused toast variable
  const [isActive, setIsActive] = useState(specialty?.isActive ?? true);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<SpecialtyFormData>({
    resolver: zodResolver(specialtySchema),
    defaultValues: {
      specialtyId: specialty?.specialtyId || "",
      name: specialty?.name || "",
      description: specialty?.description || "",
      isActive: specialty?.isActive ?? true,
    },
  });

  const handleFormSubmit = (data: SpecialtyFormData) => {
    onSubmit({
      ...data,
      isActive,
    });
  };

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle>
          {specialty ? "Edit Specialty" : "Create New Specialty"}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="specialtyId">Specialty ID</Label>
            <Input
              id="specialtyId"
              {...register("specialtyId")}
              placeholder="e.g., SPEECH_THERAPIST"
              className={errors.specialtyId ? "border-red-500" : ""}
            />
            {errors.specialtyId && (
              <p className="text-sm text-red-500">
                {errors.specialtyId.message}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="name">Name</Label>
            <Input
              id="name"
              {...register("name")}
              placeholder="Enter specialty name"
              className={errors.name ? "border-red-500" : ""}
            />
            {errors.name && (
              <p className="text-sm text-red-500">{errors.name.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description (Optional)</Label>
            <Textarea
              id="description"
              {...register("description")}
              placeholder="Enter specialty description"
              rows={3}
            />
          </div>

          <div className="flex items-center space-x-2">
            <Switch
              id="isActive"
              checked={isActive}
              onCheckedChange={setIsActive}
            />
            <Label htmlFor="isActive">Active</Label>
          </div>

          <div className="flex space-x-2 pt-4">
            <Button type="submit" disabled={isLoading} className="flex-1">
              {isLoading ? "Saving..." : specialty ? "Update" : "Create"}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
              disabled={isLoading}
            >
              Cancel
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};
