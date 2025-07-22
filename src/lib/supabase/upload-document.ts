import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";

export interface UploadDocumentParams {
  file: File;
  patientId: string;
  therapistId: string;
}

export interface UploadDocumentResult {
  fileName: string;
  fileUrl: string;
  fileSize: number;
  fileType: string;
}

export async function uploadDocument({
  file,
  patientId,
  //therapistId,
}: UploadDocumentParams): Promise<UploadDocumentResult> {
  const supabase = createClientComponentClient();

  // Generate unique file name
  const fileExt = file.name.split(".").pop();
  const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
  const filePath = `documents/${patientId}/${fileName}`;

  // Upload file to Supabase Storage
  const { error } = await supabase.storage
    .from("documents")
    .upload(filePath, file);

  if (error) {
    throw new Error(`Error uploading file: ${error.message}`);
  }

  // Get public URL
  const {
    data: { publicUrl },
  } = supabase.storage.from("documents").getPublicUrl(filePath);

  return {
    fileName: file.name,
    fileUrl: publicUrl,
    fileSize: file.size,
    fileType: file.type,
  };
}
