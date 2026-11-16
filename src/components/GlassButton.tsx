import type { ComponentPropsWithoutRef, ElementType } from 'react';
import { cx } from './cx';

type Props<T extends ElementType> = {
  as?: T;
  className?: string;
  /** soft: 明るいガラス / solid: 濃色のガラス（主操作） */
  tone?: 'soft' | 'solid';
} & Omit<ComponentPropsWithoutRef<T>, 'as' | 'className'>;

/** CSSのみのガラス調ボタン。ガラス対象の内側にも置けるよう、WebGLの対象にはしない。 */
export default function GlassButton<T extends ElementType = 'button'>({ as, className, tone = 'soft', ...rest }: Props<T>) {
  const Tag: ElementType = as ?? 'button';
  const extra = Tag === 'button' ? { type: 'button' } : {};
  return <Tag className={cx('glass-button', tone === 'solid' && 'glass-button--solid', className)} {...extra} {...rest} />;
}
