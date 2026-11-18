import { Minus, Plus } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { Button } from '@/components/Button';
import { Sheet } from '@/components/Sheet';
import { useI18n } from '@/lib/i18n';

type Props = {
  file: File | null;
  aspectRatio: number;
  shape?: 'rect' | 'circle' | 'arch';
  onCancel: () => void;
  onDone: (dataUrl: string) => void;
};

const FRAME_W = 260;
const MAX_ZOOM = 4;
const OUTPUT_MAX = 1080;

type View = { zoom: number; x: number; y: number };

/**
 * Crop a photo to the template's slot: drag to move, pinch or use the slider to zoom.
 * Starts slightly above centre on tall photos, where faces usually are.
 */
export const PhotoCropper = ({ file, aspectRatio, shape = 'rect', onCancel, onDone }: Props) => {
  const { t } = useI18n();
  const [img, setImg] = useState<HTMLImageElement | null>(null);
  const [view, setView] = useState<View>({ zoom: 1, x: 0, y: 0 });
  const [error, setError] = useState<string | null>(null);
  const pointers = useRef(new Map<number, { x: number; y: number }>());
  const pinchStart = useRef<{ dist: number; zoom: number } | null>(null);

  const W = FRAME_W;
  const H = Math.round(FRAME_W / aspectRatio);

  useEffect(() => {
    if (!file) return;
    setError(null);
    const url = URL.createObjectURL(file);
    const image = new Image();
    image.onload = () => {
      setImg(image);
      const s0 = Math.max(W / image.naturalWidth, H / image.naturalHeight);
      const dw = image.naturalWidth * s0;
      const dh = image.naturalHeight * s0;
      // Tall photo: show the upper part (faces). Wide photo: centre.
      setView({ zoom: 1, x: (W - dw) / 2, y: dh > H ? -(dh - H) * 0.3 : (H - dh) / 2 });
    };
    image.onerror = () => setError(t("That file isn't a photo we can open. Try a JPG or PNG."));
    image.src = url;
    return () => URL.revokeObjectURL(url);
  }, [file, W, H, t]);

  const baseScale = img ? Math.max(W / img.naturalWidth, H / img.naturalHeight) : 1;

  /** Keep the photo covering the whole frame. */
  const clamp = (v: View): View => {
    if (!img) return v;
    const zoom = Math.min(MAX_ZOOM, Math.max(1, v.zoom));
    const dw = img.naturalWidth * baseScale * zoom;
    const dh = img.naturalHeight * baseScale * zoom;
    return { zoom, x: Math.min(0, Math.max(W - dw, v.x)), y: Math.min(0, Math.max(H - dh, v.y)) };
  };

  /** Zoom around the frame centre. */
  const zoomTo = (zoom: number) =>
    setView((v) => {
      const z = Math.min(MAX_ZOOM, Math.max(1, zoom));
      const k = z / v.zoom;
      return clamp({ zoom: z, x: W / 2 - (W / 2 - v.x) * k, y: H / 2 - (H / 2 - v.y) * k });
    });

  const onPointerDown = (e: React.PointerEvent) => {
    e.currentTarget.setPointerCapture(e.pointerId);
    pointers.current.set(e.pointerId, { x: e.clientX, y: e.clientY });
    if (pointers.current.size === 2) {
      const [a, b] = [...pointers.current.values()];
      pinchStart.current = { dist: Math.hypot(a.x - b.x, a.y - b.y), zoom: view.zoom };
    }
  };

  const onPointerMove = (e: React.PointerEvent) => {
    const prev = pointers.current.get(e.pointerId);
    if (!prev) return;
    pointers.current.set(e.pointerId, { x: e.clientX, y: e.clientY });
    if (pointers.current.size === 2 && pinchStart.current) {
      const [a, b] = [...pointers.current.values()];
      zoomTo(pinchStart.current.zoom * (Math.hypot(a.x - b.x, a.y - b.y) / pinchStart.current.dist));
    } else if (pointers.current.size === 1) {
      setView((v) => clamp({ ...v, x: v.x + (e.clientX - prev.x), y: v.y + (e.clientY - prev.y) }));
    }
  };

  const onPointerUp = (e: React.PointerEvent) => {
    pointers.current.delete(e.pointerId);
    if (pointers.current.size < 2) pinchStart.current = null;
  };

  const confirm = () => {
    if (!img) return;
    const s = baseScale * view.zoom;
    const sx = -view.x / s;
    const sy = -view.y / s;
    const sw = W / s;
    const sh = H / s;
    const out = Math.min(1, OUTPUT_MAX / Math.max(sw, sh));
    const canvas = document.createElement('canvas');
    canvas.width = Math.round(sw * out);
    canvas.height = Math.round(sh * out);
    const ctx = canvas.getContext('2d');
    if (!ctx) {
      setError(t("This browser can't crop photos."));
      return;
    }
    ctx.drawImage(img, sx, sy, sw, sh, 0, 0, canvas.width, canvas.height);
    onDone(canvas.toDataURL('image/jpeg', 0.85));
  };

  const radius = shape === 'circle' ? '50%' : shape === 'arch' ? `${W / 2}px ${W / 2}px 16px 16px` : '16px';

  return (
    <Sheet
      open={file !== null}
      onOpenChange={(open) => !open && onCancel()}
      title={t('Adjust your photo')}
      description={t('Drag to move · pinch or use the slider to zoom')}
    >
      <div className="flex flex-col items-center">
        <div
          data-vaul-no-drag
          className="relative touch-none overflow-hidden bg-ink"
          style={{ width: W, height: H, borderRadius: radius }}
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={onPointerUp}
          onPointerCancel={onPointerUp}
        >
          {img ? (
            <img
              src={img.src}
              alt=""
              draggable={false}
              className="pointer-events-none absolute left-0 top-0 max-w-none origin-top-left"
              style={{
                width: img.naturalWidth * baseScale * view.zoom,
                height: img.naturalHeight * baseScale * view.zoom,
                transform: `translate(${view.x}px, ${view.y}px)`,
              }}
            />
          ) : null}
        </div>

        <div className="mt-4 flex w-full max-w-xs items-center gap-2" data-vaul-no-drag>
          <button onClick={() => zoomTo(view.zoom - 0.25)} className="grid size-11 place-items-center rounded-full" aria-label={t('Zoom out')}>
            <Minus className="size-5" />
          </button>
          <input
            type="range"
            min={1}
            max={MAX_ZOOM}
            step={0.01}
            value={view.zoom}
            onChange={(e) => zoomTo(Number(e.target.value))}
            className="h-11 flex-1 accent-primary"
            aria-label={t('Zoom')}
          />
          <button onClick={() => zoomTo(view.zoom + 0.25)} className="grid size-11 place-items-center rounded-full" aria-label={t('Zoom in')}>
            <Plus className="size-5" />
          </button>
        </div>

        {error ? <p className="mt-2 text-sm text-error">{error}</p> : null}

        <div className="mt-4 grid w-full grid-cols-2 gap-2">
          <Button variant="outline" onClick={onCancel}>
            {t('Cancel')}
          </Button>
          <Button onClick={confirm} disabled={!img}>
            {t('Use photo')}
          </Button>
        </div>
      </div>
    </Sheet>
  );
};
