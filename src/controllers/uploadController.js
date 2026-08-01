import { v2 as cloudinary } from "cloudinary";

export async function handleImageUpload(req, res) {
  const files = req.files ?? [];

  if (!files.length) {
    return res.status(400).json({ message: "No files received" });
  }

  // Configure at request time — guarantees env vars are present regardless
  // of ES-module import order.
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
    secure: true,
  });

  const folder = process.env.CLOUDINARY_FOLDER || "craigpets";
  const images = [];

  try {
    for (const file of files) {
      // Use base64 data-URI upload — simpler and avoids stream-specific issues.
      const dataUri = `data:${file.mimetype};base64,${file.buffer.toString("base64")}`;

      const result = await cloudinary.uploader.upload(dataUri, {
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

