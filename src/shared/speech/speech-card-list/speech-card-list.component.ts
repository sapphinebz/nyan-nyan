import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  OnDestroy,
  OnInit,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { SpeechModel } from '../model';
import { SpeechCardComponent } from '../speech-card/speech-card.component';
import { AsyncSubject, BehaviorSubject, Subject } from 'rxjs';
import {
  distinctUntilChanged,
  filter,
  map,
  mergeWith,
  share,
  shareReplay,
  startWith,
  takeUntil,
  tap,
} from 'rxjs/operators';

@Component({
  selector: 'app-speech-card-list',
  standalone: true,
  imports: [CommonModule, SpeechCardComponent],
  templateUrl: './speech-card-list.component.html',
  styleUrls: ['./speech-card-list.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SpeechCardListComponent implements OnInit, OnDestroy {
  onDestroy$ = new AsyncSubject<void>();
  originalSpeechModelList: SpeechModel[] = [
    {
      thai: 'ฟังฉันทันไหม?',
      eng: 'Do you follow me?',
    },
    {
      thai: 'ฉันไม่เคยรู้เลย',
      eng: 'I have never know',
    },
    {
      thai: 'ยังไม่เสร็จเลย',
      eng: 'Not done yet',
    },
    {
      thai: 'ไม่ใช่อันนี้',
      eng: 'Not this one',
    },
    {
      thai: 'มีอีกสองสามอย่างที่ฉันต้องทำ',
      eng: 'Couple of thing I need to do',
    },
    {
      thai: 'ฉันต้องทำไงอะ',
      eng: 'What do I do?',
    },
    {
      thai: 'คุณพูดถูกแล้ว',
      eng: 'You are right',
    },
    {
      thai: 'ขอถามเขาแป๊ปหนึง',
      eng: 'Just ask him for a moment',
    },
    {
      thai: 'ฉันยังไม่เข้าใจเลยว่าคำถามของคุณคืออะไร',
      eng: `I still don't understand what are you asking?`,
    },
    {
      thai: 'คุณชอบกินอะไร',
      eng: 'What’s your favorite food?',
    },
    {
      thai: 'ฉันจะเอาอันนี้',
      eng: 'I will take this one',
    },
    {
      thai: 'แล้วอีกอันล่ะครับ?',
      eng: 'And how about the other?',
    },
    {
      thai: 'คุณว่าอย่างไหนดีกว่า?',
      eng: 'Which would you suggest?',
    },
    {
      thai: 'ใช่ ฉันรู้จักดีเลยล่ะ',
      eng: 'Yes, I know very well',
    },
    {
      thai: 'รอสักประเดี๋ยวนะ',
      eng: 'wait for a while',
    },
    {
      thai: 'ไม่ ผมไม่คิดอย่างนั้นนะ',
      eng: "No, I don't think so",
    },
  ];

  speechModelList: SpeechModel[] = [...this.originalSpeechModelList];

  onNextSpeechSubject = new Subject<void>();

  onNextSpeech$ = this.onNextSpeechSubject.pipe(
    tap(() => {
      this.selectedSpeechModel = this.randomSpeechModel();
      this.showNextSpeechSubject.next(false);
      this.cf.markForCheck();
    }),
    share()
  );

  selectedSpeechModel: SpeechModel = this.randomSpeechModel();

  showNextSpeechSubject = new BehaviorSubject<boolean>(false);

  showNextSpeech$ = this.showNextSpeechSubject.pipe(
    map((showNext) => {
      if (this.speechModelList.length === 0) {
        return false;
      }
      return showNext;
    })
  );

  constructor(private cf: ChangeDetectorRef) {}

  ngOnDestroy(): void {
    this.onDestroy$.next();
    this.onDestroy$.complete();
  }

  ngOnInit(): void {
    this.onNextSpeech$.pipe(takeUntil(this.onDestroy$)).subscribe();
  }

  nextSpeechModel() {
    this.onNextSpeechSubject.next();
  }

  randomIndex() {
    return this.getRandomInt(0, this.speechModelList.length - 1);
  }

  randomSpeechModel() {
    const index = this.randomIndex();
    const model = this.speechModelList[index];
    this.speechModelList.splice(index, 1);
    return model;
  }

  getRandomInt(min: number, max: number) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min) + min);
  }

  clickShowHint() {
    this.showNextSpeechSubject.next(true);
  }

  userSpeechCorrect() {
    this.showNextSpeechSubject.next(true);
  }
}
