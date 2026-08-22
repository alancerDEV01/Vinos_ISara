export type FeaturedItem = {
  name: string;
  description: string;
  image?: string;
  imageAlt?: string;
  reviewStatus: "draft" | "needs_media";
};

export type DepartmentContent = {
  focus: string;
  description: string;
  place: FeaturedItem;
  dish: FeaturedItem;
};

export const departmentContent: Record<string, DepartmentContent> = {
  Beni: {
    focus: "Llanos de Moxos",
    description: "Paisajes amazónicos, cultura mojeña y una cocina vinculada al plátano, la yuca y los ríos.",
    place: { name: "Llanos de Moxos", description: "Sabanas inundables y humedales del Beni.", image: "/images/departments/beni/lugares/llanos-de-moxos.jpg", imageAlt: "Paisaje y fauna de los Llanos de Moxos", reviewStatus: "draft" },
    dish: { name: "Masaco beniano", description: "Preparación tradicional a base de plátano o yuca majada.", image: "/images/departments/beni/platos/masaco.jpg", imageAlt: "Masaco beniano servido en un plato", reviewStatus: "draft" },
  },
  Chuquisaca: {
    focus: "Sucre y Valle de Cinti",
    description: "Patrimonio histórico, cepas criollas y tradiciones culinarias del sur boliviano.",
    place: { name: "Sucre", description: "Capital histórica de Bolivia y puerta de entrada a los valles de Chuquisaca.", image: "/images/departments/chuquisaca/lugares/sucre.jpg", imageAlt: "Vista panorámica de Sucre", reviewStatus: "draft" },
    dish: { name: "Mondongo chuquisaqueño", description: "Plato de cerdo con ají colorado, mote y acompañamientos regionales.", image: "/images/generated/mondongo-chuquisaqueno.png", imageAlt: "Mondongo chuquisaqueño con cerdo en ají colorado, mote amarillo y papa", reviewStatus: "draft" },
  },
  Cochabamba: {
    focus: "Valle de Cochabamba",
    description: "Un territorio agrícola reconocido por la diversidad y abundancia de su gastronomía.",
    place: { name: "Cochabamba", description: "Ciudad y valle central rodeados por la cordillera del Tunari.", image: "/images/departments/cochabamba/lugares/cochabamba.jpg", imageAlt: "Paisaje urbano de Cochabamba", reviewStatus: "draft" },
    dish: { name: "Silpancho", description: "Carne apanada, arroz, papa, huevo y ensalada fresca.", image: "/images/generated/silpancho-cochabambino.png", imageAlt: "Silpancho cochabambino con carne fina apanada, arroz, papas, huevos y ensalada", reviewStatus: "draft" },
  },
  "La Paz": {
    focus: "Altiplano e Illimani",
    description: "Contrastes de altura, valles y productos andinos alrededor del área metropolitana paceña.",
    place: { name: "La Paz e Illimani", description: "La ciudad andina enmarcada por el nevado Illimani.", image: "/images/departments/la-paz/lugares/illimani.jpg", imageAlt: "La Paz con el Illimani al fondo", reviewStatus: "draft" },
    dish: { name: "Plato paceño", description: "Habas, choclo, papa y queso; fotografía específica todavía pendiente.", reviewStatus: "needs_media" },
  },
  Oruro: {
    focus: "Sajama y altiplano",
    description: "Volcanes, salares y cultura altiplánica vinculados a una cocina de gran intensidad.",
    place: { name: "Sajama", description: "El nevado más alto de Bolivia y su paisaje altoandino.", image: "/images/departments/oruro/lugares/sajama.jpg", imageAlt: "Nevado Sajama en el departamento de Oruro", reviewStatus: "draft" },
    dish: { name: "Charquekan", description: "Charque, mote, papa, huevo y queso; fotografía pendiente de revisión.", reviewStatus: "needs_media" },
  },
  Pando: {
    focus: "Amazonía pandina",
    description: "Bosques tropicales, ríos y una gastronomía construida alrededor de productos amazónicos.",
    place: { name: "Amazonía pandina", description: "Bosque y sistemas fluviales del norte de Bolivia; fotografía pendiente.", reviewStatus: "needs_media" },
    dish: { name: "Pescado amazónico", description: "Preparaciones regionales con pescado de río; fotografía pendiente.", reviewStatus: "needs_media" },
  },
  Potosí: {
    focus: "Cerro Rico y valles potosinos",
    description: "Historia minera, paisajes de altura y preparaciones que conservan técnicas ancestrales.",
    place: { name: "Cerro Rico", description: "Montaña histórica que domina el paisaje de la ciudad de Potosí.", image: "/images/departments/potosi/lugares/cerro-rico.jpg", imageAlt: "Cerro Rico sobre la ciudad de Potosí", reviewStatus: "draft" },
    dish: { name: "Kalapurka", description: "Sopa espesa servida tradicionalmente con una piedra volcánica caliente.", image: "/images/departments/potosi/platos/kalapurka.jpg", imageAlt: "Kalapurka potosina", reviewStatus: "draft" },
  },
  "Santa Cruz": {
    focus: "Amboró y llanuras orientales",
    description: "Bosque nublado, llanuras productivas y cocina camba de raíces diversas.",
    place: { name: "Parque Nacional Amboró", description: "Encuentro biogeográfico entre Andes, Amazonía y Chaco.", image: "/images/departments/santa-cruz/lugares/amboro.jpg", imageAlt: "Bosque del Parque Nacional Amboró", reviewStatus: "draft" },
    dish: { name: "Majadito", description: "Arroz con charque o pollo, plátano y huevo; fotografía todavía pendiente.", reviewStatus: "needs_media" },
  },
  Tarija: {
    focus: "Valle Central de Tarija",
    description: "Vinos de altura, bodegas y gastronomía regional conectados por atributos sensoriales.",
    place: { name: "Valle Central", description: "Valles templados donde se desarrolla la vitivinicultura tarijeña.", image: "/images/departments/tarija/lugares/valle-central.jpg", imageAlt: "Valle de Santa Ana en Tarija", reviewStatus: "draft" },
    dish: { name: "Saice tarijeño", description: "Carne picada con ají, papa y acompañamientos frescos.", image: "/images/departments/tarija/platos/saice.jpg", imageAlt: "Saice tarijeño servido en un plato", reviewStatus: "draft" },
  },
};
