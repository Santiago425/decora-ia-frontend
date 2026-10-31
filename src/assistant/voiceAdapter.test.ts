import { afterEach, describe, expect, it, vi } from 'vitest';
import { VoiceAdapter } from './voiceAdapter';

class FakeRecognition {
  static last: FakeRecognition;
  lang = '';
  interimResults = false;
  continuous = true;
  onresult: ((event: unknown) => void) | null = null;
  onerror: ((event: { error: string }) => void) | null = null;
  onend: (() => void) | null = null;
  start = vi.fn();
  stop = vi.fn();
  constructor() {
    FakeRecognition.last = this;
  }
}

const result = (transcript: string, isFinal: boolean) => Object.assign([{ transcript }], { isFinal });

describe('VoiceAdapter', () => {
  afterEach(() => vi.unstubAllGlobals());

  it('explains when the browser cannot listen', () => {
    vi.stubGlobal('window', {});
    const onError = vi.fn();
    const voice = new VoiceAdapter('es-CO');
    voice.listen(vi.fn(), onError, vi.fn());
    expect(voice.canListen).toBe(false);
    expect(onError).toHaveBeenCalledWith(expect.stringContaining('no permite dictar'));
  });

  it('adapts the prefixed browser API and reports final transcripts', () => {
    vi.stubGlobal('window', { webkitSpeechRecognition: FakeRecognition });
    const onResult = vi.fn();
    const onError = vi.fn();
    const voice = new VoiceAdapter('es-CO');
    voice.listen(onResult, onError, vi.fn());

    const recognition = FakeRecognition.last;
    recognition.onresult?.({ resultIndex: 0, results: [result('agrega una planta', true)] });
    recognition.onerror?.({ error: 'not-allowed' });
    recognition.onerror?.({ error: 'aborted' });

    expect(recognition.lang).toBe('es-CO');
    expect(recognition.start).toHaveBeenCalled();
    expect(onResult).toHaveBeenCalledWith({ transcript: 'agrega una planta', final: true });
    expect(onError).toHaveBeenCalledTimes(1);
    expect(onError).toHaveBeenCalledWith(expect.stringContaining('permiso'));
  });
});
