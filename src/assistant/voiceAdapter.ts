interface RecognitionResult {
  transcript: string;
  final: boolean;
}

interface BrowserRecognition {
  lang: string;
  interimResults: boolean;
  continuous: boolean;
  onresult: ((event: { resultIndex: number; results: ArrayLike<ArrayLike<{ transcript: string }> & { isFinal: boolean }> }) => void) | null;
  onerror: ((event: { error: string }) => void) | null;
  onend: (() => void) | null;
  start(): void;
  stop(): void;
}

type RecognitionConstructor = new () => BrowserRecognition;

const VOICE_ERRORS: Record<string, string> = {
  'not-allowed': 'Necesito permiso para usar el micrófono. Actívalo en el navegador.',
  'service-not-allowed': 'Necesito permiso para usar el micrófono. Actívalo en el navegador.',
  'no-speech': 'No te escuché. Intenta de nuevo, un poco más cerca del micrófono.',
  'audio-capture': 'No encontré un micrófono en este dispositivo.',
  network: 'El reconocimiento de voz necesita conexión a internet.',
};

// Adapter: hides the different browser speech APIs behind one small interface for listening and speaking.
export class VoiceAdapter {
  readonly #Recognition: RecognitionConstructor | undefined;
  #recognition: BrowserRecognition | null = null;

  constructor(private readonly lang: string) {
    const scope = window as unknown as { SpeechRecognition?: RecognitionConstructor; webkitSpeechRecognition?: RecognitionConstructor };
    this.#Recognition = scope.SpeechRecognition ?? scope.webkitSpeechRecognition;
  }

  get canListen(): boolean {
    return Boolean(this.#Recognition);
  }

  get canSpeak(): boolean {
    return 'speechSynthesis' in window;
  }

  listen(onResult: (result: RecognitionResult) => void, onError: (message: string) => void, onEnd: () => void): void {
    if (!this.#Recognition) return onError('Tu navegador no permite dictar por voz. Prueba con Chrome o escribe tu mensaje.');
    this.stopListening();
    const recognition = new this.#Recognition();
    recognition.lang = this.lang;
    recognition.interimResults = true;
    recognition.continuous = false;
    recognition.onresult = (event) => {
      const result = event.results[event.results.length - 1];
      onResult({ transcript: Array.from(event.results, (r) => r[0].transcript).join(' '), final: result.isFinal });
    };
    recognition.onerror = (event) => event.error !== 'aborted' && onError(VOICE_ERRORS[event.error] ?? 'No pude escucharte esta vez.');
    recognition.onend = () => {
      this.#recognition = null;
      onEnd();
    };
    this.#recognition = recognition;
    recognition.start();
  }

  stopListening(): void {
    this.#recognition?.stop();
    this.#recognition = null;
  }

  speak(text: string): void {
    if (!this.canSpeak) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text.replace(/\*\*/g, ''));
    utterance.lang = this.lang;
    const prefix = this.lang.split('-')[0];
    const voices = window.speechSynthesis.getVoices();
    utterance.voice = voices.find((v) => v.lang === this.lang) ?? voices.find((v) => v.lang.startsWith(prefix)) ?? null;
    window.speechSynthesis.speak(utterance);
  }

  stopSpeaking(): void {
    if (this.canSpeak) window.speechSynthesis.cancel();
  }
}
