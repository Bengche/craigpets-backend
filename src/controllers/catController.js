import pool from "../db/pool.js";
import { BREEDS } from "../utils/constants.js";

function calculateAgeMonths(dateString) {
  if (!dateString) return null;
  const dob = new Date(dateString);
  if (Number.isNaN(dob.getTime())) return null;
  const now = new Date();
  let months =
    (now.getFullYear() - dob.getFullYear()) * 12 +
    (now.getMonth() - dob.getMonth());
  if (now.getDate() < dob.getDate()) {
    months -= 1;
  }
  return months >= 0 ? months : 0;
}

function mapCatRow(row) {
  if (!row) return null;
  return {
    id: row.id,
    name: row.name,
    breed: row.breed,
    dateOfBirth: row.date_of_birth,
    ageMonths: calculateAgeMonths(row.date_of_birth),
    gender: row.gender,
    weightKg: row.weight_kg,
    personality: row.personality,
    color: row.color,
    pedigreeCertificate: row.pedigree_certificate,
    vaccinated: row.vaccinated,
    vaccinationDate: row.vaccination_date,
    healthChecked: row.health_checked,
    microchipped: row.microchipped,
    countryOfOrigin: row.country_of_origin,
    shippingAvailable: row.shipping_available,
    priceGBP: row.price_gbp,
    shortDescription: row.short_description,
    story: row.story,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function sanitizeBreed(breed) {
  if (!breed) return undefined;
  const match = BREEDS.find(
    (item) => item.toLowerCase() === String(breed).toLowerCase()
  );
  return match;
}

function mapImageArray(images) {
  let list;
  if (Array.isArray(images)) {
    list = images;
  } else if (typeof images === "string") {
    try {
      list = JSON.parse(images);
    } catch (error) {
      list = [];
    }
  } else {
    list = [];
  }
  return list
    .map((img) => ({
      id: img.id,
      url: img.image_url,
      order: img.display_order ?? 0,
    }))
    .sort((a, b) => a.order - b.order);
}

export async function getCats(req, res) {
  const filters = [];
  const values = [];
  let idx = 1;

  const {
    breed,
    gender,
    vaccinated,
    shippingAvailable,
    search,
    ageMin,
    ageMax,
  } = req.query;

  const normalizedBreed = sanitizeBreed(breed);
  if (normalizedBreed) {
    filters.push(`breed = $${idx}`);
    values.push(normalizedBreed);
    idx += 1;
  }

  if (gender) {
    filters.push(`LOWER(gender) = LOWER($${idx})`);
    values.push(gender);
    idx += 1;
  }

  if (typeof vaccinated !== "undefined") {
    filters.push(`vaccinated = $${idx}`);
    values.push(vaccinated === "true" || vaccinated === true);
    idx += 1;
  }

  if (typeof shippingAvailable !== "undefined") {
    filters.push(`shipping_available = $${idx}`);
    values.push(shippingAvailable === "true" || shippingAvailable === true);
    idx += 1;
  }

  const now = new Date();

  if (ageMin) {
    const months = Number(ageMin);
    if (!Number.isNaN(months)) {
      const minDate = new Date(now);
      minDate.setMonth(minDate.getMonth() - months);
      filters.push(`date_of_birth <= $${idx}`);
      values.push(minDate.toISOString().slice(0, 10));
      idx += 1;
    }
  }

  if (ageMax) {
    const months = Number(ageMax);
    if (!Number.isNaN(months)) {
      const maxDate = new Date(now);
      maxDate.setMonth(maxDate.getMonth() - months);
      filters.push(`date_of_birth >= $${idx}`);
      values.push(maxDate.toISOString().slice(0, 10));
      idx += 1;
    }
  }

  if (search) {
    filters.push(
      `(LOWER(name) LIKE LOWER($${idx}) OR LOWER(short_description) LIKE LOWER($${idx}))`
    );
    values.push(`%${search}%`);
    idx += 1;
  }

  const whereClause = filters.length ? `WHERE ${filters.join(" AND ")}` : "";

  const query = `
    SELECT c.*, COALESCE(json_agg(ci) FILTER (WHERE ci.id IS NOT NULL), '[]') AS images
    FROM cats c
    LEFT JOIN cat_images ci ON ci.cat_id = c.id
    ${whereClause}
    GROUP BY c.id
    ORDER BY c.created_at DESC
  `;

  const { rows } = await pool.query(query, values);
  const cats = rows.map((row) => ({
    ...mapCatRow(row),
    images: mapImageArray(row.images),
  }));

  return res.json({ cats });
}

export async function getCatById(req, res) {
  const { id } = req.params;

  const query = `
    SELECT c.*, COALESCE(json_agg(ci) FILTER (WHERE ci.id IS NOT NULL), '[]') as images
    FROM cats c
    LEFT JOIN cat_images ci ON ci.cat_id = c.id
    WHERE c.id = $1
    GROUP BY c.id
  `;

  const { rows } = await pool.query(query, [id]);
  const row = rows[0];

  if (!row) {
    return res.status(404).json({ message: "Cat not found" });
  }

  const cat = {
    ...mapCatRow(row),
    images: mapImageArray(row.images),
  };

  return res.json({ cat });
}

export async function createCat(req, res) {
  const {
    name,
    breed,
    dateOfBirth,
    gender,
    weightKg,
    personality,
    color,
    pedigreeCertificate,
    vaccinated,
    vaccinationDate,
    healthChecked,
    microchipped,
    countryOfOrigin,
    shippingAvailable,
    priceGBP,
    shortDescription,
    story,
    imageUrls,
  } = req.body ?? {};

  if (!name || !breed) {
    return res.status(400).json({ message: "Name and breed are required" });
  }

  const normalizedBreed = sanitizeBreed(breed);
  if (!normalizedBreed) {
    return res.status(400).json({ message: "Unsupported breed" });
  }

  let parsedDob = null;
  if (dateOfBirth) {
    const candidate = new Date(dateOfBirth);
    if (Number.isNaN(candidate.getTime())) {
      return res.status(400).json({ message: "Invalid date of birth" });
    }
    parsedDob = candidate.toISOString().slice(0, 10);
  }

  const insertQuery = `
    INSERT INTO cats (
      name, breed, date_of_birth, gender, weight_kg, personality, color, pedigree_certificate,
      vaccinated, vaccination_date, health_checked, microchipped, country_of_origin,
      shipping_available, price_gbp, short_description, story
    ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17)
    RETURNING id
  `;

  const colorValue =
    typeof color === "string" ? color.trim() || null : color ?? null;

  const values = [
    name,
    normalizedBreed,
    parsedDob,
    gender,
    weightKg,
    personality,
    colorValue,
    pedigreeCertificate,
    vaccinated,
    vaccinationDate,
    healthChecked,
    microchipped,
    countryOfOrigin,
    shippingAvailable,
    priceGBP,
    shortDescription,
    story,
  ];

  const { rows } = await pool.query(insertQuery, values);
  const catId = rows[0].id;

  if (Array.isArray(imageUrls)) {
    let order = 0;
    for (const url of imageUrls) {
      if (!url) continue;
      await pool.query(
        `INSERT INTO cat_images (cat_id, image_url, display_order) VALUES ($1, $2, $3)`,
        [catId, url, order]
      );
      order += 1;
    }
  }

  const { rows: result } = await pool.query(
    `
    SELECT c.*, COALESCE(json_agg(ci) FILTER (WHERE ci.id IS NOT NULL), '[]') as images
    FROM cats c
    LEFT JOIN cat_images ci ON ci.cat_id = c.id
    WHERE c.id = $1
    GROUP BY c.id
  `,
    [catId]
  );

  const cat = {
    ...mapCatRow(result[0]),
    images: mapImageArray(result[0].images),
  };

  return res.status(201).json({ cat, message: "Cat uploaded successfully!" });
}

export async function updateCat(req, res) {
  const { id } = req.params;
  const {
    name,
    breed,
    dateOfBirth,
    gender,
    weightKg,
    personality,
    color,
    pedigreeCertificate,
    vaccinated,
    vaccinationDate,
    healthChecked,
    microchipped,
    countryOfOrigin,
    shippingAvailable,
    priceGBP,
    shortDescription,
    story,
    imageUrls,
  } = req.body ?? {};

  let normalizedBreed = null;
  if (typeof breed !== "undefined" && breed !== null) {
    normalizedBreed = sanitizeBreed(breed);
    if (!normalizedBreed) {
      return res.status(400).json({ message: "Unsupported breed" });
    }
  }

  let dobValue = null;
  if (
    typeof dateOfBirth !== "undefined" &&
    dateOfBirth !== null &&
    dateOfBirth !== ""
  ) {
    const candidate = new Date(dateOfBirth);
    if (Number.isNaN(candidate.getTime())) {
      return res.status(400).json({ message: "Invalid date of birth" });
    }
    dobValue = candidate.toISOString().slice(0, 10);
  }

  const updateQuery = `
    UPDATE cats SET
      name = COALESCE($1, name),
      breed = COALESCE($2, breed),
      date_of_birth = COALESCE($3, date_of_birth),
      gender = COALESCE($4, gender),
      weight_kg = COALESCE($5, weight_kg),
      personality = COALESCE($6, personality),
      color = COALESCE($7, color),
      pedigree_certificate = COALESCE($8, pedigree_certificate),
      vaccinated = COALESCE($9, vaccinated),
      vaccination_date = COALESCE($10, vaccination_date),
      health_checked = COALESCE($11, health_checked),
      microchipped = COALESCE($12, microchipped),
      country_of_origin = COALESCE($13, country_of_origin),
      shipping_available = COALESCE($14, shipping_available),
      price_gbp = COALESCE($15, price_gbp),
      short_description = COALESCE($16, short_description),
      story = COALESCE($17, story),
      updated_at = NOW()
    WHERE id = $18
    RETURNING id
  `;

  const colorValue =
    typeof color === "string" ? color.trim() || null : color ?? null;

  const values = [
    name,
    normalizedBreed,
    dobValue,
    gender,
    weightKg,
    personality,
    colorValue,
    pedigreeCertificate,
    vaccinated,
    vaccinationDate,
    healthChecked,
    microchipped,
    countryOfOrigin,
    shippingAvailable,
    priceGBP,
    shortDescription,
    story,
    id,
  ];

  const result = await pool.query(updateQuery, values);
  if (result.rowCount === 0) {
    return res.status(404).json({ message: "Cat not found" });
  }

  if (Array.isArray(imageUrls)) {
    await pool.query(`DELETE FROM cat_images WHERE cat_id = $1`, [id]);
    let order = 0;
    for (const url of imageUrls) {
      if (!url) continue;
      await pool.query(
        `INSERT INTO cat_images (cat_id, image_url, display_order) VALUES ($1, $2, $3)`,
        [id, url, order]
      );
      order += 1;
    }
  }

  return getCatById(req, res);
}

export async function deleteCat(req, res) {
  const { id } = req.params;
  await pool.query(`DELETE FROM cat_images WHERE cat_id = $1`, [id]);
  const result = await pool.query(`DELETE FROM cats WHERE id = $1`, [id]);
  if (result.rowCount === 0) {
    return res.status(404).json({ message: "Cat not found" });
  }
  return res.json({ message: "Cat deleted" });
}
