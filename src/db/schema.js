import pool from "./pool.js";

const createTablesSQL = `
CREATE TABLE IF NOT EXISTS cats (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  breed TEXT NOT NULL,
  gender TEXT,
  weight_kg NUMERIC(5,2),
  personality TEXT,
  color TEXT,
  date_of_birth DATE,
  pedigree_certificate BOOLEAN DEFAULT false,
  vaccinated BOOLEAN DEFAULT false,
  vaccination_date DATE,
  health_checked BOOLEAN DEFAULT false,
  microchipped BOOLEAN DEFAULT false,
  country_of_origin TEXT,
  shipping_available BOOLEAN DEFAULT true,
  price_gbp NUMERIC(10,2),
  short_description TEXT,
  story TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
ALTER TABLE cats
  ADD COLUMN IF NOT EXISTS color TEXT;

ALTER TABLE cats
  ADD COLUMN IF NOT EXISTS date_of_birth DATE;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'cats' AND column_name = 'age_months'
  ) THEN
    ALTER TABLE cats ADD COLUMN IF NOT EXISTS date_of_birth DATE;
    UPDATE cats
      SET date_of_birth = COALESCE(
        date_of_birth,
        (CURRENT_DATE - (age_months * INTERVAL '1 month'))::date
      )
      WHERE age_months IS NOT NULL;
    ALTER TABLE cats DROP COLUMN age_months;
  END IF;
END $$;

CREATE TABLE IF NOT EXISTS cat_images (
  id SERIAL PRIMARY KEY,
  cat_id INTEGER REFERENCES cats(id) ON DELETE CASCADE,
  image_url TEXT NOT NULL,
  display_order INTEGER DEFAULT 0
);

CREATE INDEX IF NOT EXISTS idx_cats_breed ON cats(breed);
CREATE INDEX IF NOT EXISTS idx_cats_vaccinated ON cats(vaccinated);
CREATE INDEX IF NOT EXISTS idx_cats_shipping ON cats(shipping_available);
`;

export async function ensureSchema() {
  await pool.query(createTablesSQL);
}
