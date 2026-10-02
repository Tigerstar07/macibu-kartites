import { useNavigate } from 'react-router-dom';
import { House } from 'lucide-react';
import { useT } from '../lib/i18n';
import { RankEmblem } from '../components/rank/RankEmblem';
import { Button } from '../components/ui/Button';

export default function NotFound() {
  const t = useT();
  const navigate = useNavigate();
  return (
    <div className="mt-16 flex flex-col items-center text-center">
      <div className="animate-float">
        <RankEmblem rankIndex={0} size={120} locked />
      </div>
      <h1 className="mt-6 font-display text-6xl font-extrabold">404</h1>
      <p className="mt-2 text-lg text-muted">{t('Šī lapa nav atrasta — varbūt tā vēl nav atbloķēta?', "This page wasn't found — maybe it isn't unlocked yet?")}</p>
      <Button variant="primary" size="lg" className="mt-7" icon={<House className="size-5" />} onClick={() => navigate('/')}>
        {t('Uz sākumu', 'Home')}
      </Button>
    </div>
  );
}
