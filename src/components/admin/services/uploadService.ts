export const uploadFileToCloudinary = async (
  file: File,
  folderName: string = "portfolio"
): Promise<string> => {
  const formDataUpload = new FormData();
  formDataUpload.append("file", file);
  formDataUpload.append("folder", folderName);

  const response = await fetch("/api/upload", {
    method: "POST",
    body: formDataUpload,
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || "Upload failed");
  }

  const { url } = await response.json();
  return url;
};
