// "Plan Fase 1": 5 gym days (Mon–Fri). Rest is in seconds.
// type 'leg' or 'up' drives the calories of the day.

const i = (ex, sets, min, max, rir, rest, extra = {}) => ({ ex, sets, min, max, rir, rest, ...extra });

export const PRESET_ID = 'fase1';

export const PRESET_ROUTINE = {
  id: PRESET_ID,
  name: 'Plan Fase 1',
  source: 'preset',
  version: 4,
  days: [
    {
      id: 'torsoA', name: 'Torso A', short: 'L', plate: 'p25', type: 'up', time: 70,
      focus: 'Fuerza: press, dominadas, remo y fondos',
      items: [
        i('press_incl_smith', 4, 5, 8, '1–2', 180),
        i('dominadas', 4, 5, 8, '1–2', 180),
        i('press_hombro_maquina', 3, 6, 10, '1–2', 150),
        i('remo_apoyo_pecho', 3, 6, 10, '1–2', 150),
        i('fondos', 3, 6, 10, '1–2', 150),
        i('lateral_polea', 3, 12, 15, '0–1', 75)
      ]
    },
    {
      id: 'piernaA', name: 'Pierna A', short: 'M', plate: 'p20', type: 'leg', time: 70,
      focus: 'Fuerza: hack, rumano y agarre',
      items: [
        i('hack', 4, 5, 8, '1–2', 180),
        i('rdl_smith', 3, 6, 8, '2', 180),
        i('curl_femoral_sentado', 3, 8, 12, '0–1', 105),
        i('ext_cuadriceps', 2, 10, 15, '0–1', 90),
        i('granjero', 3, 30, 40, 'agarre', 120),
        i('gemelo_pie', 3, 8, 12, '0–1', 90),
        i('crunch_polea', 3, 10, 15, '0–1', 60)
      ]
    },
    {
      id: 'prio', name: 'Prioridades', short: 'X', plate: 'p15', type: 'up', time: 70,
      focus: 'Hombro lateral, pecho superior, tríceps, antebrazo y abdomen',
      items: [
        i('press_incl_mancuernas', 3, 8, 12, '1–2', 150),
        i('cruce_poleas', 3, 12, 15, '0–1', 90),
        i('lateral_maquina', 3, 12, 20, '0–1', 60),
        i('lateral_cruzada', 3, 15, 20, '0–1', 60, { ss: 'A' }),
        i('triceps_overhead', 3, 10, 15, '0–1', 60, { ss: 'A' }),
        i('triceps_cuerda', 3, 10, 15, '0–1', 60, { ss: 'B' }),
        i('curl_inverso', 3, 10, 15, '0–1', 60, { ss: 'B' }),
        i('pulso_polea', 2, 8, 12, '1–2', 60, { perSide: true }),
        i('curl_muneca', 2, 12, 20, '0–1', 60, { ss: 'C' }),
        i('rodillas_colgado', 3, 10, 15, '1', 60, { ss: 'C' })
      ]
    },
    {
      id: 'torsoB', name: 'Torso B', short: 'J', plate: 'p10', type: 'up', time: 60,
      focus: 'Espalda ancha, pecho, hombro posterior y bíceps',
      items: [
        i('jalon', 3, 8, 12, '1–2', 120),
        i('remo_polea', 3, 8, 12, '1–2', 120),
        i('press_pecho_maquina', 3, 8, 12, '1–2', 120),
        i('pullover_polea', 2, 12, 15, '0–1', 90),
        i('pajaros_maquina', 3, 12, 20, '0–1', 75),
        i('curl_predicador', 3, 10, 15, '0–1', 90)
      ]
    },
    {
      id: 'piernaB', name: 'Pierna B', short: 'V', plate: 'p5', type: 'leg', time: 65,
      focus: 'Pierna completa, glúteo y hombro lateral',
      items: [
        i('prensa', 3, 10, 15, '1–2', 150),
        i('curl_femoral_tumbado', 3, 10, 15, '0–1', 90),
        i('hip_thrust_maquina', 3, 8, 12, '1–2', 120),
        i('ext_cuadriceps', 3, 12, 15, '0–1', 90),
        i('gemelo_prensa', 3, 12, 15, '0–1', 60),
        i('lateral_mancuernas', 3, 15, 20, '0–1', 60),
        i('crunch_maquina', 3, 10, 15, '0–1', 60)
      ]
    }
  ]
};

export const PLATES = ['p25', 'p20', 'p15', 'p10', 'p5'];
