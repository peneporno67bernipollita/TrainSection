import { useMemo } from 'preact/hooks';
import { useStore } from '../lib/store.js';
import { encodeRoutine, shareLink } from '../lib/share.js';
import { qrSvg } from '../lib/qr.js';
import { copyText, shareText } from '../lib/files.js';
import { Top, Icon, toast } from '../ui.jsx';

export function ShareRoutine({ id }) {
  const s = useStore();
  const r = s.routines.find((x) => x.id === id);
  const data = useMemo(() => {
    if (!r) return null;
    const code = encodeRoutine(r);
    const link = shareLink(code);
    return { code, link, qr: qrSvg(link) };
  }, [r]);

  if (!r || !data) return (<><Top title="Compartir" back="#/rutinas" /><main class="content"><p class="empty">No encuentro esta rutina.</p></main></>);

  const copy = async () => { toast((await copyText(data.link)) ? 'Enlace copiado' : 'No he podido copiar; mantén pulsado el texto'); };
  const share = async () => {
    const ok = await shareText('Rutina ' + r.name, 'Te paso mi rutina de TrainSection: ' + r.name, data.link);
    if (!ok) copy();
  };

  return (
    <>
      <Top title="Compartir" sub={r.name} back="#/rutinas" />
      <main class="content">
        <div class="card">
          <p class="k">Cómo funciona</p>
          <ol class="dots small">
            <li>Mándale el enlace a tu amigo por WhatsApp, o enséñale el QR.</li>
            <li>Él lo abre y pulsa «Copiar código».</li>
            <li>En su TrainSection: Rutinas, Importar de un amigo, pegar y guardar.</li>
          </ol>
          <p class="small muted">No hace falta cuenta ni internet en el gimnasio: la rutina va dentro del enlace. Sus pesos y fotos son suyos y no se comparten.</p>
        </div>
        <div class="btns">
          <button type="button" class="btn primary" onClick={share}><Icon.share /> Compartir</button>
          <button type="button" class="btn" onClick={copy}><Icon.copy /> Copiar enlace</button>
        </div>
        {data.qr ? (
          <div class="qr" dangerouslySetInnerHTML={{ __html: data.qr }} />
        ) : (
          <p class="small muted">Esta rutina es demasiado larga para un QR; usa el enlace.</p>
        )}
        <details class="cue"><summary>Ver el código</summary><p class="code">{data.code}</p></details>
      </main>
    </>
  );
}
