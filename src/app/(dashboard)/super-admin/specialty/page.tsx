"use client";

import { useState } from "react";
import { useToast } from "@/components/ui/use-toast";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { SpecialtyForm } from "@/components/specialties/SpecialtyForm";
import { SpecialtyTable } from "@/components/specialties/SpecialtyTable";
import {
  useSpecialties,
  useCreateSpecialty,
  useUpdateSpecialty,
  useDeleteSpecialty,
  Specialty,
  CreateSpecialtyData,
  UpdateSpecialtyData,
} from "@/hooks/use-specialties";

export default function SpecialtyManagementPage() {
  const { toast } = useToast();
  const [showForm, setShowForm] = useState(false);
  const [editingSpecialty, setEditingSpecialty] = useState<Specialty | null>(
    null
  );
  const [deletingSpecialty, setDeletingSpecialty] = useState<Specialty | null>(
    null
  );

  const { data: specialties = [], isLoading } = useSpecialties();
  const createSpecialty = useCreateSpecialty();
  const updateSpecialty = useUpdateSpecialty();
  const deleteSpecialty = useDeleteSpecialty();

  const handleAdd = () => {
    setEditingSpecialty(null);
    setShowForm(true);
  };

  const handleEdit = (specialty: Specialty) => {
    setEditingSpecialty(specialty);
    setShowForm(true);
  };

  const handleDelete = (specialty: Specialty) => {
    setDeletingSpecialty(specialty);
  };

  const handleFormSubmit = async (data: CreateSpecialtyData | UpdateSpecialtyData) => {
    try {
      if (editingSpecialty) {
        await updateSpecialty.mutateAsync({
          id: editingSpecialty.id,
          data,
        });
        toast({
          title: "Success",
          description: "Specialty updated successfully",
        });
      } else {
        await createSpecialty.mutateAsync(data);
        toast({
          title: "Success",
          description: "Specialty created successfully",
        });
      }
      setShowForm(false);
      setEditingSpecialty(null);
    } catch (error) {
      toast({
        title: "Error",
        description:
          error instanceof Error ? error.message : "Something went wrong",
        variant: "destructive",
      });
    }
  };

  const handleFormCancel = () => {
    setShowForm(false);
    setEditingSpecialty(null);
  };

  const handleConfirmDelete = async () => {
    if (!deletingSpecialty) return;

    try {
      await deleteSpecialty.mutateAsync(deletingSpecialty.id);
      toast({
        title: "Success",
        description: "Specialty deleted successfully",
      });
      setDeletingSpecialty(null);
    } catch (error) {
      toast({
        title: "Error",
        description:
          error instanceof Error ? error.message : "Something went wrong",
        variant: "destructive",
      });
    }
  };

  const handleCancelDelete = () => {
    setDeletingSpecialty(null);
  };

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">
          Specialty Management
        </h1>
        <p className="text-muted-foreground">
          Manage therapist specialties and their availability.
        </p>
      </div>

      <div className="grid gap-6">
        <SpecialtyTable
          specialties={specialties}
          onEdit={handleEdit}
          onDelete={handleDelete}
          onAdd={handleAdd}
          isLoading={isLoading}
        />
      </div>

      {/* Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-background p-6 rounded-lg shadow-lg max-w-md w-full mx-4">
            <SpecialtyForm
              specialty={editingSpecialty || undefined}
              onSubmit={handleFormSubmit}
              onCancel={handleFormCancel}
              isLoading={createSpecialty.isPending || updateSpecialty.isPending}
            />
          </div>
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!deletingSpecialty} onOpenChange={handleCancelDelete}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the{" "}
              <strong>{deletingSpecialty?.name}</strong> specialty.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmDelete}
              className="bg-red-600 hover:bg-red-700"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
