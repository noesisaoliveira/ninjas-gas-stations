import { siAuchan, siEdotleclerc, siIntermarche, siShell } from "simple-icons";
import type { SimpleIcon } from "simple-icons";

const BRAND_MARKS: Array<{ terms: string[]; icon: SimpleIcon }> = [
  { terms: ["intermarche", "intermarché"], icon: siIntermarche },
  { terms: ["e.leclerc", "eleclerc", "leclerc"], icon: siEdotleclerc },
  { terms: ["auchan"], icon: siAuchan },
  { terms: ["shell"], icon: siShell },
];

export function brandMark(brand: string | null): SimpleIcon | undefined {
  const normalized = (brand ?? "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();
  return BRAND_MARKS.find(({ terms }) => terms.some((term) => normalized.includes(term)))?.icon;
}
