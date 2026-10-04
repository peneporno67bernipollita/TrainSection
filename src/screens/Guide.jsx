import { Top, Videos } from '../ui.jsx';

const SECTIONS = [
  {
    id: 'progresion', title: 'Cómo progresar',
    body: (
      <ul class="dots small">
        <li><strong>Semanas 1 y 2, rodaje:</strong> 2 series por ejercicio con 2–3 repeticiones en reserva (RIR). Aprende la técnica y apunta los pesos.</li>
        <li><strong>Doble progresión:</strong> sube repeticiones de una sesión a otra. Cuando llegues al máximo del rango en todas las series, sube el peso lo mínimo y vuelve a la parte baja. La app te avisa en cada ejercicio.</li>
        <li><strong>Dominadas y fondos:</strong> cuando completes todas las series al máximo, añade 2,5 kg con un cinturón de lastre o una mancuerna entre los pies.</li>
        <li><strong>RIR</strong> son las repeticiones que te quedan. RIR 2 = podrías hacer 2 más con buena técnica. En los ejercicios grandes quédate a 1–2 del fallo; en los de aislamiento la última serie puede ir al fallo.</li>
        <li>Baja el peso en 2–3 s y usa todo el recorrido, sobre todo la parte en la que el músculo se estira.</li>
        <li>Descansa 3 min en los ejercicios de fuerza, 2 min en el resto de ejercicios grandes y 1–1,5 min en los de aislamiento. El temporizador lo hace solo.</li>
        <li>Calentamiento: 5 min suaves y 2–3 series de aproximación en el primer ejercicio de cada músculo (50 % × 10, 70 % × 5, 85–90 % × 2).</li>
        <li><strong>Semana 9, descarga:</strong> mitad de series, mismos pesos y RIR 3–4. Adelántala si rindes peor 2 sesiones seguidas o te duelen las articulaciones.</li>
        <li>Si una noche duermes menos de 6 h, quita la última serie de cada ejercicio al día siguiente.</li>
      </ul>
    )
  },
  {
    id: 'calistenia', title: 'Calistenia los sábados',
    body: (
      <div class="stack">
        <ol class="dots small">
          <li><strong>Calentamiento, 10 min:</strong> muñecas, círculos de hombro, colgarte de la barra 2 × 20–30 s y flexiones escapulares.</li>
          <li><strong>Habilidad, 20 min:</strong> elige 1 o 2 y practícalas descansado: pino contra la pared, L-sit, front lever recogido o muscle up. Intentos cortos y de calidad.</li>
          <li><strong>Fuerza, 20 min:</strong> flexiones en paralelas, remo invertido en anillas, fondos y sentadilla a una pierna asistida. 3 × 5–12 dejando 2–3 repeticiones.</li>
          <li><strong>Core, 5–10 min:</strong> hollow body 3 × 20–30 s.</li>
        </ol>
        <ul class="dots small">
          <li>Nunca al fallo: el lunes toca fuerza en el gimnasio.</li>
          <li>Muscle up cuando hagas 10 dominadas estrictas y 15 fondos.</li>
          <li>Habilidades con brazos rectos (front lever, plancha): progresa despacio; tendones y codos se adaptan más lento que el músculo.</li>
          <li>Por tu cuello: nada de pino de cabeza ni flexiones con la cabeza en el suelo.</li>
          <li>Material: paralelas bajas, anillas de gimnasia y una banda elástica.</li>
          <li>Plan gratis y completo: <a href="https://www.reddit.com/r/bodyweightfitness/wiki/kb/recommended_routine" target="_blank" rel="noopener">Recommended Routine de r/bodyweightfitness</a>.</li>
        </ul>
        <Videos first={false} list={[['Muñecas', 'O2s_Sjx0OKk'], ['Pino', 'hdQRNuZs-HA'], ['L-sit', '_9TtEekVvDI'], ['Front lever', 'oTQI2y1EIT4'], ['Muscle up', '8WtE-8MyAzI']]} />
      </div>
    )
  },
  {
    id: 'antebrazo', title: 'Antebrazo',
    body: (
      <ul class="dots small">
        <li>Que se ponga duro como una piedra es bombeo. Lo que lo hace crecer es subir peso o repeticiones semana a semana.</li>
        <li>Curl inverso (braquiorradial y extensores), curl de muñeca (flexores), tu ejercicio de pulso en polea y paseo del granjero.</li>
        <li>En el pulso en polea, deja que la polea te abra la muñeca al volver: entrenar el músculo estirado lo hace crecer más.</li>
        <li>Si te duele la parte interna o externa del codo más de 2–3 días, baja el trabajo de agarre y vuelve a subirlo poco a poco.</li>
      </ul>
    )
  },
  {
    id: 'seguridad', title: 'Seguridad',
    body: (
      <ul class="dots small">
        <li><strong>Cuello:</strong> sin sentadilla con barra por ahora; en la hack, cabeza apoyada y mirada al frente. Médico o fisio si el dolor aparece fuera del gimnasio, dura más de 2–3 semanas o notas hormigueo en los brazos.</li>
        <li><strong>Peso libre:</strong> las máquinas hacen crecer igual. Empieza ligero con las mancuernas.</li>
        <li><strong>Asma:</strong> calienta progresivo. Si vuelven los pitos o la opresión al hacer cardio, coméntalo con tu médico.</li>
        <li><strong>Alergia al aguacate:</strong> comparte proteínas con plátano, kiwi y castaña. Si notas picor en la boca con el plátano, déjalo y ve al alergólogo.</li>
        <li><strong>Oficina:</strong> pantalla a la altura de los ojos y 3–5 min andando cada hora.</li>
      </ul>
    )
  },
  {
    id: 'habitos', title: 'Hábitos',
    body: (
      <ul class="dots small">
        <li><strong>Sueño 7,5–8 h:</strong> a la cama a las 22:30 y arriba a las 6:30, también el fin de semana. Una noche sin dormir baja la síntesis muscular un 18 %.</li>
        <li><strong>8.000–10.000 pasos:</strong> 3–5 min andando cada hora y un paseo tras comer.</li>
        <li><strong>Alcohol:</strong> solo en ocasiones. Tras entrenar, beber mucho bajó la síntesis muscular un 24 % incluso con proteína.</li>
        <li><strong>Orden:</strong> gimnasio L–V a las 18:00 como una cita; bolsa preparada la noche antes; domingo para tápers y plan. Regla del mínimo: en un día malo, solo los 2 primeros ejercicios. Nunca dos fallos seguidos.</li>
      </ul>
    )
  },
  {
    id: 'esperar', title: 'Qué esperar',
    body: (
      <ul class="dots small">
        <li>Un natural bien entrenado gana en torno al 1–1,5 % de su peso en músculo al mes el primer año: unos 0,4–0,8 kg al mes en tu caso.</li>
        <li>En un año bien hecho, unos 4–7 kg de músculo. Tras 5–6 meses subiendo, una definición corta de 6–8 semanas para ver el abdomen.</li>
        <li>Hacer abdominales no quema la grasa de la barriga: se marca bajando la grasa total.</li>
        <li>Varios físicos de redes no son naturales (Chris Bumstead y Sam Sulek lo han reconocido). Compárate con tus fotos de hace 8 semanas.</li>
      </ul>
    )
  },
  {
    id: 'estudios', title: 'Estudios clave',
    body: (
      <ul class="dots small">
        <li><a href="https://link.springer.com/article/10.1007/s40279-025-02344-w" target="_blank" rel="noopener">Pelland 2025</a>: más series semanales, más músculo, con rendimientos decrecientes.</li>
        <li><a href="https://link.springer.com/article/10.1007/s40279-024-02069-2" target="_blank" rel="noopener">Robinson 2024</a>: acercarse al fallo da más hipertrofia.</li>
        <li><a href="https://link.springer.com/article/10.1186/s13102-023-00713-4" target="_blank" rel="noopener">Haugen 2023</a>: máquinas y peso libre, misma hipertrofia.</li>
        <li><a href="https://onlinelibrary.wiley.com/doi/10.1080/17461391.2022.2100279" target="_blank" rel="noopener">Maeo 2023</a>: tríceps por encima de la cabeza crece más.</li>
        <li><a href="https://link.springer.com/article/10.1186/s40798-023-00651-y" target="_blank" rel="noopener">Helms 2023</a>: un superávit grande sobre todo añade grasa.</li>
        <li><a href="https://www.researchgate.net/publication/318368028_A_systematic_review_meta-analysis_and_meta-regression_of_the_effect_of_protein_supplementation_on_resistance_training-induced_gains_in_muscle_mass_and_strength_in_healthy_adults" target="_blank" rel="noopener">Morton 2018</a>: la proteína deja de sumar en torno a 1,6 g/kg.</li>
        <li><a href="https://physoc.onlinelibrary.wiley.com/doi/10.14814/phy2.14660" target="_blank" rel="noopener">Lamon 2021</a>: dormir mal frena la síntesis muscular.</li>
        <li><a href="https://www.gov.uk/government/publications/home-food-fact-checker/home-food-fact-checker" target="_blank" rel="noopener">Food Standards Agency</a>: el arroz cocinado, máximo 24 h en la nevera.</li>
      </ul>
    )
  }
];

export function Guide({ open = '' }) {
  return (
    <>
      <Top title="Guía" back="#/hoy" />
      <main class="content">
        {SECTIONS.map((sec) => (
          <details class="card" key={sec.id} id={sec.id} open={open ? open === sec.id : sec.id === 'progresion'}>
            <summary class="h2" style={{ cursor: 'pointer' }}>{sec.title}</summary>
            {sec.body}
          </details>
        ))}
      </main>
    </>
  );
}
