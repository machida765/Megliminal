/** トップの getHomePageData が何回走ったか（プロセス内）。ISR が効くと同じ数字の HTML が使い回される。 */
let homeFetchCount = 0;

export function nextHomeFetchCount(): number {
  homeFetchCount += 1;
  return homeFetchCount;
}
