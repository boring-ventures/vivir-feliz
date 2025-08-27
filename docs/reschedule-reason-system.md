# Reschedule Reason System

## Overview

The reschedule reason system allows administrators to track and categorize why appointments are being rescheduled. This is particularly useful for understanding patterns in schedule changes and improving appointment management.

## Features

### 1. Reschedule Reason Field

- Added `rescheduleReason` field to the `Appointment` model
- Stores the reason for rescheduling appointments
- Optional field that can be filled during the reschedule process

### 2. Schedule Change Type Combobox

- Predefined categories for common schedule change reasons:
  - **Cambio de horario escolar** - School schedule changes
  - **Cambio de actividad extracurricular** - Extracurricular activity changes
  - **Cambio de horario de trabajo de los padres** - Parent work schedule changes
  - **Cambio de disponibilidad de transporte** - Transportation availability changes
  - **Otro compromiso familiar** - Other family commitments
  - **Otro motivo** - Other reasons

### 3. Automatic Reason Generation

- When a schedule change type is selected, the system automatically generates a formatted reason
- Format: "Cambio de horario regular: [selected_type]"
- Custom additional notes can be added for more details

### 4. UI Integration

#### Reschedule Modal

- New section for "Motivo de Reprogramación"
- Combobox for schedule change types
- Text input for custom/additional reasons
- Validation ensures a reason is provided when not a schedule change

#### Appointment Details Modal

- New section showing reschedule information for RESCHEDULED appointments
- Displays the reason, original date, and new date
- Purple-themed section to distinguish from other information

#### Admin Appointments Table

- Shows reschedule reason in the date column for rescheduled appointments
- Displays under the "Reprogramada desde" information

## Database Changes

### Migration: `20250826192105_add_reschedule_reason`

```sql
ALTER TABLE "appointments" ADD COLUMN "reschedule_reason" TEXT;
```

### Schema Update

```prisma
model Appointment {
  // ... existing fields
  rescheduleReason     String?            @map("reschedule_reason")
  // ... other fields
}
```

## API Changes

### Reschedule Endpoint

- Updated `/api/admin/appointments/[appointmentId]/reschedule` to accept `rescheduleReason`
- Added validation for the new field
- Stores the reason in the database during reschedule

### Request Format

```json
{
  "newDate": "2025-01-15",
  "newStartTime": "10:00",
  "newEndTime": "11:00",
  "rescheduleReason": "Cambio de horario regular: cambio_horario_escuela"
}
```

## Usage

### For Regular Schedule Changes

1. Select the appropriate schedule change type from the combobox
2. Optionally add additional details in the reason field
3. The system will automatically format the reason

### For Other Reschedules

1. Leave the schedule change type empty or select "Otro motivo"
2. Fill in the custom reason field
3. The system will use the custom reason as provided

## Benefits

1. **Better Tracking**: Understand why appointments are being rescheduled
2. **Pattern Recognition**: Identify common reasons for schedule changes
3. **Improved Planning**: Better anticipate and accommodate schedule changes
4. **Communication**: Clear documentation of reschedule reasons for all parties
5. **Analytics**: Data for improving appointment scheduling processes

## Future Enhancements

- Analytics dashboard showing reschedule reason statistics
- Automated notifications based on reschedule reasons
- Integration with calendar systems for better scheduling
- Reports on schedule change patterns by patient/family
