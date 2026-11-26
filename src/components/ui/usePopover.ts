'use client';

import { useEffect, useRef, useState } from 'react';

/**
 * Open state for a click-to-open menu: closes on a click outside `rootRef`
 * and on Escape (which returns focus to `triggerRef`).
 */
export function usePopover<
  R extends HTMLElement = HTMLDivElement,
  T extends HTMLElement = HTMLButtonElement,
>() {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<R>(null);
  const triggerRef = useRef<T>(null);

  useEffect(() => {
    if (!open) return;
    const onPointer = (e: PointerEvent) => {
      if (!rootRef.current?.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== 'Escape') return;
      setOpen(false);
      triggerRef.current?.focus();
    };
    document.addEventListener('pointerdown', onPointer);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('pointerdown', onPointer);
      document.removeEventListener('keydown', onKey);
    };
  }, [open]);

  return { open, setOpen, rootRef, triggerRef };
}
