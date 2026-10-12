import { siAuchan, siEdotleclerc, siIntermarche, siShell } from "simple-icons";
import type { SimpleIcon } from "simple-icons";
import galpLogo from "./assets/galp.svg?inline";
import repsolLogo from "./assets/repsol.svg?inline";
import prioLogo from "./assets/prio.svg?inline";
import moeveLogo from "./assets/moeve.svg?inline";
import alvesBandeiraLogo from "./assets/alves-bandeira.png?inline";
import ozEnergiaLogo from "./assets/oz-energia.png?inline";
import plenergyLogo from "./assets/plenergy.png?inline";
import bpLogo from "./assets/bp.svg?inline";

export type BrandMark = { terms: string[]; icon: SimpleIcon } | { terms: string[]; image: string };

const BRAND_MARKS: BrandMark[] = [
  { terms: ["intermarche", "intermarché"], icon: siIntermarche },
  { terms: ["e.leclerc", "eleclerc", "leclerc"], icon: siEdotleclerc },
  { terms: ["auchan"], icon: siAuchan },
  { terms: ["shell"], icon: siShell },
  { terms: ["galp"], image: galpLogo },
  { terms: ["repsol"], image: repsolLogo },
  { terms: ["prio"], image: prioLogo },
  { terms: ["moeve", "cepsa"], image: moeveLogo },
  { terms: ["alves bandeira", "alvesbandeira"], image: alvesBandeiraLogo },
  { terms: ["oz energia", "ozenergia"], image: ozEnergiaLogo },
  { terms: ["plenergy", "plenoil"], image: plenergyLogo },
  { terms: ["bp"], image: bpLogo },
];

export function brandMark(brand: string | null): BrandMark | undefined {
  const normalized = (brand ?? "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();
  return BRAND_MARKS.find(({ terms }) => terms.some((term) => normalized.includes(term)));
}
