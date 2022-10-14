import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SpeechCardListComponent } from './speech-card-list.component';

describe('SpeechCardListComponent', () => {
  let component: SpeechCardListComponent;
  let fixture: ComponentFixture<SpeechCardListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ SpeechCardListComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SpeechCardListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
