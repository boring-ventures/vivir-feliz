# Admin Consultation Requests Management

## Overview

The admin page for managing consultation requests (`/admin/consultation-requests`) provides a comprehensive interface for administrators to view, filter, and manage all consultation appointment requests submitted through the website.

## Features

### 📊 Dashboard View

- **Complete list** of all consultation requests with pagination
- **Real-time search** by child name or parent names
- **Status filtering** (Pending, Scheduled, Completed, Cancelled)
- **Request counter** showing total number of requests

### 🔍 Detailed Information Display

Each request shows:

- **Child Information**: Name, age, gender, address, living situation
- **Parent Details**: Complete information for both mother and father (if provided)
- **School Data**: Institution, level, teacher, contact information
- **Family History**: Siblings and any reported problems
- **Consultation Reasons**: All selected reasons from the 22-option checklist
- **Referral Information**: Who referred the child to the center

### ⚙️ Request Management

- **Status Updates**: Change request status between Pending, Scheduled, Completed, Cancelled
- **Scheduling**: Set specific date and time for appointments
- **Notes**: Add internal notes for each request
- **Therapist Assignment**: Assign specific therapists to requests
- **Price Management**: Default cost is Bs. 250, can be modified

### 🎯 Quick Actions

- **View Details**: Complete modal with all submitted information
- **Edit Status**: Quick status changes with scheduling options
- **Filter & Search**: Find specific requests efficiently

## Access Instructions

### 1. Login as Admin

- Navigate to `/sign-in`
- Use admin credentials
- Must have ADMIN role in the system

### 2. Access from Dashboard

- Go to `/admin/dashboard`
- Click on "Ver Solicitudes de Consulta" in the Quick Access section

### 3. Direct Access

- Navigate directly to `/admin/consultation-requests`

## Usage Guide

### Viewing Requests

1. The main table shows all requests with key information
2. Use the search bar to find specific requests by name
3. Filter by status using the dropdown
4. Click the eye icon (👁) to view complete details

### Managing Request Status

1. Click the edit icon (✏️) on any request
2. Select new status from dropdown
3. For "Scheduled" status:
   - Set date and time
   - Optionally assign a therapist
4. Add notes if needed
5. Click "Guardar Cambios"

### Understanding Request Details

When viewing a request, you'll see:

- **Child data**: Complete profile including living situation
- **Parents**: Separate sections for mother and father with all details
- **School**: Educational institution information
- **Family history**: Other children in the family
- **Consultation reasons**: Specific concerns marked by parents
- **Pricing**: Current cost (Bs. 250 default)

## Status Workflow

1. **PENDING** (Pendiente): New requests awaiting review
2. **SCHEDULED** (Programada): Appointment date and time set
3. **COMPLETED** (Completada): Consultation finished
4. **CANCELLED** (Cancelada): Request cancelled for any reason

## Integration Points

- **Database**: Uses Prisma with PostgreSQL
- **Authentication**: Supabase Auth with role-based access
- **Real-time updates**: React Query for data synchronization
- **UI Components**: shadcn/ui component library
- **Form validation**: Comprehensive client and server-side validation

## API Endpoints

- `GET /api/consultation-requests` - Fetch requests with pagination and filtering
- `POST /api/consultation-requests` - Create new requests (from public form)
- `PATCH /api/consultation-requests/[id]` - Update request status and details

## Technical Stack

- **Frontend**: Next.js 15, React 19, TypeScript
- **Backend**: Next.js API Routes
- **Database**: Prisma ORM with PostgreSQL
- **Authentication**: Supabase Auth
- **UI**: TailwindCSS, shadcn/ui components
- **State Management**: TanStack React Query
- **Icons**: Lucide React

## Notes

- All data is validated both client and server-side
- The system maintains audit trails with created/updated timestamps
- Responsive design works on all device sizes
- Role-based access ensures only admins can view sensitive information
- Toast notifications provide feedback for all actions
