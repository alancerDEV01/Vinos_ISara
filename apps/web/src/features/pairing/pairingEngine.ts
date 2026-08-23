import type { Dish, Level, SpiceLevel } from "@/features/dish-catalog/dishData";
import type { Wine } from "@/features/wine-catalog/wineData";

export type PairingResult = {
  wine: Wine;
  dish: Dish;
  affinity: number;
  contrast: number;
  culture: number;
  global: number;
  verdict: string;
  reasons: string[];
  cautions: string[];
  biochemical: string;
};

const level = (value: Level | SpiceLevel | undefined) => ({ Ausente: 0, Bajo: .28, Medio: .62, Alto: .9, Intenso: 1 }[value ?? "Medio"] ?? .5);
const has = (values: string[], terms: string[]) => values.some((value) => terms.some((term) => value.toLocaleLowerCase("es").includes(term)));
const axis = (wine: Wine, name: keyof NonNullable<Wine["palateAxes"]>, fallback: number) => {
  const value = wine.palateAxes?.[name]?.toLocaleLowerCase("es") ?? "";
  if (/alta|marcada|firme|potente|con cuerpo|largo|persistente/.test(value)) return .88;
  if (/media|moderad|equilibrad|buena/.test(value)) return .62;
  if (/baja|liger|suave|fina/.test(value)) return .32;
  return fallback;
};

export function evaluatePairing(wine: Wine, dish: Dish): PairingResult {
  const wineBody = axis(wine, "Cuerpo", wine.style === "Tinto" ? .78 : wine.style === "Espumante" ? .45 : .5);
  const acidity = axis(wine, "Acidez", has([...wine.palate, ...wine.character], ["ácid", "fresc", "vivaz"]) ? .78 : .52);
  const tannins = axis(wine, "Taninos", wine.style === "Tinto" ? .72 : .12);
  const sweetness = axis(wine, "Dulzor", has([...wine.palate, ...wine.character], ["dulce", "demi", "semidulce"]) ? .72 : .2);
  const intensity = level(dish.intensity);
  const fat = level(dish.fat);
  const spice = level(dish.spice);
  const sameRegion = wine.department === dish.department;
  const bodyMatch = 1 - Math.abs(wineBody - intensity);
  const aromaticMatch = has(wine.nose, ["especia", "pimienta", "clavo", "canela", "humo", "tostado"]) && has(dish.aromas, ["Especiada", "Ahumada", "Tostada"]);
  const textureMatch = has([...wine.palate, ...wine.character], ["cremos", "untuoso", "carnoso", "sedoso", "textur"])
    && has(dish.textures, ["Cremosa", "Untuosa", "Jugosa"]);
  const affinity = Math.round(Math.min(1, .68 * bodyMatch + (aromaticMatch ? .19 : .08) + (textureMatch ? .13 : .05)) * 100);
  const acidBalance = Math.min(acidity, fat + .12);
  const sweetHeat = spice > .25 ? Math.min(sweetness + .12, spice) : .45;
  const tanninProtein = has(dish.ingredients, ["Carne", "Cerdo", "Charque"]) ? tannins : .38;
  const bubblesFry = wine.style === "Espumante" && has(dish.techniques, ["Fritura"]) ? .92 : .42;
  const contrast = Math.round((.38 * acidBalance + .19 * sweetHeat + .24 * tanninProtein + .19 * bubblesFry) * 100);
  const culture = sameRegion ? (wine.valley.includes("Cinti") || wine.valley.includes("Tarija") ? 96 : 88) : 30;
  const global = Math.round(.42 * affinity + .38 * contrast + .2 * culture);
  const reasons = [
    `La intensidad ${dish.intensity.toLocaleLowerCase("es")} del plato encuentra un vino de cuerpo ${wineBody > .7 ? "amplio" : wineBody > .45 ? "medio" : "ligero"}.`,
    acidity > .65 && fat > .5 ? "La acidez y frescura ayudan a limpiar la percepción grasa del plato." : "El equilibrio del vino acompaña el peso del plato sin dominarlo.",
    tannins > .6 && tanninProtein > .6 ? "Los taninos interactúan favorablemente con proteínas y grasa de la preparación." : aromaticMatch ? "Las familias especiadas y tostadas crean afinidad aromática." : "La fruta y los aromas del vino aportan un contrapunto limpio.",
    sameRegion ? `El vínculo ${wine.department}–${dish.department} aporta coherencia territorial y patrimonial.` : "El maridaje se sostiene sensorialmente, aunque no comparte territorio.",
  ];
  const cautions = [
    ...(tannins > .72 && spice > .7 ? ["Tanino firme y picor intenso pueden aumentar la sensación de sequedad."] : []),
    ...(wineBody < .4 && intensity > .82 ? ["El plato puede superar la persistencia de un vino ligero."] : []),
    ...(sweetness < .28 && spice > .82 ? ["Un vino muy seco puede acentuar el picor."] : []),
  ];
  return {
    wine, dish, affinity, contrast, culture, global,
    verdict: global >= 85 ? "Maridaje altamente favorable" : global >= 70 ? "Maridaje favorable" : "Maridaje para explorar",
    reasons, cautions,
    biochemical: acidity > .65 ? "Los ácidos orgánicos aportan frescura; los taninos y polisacáridos modulan estructura y textura." : "Ésteres y compuestos varietales construyen el puente aromático; la fermentación define parte de su expresión.",
  };
}

export const rankDishesForWine = (wine: Wine, dishes: Dish[]) => dishes.map((dish) => evaluatePairing(wine, dish)).sort((a, b) => b.global - a.global);
export const rankWinesForDish = (dish: Dish, wines: Wine[]) => wines.map((wine) => evaluatePairing(wine, dish)).sort((a, b) => b.global - a.global);
