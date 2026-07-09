export interface TimeContext {
  slug: string;
  label: string;
}

/**
 * Détermine le moment de la journée (heure de Paris, pour que ça
 * reste cohérent quel que soit le fuseau horaire du serveur).
 */
export function getMealPeriod(): TimeContext {
  const hour = Number(
    new Intl.DateTimeFormat("fr-FR", {
      timeZone: "Europe/Paris",
      hour: "numeric",
      hour12: false,
    }).format(new Date())
  );

  if (hour >= 5 && hour < 11) return { slug: "petit-dejeuner", label: "le petit-déjeuner" };
  if (hour >= 11 && hour < 15) return { slug: "dejeuner", label: "le déjeuner" };
  if (hour >= 15 && hour < 18) return { slug: "gouter", label: "le goûter" };
  return { slug: "diner", label: "le dîner" };
}

/**
 * Détermine la saison actuelle (hémisphère nord).
 */
export function getCurrentSeason(): TimeContext {
  const month = Number(
    new Intl.DateTimeFormat("fr-FR", {
      timeZone: "Europe/Paris",
      month: "numeric",
    }).format(new Date())
  );

  if (month === 12 || month <= 2) return { slug: "hiver", label: "l'hiver" };
  if (month <= 5) return { slug: "printemps", label: "le printemps" };
  if (month <= 8) return { slug: "ete", label: "l'été" };
  return { slug: "automne", label: "l'automne" };
}
