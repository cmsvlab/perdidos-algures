// Perdidos Algures — data model (v2: 8 phases).
// Edition flow:
//   1. RSVP — who's in
//   2. Sugerir localizações (up to 3 each)
//   3. Votar localização — winner picked
//   4. Sugerir alojamentos (unlimited, with type / price / area / link / note)
//   5. Votar alojamento — winner picked
//   6. Disponibilidade — each marks days
//   7. Trancar datas — admin locks range
//   8. Planeamento — costs, itinerary, activities, shopping

window.PA_DATA = {
  adminId: 'miguel',

  members: [
    { id: 'miguel',  name: 'Miguel',  initials: 'M',  color: '#1f1a14', isAdmin: true },
    { id: 'rita',    name: 'Rita',    initials: 'RP', color: '#d97757' },
    { id: 'tiago',   name: 'Tiago',   initials: 'TM', color: '#6b8e6f' },
    { id: 'matilde', name: 'Matilde', initials: 'MS', color: '#b08968' },
    { id: 'joao',    name: 'João',    initials: 'JF', color: '#8b6f47' },
    { id: 'ines',    name: 'Inês',    initials: 'IC', color: '#c08552' },
    { id: 'pedro',   name: 'Pedro',   initials: 'PR', color: '#7a8c5a' },
    { id: 'sofia',   name: 'Sofia',   initials: 'SL', color: '#a47148' },
  ],

  edition: {
    number: 14,
    title: 'Tropa Mediterrânica',
    subtitle: 'Algures entre o sol e o vinho.',
    currentPhase: 5,
    startedAt: 'há 12 dias',
    startedBy: 'miguel',
  },

  phases: [
    { n: 1, key: 'rsvp',     name: 'Quem entra',         hint: 'Estás dentro?' },
    { n: 2, key: 'locSug',   name: 'Localizações',       hint: 'Até 3 por cabeça' },
    { n: 3, key: 'locVote',  name: 'Votar local',        hint: 'Voto secreto' },
    { n: 4, key: 'accSug',   name: 'Alojamentos',        hint: 'Sem limite' },
    { n: 5, key: 'accVote',  name: 'Votar alojamento',   hint: 'Voto secreto' },
    { n: 6, key: 'avail',    name: 'Disponibilidade',    hint: 'Quando podes?' },
    { n: 7, key: 'lock',     name: 'Datas finais',       hint: 'Admin tranca' },
    { n: 8, key: 'plan',     name: 'Planeamento',        hint: 'Arrumar tudo' },
  ],

  // ─── Phase 1 — RSVP ────────────────────────────────────
  phase1: {
    deadline: 'fechou há 6 dias',
    state: {
      miguel:'in', rita:'in', tiago:'in', matilde:'in',
      joao:'in', ines:'in', pedro:'in', sofia:'out',
    },
  },

  // ─── Phase 2 — Sugerir localizações (up to 3 each) ─────
  phase2: {
    deadline: 'fechou há 3 dias',
    perPersonLimit: 3,
    suggestions: [
      { id: 'cies',    name: 'Ilhas Cíes + Bouzas', city: 'Vigo, ES',       by: 'matilde', tags: ['Natureza', 'Glamping'],     accent: '#6b8e6f' },
      { id: 'samil',   name: 'Praia de Samil',       city: 'Vigo, ES',       by: 'tiago',   tags: ['Praia', 'Casa partilhada'], accent: '#5a8caa' },
      { id: 'casco',   name: 'Casco Vello',          city: 'Vigo, ES',       by: 'joao',    tags: ['Cidade', 'Tapas'],          accent: '#c8956d' },
      { id: 'cangas',  name: 'Cangas do Morrazo',    city: 'Pontevedra, ES', by: 'pedro',   tags: ['Sossego', 'Vista mar'],     accent: '#a47148' },
      { id: 'baiona',  name: 'Baiona',               city: 'Pontevedra, ES', by: 'rita',    tags: ['Marítima', 'Centro'],       accent: '#7a8c5a' },
      { id: 'comporta',name: 'Comporta',             city: 'Setúbal, PT',    by: 'ines',    tags: ['Praia', 'Sereno'],          accent: '#b08968' },
      { id: 'porto',   name: 'Porto',                city: 'Porto, PT',      by: 'miguel',  tags: ['Cidade', 'Vinhos'],         accent: '#8b6f47' },
      { id: 'gimonde', name: 'Gimonde',              city: 'Bragança, PT',   by: 'matilde', tags: ['Aldeia', 'Forno a lenha'],  accent: '#a07852' },
    ],
    submittedBy: { miguel: 1, rita: 1, tiago: 1, matilde: 2, joao: 1, ines: 1, pedro: 1 },
  },

  // ─── Phase 3 — Votar localização ───────────────────────
  phase3: {
    deadline: 'fechou ontem',
    votedBy: ['rita', 'tiago', 'matilde', 'ines', 'miguel', 'joao', 'pedro'],
    pendingBy: [],
    myVote: 'cies',
    results: {
      cies:     { count: 4, voters: ['rita', 'tiago', 'matilde', 'ines'] },
      samil:    { count: 1, voters: ['miguel'] },
      casco:    { count: 1, voters: ['joao'] },
      cangas:   { count: 1, voters: ['pedro'] },
      baiona:   { count: 0, voters: [] },
      comporta: { count: 0, voters: [] },
      porto:    { count: 0, voters: [] },
      gimonde:  { count: 0, voters: [] },
    },
    winnerId: 'cies',
  },

  // ─── Phase 4 — Sugerir alojamentos (unlimited) ─────────
  phase4: {
    deadline: 'fecha em 3 dias',
    perPersonLimit: null, // unlimited
    // The location winner determines context — these are around Vigo / Cíes
    locationName: 'Vigo · Ilhas Cíes',
    types: ['Casa', 'Apartamento', 'Glamping', 'Hostel', 'Hotel', 'Outro'],
    suggestions: [
      { id: 'a1', type: 'Casa',       price: 65, area: 'Bouzas',         link: 'https://airbnb.com/h/casadofaro',  note: 'A 200m do centro de Bouzas, 4 quartos, vista para a ria. Já fui — o anfitrião é simpático.', by: 'tiago' },
      { id: 'a2', type: 'Glamping',   price: 82, area: 'Cíes (ilha)',     link: 'https://campingilascies.com',      note: 'Dentro do parque natural, tendas com cama a sério. Único senão: ferry tem horário fixo.', by: 'matilde' },
      { id: 'a3', type: 'Apartamento',price: 58, area: 'Casco Vello',     link: 'https://booking.com/p/vigolofts',  note: 'Centro histórico, perto das tapas. Sem elevador, 3 andares de escadas.', by: 'joao' },
      { id: 'a4', type: 'Casa',       price: 71, area: 'Cangas',          link: 'https://airbnb.com/h/quintadaria','note': 'Casa rural com piscina pequena, mais sossegado. Carro é preciso.', by: 'pedro' },
      { id: 'a5', type: 'Hostel',     price: 32, area: 'Vigo centro',     link: 'https://hostelvigo.com',           note: 'Quarto privado para 8 dá-se bem. Cozinha partilhada com mais gente.', by: 'rita' },
      { id: 'a6', type: 'Apartamento',price: 64, area: 'Bouzas',          link: 'https://airbnb.com/h/marinabouzas','note': 'Frente à marina, varanda grande. Caro para o que é mas a vista compensa.', by: 'ines' },
    ],
    submittedBy: { miguel: 0, rita: 1, tiago: 1, matilde: 1, joao: 1, ines: 1, pedro: 1 },
  },

  // ─── Phase 5 — Votar alojamento (currently with a TIE) ─
  phase5: {
    deadline: 'fecha em 18h',
    votedBy: ['rita', 'tiago', 'matilde', 'ines', 'miguel', 'joao'],
    pendingBy: ['pedro'],
    myVote: 'a1',
    // Results show a TIE (a1 and a2 both at 3) to demonstrate the tiebreak.
    results: {
      a1: { count: 3, voters: ['rita', 'tiago', 'miguel'] },
      a2: { count: 3, voters: ['matilde', 'ines', 'joao'] },
      a3: { count: 0, voters: [] },
      a4: { count: 0, voters: [] },
      a5: { count: 0, voters: [] },
      a6: { count: 0, voters: [] },
    },
    winnerId: null, // decided by tiebreak
  },

  // ─── Phase 6 — Availability ────────────────────────────
  phase6: {
    monthLabel: 'Junho 2026',
    monthGrid: buildMonth(2026, 5),
    availability: {
      miguel:  [5, 6, 12, 13, 14, 19, 20, 21, 26, 27, 28],
      rita:    [5, 6, 7, 12, 13, 14, 19, 20, 21],
      tiago:   [12, 13, 14, 19, 20, 21, 26, 27, 28],
      matilde: [5, 6, 7, 12, 13, 14, 26, 27, 28],
      joao:    [12, 13, 14, 19, 20, 21],
      ines:    [12, 13, 14, 21],
      pedro:   [13, 14, 19, 20, 21, 26, 27, 28],
    },
    submittedBy: ['miguel', 'rita', 'tiago', 'matilde', 'joao', 'ines'],
    pendingBy: ['pedro'],
  },

  // ─── Phase 7 — Lock dates ──────────────────────────────
  phase7: {
    locked: { from: 12, to: 14, monthLabel: 'Junho 2026' },
    consensus: 7,
  },

  // ─── Phase 8 — Planning ────────────────────────────────
  phase8: {
    tripStart: '12 Jun',
    tripEnd: '14 Jun',
    dayCount: 3,
    costs: {
      perPerson: 215,
      breakdown: [
        { label: 'Alojamento', value: 69 },
        { label: 'Ferry Cíes', value: 22 },
        { label: 'Comida', value: 80 },
        { label: 'Aluguer carros', value: 28 },
        { label: 'Imprevistos', value: 16 },
      ],
      paid: { miguel: 215, rita: 215, tiago: 100, matilde: 215, joao: 0, ines: 215, pedro: 50 },
    },
    itinerary: [
      { day: 'Sex 12', items: [
        { t: '17:30', label: 'Check-in Casa do Faro', who: 'miguel' },
        { t: '20:00', label: 'Jantar em Bouzas — A Marisqueira', who: 'tiago' },
      ]},
      { day: 'Sáb 13', items: [
        { t: '09:30', label: 'Ferry para as Cíes', who: 'matilde' },
        { t: '13:00', label: 'Picnic na praia de Rodas', who: 'rita' },
        { t: '21:00', label: 'Cocktails no Casco Vello', who: 'joao' },
      ]},
      { day: 'Dom 14', items: [
        { t: '11:00', label: 'Brunch lento', who: 'ines' },
        { t: '15:00', label: 'Estrada para casa', who: 'pedro' },
      ]},
    ],
    activities: [
      { id: 'a1', label: 'Caiaque nas Cíes', by: 'tiago', votes: 6 },
      { id: 'a2', label: 'Vinícola Albariño', by: 'joao', votes: 4 },
      { id: 'a3', label: 'Mercado de Bouzas', by: 'matilde', votes: 5 },
      { id: 'a4', label: 'Trilho ao Monte Faro', by: 'pedro', votes: 3 },
      { id: 'a5', label: 'Aula de cozinha galega', by: 'rita', votes: 7 },
    ],
    shopping: [
      { id: 's1', label: 'Pequeno-almoço (pão, fruta, café)', who: 'rita', done: true },
      { id: 's2', label: 'Vinho branco × 6', who: 'joao', done: true },
      { id: 's3', label: 'Carvão + acendalha', who: 'pedro', done: false },
      { id: 's4', label: 'Protetor solar', who: 'matilde', done: false },
      { id: 's5', label: 'Música offline', who: 'tiago', done: false },
      { id: 's6', label: 'Marshmallows', who: 'ines', done: true },
    ],
  },

  // ─── Past editions ─────────────────────────────────────
  history: [
    { n: 13, title: 'Costa Vicentina',  dates: 'Out 2025', winner: 'Aljezur',       people: 6, cover: '#5a7a4a' },
    { n: 12, title: 'Verão Atlântico',  dates: 'Jun 2025', winner: 'Praia da Luz',  people: 7, cover: '#c8956d' },
    { n: 11, title: 'San Sebastián',    dates: 'Set 2024', winner: 'Parte Vieja',   people: 6, cover: '#8b6f47' },
  ],
};

function buildMonth(year, monthIndex) {
  const first = new Date(year, monthIndex, 1);
  const startCol = (first.getDay() + 6) % 7;
  const daysInMonth = new Date(year, monthIndex + 1, 0).getDate();
  const cells = [];
  for (let i = 0; i < startCol; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);
  while (cells.length % 7 !== 0) cells.push(null);
  return cells;
}
