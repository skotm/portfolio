import type { ComponentPropsWithoutRef, ElementType } from 'react';
import { cx } from './cx';

type Props<T extends ElementType> = { as?: T; className?: string } & Omit<ComponentPropsWithoutRef<T>, 'as' | 'className'>;

/**
 * ガラス対象になる要素。LiquidGlassRootの直接の子として置くこと（入れ子不可）。
 * ラッパー要素は作らず、指定タグ自身に .glass-panel を付ける。
 */
export default function GlassPanel<T extends ElementType = 'div'>({ as, className, ...rest }: Props<T>) {
  const Tag: ElementType = as ?? 'div';
  return <Tag className={cx('glass-panel', className)} {...rest} />;
}
