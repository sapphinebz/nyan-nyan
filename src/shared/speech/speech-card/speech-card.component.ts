import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  ElementRef,
  EventEmitter,
  Input,
  OnInit,
  Output,
  ViewChild,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { SpeechModel } from '../model';
import { SpeechRecognitionService } from '../speech-recognition.service';
import { SpeechSynthesisService } from '../speech-synthesis.service';
import { ZoneOptimizedService } from 'src/shared/zone/zone-optimized.service';
import {
  catchError,
  map,
  mergeWith,
  shareReplay,
  startWith,
  switchMap,
  tap,
  timeout,
} from 'rxjs/operators';
import { BehaviorSubject, combineLatest, EMPTY, Subject } from 'rxjs';

@Component({
  selector: 'app-speech-card',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './speech-card.component.html',
  styleUrls: ['./speech-card.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [
    SpeechRecognitionService,
    SpeechSynthesisService,
    ZoneOptimizedService,
  ],
})
export class SpeechCardComponent implements OnInit {
  @Input() set speechModel(value: SpeechModel) {
    this._speechModel = value;
    this.showHint$.next(false);
    this.resetSpeechModel$.next();
    this.disabledSpeaking$.next(false);
  }

  @Output() onShowHit = new EventEmitter<void>();

  @Output() onCorrect = new EventEmitter<void>();

  get speechModel() {
    return this._speechModel;
  }

  _speechModel!: SpeechModel;
  @ViewChild('speakEl', { read: ElementRef }) set speakEl(
    ref: ElementRef<HTMLButtonElement>
  ) {
    if (ref) {
      this.disabledSpeaking$.subscribe((disabled) => {
        const element = ref.nativeElement;
        if (disabled) {
          element.setAttribute('disabled', '');
          element.innerText = 'listening ...';
        } else {
          element.removeAttribute('disabled');
          element.innerText = 'Speech ';
        }
      });
    }
  }

  showHint$ = new BehaviorSubject<boolean>(false);

  speaking$ = new Subject<void>();

  resetSpeechModel$ = new Subject<void>();

  disabledSpeaking$ = new BehaviorSubject<boolean>(false);

  speechText$ = this.speaking$.pipe(
    switchMap(() => {
      return this.speechRecognitionService.speechText$.pipe(
        timeout(5000),
        catchError((err) => {
          this.disabledSpeaking$.next(false);
          return EMPTY;
        }),
        tap({
          subscribe: () => {
            this.disabledSpeaking$.next(true);
          },
          next: () => {
            this.disabledSpeaking$.next(false);
          },
        }),
        this.zone.zoneOptimized()
      );
    }),
    mergeWith(this.resetSpeechModel$.pipe(map(() => ''))),
    shareReplay({
      bufferSize: 1,
      refCount: true,
    })
  );

  showCorrection$ = this.speechText$.pipe(
    map((speechText) => {
      return (
        speechText &&
        this.speechModel.eng.toLowerCase().indexOf(speechText.toLowerCase()) !==
          -1
      );
    }),
    tap((isCorrect) => {
      if (isCorrect) {
        this.onCorrect.emit();
      }
    }),
    startWith(false)
  );

  constructor(
    private speechRecognitionService: SpeechRecognitionService,
    private speechSynthesisService: SpeechSynthesisService,
    private cd: ChangeDetectorRef,
    private zone: ZoneOptimizedService
  ) {}

  ngOnInit() {}

  clickRead() {
    this.speechSynthesisService.speak(this.speechModel.eng);
  }

  clickSpeakAgain() {
    this.speaking$.next();
  }

  showHint() {
    this.showHint$.next(true);
    this.onShowHit.emit();
    this.cd.markForCheck();
    if (this.showHint$.value === true) {
      setTimeout(() => {
        this.clickRead();
      }, 500);
    }
  }
}
