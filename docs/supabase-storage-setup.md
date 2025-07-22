# Supabase Storage Setup for Document Uploads

## Overview

This guide explains how to set up Supabase Storage to handle patient document uploads.

## Step 1: Create Storage Bucket

1. Go to your Supabase project dashboard
2. Navigate to **Storage** in the left sidebar
3. Click **Create a new bucket**
4. Configure the bucket:
   - **Name**: `documents`
   - **Public bucket**: ✅ Check this (for now, we'll add policies later)
   - **File size limit**: 10MB
   - **Allowed MIME types**: Leave empty (we'll handle validation in the app)

## Step 2: Storage Policies

Create the following policies for the `documents` bucket:

### Policy 1: Allow authenticated users to upload files

```sql
-- Policy name: "Allow authenticated uploads"
-- Operation: INSERT
-- Target roles: authenticated

CREATE POLICY "Allow authenticated uploads" ON storage.objects
FOR INSERT TO authenticated
WITH CHECK (bucket_id = 'documents');
```

### Policy 2: Allow users to view their own files

```sql
-- Policy name: "Allow users to view own files"
-- Operation: SELECT
-- Target roles: authenticated

CREATE POLICY "Allow users to view own files" ON storage.objects
FOR SELECT TO authenticated
USING (bucket_id = 'documents');
```

### Policy 3: Allow users to update their own files

```sql
-- Policy name: "Allow users to update own files"
-- Operation: UPDATE
-- Target roles: authenticated

CREATE POLICY "Allow users to update own files" ON storage.objects
FOR UPDATE TO authenticated
USING (bucket_id = 'documents');
```

### Policy 4: Allow users to delete their own files

```sql
-- Policy name: "Allow users to delete own files"
-- Operation: DELETE
-- Target roles: authenticated

CREATE POLICY "Allow users to delete own files" ON storage.objects
FOR DELETE TO authenticated
USING (bucket_id = 'documents');
```

## Step 3: Test the Setup

1. **Test Upload**: Try uploading a document through the therapist patients page
2. **Check Storage**: Verify the file appears in the `documents` bucket
3. **Check URL**: Verify the public URL works and the file is accessible

## Step 4: Advanced Policies (Optional)

For more granular control, you can create policies that check file paths:

```sql
-- Example: Only allow therapists to upload to their patient folders
CREATE POLICY "Allow therapist uploads to patient folders" ON storage.objects
FOR INSERT TO authenticated
WITH CHECK (
  bucket_id = 'documents'
  AND (storage.foldername(name))[1] = 'patient-documents'
);
```

## Troubleshooting

### Common Issues

1. **"Bucket not found" error**

   - Ensure the bucket name is exactly `documents`
   - Check that the bucket is created in the correct project

2. **"Permission denied" error**

   - Verify the storage policies are applied correctly
   - Check that the user is authenticated
   - Ensure the bucket is public or policies allow access

3. **"File too large" error**

   - Check the bucket's file size limit
   - Verify the file is under 10MB

4. **"Invalid file type" error**
   - This is handled by the application, not Supabase
   - Check the `UPLOAD_LIMITS.allowedTypes` in the code

### Testing Commands

You can test the storage setup using the Supabase CLI:

```bash
# List buckets
supabase storage list

# List files in documents bucket
supabase storage list documents

# Upload a test file
supabase storage upload documents test.pdf ./test.pdf
```

## Security Considerations

1. **File Validation**: Always validate files on both client and server
2. **Access Control**: Use policies to restrict access to authorized users
3. **File Scanning**: Consider implementing virus scanning for uploaded files
4. **Backup**: Set up regular backups of important documents
5. **Monitoring**: Monitor storage usage and set up alerts for unusual activity

## Next Steps

Once the storage is set up:

1. Test the upload functionality in the application
2. Implement document listing and management
3. Add file preview capabilities
4. Set up document deletion functionality
5. Implement access control based on patient-therapist relationships
