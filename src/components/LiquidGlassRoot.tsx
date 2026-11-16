import { useRef, type ReactNode } from 'react';
import { useLiquidGlass } from '../hooks/useLiquidGlass';

type Props = {
  className?: string;
  id?: string;
  /** root直下のガラス対象セレクタ */
  targets: string;
  /** 変化すると再初期化（画面切り替え・絞り込みなど） */
  resetKey?: string;
  enabled?: boolean;
  options?: Record<string, number>;
  children: ReactNode;
};

/** Liquid Glassインスタンス1つ分のroot。初期化・破棄はuseLiquidGlassが管理する。 */
export default function LiquidGlassRoot({ className, id, targets, resetKey, enabled, options, children }: Props) {
  const ref = useRef<HTMLDivElement>(null);
  const status = useLiquidGlass({ rootRef: ref, targets, resetKey, enabled, options });
  return <div ref={ref} className={className} id={id} data-glass-root="" data-glass={status}>{children}</div>;
}
