// Use type safe message keys with `next-intl`
type Messages = typeof import('../locales/en.json');

declare interface IntlMessages extends Messages {}

interface KaiaEIP1193Provider {
  request: (args: { method: string; params?: unknown[] }) => Promise<unknown>;
  on: (event: string, handler: (...args: unknown[]) => void) => void;
  removeListener: (event: string, handler: (...args: unknown[]) => void) => void;
}

declare interface Window {
  klaytn?: KaiaEIP1193Provider;
}
