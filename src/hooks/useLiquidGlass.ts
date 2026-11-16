import { useEffect, useRef, useState, type RefObject } from 'react';

/** ライブラリへ渡す初期値（設計書 06章の初期候補。実機で調整する）。 */
export const GLASS_DEFAULTS: Record<string, number> = {
  blurAmount: 0.2,
  refraction: 0.5,
  chromAberration: 0.02,
  edgeHighlight: 0.08,
  specular: 0.12,
  fresnel: 0.7,
  distortion: 0,
  cornerRadius: 20,
  opacity: 0.95,
  shadowOpacity: 0.12,
};

/** ready: WebGL描画中 / fallback: CSS表現 / pending: 初期化待ち（CSS表現） / off: 対象なし・無効 */
export type GlassStatus = 'off' | 'pending' | 'ready' | 'fallback';

type GlassInstance = { destroy: () => void; markChanged?: (...args: unknown[]) => void };
type GlassStatic = { init: (options: Record<string, unknown>) => Promise<GlassInstance> };
type GlassModule = { LiquidGlass?: GlassStatic; default?: GlassStatic };

type Options = {
  rootRef: RefObject<HTMLElement | null>;
  /** root直下のガラス対象を選ぶセレクタ（カンマ区切り可）。 */
  targets: string;
  /** 値が変わると再初期化する（画面切り替え・絞り込みなど）。 */
  resetKey?: string;
  enabled?: boolean;
  options?: Record<string, number>;
};

let webglSupport: boolean | null = null;

function supportsWebGL(): boolean {
  if (webglSupport !== null) return webglSupport;
  try {
    const canvas = document.createElement('canvas');
    const gl = (canvas.getContext('webgl') || canvas.getContext('experimental-webgl')) as WebGLRenderingContext | null;
    webglSupport = Boolean(gl);
    gl?.getExtension('WEBGL_lose_context')?.loseContext();
  } catch {
    webglSupport = false;
  }
  return webglSupport;
}

/** WebGL非対応・低性能端末・?glass=off のときはCSSフォールバックのみにする。 */
function canUseGlass(): boolean {
  if (typeof window === 'undefined') return false;
  if (new URLSearchParams(window.location.search).get('glass') === 'off') return false;
  const nav = navigator as Navigator & { deviceMemory?: number };
  if ((nav.hardwareConcurrency && nav.hardwareConcurrency <= 2) || (nav.deviceMemory && nav.deviceMemory <= 2)) return false;
  return supportsWebGL();
}

/** フォントと、表示付近の画像を待つ（最大 timeoutMs）。 */
async function waitForAssets(root: HTMLElement, timeoutMs = 4000): Promise<void> {
  const tasks: Promise<unknown>[] = [];
  if ('fonts' in document) tasks.push(document.fonts.ready);
  root.querySelectorAll('img').forEach((img) => {
    if (img.complete) return;
    if (img.loading === 'lazy' && img.getBoundingClientRect().top > window.innerHeight * 1.5) return;
    tasks.push(new Promise((resolve) => {
      img.addEventListener('load', resolve, { once: true });
      img.addEventListener('error', resolve, { once: true });
    }));
  });
  await Promise.race([Promise.all(tasks), new Promise((resolve) => window.setTimeout(resolve, timeoutMs))]);
}

function pickTargets(root: HTMLElement, selector: string): HTMLElement[] {
  return Array.from(root.querySelectorAll<HTMLElement>(selector)).filter(
    (el) => el.parentElement === root && el.getClientRects().length > 0,
  );
}

function sameElements(a: HTMLElement[], b: HTMLElement[]): boolean {
  return a.length === b.length && a.every((el, i) => el === b[i]);
}

// 同じroot要素に対する初期化・破棄を直列化し、インスタンスの二重生成を防ぐ（StrictMode対策）。
const chains = new WeakMap<HTMLElement, Promise<unknown>>();

export function useLiquidGlass({ rootRef, targets, resetKey = '', enabled = true, options }: Options): GlassStatus {
  const [status, setStatus] = useState<GlassStatus>('off');
  const optionsRef = useRef(options);
  optionsRef.current = options;

  useEffect(() => {
    const root = rootRef.current;
    if (!enabled || !root) { setStatus('off'); return; }
    if (!canUseGlass()) { setStatus('fallback'); return; }

    let cancelled = false;
    let instance: GlassInstance | null = null;
    let current: HTMLElement[] = [];
    let resizeTimer = 0;
    let busy = false;
    let failed = false;
    setStatus('pending');

    const teardown = () => {
      const old = instance;
      instance = null;
      current = [];
      try { old?.destroy(); } catch (error) { console.warn('Liquid Glassの破棄に失敗しました。', error); }
    };

    const initialize = async () => {
      busy = true;
      try {
        await run();
      } finally {
        busy = false;
      }
    };

    const run = async () => {
      await waitForAssets(root);
      if (cancelled) return;
      const elements = pickTargets(root, targets);
      if (elements.length === 0) { setStatus('off'); return; }
      try {
        const mod = (await import('@ybouane/liquidglass')) as unknown as GlassModule;
        const LiquidGlass = mod.LiquidGlass ?? mod.default;
        if (!LiquidGlass) throw new Error('LiquidGlass export が見つかりません。');
        const created = await LiquidGlass.init({
          root,
          glassElements: elements,
          defaults: { ...GLASS_DEFAULTS, ...optionsRef.current },
        });
        if (cancelled) { created.destroy(); return; }
        instance = created;
        current = elements;
        setStatus('ready');
      } catch (error) {
        console.warn('Liquid Glassを初期化できなかったため、CSS表現に切り替えます。', error);
        failed = true;
        teardown();
        if (!cancelled) setStatus('fallback');
      }
    };

    const enqueue = (task: () => Promise<void>) => {
      busy = true;
      const run = (chains.get(root) ?? Promise.resolve()).then(task);
      chains.set(root, run.catch(() => undefined));
    };

    enqueue(initialize);

    // 向き・幅の変化でガラス対象の表示/非表示が変わったら作り直す。
    const onResize = () => {
      window.clearTimeout(resizeTimer);
      resizeTimer = window.setTimeout(() => {
        if (cancelled || failed || busy) return;
        if (sameElements(pickTargets(root, targets), current)) return;
        teardown();
        setStatus('pending');
        enqueue(initialize);
      }, 250);
    };
    // 画像の遅延読み込み完了を描画へ通知する。
    const onImageLoad = () => { try { instance?.markChanged?.(); } catch { /* 通知失敗は無視 */ } };
    // WebGLコンテキスト喪失時はCSSへ戻す。
    const onContextLost = () => { failed = true; teardown(); if (!cancelled) setStatus('fallback'); };

    window.addEventListener('resize', onResize);
    window.addEventListener('orientationchange', onResize);
    root.addEventListener('load', onImageLoad, true);
    root.addEventListener('webglcontextlost', onContextLost, true);

    return () => {
      cancelled = true;
      window.clearTimeout(resizeTimer);
      window.removeEventListener('resize', onResize);
      window.removeEventListener('orientationchange', onResize);
      root.removeEventListener('load', onImageLoad, true);
      root.removeEventListener('webglcontextlost', onContextLost, true);
      teardown();
    };
  }, [rootRef, targets, resetKey, enabled]);

  return status;
}
