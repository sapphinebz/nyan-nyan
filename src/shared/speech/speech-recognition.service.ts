import { Injectable } from '@angular/core';
import {
  fromEvent,
  MonoTypeOperatorFunction,
  Observable,
  OperatorFunction,
  pipe,
  shareReplay,
} from 'rxjs';
import { filter, skipWhile, map, takeWhile, first } from 'rxjs/operators';

@Injectable()
export class SpeechRecognitionService {
  speechRecognition$ = this.fromSpeechRecognition();
  speechText$ = this.speechRecognition$.pipe(this.saidToText());

  lang = 'en-US';

  constructor() {}

  fromSpeechRecognition() {
    return new Observable<SpeechRecognitionResult[]>((subscriber) => {
      const windowRef: any = document.defaultView as Window;

      const SpeechRecognition =
        windowRef.speechRecognition ||
        windowRef.webkitSpeechRecognition ||
        null;

      if (!SpeechRecognition) {
        subscriber.error(new Error('SpeechRecognition is not supported'));

        return;
      }
      const speechRecognition = new SpeechRecognition();
      speechRecognition.maxAlternatives = 1;
      speechRecognition.lang = this.lang || navigator.language || '';
      speechRecognition.interimResults = true;
      speechRecognition.onerror = (error: any) => subscriber.error(error);
      speechRecognition.onend = () => subscriber.complete();
      speechRecognition.onresult = (event: any) => {
        subscriber.next(
          Array.from(
            { length: event.results.length },
            (_, i) => event.results[i]
          )
        );
      };

      speechRecognition.nomatch = () => {
        console.log('nomatch');
      };
      speechRecognition.speechend = () => {
        console.log('speechend');
      };
      speechRecognition.audioend = () => {
        console.log('audioend');
      };
      speechRecognition.soundend = () => {
        console.log('soundend');
      };

      speechRecognition.start();

      return {
        unsubscribe: () => speechRecognition.abort(),
      };
    });
  }

  sentenceHasKeywords(sentence: string, keywords: string[]): boolean {
    return keywords.some((keyword) => {
      return sentence.indexOf(keyword) !== -1;
    });
  }

  isSaid(results: SpeechRecognitionResult[], keywords: string[]): boolean {
    if (results) {
      return results.some((result) => {
        return (
          result.isFinal &&
          result[0] &&
          this.sentenceHasKeywords(
            result[0].transcript.toLowerCase().trim(),
            keywords
          )
        );
      });
    }
    return false;
  }

  saidToText(): OperatorFunction<SpeechRecognitionResult[], any> {
    return pipe(
      map((results) => results.find((result) => result.isFinal)),
      filter((result) => Boolean(result) && Boolean(result![0])),
      map((result) => result![0].transcript)
    );
  }

  onSaid(
    keywords: string[]
  ): MonoTypeOperatorFunction<SpeechRecognitionResult[]> {
    return pipe(
      filter((results) => {
        return this.isSaid(results, keywords);
      })
    );
  }

  skipUntilSaid(
    keywords: string[]
  ): MonoTypeOperatorFunction<SpeechRecognitionResult[]> {
    return pipe(
      skipWhile((results) => !this.isSaid(results, keywords)),
      map((value, index) => (index ? value : []))
    );
  }

  takeUntilSaid(
    keywords: string[]
  ): MonoTypeOperatorFunction<SpeechRecognitionResult[]> {
    return takeWhile((results) => !this.isSaid(results, keywords));
  }
}
