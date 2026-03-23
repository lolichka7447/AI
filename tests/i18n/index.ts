import { ru } from './ru';
import { en } from './en';

export type Locale = 'ru' | 'en';

const dictionaries: Record<Locale, Record<string, string>> = { ru, en };

/** Current locale, read once from LOCALE env var (default: 'ru') */
export function getLocale(): Locale {
  const val = (process.env.LOCALE || 'ru').toLowerCase();
  return val === 'en' ? 'en' : 'ru';
}

/**
 * Return the translated string for the current locale.
 * Throws if key is missing — fail-fast in tests.
 */
export function t(key: string): string {
  const locale = getLocale();
  const dict = dictionaries[locale];
  const value = dict[key];
  if (value === undefined) {
    throw new Error(`i18n key "${key}" not found in locale "${locale}"`);
  }
  return value;
}

/**
 * Return a RegExp that matches BOTH locale values (case-insensitive).
 * Useful for assertions like `expect(locator).toContainText(tRegex('label.total'))`.
 */
export function tRegex(key: string): RegExp {
  const ruVal = ru[key];
  const enVal = en[key];
  if (ruVal === undefined || enVal === undefined) {
    throw new Error(`i18n key "${key}" not found in both locales`);
  }
  // Escape regex special chars in both values
  const esc = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  return new RegExp(`${esc(ruVal)}|${esc(enVal)}`, 'i');
}
