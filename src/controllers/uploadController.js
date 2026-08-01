function getPublicBaseUrl(req) {
  const configured = process.env.PUBLIC_BASE_URL?.trim();
  if (configured) {
    return configured.replace(/\/$/, "");
  }

  const forwardedProto = req.get("x-forwarded-proto")?.split(",")[0]?.trim();
  const forwardedHost = req.get("x-forwarded-host")?.split(",")[0]?.trim();

  const protocol = forwardedProto || req.protocol || "http";
  const host = forwardedHost || req.get("host");

  return `${protocol}://${host}`;
}

export function handleImageUpload(req, res) {
  const files = req.files ?? [];

  if (!files.length) {
    return res.status(400).json({ message: "No files received" });
  }

  const baseUrl = getPublicBaseUrl(req);

  const images = files.map((file) => ({
    filename: file.filename,
    url: `${baseUrl}/uploads/${file.filename}`,
    mimetype: file.mimetype,
    size: file.size,
  }));

  return res.status(201).json({ images });
}
