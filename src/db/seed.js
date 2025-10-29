import pool from "./pool.js";

const sampleCats = [
  {
    name: "Aurora",
    breed: "Maine Coon",
    ageMonths: 18,
    gender: "Female",
    weightKg: 6.4,
    personality: "Affectionate, playful, confident",
    color: "Silver tabby",
    pedigreeCertificate: true,
    vaccinated: true,
    vaccinationDate: "2025-08-12",
    healthChecked: true,
    microchipped: true,
    countryOfOrigin: "United Kingdom",
    shippingAvailable: true,
    priceGBP: 1850,
    shortDescription:
      "Gilded silver tabby with a gentle heart and luxurious coat.",
    story:
      "Aurora adores curling up beside the fireplace and listening to soft piano. She comes from a champion bloodline and is raised with children, ensuring a loving temperament.",
    images: [
      "https://images.unsplash.com/photo-1518791841217-8f162f1e1131",
      "https://images.unsplash.com/photo-1519058082700-08a0b56da1a6",
      "https://images.unsplash.com/photo-1543852786-1cf6624b9987",
    ],
  },
  {
    name: "Winston",
    breed: "Maine Coon",
    ageMonths: 22,
    gender: "Male",
    weightKg: 7.3,
    personality: "Loyal, intelligent, gentle giant",
    color: "Blue smoke",
    pedigreeCertificate: true,
    vaccinated: true,
    vaccinationDate: "2025-07-30",
    healthChecked: true,
    microchipped: true,
    countryOfOrigin: "Scotland",
    shippingAvailable: true,
    priceGBP: 1995,
    shortDescription:
      "Royal blue smoke coat with amber eyes that captivate instantly.",
    story:
      "Winston enjoys interactive play sessions and is trained to walk on a leash. He travels well and has a calm presence that comforts everyone around him.",
    images: [
      "https://images.unsplash.com/photo-1511288591264-1f7f7c9b12c1",
      "https://images.unsplash.com/photo-1516979187457-637abb4f9353",
      "https://images.unsplash.com/photo-1511044568932-338cba0ad803",
    ],
  },
  {
    name: "Ophelia",
    breed: "Maine Coon",
    ageMonths: 15,
    gender: "Female",
    weightKg: 5.9,
    personality: "Graceful, curious, people-oriented",
    color: "Silver lynx",
    pedigreeCertificate: true,
    vaccinated: true,
    vaccinationDate: "2025-09-18",
    healthChecked: true,
    microchipped: true,
    countryOfOrigin: "France",
    shippingAvailable: true,
    priceGBP: 1890,
    shortDescription:
      "Silver lynx with tufted ears and a love for window gazing.",
    story:
      "Ophelia is a gentle soul who loves being brushed and doted on. She is an ideal companion for families seeking an affectionate feline.",
    images: [
      "https://images.unsplash.com/photo-1526336024174-e58f5cdd8e13",
      "https://images.unsplash.com/photo-1536589961747-e239b2abbec1",
      "https://images.unsplash.com/photo-1472491235688-bdc81a63246e",
    ],
  },
  {
    name: "Isolde",
    breed: "Persian",
    ageMonths: 20,
    gender: "Female",
    weightKg: 4.2,
    personality: "Calm, regal, lap-loving",
    color: "Cream golden",
    pedigreeCertificate: true,
    vaccinated: true,
    vaccinationDate: "2025-06-21",
    healthChecked: true,
    microchipped: true,
    countryOfOrigin: "Italy",
    shippingAvailable: true,
    priceGBP: 1750,
    shortDescription:
      "Cream and gold Persian with a velvety coat and serene gaze.",
    story:
      "Isolde is a gentle companion who prefers quiet evenings and soft blankets. Her coat gleams like spun gold under candlelight.",
    images: [
      "https://images.unsplash.com/photo-1519052537078-e6302a4968d4",
      "https://images.unsplash.com/photo-1450778869180-41d0601e046e",
      "https://images.unsplash.com/photo-1510337550647-e84f83e341ca",
    ],
  },
  {
    name: "Chester",
    breed: "Persian",
    ageMonths: 24,
    gender: "Male",
    weightKg: 5.1,
    personality: "Easy-going, cuddly, refined",
    color: "Chocolate",
    pedigreeCertificate: true,
    vaccinated: true,
    vaccinationDate: "2025-05-05",
    healthChecked: true,
    microchipped: true,
    countryOfOrigin: "England",
    shippingAvailable: false,
    priceGBP: 1680,
    shortDescription: "Copper-eyed gentleman with plush chocolate fur.",
    story:
      "Chester lives for sunlit naps and gourmet treats. He bonds quickly and makes a soothing companion for a calm household.",
    images: [
      "https://images.unsplash.com/photo-1518895949257-7621c3c786d4",
      "https://images.unsplash.com/photo-1487412720507-e7ab37603c6f",
      "https://images.unsplash.com/photo-1494256997604-768d1f608cac",
    ],
  },
  {
    name: "Eloise",
    breed: "Persian",
    ageMonths: 16,
    gender: "Female",
    weightKg: 4.0,
    personality: "Sweet, poised, gentle",
    color: "Ivory with blue eyes",
    pedigreeCertificate: true,
    vaccinated: true,
    vaccinationDate: "2025-09-02",
    healthChecked: true,
    microchipped: true,
    countryOfOrigin: "Spain",
    shippingAvailable: true,
    priceGBP: 1725,
    shortDescription: "Ivory Persian with crystal blue eyes and a soft purr.",
    story:
      "Eloise loves soft grooming sessions and elegant toys. She travels comfortably and adapts well to refined homes.",
    images: [
      "https://images.unsplash.com/photo-1516738901171-8eb4fc13bd20",
      "https://images.unsplash.com/photo-1495395226200-8fbf6dc92e84",
      "https://images.unsplash.com/photo-1508672019048-805c876b67e2",
    ],
  },
  {
    name: "Reginald",
    breed: "British Shorthair",
    ageMonths: 21,
    gender: "Male",
    weightKg: 6.1,
    personality: "Distinguished, calm, observant",
    color: "Blue",
    pedigreeCertificate: true,
    vaccinated: true,
    vaccinationDate: "2025-07-14",
    healthChecked: true,
    microchipped: true,
    countryOfOrigin: "England",
    shippingAvailable: true,
    priceGBP: 1820,
    shortDescription:
      "Classic blue coat with plush texture and a noble stance.",
    story:
      "Reginald enjoys classical music and quiet evenings. He is impeccably mannered and ideal for elegant city apartments.",
    images: [
      "https://images.unsplash.com/photo-1511044568932-338cba0ad803",
      "https://images.unsplash.com/photo-1489515217757-5fd1be406fef",
      "https://images.unsplash.com/photo-1500879747858-bb1845b61beb",
    ],
  },
  {
    name: "Beatrice",
    breed: "British Shorthair",
    ageMonths: 14,
    gender: "Female",
    weightKg: 4.8,
    personality: "Charming, playful, poised",
    color: "Lilac",
    pedigreeCertificate: true,
    vaccinated: true,
    vaccinationDate: "2025-10-09",
    healthChecked: true,
    microchipped: true,
    countryOfOrigin: "Ireland",
    shippingAvailable: true,
    priceGBP: 1760,
    shortDescription: "Lilac plush coat with sparkling amber eyes.",
    story:
      "Beatrice loves interactive feather wands and cozy blankets. She is social, impeccably groomed, and thrives in attentive homes.",
    images: [
      "https://images.unsplash.com/photo-1511288591264-1f7f7c9b12c1",
      "https://images.unsplash.com/photo-1480951759438-68a5bf19c4b0",
      "https://images.unsplash.com/photo-1469567759157-8158635ea584",
    ],
  },
  {
    name: "Matilda",
    breed: "British Shorthair",
    ageMonths: 19,
    gender: "Female",
    weightKg: 5.3,
    personality: "Affectionate, composed, curious",
    color: "Silver shaded",
    pedigreeCertificate: true,
    vaccinated: true,
    vaccinationDate: "2025-08-28",
    healthChecked: true,
    microchipped: true,
    countryOfOrigin: "Germany",
    shippingAvailable: true,
    priceGBP: 1835,
    shortDescription: "Pearl silver coat with plush density and calm demeanor.",
    story:
      "Matilda adores gentle petting and deluxe lounging spaces. She acclimates quickly and pairs well with serene households.",
    images: [
      "https://images.unsplash.com/photo-1444213007800-cff19e1677ac",
      "https://images.unsplash.com/photo-1455758190477-ac7265bc8139",
      "https://images.unsplash.com/photo-1470246973918-29a93221c455",
    ],
  },
];

export async function seedData() {
  const { rows } = await pool.query("SELECT COUNT(*)::int FROM cats");
  const catCount = rows[0]?.count ?? 0;
  if (catCount > 0) {
    return;
  }

  const todayUtc = new Date();
  todayUtc.setUTCHours(0, 0, 0, 0);

  const deriveBirthDate = (months) => {
    if (typeof months !== "number" || Number.isNaN(months)) {
      return null;
    }
    const birthDate = new Date(todayUtc);
    birthDate.setUTCMonth(birthDate.getUTCMonth() - months);
    return birthDate.toISOString().slice(0, 10);
  };

  for (const cat of sampleCats) {
    const insertCatQuery = `
      INSERT INTO cats (
        name, breed, date_of_birth, gender, weight_kg, personality, color, pedigree_certificate,
        vaccinated, vaccination_date, health_checked, microchipped, country_of_origin,
        shipping_available, price_gbp, short_description, story
      ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17)
      RETURNING id
    `;

    const catValues = [
      cat.name,
      cat.breed,
      deriveBirthDate(cat.ageMonths),
      cat.gender,
      cat.weightKg,
      cat.personality,
      cat.color ?? null,
      cat.pedigreeCertificate,
      cat.vaccinated,
      cat.vaccinationDate,
      cat.healthChecked,
      cat.microchipped,
      cat.countryOfOrigin,
      cat.shippingAvailable,
      cat.priceGBP,
      cat.shortDescription,
      cat.story,
    ];

    const { rows: catRows } = await pool.query(insertCatQuery, catValues);
    const catId = catRows[0].id;

    for (let i = 0; i < cat.images.length; i += 1) {
      const imageUrl = cat.images[i];
      await pool.query(
        `INSERT INTO cat_images (cat_id, image_url, display_order) VALUES ($1, $2, $3)`,
        [catId, imageUrl, i]
      );
    }
  }
}
