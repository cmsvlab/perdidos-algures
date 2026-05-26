// Perdidos Algures — data model (limpo, pronto para uso real).
// Toda a informação dinâmica (RSVP, sugestões, votos, disponibilidade)
// fica no AppStore (localStorage) em auth.jsx — não aqui.

const MONTH_NAMES = ['Janeiro','Fevereiro','Março','Abril','Maio','Junho',
                     'Julho','Agosto','Setembro','Outubro','Novembro','Dezembro'];

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

// Mês dinâmico: dois meses à frente (zona de viagem típica)
function getDefaultMonth() {
  const now = new Date();
  const target = new Date(now.getFullYear(), now.getMonth() + 2, 1);
  return { year: target.getFullYear(), month: target.getMonth() };
}
const { year: DY, month: DM } = getDefaultMonth();

window.PA_DATA = {
  adminId: 'miguel',

  // Só o admin está pré-definido; os restantes membros registam-se via AuthStore.
  members: [
    { id: 'miguel', name: 'Miguel', initials: 'M', color: '#1f1a14', isAdmin: true },
  ],

  edition: {
    number: 1,
    title: 'Nova Aventura',
    subtitle: 'Algures no mundo.',
    currentPhase: 1,
    startedAt: 'hoje',
    startedBy: 'miguel',
  },

  phases: [
    { n: 1, key: 'rsvp',    name: 'Quem entra',       hint: 'Estás dentro?' },
    { n: 2, key: 'locSug',  name: 'Localizações',     hint: 'Até 3 por cabeça' },
    { n: 3, key: 'locVote', name: 'Votar local',      hint: 'Voto secreto' },
    { n: 4, key: 'accSug',  name: 'Alojamentos',      hint: 'Sem limite' },
    { n: 5, key: 'accVote', name: 'Votar alojamento', hint: 'Voto secreto' },
    { n: 6, key: 'avail',   name: 'Disponibilidade',  hint: 'Quando podes?' },
    { n: 7, key: 'lock',    name: 'Datas finais',     hint: 'Admin tranca' },
    { n: 8, key: 'plan',    name: 'Planeamento',      hint: 'Arrumar tudo' },
  ],

  // Estrutura estática usada como fallback; dados reais vêm do AppStore.
  phase1: { deadline: null, state: {} },
  phase2: { deadline: null, perPersonLimit: 3, suggestions: [], submittedBy: {} },
  phase3: { deadline: null, votedBy: [], pendingBy: [], results: {}, winnerId: null },
  phase4: {
    deadline: null, perPersonLimit: null, locationName: '',
    types: ['Casa', 'Apartamento', 'Glamping', 'Hostel', 'Hotel', 'Outro'],
    suggestions: [], submittedBy: {},
  },
  phase5: { deadline: null, votedBy: [], pendingBy: [], results: {}, winnerId: null },
  phase6: {
    monthLabel: MONTH_NAMES[DM] + ' ' + DY,
    monthGrid: buildMonth(DY, DM),
    availability: {},
    submittedBy: [], pendingBy: [],
  },
  phase7: { locked: null, consensus: 0 },
  phase8: {
    tripStart: null, tripEnd: null, dayCount: 0,
    costs: { perPerson: 0, breakdown: [], paid: {} },
    itinerary: [], activities: [], shopping: [],
  },

  history: [],
};
