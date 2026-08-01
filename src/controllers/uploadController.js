import { uploadBuffer } from "../lib/cloudinary.js";

export async function handleImageUpload(req, res) {
  const files = req.files ?? [];

  if (!files.length) {
    return res.status(400).json({ message: "No files received" });
  }

  const folder = process.env.CLOUDINARY_FOLDER || "craigpets";
  const images = [];

  try {
    for (const file of files) {
      const result = await uploadBuffer(file.buffer, {
        folder,
        resource_type: "image",
      });

      images.push({
        filename: result.public_id,
        url: result.secure_url,
        mimetype: file.mimetype,
        size: file.size,
      });
    }
  } catch (err) {
    console.error("Cloudinary upload error:", err);
    return res
      .status(502)
      .json({ message: "Image upload failed: " + err.message });
  }

  return res.status(201).json({ images });
}
