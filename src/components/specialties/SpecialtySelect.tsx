"use client";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useActiveSpecialties } from "@/hooks/use-specialties";

interface SpecialtySelectProps {
  value?: string;
  onValueChange: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
}

export const SpecialtySelect = ({
  value,
  onValueChange,
  placeholder = "Select a specialty",
  disabled = false,
}: SpecialtySelectProps) => {
  const { data: specialties = [], isLoading } = useActiveSpecialties();

  return (
    <Select
      value={value}
      onValueChange={onValueChange}
      disabled={disabled || isLoading}
    >
      <SelectTrigger>
        <SelectValue placeholder={isLoading ? "Loading..." : placeholder} />
      </SelectTrigger>
      <SelectContent>
        {specialties.map((specialty) => (
          <SelectItem key={specialty.id} value={specialty.id}>
            {specialty.name}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
};
