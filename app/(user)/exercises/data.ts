export type ExerciseItem = {
  id: string
  title: string
  description: string
  type: 'mcq' | 'fill_blank' | 'matching'
  level: 'A1' | 'A2' | 'B1' | 'B2'
  topic: 'daily-life' | 'work' | 'travel' | 'technology'
  questionCount: number
  durationMinutes: number
}

export const EXERCISES: ExerciseItem[] = [
  {
    id: 'e1',
    title: 'Daily Greetings Drill',
    description: 'Practice common greetings and short responses in daily conversation.',
    type: 'mcq',
    level: 'A1',
    topic: 'daily-life',
    questionCount: 12,
    durationMinutes: 8,
  },
  {
    id: 'e2',
    title: 'Workplace Email Basics',
    description: 'Choose suitable phrases for formal email writing at work.',
    type: 'mcq',
    level: 'A2',
    topic: 'work',
    questionCount: 15,
    durationMinutes: 12,
  },
  {
    id: 'e3',
    title: 'Airport Fill-in Practice',
    description: 'Fill missing words in travel conversations at the airport.',
    type: 'fill_blank',
    level: 'A2',
    topic: 'travel',
    questionCount: 10,
    durationMinutes: 10,
  },
  {
    id: 'e4',
    title: 'Tech Terms Match-up',
    description: 'Match key technology terms with their correct definitions.',
    type: 'matching',
    level: 'B1',
    topic: 'technology',
    questionCount: 18,
    durationMinutes: 14,
  },
  {
    id: 'e5',
    title: 'Project Meeting Scenarios',
    description: 'Select the best sentence in realistic project meeting contexts.',
    type: 'mcq',
    level: 'B2',
    topic: 'work',
    questionCount: 20,
    durationMinutes: 16,
  },
]

export const TOPIC_LABELS: Record<ExerciseItem['topic'], string> = {
  'daily-life': 'Daily Life',
  work: 'Work',
  travel: 'Travel',
  technology: 'Technology',
}

export const TYPE_LABELS: Record<ExerciseItem['type'], string> = {
  mcq: 'Multiple Choice',
  fill_blank: 'Fill in the Blank',
  matching: 'Matching',
}
