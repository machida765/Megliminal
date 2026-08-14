/** 投稿IDなどから、毎回同じ傾きクラスを返す */
export function tiltClass(seed: string): string {
  const n = [...seed].reduce((sum, ch) => sum + ch.charCodeAt(0), 0);
  const tilts = [
    '-rotate-2',
    'rotate-1',
    '-rotate-1',
    'rotate-2',
    'rotate-[1.4deg]',
    '-rotate-[1.7deg]',
    'rotate-[0.8deg]',
    '-rotate-[0.9deg]',
  ];
  return tilts[n % tilts.length];
}

export function paperTone(seed: string): string {
  const n = [...seed].reduce((sum, ch) => sum + ch.charCodeAt(0), 0);
  const tones = [
    'bg-[#fffdf6]',
    'bg-[#fff7d6]',
    'bg-[#ffe8d2]',
    'bg-[#fff1e4]',
    'bg-[#f7f0e2]',
  ];
  return tones[n % tones.length];
}
