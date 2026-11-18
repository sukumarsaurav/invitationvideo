import { getDurationInFrames } from '@/templates/data';
import { waitForTemplateFonts } from '@/templates/shared/fonts';
import { bindTemplate } from '@/templates/TemplateVideo';
import type { TemplateDefinition, VideoData } from '@/templates/types';

export type RenderQuality = '1080p' | '720p';

/**
 * HD downloads without payment: always in development, and in production only when
 * VITE_FREE_HD=true is set on purpose (e.g. a launch promotion). Otherwise the server's
 * payment status decides (see RenderPage).
 * Note: rendering happens in the customer's browser, so this check stops ordinary customers,
 * not someone editing the app's JavaScript.
 */
export const FREE_HD = import.meta.env.DEV || import.meta.env.VITE_FREE_HD === 'true';

export const scaleFor = (q: RenderQuality) => (q === '1080p' ? 1 : 720 / 1080);

/** Default quality for this device: full HD on computers, 720p on phones (faster, plenty for WhatsApp). */
export const defaultQuality = (): RenderQuality =>
  typeof window !== 'undefined' && window.matchMedia('(max-width: 767px)').matches ? '720p' : '1080p';

/**
 * Rough render time from CPU cores, for setting expectations before the customer starts.
 * Measured: a 10-core laptop renders 720p at ~80 fps; mid-range phones are several times slower.
 */
export const estimateRenderSeconds = (frames: number, quality: RenderQuality): number => {
  const cores = typeof navigator !== 'undefined' ? navigator.hardwareConcurrency || 4 : 4;
  const fps720 = cores >= 10 ? 70 : cores >= 8 ? 35 : cores >= 6 ? 20 : 12;
  const fps = quality === '1080p' ? fps720 / 2 : fps720;
  return Math.max(5, Math.ceil(frames / fps / 5) * 5);
};

export type RenderCheck = { ok: boolean; problems: string[] };

/** Can this browser encode the video? Checks WebCodecs + H.264 support for the chosen size. */
export const checkCanRender = async (def: TemplateDefinition, quality: RenderQuality): Promise<RenderCheck> => {
  try {
    const { canRenderMediaOnWeb } = await import('@remotion/web-renderer');
    const result = await canRenderMediaOnWeb({
      width: def.width,
      height: def.height,
      scale: scaleFor(quality),
      container: 'mp4',
      videoCodec: 'h264',
    });
    return {
      ok: result.canRender,
      problems: result.issues.filter((i) => i.severity === 'error').map((i) => i.message),
    };
  } catch (e) {
    return { ok: false, problems: [e instanceof Error ? e.message : String(e)] };
  }
};

export type RenderProgress = { progress: number; encodedFrames: number; totalFrames: number };

/** Renders the final, watermark-free MP4 in this browser tab. */
export const renderVideo = async ({
  def,
  data,
  quality,
  onProgress,
  signal,
}: {
  def: TemplateDefinition;
  data: VideoData;
  quality: RenderQuality;
  onProgress: (p: RenderProgress) => void;
  signal?: AbortSignal;
}): Promise<Blob> => {
  await waitForTemplateFonts();
  const { renderMediaOnWeb } = await import('@remotion/web-renderer');
  const totalFrames = getDurationInFrames(def, data);
  const props = { data, watermark: false };
  const result = await renderMediaOnWeb({
    composition: {
      id: def.slug,
      component: bindTemplate(def),
      width: def.width,
      height: def.height,
      fps: def.fps,
      durationInFrames: totalFrames,
      defaultProps: props,
    },
    inputProps: props,
    container: 'mp4',
    videoCodec: 'h264',
    videoBitrate: 'high',
    scale: scaleFor(quality),
    signal: signal ?? null,
    onProgress: (p) => onProgress({ progress: p.progress, encodedFrames: p.encodedFrames, totalFrames }),
  });
  return result.getBlob();
};

export const downloadBlob = (blob: Blob, filename: string) => {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 60_000);
};
