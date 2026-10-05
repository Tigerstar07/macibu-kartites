import { cosmetic, RARITY_META } from '../../lib/cosmetics';
import { useLang } from '../../lib/i18n';
import { cn } from '../../lib/cn';

/** A player's display name, dressed in their equipped name tag (see `nt-*` in index.css). */
export function NameTag({ name, tag, className }: { name: string; tag?: string; className?: string }) {
  const fx = tag ? cosmetic(tag)?.fx : undefined;
  return (
    <span className={cn('nametag', fx && `nt-${fx}`, className)} data-text={name}>
      {name}
    </span>
  );
}

/**
 * A player's title. Rarity sets the colour (darkened/lightened toward the text
 * colour so it stays readable on both themes); legendary titles get a slow
 * gilded sweep. Common titles stay quiet and inherit the surrounding colour.
 */
export function TitleText({ id, className }: { id: string; className?: string }) {
  const lang = useLang();
  const c = cosmetic(id);
  if (!c) return null;
  if (c.rarity === 'legendary') return <span className={cn('nametag nt-gilded font-bold', className)}>{c[lang]}</span>;
  const tinted = c.rarity !== 'common';
  return (
    <span
      className={cn('font-semibold', className)}
      style={tinted ? { color: `color-mix(in oklch, ${RARITY_META[c.rarity].color} 72%, var(--color-fg))` } : undefined}
    >
      {c[lang]}
    </span>
  );
}
