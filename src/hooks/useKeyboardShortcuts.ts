import { useEffect } from 'react';

type Tool = 'select' | 'rect' | 'circle' | 'triangle' | 'line' | 'arrow' | 'pencil' | 'highlight' | 'text' | 'sticky' | 'image';

interface ShortcutOptions {
  onToolSelect?: (tool: Tool) => void;
  onZoomIn?: () => void;
  onZoomOut?: () => void;
  onDelete?: () => void;
  onUndo?: () => void;
  onRedo?: () => void;
  onNudge?: (dx: number, dy: number) => void;
  onCopy?: () => void;
  onPaste?: () => void;
}

export function useKeyboardShortcuts(options: ShortcutOptions) {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't trigger shortcuts if user is typing in an input or textarea
      if (
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement ||
        (e.target as HTMLElement).isContentEditable
      ) {
        return;
      }

      const { key, ctrlKey, metaKey, shiftKey } = e;
      const isCmdOrCtrl = ctrlKey || metaKey;
      const nudgeAmount = shiftKey ? 10 : 1;

      switch (key.toLowerCase()) {
        case 'arrowup':
          e.preventDefault();
          options.onNudge?.(0, -nudgeAmount);
          break;
        case 'arrowdown':
          e.preventDefault();
          options.onNudge?.(0, nudgeAmount);
          break;
        case 'arrowleft':
          e.preventDefault();
          options.onNudge?.(-nudgeAmount, 0);
          break;
        case 'arrowright':
          e.preventDefault();
          options.onNudge?.(nudgeAmount, 0);
          break;
        case 'v':
          if (isCmdOrCtrl) {
            e.preventDefault();
            options.onPaste?.();
          } else {
            options.onToolSelect?.('select');
          }
          break;
        case 'r':
          options.onToolSelect?.('rect');
          break;
        case 'c':
          if (isCmdOrCtrl) {
            e.preventDefault();
            options.onCopy?.();
          } else {
            options.onToolSelect?.('circle');
          }
          break;
        case 't':
          options.onToolSelect?.('text');
          break;
        case 'p':
          options.onToolSelect?.('pencil');
          break;
        case 's':
          options.onToolSelect?.('sticky');
          break;
        case 'l':
          options.onToolSelect?.('line');
          break;
        case 'a':
          options.onToolSelect?.('arrow');
          break;
        case '=':
        case '+':
          if (isCmdOrCtrl) {
            e.preventDefault();
            options.onZoomIn?.();
          }
          break;
        case '-':
          if (isCmdOrCtrl) {
            e.preventDefault();
            options.onZoomOut?.();
          }
          break;
        case 'backspace':
        case 'delete':
          options.onDelete?.();
          break;
        case 'z':
          if (isCmdOrCtrl) {
            e.preventDefault();
            if (e.shiftKey) {
              options.onRedo?.();
            } else {
              options.onUndo?.();
            }
          }
          break;
        case 'y':
          if (isCmdOrCtrl) {
            e.preventDefault();
            options.onRedo?.();
          }
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [options]);
}
