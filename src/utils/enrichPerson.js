import enrichCastWithImages from "./enrichCast";

function formatProfession(value) {
  if (!value) return null;

  return value
    .split(",")
    .map(p =>
      p
        .trim()
        .toLowerCase()
        .replace(/^\w/, c => c.toUpperCase())
    )
    .join(", ");
}

/**
 * Enrich a single person with:
 * - TMDB image
 * - formatted job/profession
 */
export async function enrichPerson(person) {
  if (!person) return person;

  const [enriched] = await enrichCastWithImages([person]);
  const out = enriched ?? person;

  // Normalize + format profession for bookmarks
  if (!out.job && out.primaryProfession) {
    out.job = formatProfession(out.primaryProfession);
  }

  return out;
}
