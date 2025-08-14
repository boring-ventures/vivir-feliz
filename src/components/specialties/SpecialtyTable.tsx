"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, MoreHorizontal, Search, Edit, Trash2 } from "lucide-react";
import { Specialty } from "@/hooks/use-specialties";
import { format } from "date-fns";

interface SpecialtyTableProps {
  specialties: Specialty[];
  onEdit: (specialty: Specialty) => void;
  onDelete: (specialty: Specialty) => void;
  onAdd: () => void;
  isLoading?: boolean;
}

export const SpecialtyTable = ({
  specialties,
  onEdit,
  onDelete,
  onAdd,
  isLoading = false,
}: SpecialtyTableProps) => {
  const [searchTerm, setSearchTerm] = useState("");

  const filteredSpecialties = specialties.filter(
    (specialty) =>
      specialty.specialtyId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      specialty.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      specialty.description?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Specialties</CardTitle>
          <Button onClick={onAdd} disabled={isLoading}>
            <Plus className="h-4 w-4 mr-2" />
            Add Specialty
          </Button>
        </div>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder="Search specialties..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>ID</TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Description</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Created</TableHead>
              <TableHead className="w-[50px]">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8">
                  Loading specialties...
                </TableCell>
              </TableRow>
            ) : filteredSpecialties.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8">
                  {searchTerm
                    ? "No specialties found matching your search."
                    : "No specialties found."}
                </TableCell>
              </TableRow>
            ) : (
              filteredSpecialties.map((specialty) => (
                <TableRow key={specialty.id}>
                  <TableCell className="font-mono text-sm">
                    {specialty.specialtyId}
                  </TableCell>
                  <TableCell className="font-medium">
                    {specialty.name}
                  </TableCell>
                  <TableCell>
                    {specialty.description ? (
                      <span className="text-sm text-gray-600">
                        {specialty.description.length > 50
                          ? `${specialty.description.substring(0, 50)}...`
                          : specialty.description}
                      </span>
                    ) : (
                      <span className="text-sm text-gray-400">
                        No description
                      </span>
                    )}
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={specialty.isActive ? "default" : "secondary"}
                    >
                      {specialty.isActive ? "Active" : "Inactive"}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-sm text-gray-600">
                    {format(new Date(specialty.createdAt), "MMM dd, yyyy")}
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                          <span className="sr-only">Open menu</span>
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => onEdit(specialty)}>
                          <Edit className="mr-2 h-4 w-4" />
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => onDelete(specialty)}
                          className="text-red-600"
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
};
