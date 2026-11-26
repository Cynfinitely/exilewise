'use client';

import { useState } from 'react';

/**
 * Prefill links: ChatGPT and Claude accept the prompt in `?q=`; long
 * prompts exceed safe URL lengths, so those open empty and the visitor
 * pastes (the prompt is copied first either way).
 */
const MAX_URL_PROMPT = 6_000;

const ASSISTANTS = [
  { name: 'ChatGPT', base: 'https://chatgpt.com/', q: true },
  { name: 'Claude', base: 'https://claude.ai/new', q: true },
  { name: 'Gemini', base: 'https://gemini.google.com/app', q: false },
] as const;

export function PromptPanel({ prompt }: { prompt: string }) {
  const [status, setStatus] = useState<'idle' | 'copied' | 'failed'>('idle');
  const fitsUrl = encodeURIComponent(prompt).length <= MAX_URL_PROMPT;

  const settle = (write: Promise<void>) =>
    write.then(
      () => setStatus('copied'),
      () => setStatus('failed')
    );

  const copy = () => settle(navigator.clipboard.writeText(prompt));

  const open = (a: (typeof ASSISTANTS)[number]) => {
    // Start the copy while this page still has focus, then open the tab
    // (pop-ups are only allowed straight from the click).
    const write = navigator.clipboard.writeText(prompt);
    const url =
      a.q && fitsUrl ? `${a.base}?q=${encodeURIComponent(prompt)}` : a.base;
    window.open(url, '_blank', 'noopener,noreferrer');
    void settle(write);
  };

  const words = prompt.split(/\s+/).length;

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-3">
        <button
          type="button"
          onClick={() => void copy()}
          className="btn btn-primary h-11 rounded-full px-6 font-display text-xs font-bold uppercase tracking-[0.16em]"
        >
          {status === 'copied' ? 'Copied ✓' : 'Copy prompt'}
        </button>
        {ASSISTANTS.map(a => (
          <button
            key={a.name}
            type="button"
            onClick={() => open(a)}
            className="btn h-11 rounded-full px-5"
          >
            Copy & open {a.name}
            <span className="sr-only"> (new tab)</span>
          </button>
        ))}
      </div>
      <p aria-live="polite" className="text-sm text-forge-muted">
        {status === 'failed'
          ? 'Your browser blocked copying. Select the text below and copy it yourself.'
          : status === 'copied'
            ? fitsUrl
              ? 'Copied. ChatGPT and Claude open with the prompt filled in; for Gemini, paste it.'
              : 'Copied. The prompt is too long to pass in a link: paste it into the chat that opened.'
            : `About ${words.toLocaleString('en')} words. Works best with a reasoning model (ChatGPT, Claude or Gemini with thinking on).`}
      </p>
      <label className="sr-only" htmlFor="build-prompt">
        Generated prompt
      </label>
      <textarea
        id="build-prompt"
        readOnly
        value={prompt}
        rows={16}
        onFocus={e => e.currentTarget.select()}
        className="input font-mono text-xs leading-relaxed"
      />
    </div>
  );
}
