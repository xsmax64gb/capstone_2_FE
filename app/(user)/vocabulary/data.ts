export type VocabularyItem = {
  id: string
  word: string
  phonetic: string
  meaning: string
  example: string
  level: 'A1' | 'A2' | 'B1' | 'B2'
  topic: 'daily-life' | 'work' | 'travel' | 'technology'
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
  },
  {
    id: 'v2',
    word: 'improve',
    phonetic: '/ɪmˈpruːv/',
    meaning: 'cai thien',
    example: 'Reading every day can improve your vocabulary quickly.',
    level: 'A1',
    topic: 'daily-life',
  },
  {
    id: 'v3',
    word: 'boarding pass',
    phonetic: '/ˈbɔːr.dɪŋ pæs/',
    meaning: 'the len may bay',
    example: 'Please show your boarding pass at the gate.',
    level: 'A2',
    topic: 'travel',
  },
  {
    id: 'v4',
    word: 'efficient',
    phonetic: '/ɪˈfɪʃ.ənt/',
    meaning: 'hieu qua, nang suat',
    example: 'This method is more efficient for learning new words.',
    level: 'B1',
    topic: 'work',
  },
  {
    id: 'v5',
    word: 'algorithm',
    phonetic: '/ˈæl.ɡə.rɪð.əm/',
    meaning: 'thuat toan',
    example: 'The app uses an algorithm to recommend lessons.',
    level: 'B2',
    topic: 'technology',
  },
  {
    id: 'v6',
    word: 'destination',
    phonetic: '/ˌdes.tɪˈneɪ.ʃən/',
    meaning: 'diem den',
    example: 'Da Nang is a popular destination for tourists.',
    level: 'A2',
    topic: 'travel',
  },
]

export const TOPIC_LABELS: Record<VocabularyItem['topic'], string> = {
  'daily-life': 'Daily Life',
  work: 'Work',
  travel: 'Travel',
  technology: 'Technology',
}
