import { Injectable, NgZone } from '@angular/core';
import { Observable, Subscription } from 'rxjs';

@Injectable()
export class ZoneOptimizedService {
  constructor(private zone: NgZone) {}

  zoneOptimized<T>() {
    return (source: Observable<T>) =>
      new Observable<T>((subscriber) => {
        let subscription: Subscription;
        this.zone.runOutsideAngular(() => {
          subscription = source.subscribe({
            next: (value) => {
              this.zone.run(() => {
                subscriber.next(value);
              });
            },
            error: (err) => {
              this.zone.run(() => {
                subscriber.error(err);
              });
            },
            complete: () => {
              this.zone.run(() => {
                subscriber.complete();
              });
            },
          });
        });

        return {
          unsubscribe: () => {
            subscription.unsubscribe();
          },
        };
      });
  }
}
