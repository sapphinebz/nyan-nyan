import { Injectable, OnDestroy } from '@angular/core';
import { AsyncSubject, fromEvent, Observable, Subject, takeUntil } from 'rxjs';
import { map, shareReplay, first } from 'rxjs';
import { take, tap, switchMap } from 'rxjs/operators';

@Injectable()
export class SpeechSynthesisService implements OnDestroy {
  onDestroy$ = new AsyncSubject<void>();
  speechSynthesisRef = window.speechSynthesis;
  speechSynthesis = document.defaultView!.speechSynthesis;

  speakSentence$ = new Subject<string>();

  spoke$ = this.speakSentence$.pipe(
    switchMap((sentence) => this.fromSpeak(sentence))
  );

  voices$ = fromEvent(speechSynthesis, 'voiceschanged').pipe(
    map(() => speechSynthesis.getVoices()),
    shareReplay({
      bufferSize: 1,
      refCount: true,
    })
  );

  alexVoice$ = this.voices$.pipe(
    map((voices) => voices.find((v) => v.name === 'Alex')),
    first(),
    shareReplay({
      bufferSize: 1,
      refCount: true,
    })
  );

  constructor() {
    this.spoke$.pipe(takeUntil(this.onDestroy$)).subscribe();
  }

  speak(sentence: string) {
    this.speakSentence$.next(sentence);
  }

  private fromSpeak(sentence: string) {
    return new Observable<string>((subscriber) => {
      const voice = this.speechSynthesis
        .getVoices()
        .find((v) => v.name === 'Alex');

      // speechSynthesisRef.pause();
      // speechSynthesisRef.resume();

      if (voice) {
        // lang = '',
        // pitch = 1,
        // rate = 1,
        // volume = 1,
        // voice = null,
        const utterance = new SpeechSynthesisUtterance(sentence);
        // utterance.lang = 'th-TH';
        utterance.lang = 'en-US';
        utterance.voice = voice;

        // utterance.onerror = (e) => {
        //   console.log('error', e);
        // };
        // utterance.onend = (e) => {
        //   console.log('end', e);
        // };

        // utterance.onmark = (e) => {
        //   console.log('mark', e);
        // };

        // utterance.onboundary = (e) => {
        //   console.log('boundary', e);
        // };

        // 'start' fires when speaking starts.
        // 'pause' fires when speaking is paused.
        // 'resume' fires when speaking is resumed.
        // 'end' fires when speaking reaches the end of the text. Browsers other than Safari will also fire this when speaking is cancelled.
        // 'boundary' fires when speaking reaches a new word or sentence. It does not fire on Android, unfortunately. We’ll talk more about this one in a bit.

        utterance.volume = 1;
        utterance.pitch = 1;
        utterance.rate = 1;
        this.speechSynthesisRef.speak(utterance);
      }

      return {
        unsubscribe: () => {
          this.speechSynthesisRef.cancel();
        },
      };
    });
  }

  ngOnDestroy(): void {
    this.onDestroy$.next();
    this.onDestroy$.complete();
  }
}
