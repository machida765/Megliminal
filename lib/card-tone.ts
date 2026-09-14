const TONES = ['tone-a', 'tone-b', 'tone-c', 'tone-d', 'tone-e'] as const;

export type CardTone = (typeof TONES)[number];

/** 投稿IDなどから、毎回同じカード色を返す */
export function cardTone(seed: string): CardTone {
  const n = [...seed].reduce((sum, ch) => sum + ch.charCodeAt(0), 0);
  return TONES[n % TONES.length];
}
