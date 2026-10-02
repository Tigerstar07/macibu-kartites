export const cn = (...parts: (string | false | null | undefined | 0)[]) => parts.filter(Boolean).join(' ');
