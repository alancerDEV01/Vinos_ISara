export type Level = "Bajo" | "Medio" | "Alto";
export type SpiceLevel = "Ausente" | "Bajo" | "Medio" | "Intenso";

export type Dish = {
  id: string;
  name: string;
  department: string;
  region: string;
  image?: string;
  imageAlt?: string;
  description: string;
  intensity: Level;
  fat: Level;
  spice: SpiceLevel;
  tastes: string[];
  aromas: string[];
  textures: string[];
  techniques: string[];
  ingredients: string[];
  status: "draft" | "needs_review";
};

// El DOCX enumera los platos y los campos requeridos, pero no proporciona una
// caracterización completa de cada preparación. Estos perfiles son borradores
// editoriales para probar el producto y deben validarse antes de publicarse.
export const dishes: Dish[] = [
  { id: "mondongo-chuquisaqueno", name: "Mondongo chuquisaqueño", department: "Chuquisaca", region: "Sucre", image: "/images/generated/mondongo-chuquisaqueno.png", imageAlt: "Mondongo chuquisaqueño con cerdo en ají colorado, mote amarillo y papa", description: "Preparación regional con cerdo, ají colorado, mote y acompañamientos.", intensity: "Alto", fat: "Medio", spice: "Medio", tastes: ["Salado", "Umami"], aromas: ["Cárnica", "Especiada"], textures: ["Jugosa", "Suave"], techniques: ["Cocción lenta"], ingredients: ["Cerdo", "Ají rojo", "Maíz"], status: "needs_review" },
  { id: "chorizo-chuquisaqueno", name: "Chorizo chuquisaqueño", department: "Chuquisaca", region: "Sucre", image: "/images/generated/chorizo-chuquisaqueno.png", imageAlt: "Chorizo chuquisaqueño con ensalada, pan tostado y llajua", description: "Embutido tradicional servido con acompañamientos regionales.", intensity: "Alto", fat: "Alto", spice: "Bajo", tastes: ["Salado", "Umami"], aromas: ["Cárnica", "Especiada"], textures: ["Jugosa"], techniques: ["Fritura"], ingredients: ["Cerdo", "Especias"], status: "needs_review" },
  { id: "saice-tarijeno", name: "Saice tarijeño", department: "Tarija", region: "Valle Central", image: "/images/departments/tarija/platos/saice.jpg", imageAlt: "Saice tarijeño servido en un plato", description: "Carne picada con ají, papa y acompañamientos frescos.", intensity: "Alto", fat: "Medio", spice: "Medio", tastes: ["Salado", "Umami"], aromas: ["Cárnica", "Especiada"], textures: ["Jugosa", "Suave"], techniques: ["Cocción lenta"], ingredients: ["Carne roja", "Ají rojo", "Papa"], status: "needs_review" },
  { id: "chancho-cruz", name: "Chancho a la cruz", department: "Tarija", region: "Tarija", description: "Cerdo cocinado lentamente al fuego mediante una estructura en cruz.", intensity: "Alto", fat: "Alto", spice: "Bajo", tastes: ["Salado", "Umami"], aromas: ["Cárnica", "Tostada", "Ahumada"], textures: ["Jugosa", "Crocante"], techniques: ["Asado"], ingredients: ["Cerdo", "Especias"], status: "needs_review" },
  { id: "silpancho", name: "Silpancho", department: "Cochabamba", region: "Valle de Cochabamba", image: "/images/generated/silpancho-cochabambino.png", imageAlt: "Silpancho cochabambino con carne fina apanada, arroz, papas, huevos y ensalada", description: "Carne apanada con arroz, papa, huevo y ensalada.", intensity: "Alto", fat: "Medio", spice: "Bajo", tastes: ["Salado", "Umami"], aromas: ["Cárnica", "Tostada"], textures: ["Crocante", "Jugosa"], techniques: ["Fritura"], ingredients: ["Carne roja", "Papa", "Arroz", "Huevo"], status: "needs_review" },
  { id: "sopa-mani", name: "Sopa de maní", department: "Cochabamba", region: "Cochabamba", image: "/images/generated/sopa-de-mani-boliviana.png", imageAlt: "Sopa de maní boliviana con carne, verduras, fideo y papas fritas finas", description: "Caldo de maní con carne, verduras y fideo, coronado con papas fritas finas.", intensity: "Medio", fat: "Medio", spice: "Bajo", tastes: ["Salado", "Umami", "Dulce"], aromas: ["Terrosa", "Tostada"], textures: ["Cremosa", "Jugosa", "Crocante"], techniques: ["Hervido", "Cocción lenta", "Fritura"], ingredients: ["Maní", "Carne roja", "Papa", "Zanahoria", "Arvejas", "Fideo"], status: "needs_review" },
  { id: "plato-paceno", name: "Plato paceño", department: "La Paz", region: "Altiplano paceño", description: "Habas, choclo, papa y queso presentados como conjunto.", intensity: "Medio", fat: "Medio", spice: "Ausente", tastes: ["Salado", "Dulce"], aromas: ["Vegetal", "Láctea"], textures: ["Suave", "Cremosa"], techniques: ["Hervido"], ingredients: ["Habas", "Maíz", "Papa", "Queso"], status: "needs_review" },
  { id: "fricase", name: "Fricasé", department: "La Paz", region: "La Paz", description: "Caldo intenso de cerdo y ají acompañado con mote.", intensity: "Alto", fat: "Alto", spice: "Intenso", tastes: ["Salado", "Umami"], aromas: ["Cárnica", "Especiada"], textures: ["Jugosa", "Gelatinosa"], techniques: ["Cocción lenta"], ingredients: ["Cerdo", "Ají amarillo", "Maíz"], status: "needs_review" },
  { id: "charquekan", name: "Charquekan", department: "Oruro", region: "Altiplano de Oruro", description: "Charque acompañado con mote, papa, huevo y queso.", intensity: "Alto", fat: "Medio", spice: "Bajo", tastes: ["Salado", "Umami"], aromas: ["Cárnica", "Láctea"], textures: ["Fibrosa", "Seca"], techniques: ["Hervido", "Fritura"], ingredients: ["Charque", "Maíz", "Papa", "Queso"], status: "needs_review" },
  { id: "brazuelo-cordero-orureno", name: "Brazuelo de cordero", department: "Oruro", region: "Altiplano de Oruro", description: "Cordero cocido y dorado, acompañado con papa y productos del altiplano.", intensity: "Alto", fat: "Medio", spice: "Bajo", tastes: ["Salado", "Umami"], aromas: ["Cárnica", "Tostada"], textures: ["Jugosa", "Tierna"], techniques: ["Horneado", "Dorado"], ingredients: ["Cordero", "Papa", "Hierbas"], status: "needs_review" },
  { id: "carne-llama", name: "Carne de llama", department: "Potosí", region: "Altiplano potosino", description: "Preparaciones regionales basadas en carne de camélido; variante por documentar.", intensity: "Alto", fat: "Bajo", spice: "Bajo", tastes: ["Salado", "Umami"], aromas: ["Cárnica"], textures: ["Fibrosa"], techniques: ["Asado"], ingredients: ["Carne de llama"], status: "needs_review" },
  { id: "kalapurka-potosina", name: "Kalapurka", department: "Potosí", region: "Villa Imperial de Potosí", image: "/images/departments/potosi/platos/kalapurka.jpg", imageAlt: "Kalapurka potosina servida caliente en recipiente tradicional", description: "Sopa espesa y picante de maíz, carne y ají, tradicionalmente calentada con piedra volcánica.", intensity: "Alto", fat: "Medio", spice: "Medio", tastes: ["Salado", "Umami"], aromas: ["Cárnica", "Especiada", "Tostada"], textures: ["Espesa", "Cremosa"], techniques: ["Hervido", "Cocción con piedra caliente"], ingredients: ["Maíz", "Carne", "Ají", "Papa"], status: "needs_review" },
  { id: "majadito", name: "Majadito", department: "Santa Cruz", region: "Llanos cruceños", description: "Arroz preparado con charque o pollo y acompañado con plátano y huevo.", intensity: "Medio", fat: "Medio", spice: "Bajo", tastes: ["Salado", "Umami", "Dulce"], aromas: ["Cárnica", "Tostada"], textures: ["Jugosa"], techniques: ["Cocción lenta", "Fritura"], ingredients: ["Arroz", "Charque", "Plátano", "Huevo"], status: "needs_review" },
  { id: "locro-cruceno", name: "Locro cruceño", department: "Santa Cruz", region: "Llanos cruceños", description: "Caldo tradicional de arroz con gallina, papa y verduras, de carácter cálido y reconfortante.", intensity: "Medio", fat: "Medio", spice: "Bajo", tastes: ["Salado", "Umami"], aromas: ["Cárnica", "Vegetal"], textures: ["Jugosa", "Suave"], techniques: ["Hervido", "Cocción lenta"], ingredients: ["Gallina", "Arroz", "Papa", "Verduras"], status: "needs_review" },
  { id: "masaco", name: "Masaco", department: "Beni", region: "Llanos del Beni", image: "/images/departments/beni/platos/masaco.jpg", imageAlt: "Masaco beniano servido en un plato", description: "Plátano o yuca majada con un componente salado regional.", intensity: "Medio", fat: "Medio", spice: "Ausente", tastes: ["Salado", "Dulce"], aromas: ["Vegetal", "Cárnica"], textures: ["Suave", "Cremosa"], techniques: ["Hervido", "Majado"], ingredients: ["Plátano", "Yuca"], status: "needs_review" },
  { id: "pescado-tacuara-beniano", name: "Pescado a la tacuara", department: "Beni", region: "Amazonía beniana", image: "/images/departments/beni/platos/pescado-tacuara.webp", imageAlt: "Pescado de río beniano cocinado en una tacuara con yuca y ensalada fresca", description: "Pescado de río cocinado al fuego en tacuara y acompañado con yuca y ensalada fresca.", intensity: "Medio", fat: "Bajo", spice: "Bajo", tastes: ["Salado", "Umami"], aromas: ["Ahumada", "Herbal"], textures: ["Jugosa", "Suave"], techniques: ["Asado", "Cocción en tacuara"], ingredients: ["Pescado de río", "Yuca", "Hierbas"], status: "needs_review" },
  { id: "pescado-amazonico", name: "Pescado amazónico", department: "Pando", region: "Amazonía pandina", image: "/images/departments/pando/platos/pescado-amazonico.webp", imageAlt: "Pescado amazónico pandino asado sobre hoja de plátano con yuca y plátano frito", description: "Categoría de preparaciones con pescado de río; especie y receta pendientes.", intensity: "Medio", fat: "Bajo", spice: "Bajo", tastes: ["Salado", "Umami"], aromas: ["Herbal"], textures: ["Jugosa", "Suave"], techniques: ["Asado"], ingredients: ["Pescado", "Hierbas aromáticas"], status: "needs_review" },
  { id: "sudado-pescado-pandino", name: "Sudado de pescado", department: "Pando", region: "Amazonía pandina", image: "/images/departments/pando/platos/sudado-pescado.webp", imageAlt: "Sudado pandino de pescado de río con tomate, cebolla, hierbas y yuca", description: "Pescado de río cocido suavemente con tomate, cebolla, hierbas y productos amazónicos.", intensity: "Medio", fat: "Bajo", spice: "Bajo", tastes: ["Salado", "Umami", "Ácido"], aromas: ["Herbal", "Vegetal"], textures: ["Jugosa", "Suave"], techniques: ["Cocción húmeda", "Hervido"], ingredients: ["Pescado de río", "Tomate", "Cebolla", "Hierbas"], status: "needs_review" },
];

export const generatedDishCells: Record<string, number> = {
  "chorizo-chuquisaqueno": 0,
  "chancho-cruz": 1,
  "sopa-mani": 2,
  "plato-paceno": 3,
  fricase: 4,
  charquekan: 5,
  "brazuelo-cordero-orureno": 1,
  "carne-llama": 6,
  "kalapurka-potosina": 5,
  majadito: 7,
  "locro-cruceno": 4,
  "pescado-tacuara-beniano": 8,
  "pescado-amazonico": 8,
  "sudado-pescado-pandino": 8,
};
