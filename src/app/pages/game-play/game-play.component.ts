import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { SpeechCardListComponent } from 'src/shared/speech/speech-card-list/speech-card-list.component';

@Component({
  selector: 'app-game-play',
  standalone: true,
  imports: [CommonModule, RouterModule, SpeechCardListComponent],
  templateUrl: './game-play.component.html',
  styleUrls: ['./game-play.component.scss'],
})
export class GamePlayComponent implements OnInit {
  constructor() {}

  ngOnInit(): void {}
}
