# Dual Proposal System

## Overview

The dual proposal system allows therapists to create two separate proposals (Proposal A and Proposal B) for the same patient consultation. This feature enables offering different treatment options to patients and their families.

## Features

### 1. Two Proposal Types

- **Proposal A**: Primary treatment option
- **Proposal B**: Alternative treatment option

### 2. Shared Components

- **Therapist Selection**: Both proposals use the same therapist selection for each service
- **Time Availability**: Both proposals share the same time availability settings
- **Patient Information**: Both proposals are for the same patient

### 3. Separate Service Selection

- Each proposal can have different services selected
- Services can be selected for Proposal A, Proposal B, or both
- Number of sessions is configurable per service

## Database Changes

### ProposalService Table

Added a new field `proposalType` to distinguish between proposals:

- `proposalType: "A"` for Proposal A services
- `proposalType: "B"` for Proposal B services

## UI Changes

### 1. Service Tables

- Removed the "Description" column to make room for proposal columns
- Added "Propuesta A" and "Propuesta B" columns with checkboxes
- Color-coded columns (blue for Proposal A, green for Proposal B)

### 2. Proposal Summary

- Real-time summary showing selected services for each proposal
- Session count calculation for each proposal
- Overall status indicator

### 3. Visual Indicators

- Color-coded headers and cells for easy identification
- Summary cards showing proposal status
- Service count indicators

## API Changes

### Request Structure

The API now accepts separate arrays for each proposal:

```typescript
{
  serviciosEvaluacionA: ServiceData[],
  serviciosTratamientoA: ServiceData[],
  serviciosEvaluacionB: ServiceData[],
  serviciosTratamientoB: ServiceData[]
}
```

### Database Storage

- Each service is stored with a `proposalType` field
- Services from both proposals are stored in the same table
- Proposal metadata is stored in the proposal notes

## Usage

1. **Select Services**: Choose services for Proposal A, Proposal B, or both
2. **Assign Therapists**: Select therapists for each service (shared between proposals)
3. **Set Time Availability**: Configure available time slots
4. **Review Summary**: Check the proposal summary before submitting
5. **Submit**: Send both proposals to the administrator

## Benefits

- **Flexibility**: Offer multiple treatment options
- **Comparison**: Easy to compare different approaches
- **Patient Choice**: Patients can choose between options
- **Efficiency**: Create both proposals in one session
