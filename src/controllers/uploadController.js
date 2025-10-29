export function handleImageUpload(req, res) {
  const files = req.files ?? [];

  if (!files.length) {
    return res.status(400).json({ message: "No files received" });
  }

  const baseUrl = `${req.protocol}://${req.get("host")}`;

  const images = files.map((file) => ({
    filename: file.filename,
    url: `${baseUrl}/uploads/${file.filename}`,
    mimetype: file.mimetype,
    size: file.size,
  }));

  return res.status(201).json({ images });
}
