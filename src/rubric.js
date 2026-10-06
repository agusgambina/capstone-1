// Single source of truth for criteria, weights and verdicts (session-7.pdf pp. 4-5).

export const CRITERIA = [
  { id: 'novelty', axis: 'poc', label: 'Technical Novelty', weight: 3 },
  { id: 'scope', axis: 'poc', label: 'Defined Scope', weight: 4 },
  { id: 'resources', axis: 'poc', label: 'Resource Accessibility', weight: 2 },
  { id: 'outcome', axis: 'poc', label: 'Measurable Outcome', weight: 1 },
  { id: 'pain', axis: 'market', label: 'Pain Severity', weight: 4 },
  { id: 'pay', axis: 'market', label: 'Willingness to Pay', weight: 3 },
  { id: 'size', axis: 'market', label: 'Market Size', weight: 2 },
  { id: 'moat', axis: 'market', label: 'Differentiation', weight: 1 },
];

export const HIGH_THRESHOLD = 65;

export const VERDICTS = {
  go: { label: 'Go / Full Speed Ahead', why: 'Excellent on both axes.' },
  derisk: { label: 'De-risk First', why: 'Strong demand, hard build. Spike the tech.' },
  validate: { label: 'Validate Demand', why: 'Buildable, but prove someone wants it.' },
  shelve: { label: 'Reframe or Shelve', why: 'High risk on both axes.' },
};
