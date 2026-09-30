/** ブラウザ向け。eval を使う vm-browserify の代わり。 */
export function createContext(): Record<string, never> {
  return {};
}

export function runInContext(): undefined {
  return undefined;
}

export function runInThisContext(): undefined {
  return undefined;
}

export function runInNewContext(): undefined {
  return undefined;
}

export class Script {
  runInThisContext(): undefined {
    return undefined;
  }
}

const vm = {
  createContext,
  runInContext,
  runInThisContext,
  runInNewContext,
  Script,
};

export default vm;
