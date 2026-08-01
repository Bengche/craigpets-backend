import crypto from "crypto";

function signUploadParams(params, apiSecret) {
  const sorted = Object.keys(params)
    .sort()
    .map((k) => `${k}=${params[k]}`)
    .join("&");
  return crypto.createHash("sha1").update(sorted + apiSecret).digest("hex");
}

async function uploadToCloudinary(buffer, mimetype, { cloudName, apiKey, apiSecret, folder }) {
  const timestamp = Math.round(Date.now() / 1000);
  const paramsToSign = { folder, timestamp };
  const signature = signUploadParams(paramsToSign, apiSecret);

  const form = new FormData();
  form.append("file", new Blob([buffer], { type: mimetype }));
  form.append("api_key", apiKey);
  form.append("timestamp", String(timestamp));
  form.append("signature", signature);
  form.append("folder", folder);

  const response = await fetch(
    `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
    { method: "POST", body: form }
  );

  const data = await response.json();

  if (!response.ok) {
    const msg = data?.error?.message || JSON.stringify(data);
    const err = new Error(`Cloudinary ${response.status}: ${msg}`);
    err.status = response.status;
    err.cloudinaryData = data;
    throw err;
  }

  return data;
}

export async function handleImageUpload(req, res) {
  const files = req.files ?? [];

  if (!files.length) {
    return res.status(400).json({ message: "No files received" });
  }

  const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
  const apiKey = process.env.CLOUDINARY_API_KEY;
  const apiSecret = process.env.CLOUDINARY_API_SECRET;
  const folder = process.env.CLOUDINARY_FOLDER || "craigpets";

  if (!cloudName || !apiKey || !apiSecret) {
    return res.status(500).json({ message: "Cloudinary env vars not configured" });
  }

  const images = [];

  try {
    for (const file of files) {
      const result = await uploadToCloudinary(file.buffer, file.mimetype, {
        cloudName,
        apiKey,
        apiSecret,
        folder,
      });

      images.push({
        filename: result.public_id,
        url: result.secure_url,
        mimetype: file.mimetype,
        size: file.size,
      });
    }
  } catch (err) {
    console.error("Cloudinary upload error:", err.message, err.cloudinaryData ?? "");
    return res.status(502).json({ message: err.message });
  }

  return res.status(201).json({ images });
}


