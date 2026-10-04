// Recipes, rotating menus and the shopping list. Macros are per serving and
// exclude bread; costs use Mercadona prices checked on 4 Oct 2026.

export const RECIPES = {
  gachas: { name: 'Gachas de avena al microondas', tools: ['Microondas'], per: '1 ración', kcal: 630, p: 23, cost: '0,73', ing: '80 g de copos de avena, 350 ml de leche entera, 1 plátano y canela. 2–3 min al microondas, removiendo a mitad.', videos: [['Receta', 'E04oE19ApaY']] },
  lentejas: { name: 'Lentejas con verduras y huevo', tools: ['Olla exprés'], per: '3 raciones', kcal: 540, p: 33, cost: '0,78', ing: '300 g de lentejas pardinas, 1 cebolla, 2 zanahorias, 1 pimiento, 2 ajos, 100 g de tomate triturado, 2 cucharadas de aceite, pimentón, comino y laurel. Al servir, 1 huevo cocido por ración. Si el mes da, añade 240 g de pollo en dados al sofrito: +20 g de proteína por ración por unos 0,55 €.', videos: [['Receta', 'LT4-vu1nULg']] },
  arrozPollo: { name: 'Arroz con pollo', tools: ['Sartén'], per: '3 raciones', kcal: 590, p: 34, cost: '1,10', ing: '500 g de jamoncitos de pollo (o 360 g de contramuslo deshuesado), 270 g de arroz, 300 g de verdura para paella congelada, 100 g de tomate triturado, 3 cucharadas de aceite, ajo, pimentón, cúrcuma y caldo o agua.', note: 'Deja 1 ración en la nevera y congela las otras 2 en cuanto se enfríen.', videos: [['Receta', 'yprneRFOIKM']] },
  espinacas: { name: 'Espinacas con garbanzos y huevo', tools: ['Olla exprés', 'Sartén'], per: '3 raciones', kcal: 600, p: 34, cost: '1,04', ing: '250 g de garbanzos secos (12 h en remojo) o 2 tarros de garbanzos cocidos, 450 g de espinacas congeladas, 6 huevos (2 por ración), 1 rebanada de pan para el majado, 2 ajos, comino, pimentón, un chorrito de vinagre y 3 cucharadas de aceite.', videos: [['Receta', 'cviNRSB1At0'], ['Cocer garbanzos', 'Iw_vWyvm79Q']] },
  macarrones: { name: 'Macarrones con atún y tomate', tools: ['Olla', 'Sartén'], per: '3 raciones', kcal: 630, p: 40, cost: '1,27', ing: '300 g de macarrones, 240 g de atún al natural escurrido, 400 g de tomate triturado, 1 cebolla, 2 cucharadas de aceite, orégano y 3 huevos cocidos (1 por ración).', videos: [['Receta', 'FN-2YmHiC0k']] },
  polloGuisado: { name: 'Pollo guisado con patatas', tools: ['Olla exprés'], per: '3 raciones', kcal: 510, p: 42, cost: '1,53', ing: '750 g de jamoncitos de pollo sin piel, 750 g de patatas, 1 cebolla, 1 pimiento, 2 ajos, 150 g de tomate triturado, 2 cucharadas de aceite, laurel y pimentón.', videos: [['Receta', 'YyKkq-4Plto']] },
  alubias: { name: 'Alubias con pollo', tools: ['Olla exprés'], per: '3 raciones', kcal: 485, p: 37, cost: '1,08', ing: '250 g de alubias blancas secas (12 h en remojo) o 2 tarros de alubias cocidas, 240 g de contramuslo de pollo, 1 cebolla, 1 pimiento, 1 zanahoria, 2 ajos, 100 g de tomate triturado, 2 cucharadas de aceite y pimentón.', videos: [['Receta', '2o2CrSCdzC4']] },
  curry: { name: 'Pollo al curry con arroz', tools: ['Sartén', 'Olla'], per: '3 raciones', kcal: 610, p: 46, cost: '1,32', ing: '450 g de pechuga de pollo, 240 g de arroz, 1 cebolla, 200 ml de leche en lugar de la nata del vídeo, 150 g de guisantes congelados, 2 cucharadas de curry y 2 de aceite.', note: 'Deja 1 ración en la nevera y congela las otras 2 en cuanto se enfríen.', videos: [['Receta', 'qaoKiH_2Fzo']] },
  pescadilla: { name: 'Pescadilla en salsa verde con patatas', tools: ['Sartén', 'Olla'], per: '3 raciones', kcal: 450, p: 35, cost: '1,49', ing: '600 g de pescadilla o merluza congelada, 750 g de patatas, 150 g de guisantes, 3 ajos, perejil, 1 cucharada de harina, 3 cucharadas de aceite y caldo o agua.', videos: [['Receta', 'Fh3P1IrUrBQ']] },
  tortilla: { name: 'Tortilla de patatas al microondas', tools: ['Microondas', 'Sartén'], per: '2 raciones', kcal: 495, p: 29, cost: '1,10', ing: '4 huevos, 200 ml de claras pasteurizadas, 500 g de patatas, media cebolla y 2 cucharadas de aceite.', videos: [['Receta', 'wh4yKe2MkoE']] },
  sardinas: { name: 'Sardinas a la plancha con patatas', tools: ['Sartén', 'Microondas'], per: '1 ración', kcal: 700, p: 52, cost: '2,25', ing: '250 g de sardinas limpias (o boquerones o jurel del mercado), 300 g de patatas, ensalada y 1 cucharada de aceite. El pescado fresco, mejor comerlo el mismo día.', videos: [['Sardinas', 'RV0XdLwn1mg'], ['Patatas al microondas', 'jk9DsNX5PRM']] },
  revuelto: { name: 'Revuelto de huevos y claras con patatas', tools: ['Microondas', 'Sartén'], per: '2 raciones', kcal: 575, p: 36, cost: '1,45', ing: '4 huevos, 300 ml de claras, 600 g de patatas, 200 g de verdura (pimiento, cebolla o espinacas) y 2 cucharadas de aceite.', videos: [['Claras al microondas', 'CQ4gxoiUdDI'], ['Patatas al microondas', 'jk9DsNX5PRM']] }
};

// early = lunch and dinner Mon–Wed (fridge); late = Thu–Sat (freezer).
export const MENUS = [
  { k: 'A', early: ['lentejas', 'arrozPollo'], late: ['espinacas', 'macarrones'], sunday: ['tortilla'], sunDinner: 'tortilla', sunNote: 'Haz las 2 raciones: comida y cena del domingo.' },
  { k: 'B', early: ['lentejas', 'polloGuisado'], late: ['alubias', 'curry'], sunday: ['sardinas'], sunDinner: null, sunNote: 'Por la noche, una tortilla francesa de 2 huevos y 2 claras con pan.' },
  { k: 'C', early: ['lentejas', 'pescadilla'], late: ['arrozPollo', 'espinacas'], sunday: ['revuelto'], sunDinner: 'revuelto', sunNote: 'Haz las 2 raciones: comida y cena del domingo.' }
];

// The rotation started on Sunday 4 October 2026, the first cooking day.
export const MENU_START = '2026-10-04';

export const SHAKES = {
  pre: {
    name: 'Batido pre-entreno',
    verdict: 'Funciona, con 3 ajustes',
    tone: 'ok',
    recipe: '300 ml de leche entera, 60 g de avena, 1 plátano, 1 cucharadita de miel y canela.',
    macros: '≈ 545 kcal · 19 g · 0,70 €',
    plus: 'Si el mes da, añade 150 g de queso fresco batido 0 %: ≈ 615 kcal · 31 g · 1 €.',
    notes: [
      'Tómalo 60–90 min antes de entrenar para no ir pesado.',
      'Con la comida de las 14:00 ya llegas con el glucógeno lleno; tomar hidratos antes no mejora el rendimiento en entrenos normales (Henselmans 2022). Sirve para sumar calorías baratas.',
      'La canela solo ha bajado la glucosa en personas con diabetes, con varios gramos al día. Ponla por sabor.'
    ]
  },
  post: {
    name: 'Batido post-entreno',
    verdict: 'Prescindible con tu presupuesto',
    tone: 'warn',
    recipe: 'Solo si vas a cenar más de 2 h después de entrenar: 300 ml de leche entera, 250 g de queso fresco batido 0 %, 1 plátano y 15 g de crema de cacahuete.',
    macros: '≈ 505 kcal · 34 g · 1,20 €',
    notes: [
      'La cena hace de recuperación: tomar proteína justo al acabar no da más músculo si llegas a la proteína del día (Schoenfeld 2013).',
      'El yogur griego del súper lleva nata: 3,9 g de proteína y 10,8 g de grasa por 100 g. Mejor queso fresco batido 0 %.',
      'Las claras cocinadas se digieren mejor que crudas (91 % frente a 51 %, Evenepoel 1998).',
      'Los dátiles no hacen falta para «disparar la insulina»: añadir hidratos a la proteína no aumentó la síntesis muscular (Staples 2011).'
    ]
  }
};

export const SHOPPING = [
  { group: 'Despensa', items: [
    ['Copos de avena', '920 g', 1.5], ['Lentejas pardinas', '300 g', 0.56], ['Garbanzos secos', '250 g', 0.54],
    ['Arroz', '270 g', 0.31], ['Macarrones', '300 g', 0.35], ['Cacahuetes tostados sin sal', '210 g', 0.81],
    ['Aceite de oliva virgen extra, en garrafa', '130 ml', 0.56], ['Miel, especias, sal y caldo', '—', 1.01]
  ] },
  { group: 'Nevera', items: [
    ['Leche entera', '4,25 L', 4.08], ['Huevos', '16', 3.68], ['Claras pasteurizadas', '200 ml', 0.57],
    ['Queso fresco batido 0 %', '250 g', 0.55], ['Jamoncitos de pollo', '500 g', 1.9], ['Atún al natural', '240 g escurrido', 1.92]
  ] },
  { group: 'Fruta, verdura y pan', items: [
    ['Plátanos', '14', 3.64], ['Patatas', '500 g', 0.5], ['Cebolla, zanahoria, pimiento y ajo', '≈ 700 g', 1.31],
    ['Tomate triturado', '600 g', 0.75], ['Lechuga y tomate', '—', 0.6], ['Pan (packs de 3 barras)', '1,25 kg', 1.99]
  ] },
  { group: 'Congelados', items: [
    ['Espinacas', '450 g', 0.9], ['Verdura para paella', '300 g', 0.63]
  ] }
];

export const SAVINGS = [
  ['Un plátano al día en vez de dos: quita el de las gachas y pon 25 g más de avena', '≈ 1,50 €'],
  ['Ofertas de la app y la marca blanca más barata de cada producto', '≈ 1,40 €'],
  ['Menos pan y más arroz o pasta en el táper, con las mismas calorías', '≈ 0,85 €'],
  ['Verdura, fruta y pescado en el mercado de abastos o de oferta', '≈ 0,50–1 €']
];

export const STORES = [
  'En el estudio de la OCU de 2025, Sanlúcar de Barrameda empata con Torrent como la localidad más barata de las 183 analizadas.',
  'Las que más veces salen como la más barata de su ciudad son Alcampo, Consum, Lidl y Supeco. En Sanlúcar tienes Lidl (avenida de la Constitución) y Supeco (carretera de Chipiona).',
  'Haz la prueba: compra la lista una semana en Aldi y la siguiente en Supeco o en Lidl, y compara los tickets.',
  'En el mercado de abastos, la sardina, el boquerón o el jurel de temporada suelen salir baratos y son pescado azul.'
];

export const APPS = [
  ['Lidl Plus', 'Cupones cada semana y 1 punto por cada euro, canjeables por descuentos.'],
  ['App de Aldi', 'Las ofertas de cada semana organizadas por días.'],
  ['Club Dia', 'Cupones y descuentos exclusivos de la app.'],
  ['Too Good To Go', 'Packs de comida del día a precio reducido.']
];

export const FOOD_SAFETY = [
  'Domingo, 2–3 h: cocina las 4 recetas del menú. Las de lunes a miércoles van a la nevera; las de jueves a sábado, al congelador.',
  'Cada noche, pasa del congelador a la nevera los tápers del día siguiente.',
  'La comida cocinada aguanta 3–4 días en la nevera y 3–4 meses congelada (USDA).',
  'El arroz es distinto: enfríalo en menos de 1 h, no lo tengas más de 24 h en la nevera y recaliéntalo una sola vez, hasta que humee (Food Standards Agency).'
];
