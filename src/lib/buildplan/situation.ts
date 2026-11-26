/**
 * The visitor's circumstances, asked next to the two builds. Every field is
 * optional in spirit: blank answers become "not given" in the prompt and
 * the AI is told to state its assumptions. Client-safe.
 */

export const GOALS = [
  'Comfortable mapping (T16 / red maps)',
  'Juiced mapping / high-end farming',
  'Pinnacle bosses',
  'Uber pinnacle bosses',
  'Deep Delve',
  'Simulacrum / Legion encounters',
  'A specific money-making strategy',
  'League mechanic farming',
] as const;

export const PAIN_POINTS = [
  'Dying to big hits / one-shots',
  'Dying to damage over time / degens',
  'Freezes, shocks or other ailments',
  'Low single-target damage',
  'Slow clear speed',
  'Mana / life / ES sustain problems',
  'Build feels clunky to play',
  'Not making enough currency',
] as const;

export type Priority = 'defense' | 'damage' | 'clear' | 'balanced';
export type Mode = 'trade' | 'ssf';
export type Crafting = 'none' | 'basic' | 'advanced';
export type Risk = 'safe' | 'some' | 'gambler';
export type Experience = 'new' | 'returning' | 'veteran';
export type Detail = 'quick' | 'detailed' | 'exhaustive';
export type BudgetCurrency = 'divine' | 'chaos';

export interface Situation {
  budget: string;
  budgetCurrency: BudgetCurrency;
  /** Divines per hour the player makes now. */
  income: string;
  hoursPerWeek: string;
  deadline: string;
  mode: Mode;
  hardcore: boolean;
  goals: string[];
  priority: Priority;
  crafting: Crafting;
  risk: Risk;
  painPoints: string[];
  experience: Experience;
  detail: Detail;
  /** Items the player will not sell or swap. */
  keep: string;
  language: string;
  notes: string;
}

export function defaultSituation(league: string): Situation {
  return {
    budget: '',
    budgetCurrency: 'divine',
    income: '',
    hoursPerWeek: '',
    deadline: '',
    mode: /ssf|solo/i.test(league) ? 'ssf' : 'trade',
    hardcore: /hardcore|^hc /i.test(league),
    goals: [],
    priority: 'balanced',
    crafting: 'basic',
    risk: 'some',
    painPoints: [],
    experience: 'returning',
    detail: 'detailed',
    keep: '',
    language: 'English',
    notes: '',
  };
}

export const PRIORITY_LABELS: Record<Priority, string> = {
  defense: 'Survive first',
  damage: 'Damage first',
  clear: 'Clear speed first',
  balanced: 'Balanced',
};

export const CRAFTING_LABELS: Record<Crafting, string> = {
  none: 'Buy everything ready-made',
  basic: 'Bench crafts, essences, simple steps',
  advanced: 'Multi-step crafts (fossils, harvest, meta-crafting)',
};

export const RISK_LABELS: Record<Risk, string> = {
  safe: 'No gambling',
  some: 'Some risk is fine',
  gambler: 'Happy to gamble (corruptions, Vaal orbs)',
};

export const EXPERIENCE_LABELS: Record<Experience, string> = {
  new: 'New to the game',
  returning: 'Know the basics',
  veteran: 'Veteran',
};

export const DETAIL_LABELS: Record<Detail, string> = {
  quick: 'Short checklist',
  detailed: 'Detailed plan',
  exhaustive: 'Everything, step by step',
};
