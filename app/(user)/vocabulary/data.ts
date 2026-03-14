export type VocabularyLevel = 'A1' | 'A2' | 'B1' | 'B2'
export type VocabularyTopic = 'daily-life' | 'work' | 'travel' | 'technology'

export type VocabularyQuizQuestion = {
  id: string
  prompt: string
  options: string[]
  correctIndex: number
  explanation: string
}

export type VocabularyItem = {
  id: string
  word: string
  phonetic: string
  meaning: string
  example: string
  level: VocabularyLevel
  topic: VocabularyTopic
  partOfSpeech: 'noun' | 'verb' | 'adjective' | 'phrase'
  synonyms: string[]
  antonyms: string[]
  flashcards: {
    front: string
    back: string
  }[]
  quiz: VocabularyQuizQuestion[]
}

export type VocabularyProgressItem = {
  vocabularyId: string
  status: 'new' | 'learning' | 'mastered'
  reviewCount: number
  correctRate: number
  lastReviewedAt: string
}

export const VOCABULARIES: VocabularyItem[] = [
  {
    id: 'v1',
    word: 'schedule',
    phonetic: '/ˈskedʒ.uːl/',
    meaning: 'lich trinh, thoi khoa bieu',
    example: 'I need to check my schedule before confirming the meeting.',
    level: 'A2',
    topic: 'work',
    partOfSpeech: 'noun',
    synonyms: ['timetable', 'plan'],
    antonyms: ['chaos'],
    flashcards: [
      { front: 'schedule', back: 'lich trinh, thoi khoa bieu' },
      { front: 'I need to check my ___', back: 'schedule' },
      { front: 'Synonym of schedule', back: 'timetable' },
    ],
    quiz: [
      {
        id: 'q1',
        prompt: 'What does "schedule" mean?',
        options: ['lich trinh', 'bua an', 'kho hang', 'thiet bi'],
        correctIndex: 0,
        explanation: '"Schedule" means plan or timetable.',
      },
      {
        id: 'q2',
        prompt: 'Choose the correct sentence.',
        options: [
          'I checked my schedule this morning.',
          'I checked my schedulely this morning.',
          'I schedule my checked morning.',
          'I check schedule to morning.',
        ],
        correctIndex: 0,
        explanation: 'The first sentence is grammatically natural.',
      },
      {
        id: 'q3',
        prompt: 'A synonym of schedule is...',
        options: ['timetable', 'vacation', 'problem', 'airport'],
        correctIndex: 0,
        explanation: '"Timetable" is a close synonym.',
      },
    ],
  },
  {
    id: 'v2',
    word: 'improve',
    phonetic: '/ɪmˈpruːv/',
    meaning: 'cai thien',
    example: 'Reading every day can improve your vocabulary quickly.',
    level: 'A1',
    topic: 'daily-life',
    partOfSpeech: 'verb',
    synonyms: ['enhance', 'develop'],
    antonyms: ['worsen'],
    flashcards: [
      { front: 'improve', back: 'cai thien' },
      { front: 'Daily practice can ___ your English.', back: 'improve' },
      { front: 'Opposite of improve', back: 'worsen' },
    ],
    quiz: [
      {
        id: 'q1',
        prompt: '"Improve" is closest to...',
        options: ['make better', 'make smaller', 'make slower', 'make noisier'],
        correctIndex: 0,
        explanation: 'To improve means to make something better.',
      },
      {
        id: 'q2',
        prompt: 'Choose the best sentence.',
        options: [
          'I want to improve my listening skill.',
          'I want improve my listening skill.',
          'I want to improves my listening.',
          'I improve want listening.',
        ],
        correctIndex: 0,
        explanation: 'Correct infinitive form: "want to improve".',
      },
      {
        id: 'q3',
        prompt: 'Antonym of improve is...',
        options: ['worsen', 'enhance', 'develop', 'upgrade'],
        correctIndex: 0,
        explanation: '"Worsen" is the opposite meaning.',
      },
    ],
  },
  {
    id: 'v3',
    word: 'boarding pass',
    phonetic: '/ˈbɔːr.dɪŋ pæs/',
    meaning: 'the len may bay',
    example: 'Please show your boarding pass at the gate.',
    level: 'A2',
    topic: 'travel',
    partOfSpeech: 'phrase',
    synonyms: ['flight ticket'],
    antonyms: [],
    flashcards: [
      { front: 'boarding pass', back: 'the len may bay' },
      { front: 'Show your ___ at gate 12.', back: 'boarding pass' },
      { front: 'Used at the airport before entering plane', back: 'boarding pass' },
    ],
    quiz: [
      {
        id: 'q1',
        prompt: 'Where do you usually show a boarding pass?',
        options: ['at the gate', 'at the supermarket', 'at the cinema', 'at the bank'],
        correctIndex: 0,
        explanation: 'Boarding passes are checked at the airport gate.',
      },
      {
        id: 'q2',
        prompt: 'Pick the correct phrase.',
        options: ['boarding pass', 'board passer', 'pass boardingly', 'board ticket pass'],
        correctIndex: 0,
        explanation: 'Correct fixed phrase is "boarding pass".',
      },
      {
        id: 'q3',
        prompt: 'Meaning of boarding pass in Vietnamese?',
        options: ['the len may bay', 'ho chieu', 'hanh ly', 'cua ra vao'],
        correctIndex: 0,
        explanation: 'Boarding pass = the len may bay.',
      },
    ],
  },
  {
    id: 'v4',
    word: 'efficient',
    phonetic: '/ɪˈfɪʃ.ənt/',
    meaning: 'hieu qua, nang suat',
    example: 'This method is more efficient for learning new words.',
    level: 'B1',
    topic: 'work',
    partOfSpeech: 'adjective',
    synonyms: ['productive', 'effective'],
    antonyms: ['inefficient'],
    flashcards: [
      { front: 'efficient', back: 'hieu qua, nang suat' },
      { front: 'An efficient method saves ___ and effort.', back: 'time' },
      { front: 'Opposite of efficient', back: 'inefficient' },
    ],
    quiz: [
      {
        id: 'q1',
        prompt: 'An efficient process usually...',
        options: [
          'uses less time and resources',
          'takes longer without reason',
          'creates more confusion',
          'stops all progress',
        ],
        correctIndex: 0,
        explanation: 'Efficiency means good output with minimal waste.',
      },
      {
        id: 'q2',
        prompt: 'Choose the correct sentence.',
        options: [
          'Our new workflow is more efficient.',
          'Our new workflow more efficient is.',
          'Our workflow is efficiently more.',
          'Our new efficient is workflow.',
        ],
        correctIndex: 0,
        explanation: 'The first sentence uses proper English order.',
      },
      {
        id: 'q3',
        prompt: 'Antonym of efficient?',
        options: ['inefficient', 'productive', 'effective', 'fast'],
        correctIndex: 0,
        explanation: '"Inefficient" is the opposite.',
      },
    ],
  },
  {
    id: 'v5',
    word: 'algorithm',
    phonetic: '/ˈæl.ɡə.rɪð.əm/',
    meaning: 'thuat toan',
    example: 'The app uses an algorithm to recommend lessons.',
    level: 'B2',
    topic: 'technology',
    partOfSpeech: 'noun',
    synonyms: ['procedure', 'formula'],
    antonyms: [],
    flashcards: [
      { front: 'algorithm', back: 'thuat toan' },
      { front: 'An algorithm is a step-by-step ___', back: 'procedure' },
      { front: 'Apps use algorithm to recommend ___', back: 'content' },
    ],
    quiz: [
      {
        id: 'q1',
        prompt: 'What is an algorithm?',
        options: [
          'a step-by-step way to solve a problem',
          'a monitor cable',
          'a random sentence',
          'a keyboard layout',
        ],
        correctIndex: 0,
        explanation: 'Algorithm = clear steps to solve tasks.',
      },
      {
        id: 'q2',
        prompt: 'Choose the best sentence.',
        options: [
          'This algorithm improves recommendation accuracy.',
          'This algorithm accuracy recommendation improve.',
          'Algorithm this improve recommend.',
          'This improve an algorithm accuracy.',
        ],
        correctIndex: 0,
        explanation: 'The first sentence is grammatically correct and natural.',
      },
      {
        id: 'q3',
        prompt: 'Algorithm is most related to which field?',
        options: ['technology', 'cooking only', 'sports only', 'music only'],
        correctIndex: 0,
        explanation: 'Algorithms are core in tech and programming.',
      },
    ],
  },
  {
    id: 'v6',
    word: 'destination',
    phonetic: '/ˌdes.tɪˈneɪ.ʃən/',
    meaning: 'diem den',
    example: 'Da Nang is a popular destination for tourists.',
    level: 'A2',
    topic: 'travel',
    partOfSpeech: 'noun',
    synonyms: ['end point', 'target place'],
    antonyms: ['origin'],
    flashcards: [
      { front: 'destination', back: 'diem den' },
      { front: 'Your final destination is...', back: 'noi ban den cuoi cung' },
      { front: 'Opposite in travel route', back: 'origin' },
    ],
    quiz: [
      {
        id: 'q1',
        prompt: '"Destination" means...',
        options: ['the place you are going to', 'your backpack', 'a hotel bill', 'airport staff'],
        correctIndex: 0,
        explanation: 'Destination is where you plan to arrive.',
      },
      {
        id: 'q2',
        prompt: 'Choose the best sentence.',
        options: [
          'Paris is my dream destination.',
          'Paris destination my dream is.',
          'Paris is destinationly dream.',
          'Dream destination is Paris my.',
        ],
        correctIndex: 0,
        explanation: 'The first sentence is natural and correct.',
      },
      {
        id: 'q3',
        prompt: 'In a route, destination is opposite of...',
        options: ['origin', 'ticket', 'airline', 'passport'],
        correctIndex: 0,
        explanation: 'Origin is starting point, destination is ending point.',
      },
    ],
  },
]

export const VOCABULARY_PROGRESS: VocabularyProgressItem[] = [
  {
    vocabularyId: 'v1',
    status: 'learning',
    reviewCount: 4,
    correctRate: 75,
    lastReviewedAt: '2026-03-14T08:20:00Z',
  },
  {
    vocabularyId: 'v2',
    status: 'mastered',
    reviewCount: 7,
    correctRate: 92,
    lastReviewedAt: '2026-03-13T16:10:00Z',
  },
  {
    vocabularyId: 'v3',
    status: 'learning',
    reviewCount: 3,
    correctRate: 67,
    lastReviewedAt: '2026-03-12T09:00:00Z',
  },
  {
    vocabularyId: 'v4',
    status: 'new',
    reviewCount: 1,
    correctRate: 50,
    lastReviewedAt: '2026-03-10T12:30:00Z',
  },
]

export const TOPIC_LABELS: Record<VocabularyTopic, string> = {
  'daily-life': 'Daily Life',
  work: 'Work',
  travel: 'Travel',
  technology: 'Technology',
}

export const STATUS_LABELS: Record<VocabularyProgressItem['status'], string> = {
  new: 'New',
  learning: 'Learning',
  mastered: 'Mastered',
}

export function getVocabularyById(id: string) {
  return VOCABULARIES.find((item) => item.id === id)
}

export function getRelatedVocabulary(id: string, limit = 3) {
  const current = getVocabularyById(id)
  if (!current) return []
  return VOCABULARIES.filter((item) => item.topic === current.topic && item.id !== id).slice(0, limit)
}
