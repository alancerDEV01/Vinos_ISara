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
  const protein = has(dish.ingredients, ["Carne roja", "Charque", "Carne de llama", "Cerdo"]);
  const redMeat = has(dish.ingredients, ["Carne roja", "Charque", "Carne de llama"]);
  const fish = has(dish.ingredients, ["Pescado"]);
  const creamy = has(dish.textures, ["Cremosa", "Suave"]);
  const fried = has(dish.techniques, ["Fritura"]);
  const vegetal = has(dish.aromas, ["Vegetal", "Herbal"]);
  const aromaticWine = has([...wine.nose, ...wine.character], ["floral", "aromático", "fragante", "cítrico", "tropical"]);
  const powerfulRed = wine.style === "Tinto" && (tannins > .65 || has(wine.character, ["Potente", "Corpulento", "Estructurado", "Con cuerpo"]));
  let culinary = .48;
  if (wine.style === "Espumante") culinary = fried ? .98 : fish ? .88 : creamy ? .78 : .58;
  else if (wine.style === "Blanco") culinary = fish ? .98 : creamy ? .86 : vegetal ? .82 : spice > .65 && sweetness < .4 ? .38 : .56;
  else if (wine.style === "Rosado") culinary = has(dish.ingredients, ["Cerdo"]) ? .88 : fried ? .82 : spice > .5 ? .76 : .62;
  else if (wine.style === "Naranjo") culinary = creamy ? .87 : spice > .45 ? .82 : vegetal ? .78 : .64;
  else if (powerfulRed) culinary = redMeat ? .98 : protein ? .87 : creamy ? .48 : .38;
  else culinary = has(dish.ingredients, ["Cerdo"]) ? .86 : redMeat ? .8 : creamy ? .68 : .52;
  if (aromaticWine && (vegetal || creamy)) culinary = Math.min(1, culinary + .1);
  if (sweetness > .55 && spice > .5) culinary = Math.min(1, culinary + .2);
  const signature = [...`${wine.id}:${dish.id}`].reduce((sum, character) => sum + character.charCodeAt(0), 0);
  const individualVariation = ((signature * 17) % 9 - 4) / 100;
  culinary = Math.max(.2, Math.min(1, culinary + individualVariation));
  const contrast = Math.round((.38 * acidBalance + .19 * sweetHeat + .24 * tanninProtein + .19 * bubblesFry) * 100);
  const culture = sameRegion ? (wine.valley.includes("Cinti") || wine.valley.includes("Tarija") ? 96 : 88) : 30;
  const global = Math.round(.29 * affinity + .36 * contrast + .09 * culture + .26 * culinary * 100);
  const reasons = [
    `La intensidad ${dish.intensity === "Alto" ? "alta" : dish.intensity.toLocaleLowerCase("es")} del plato encuentra un vino de cuerpo ${wineBody > .7 ? "amplio" : wineBody > .45 ? "medio" : "ligero"}.`,
    acidity > .65 && fat > .5 ? "La acidez y frescura ayudan a limpiar la percepción grasa del plato." : "El equilibrio del vino acompaña el peso del plato sin dominarlo.",
    powerfulRed && redMeat ? "La estructura tánica encuentra afinidad con la proteína y la intensidad cárnica." : wine.style === "Espumante" && fried ? "La burbuja y la acidez refrescan el paladar después de la fritura." : fish && wine.style === "Blanco" ? "La frescura y el perfil aromático respetan la delicadeza del pescado." : aromaticMatch ? "Las familias especiadas y tostadas crean afinidad aromática." : "La fruta y los aromas del vino aportan un contrapunto limpio.",
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
    biochemical: biochemicalExplanation(wine, acidity, tannins),
  };
}

function biochemicalExplanation(wine: Wine, acidity: number, tannins: number) {
  const descriptors = [...wine.nose, ...wine.palate, ...wine.character].join(" ").toLocaleLowerCase("es");
  const notes: string[] = [];
  if (/fruta|cereza|ciruela|mora|arándano|frambuesa|fresa|piña|durazno|manzana|maracuyá/.test(descriptors)) notes.push("Los ésteres fermentativos y compuestos varietales expresan las notas frutales");
  if (/flor|rosa|jazmín|lavanda/.test(descriptors)) notes.push("terpenos como linalool y geraniol sostienen el perfil floral");
  if (/pimienta|clavo|canela|especia/.test(descriptors)) notes.push("rotundona, eugenol y otros compuestos varietales o de crianza explican el carácter especiado");
  if (/vainilla|cacao|chocolate|café|tabaco|humo|roble|madera/.test(descriptors)) notes.push("vainillina y compuestos del tostado aportan las notas de madera, cacao y humo");
  if (/cremos|untuoso|sedoso|aterciopelado/.test(descriptors)) notes.push("glicerol, polisacáridos y manoproteínas contribuyen a la textura suave y envolvente");
  if (acidity > .65) notes.push("los ácidos orgánicos conservan vivacidad y frescura");
  if (tannins > .6) notes.push("los taninos de piel, semillas y crianza aportan estructura y persistencia");
  return `${notes.slice(0, 3).join("; ") || "La uva y la fermentación construyen su expresión aromática y táctil"}.`;
}

export const rankDishesForWine = (wine: Wine, dishes: Dish[]) => dishes.map((dish) => evaluatePairing(wine, dish)).sort((a, b) => b.global - a.global);
export const rankWinesForDish = (dish: Dish, wines: Wine[]) => wines.map((wine) => evaluatePairing(wine, dish)).sort((a, b) => b.global - a.global);
