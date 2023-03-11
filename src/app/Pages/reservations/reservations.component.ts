import { Component, OnInit, ViewChild } from '@angular/core';
import { Firestore } from '@angular/fire/firestore';
import { FormGroup } from '@angular/forms';
import {
  DateFilterFn,
  MatDatepickerInputEvent,
} from '@angular/material/datepicker';
import { MatDrawer } from '@angular/material/sidenav';
import {
  addDoc,
  collection,
  doc,
  orderBy,
  query,
  setDoc,
  where,
} from '@firebase/firestore';
import { collectionData, docData } from 'rxfire/firestore';
import { BehaviorSubject, map, of, switchMap, take } from 'rxjs';
import { QuestionBase } from 'src/app/Models/Forms/question-base';
import { IQuestion } from 'src/app/Models/question';
import { AuthService } from 'src/app/Services/Auth/auth.service';
import {
  available_days,
  booking_questionaire,
  IBookingProduct,
  IBookingRange,
  IReservation,
} from 'src/app/Services/QuestionsService/product_questionaire';
import { QuestionControlService } from 'src/app/Services/QuestionsService/question-control-service';
import { WarehouseService } from 'src/app/Services/WarehouseService/warehouse.service';
import {
  genericConverter,
  IWarehouse,
} from 'src/app/Pages/info-view/products/products.component';

@Component({
  selector: 'app-reservations',
  templateUrl: './reservations.component.html',
  styleUrls: ['./reservations.component.sass'],
})
export class ReservationsComponent implements OnInit {
  selectedWarehouse!: IWarehouse;
  products$ = new BehaviorSubject<IBookingProduct[]>([]);
  bookingRange$ = new BehaviorSubject<IBookingRange[]>([]);
  questions: IQuestion[] = [];
  forms: FormGroup[] = [];
  min = new Date(Date.now());
  currReservation!: IBookingProduct;
  currReservations: IReservation[] = [];
  intervals = {
    '15min': [0, 15, 30, 45],
    '30min': [0, 30],
    '1hr': [0],
  };
  hourRange = { start: 1, end: 4 };
  selected_date!: Date;

  @ViewChild('resevation_prod_drawer') reserationDrawer!: MatDrawer;

  constructor(
    private readonly afs: Firestore,
    private readonly warehouse: WarehouseService,
    private readonly auth: AuthService,
    private readonly questionService: QuestionControlService
  ) {}

  ngOnInit(): void {
    this.loadProducts().subscribe((prod) => {
      this.products$.next(prod);
    });
  }

  weekendsDatesFilter: DateFilterFn<Date | null> = (d: Date | null) => {
    if (!d) {
      return false;
    }
    let day = d.getDay();
    return !this.currReservation.schedule.dateRange.includes(day);
  };

  loadProducts() {
    return this.warehouse.selectedWarehouse$.pipe(
      switchMap((warehouse) => {
        if (warehouse === null) {
          return of([]);
        }
        let product_collection = collection(
          this.afs,
          'stripe_products'
        ).withConverter<IBookingProduct>(genericConverter<IBookingProduct>());
        this.selectedWarehouse = warehouse;

        if (warehouse?.name !== 'General') {
          product_collection = collection(
            this.afs,
            `warehouse/${warehouse.id}/stripe_products`
          ).withConverter<IBookingProduct>(genericConverter<IBookingProduct>());
        }

        let q = query<IBookingProduct>(
          product_collection,
          where('stripe_metadata_productType', '==', 'calendar')
        );
        
        if (this.auth.isServiceAdmin) {
          console.log(this.auth.userData$.value?.uid);
          console.log(`warehouse/${warehouse.id}/stripe_products`);
          q = query<IBookingProduct>(
            product_collection,
            where('stripe_metadata_owner', '==', this.auth.userData$.value?.uid)
          );
        }
        return collectionData<IBookingProduct>(q, {
          idField: 'id',
        }).pipe(
          map((prod) => {
            return prod;
          })
        );
      })
    );
  }

  editBookingProduct(reservation: IBookingProduct) {
    this.questions = [booking_questionaire(), available_days()];

    this.currReservation = reservation;

    const dayData = new Array(7).fill(false);

    reservation.schedule.dateRange.forEach((day, i) => {
      dayData[day] = true;
    });

    const formData = [
      {
        interval: reservation.schedule.interval,
        start: +reservation.schedule.hourRange.start,
        end: +reservation.schedule.hourRange.end,
      },
      dayData,
    ];

    formData.forEach((w, i) => {
      const questionForms: QuestionBase<any>[] =
        this.questionService.mapToQuestion(this.questions[i].questions, w);
      this.forms.push(this.questionService.toFormGroup(questionForms));
    });

    this.reserationDrawer.toggle();
  }

  selectedDate(type: string, event: MatDatepickerInputEvent<Date>) {
    this.hourRange = this.currReservation.schedule.hourRange;
    this.selectedReservation = null;

    if (!event.value) {
      return;
    }
    this.selected_date = event.value;

    const range = new Array(this.hourRange.end - this.hourRange.start)
      .fill([])
      .map((r, i) => this.hourRange.start + i);

    const bookingRange: IBookingRange[] = [];

    range.map((r) => {
      const interval = this.intervals[this.currReservation.schedule.interval];
      return interval.map((_interval, i) => {
        const bookRange: IBookingRange = {
          start_hour: r,
          start_min: _interval,
          end_min: interval[(i + 1) % interval.length],
          end_hour: (i + 1) % interval.length == 0 ? r + 1 : r,
          selected: false,
          disabled: false,
        };
        bookingRange.push(bookRange);
      });
    });

    this.bookingRange$.next(bookingRange);

    const reservationSnap = collection(
      this.afs,
      `warehouse/${this.selectedWarehouse.id}/reservation/`
    ).withConverter<IReservation>(genericConverter<IReservation>());

    const q = query(
      reservationSnap,
      where('product.id', '==', this.currReservation.id),
      where('canceled', '==', false),
      where('day', '==', this.selected_date.getDate()),
      where('month', '==', this.selected_date.getMonth()),
      where('year', '==', this.selected_date.getFullYear())
    );

    collectionData<IReservation>(q, {
      idField: 'id',
    })
      .pipe(
        map((reservations) => {
          const flattened_reservations: IBookingRange[] = [];
          this.currReservations = reservations;

          reservations.forEach((reservationData: IReservation, i) => {
            reservationData.reservation.forEach((element: IBookingRange) => {
              element.reservation_idx = i;
              console.log(element);
              flattened_reservations.push(element);
            });
          });

          console.log(flattened_reservations);

          flattened_reservations.forEach((reservation) => {
            bookingRange.forEach((booking) => {
              if (
                booking.start_hour == reservation.start_hour &&
                booking.start_min == reservation.start_min &&
                booking.end_hour == reservation.end_hour &&
                booking.end_min == reservation.end_min
              ) {
                booking.disabled = true;
                booking.reservation_idx = reservation.reservation_idx;
              }
            });
          });
          return bookingRange;
        })
      )
      .subscribe((bookings) => {
        this.bookingRange$.next(bookings);
      });
  }

  minSchedule = -1;
  maxSchedule = -1;

  selectedReservation: IReservation | null = null;

  selectedShedule(i: number, booking: IBookingRange) {
    if (booking.disabled === true && booking.reservation_idx !== undefined) {
      console.log(booking.reservation_idx);
      this.selectedReservation = this.currReservations[booking.reservation_idx];
      return;
    }

    const bookings = this.bookingRange$.value;
    this.selectedReservation = null;

    if (this.calcReservation === 0) {
      bookings[i].selected = true;
      this.minSchedule = i;
      this.maxSchedule = i;
      this.bookingRange$.next(bookings);
      return;
    }

    if (
      this.calcReservation === 1 &&
      i === this.minSchedule &&
      i === this.maxSchedule
    ) {
      bookings[i].selected = false;
      this.minSchedule = -1;
      this.maxSchedule = -1;
      this.bookingRange$.next(bookings);
      return;
    }

    if (i === this.minSchedule) {
      for (let j = i; j <= this.maxSchedule - 1; j++) {
        if (bookings[j].disabled == true) {
          return;
        }
        bookings[j].selected = false;
      }
      this.minSchedule = this.maxSchedule;
      this.bookingRange$.next(bookings);
      return;
    }

    if (i === this.maxSchedule) {
      for (let j = this.minSchedule + 1; j <= this.maxSchedule; j++) {
        if (bookings[j].disabled == true) {
          return;
        }
        bookings[j].selected = false;
      }
      this.maxSchedule = this.minSchedule;
      this.bookingRange$.next(bookings);
      return;
    }

    if (i < this.minSchedule) {
      for (let j = i; j <= this.maxSchedule; j++) {
        if (bookings[j].disabled === true) {
          return;
        }
      }

      for (let j = i; j <= this.maxSchedule; j++) {
        bookings[j].selected = true;
      }
      this.minSchedule = i;
      this.bookingRange$.next(bookings);
      return;
    }

    if (i > this.minSchedule && i < this.maxSchedule) {
      for (let j = this.minSchedule; j < i; j++) {
        if (bookings[j].disabled == true) {
          return;
        }
        bookings[j].selected = false;
      }
      this.minSchedule = i;

      this.bookingRange$.next(bookings);
      return;
    }

    if (i > this.maxSchedule) {
      for (let j = this.minSchedule; j <= i; j++) {
        if (bookings[j].disabled == true) {
          return;
        }
        bookings[j].selected = true;
      }
      this.maxSchedule = i;

      this.bookingRange$.next(bookings);
      return;
    }
  }

  get calcReservation() {
    return this.bookingRange$.value.filter((v) => v.selected === true).length;
  }

  async updateProduct() {
    const { start, end, interval } = this.forms[0].value;

    const dateRange: number[] = [];
    Object.values(this.forms[1].value).forEach((values, i) => {
      if (values === true) {
        dateRange.push(i);
      }
    });

    const ref = doc(
      this.afs,
      `warehouse/${this.selectedWarehouse.id}/stripe_products/${this.currReservation.id}`
    );
    await setDoc(
      ref,
      {
        schedule: {
          hourRange: {
            start,
            end,
          },
          interval,
          dateRange,
        },
      },
      {
        merge: true,
      }
    );
  }
  async cancelReservacion() {
    if (!this.selectedReservation) {
      return;
    }
    const ref = doc(
      this.afs,
      `warehouse/${this.selectedWarehouse.id}/reservation/${this.selectedReservation.id}`
    );
    await setDoc(
      ref,
      {
        status: 'canceled',
        canceled: true,
      },
      {
        merge: true,
      }
    );

    this.selectedReservation = null;
  }

  createReservation() {
    const reservation = this.bookingRange$.value.filter(
      (v) => v.selected === true
    );
    const user = this.auth.userData$.value;

    if (!user) {
      return null;
    }

    const ref = collection(
      this.afs,
      `warehouse/${this.selectedWarehouse.id}/reservation`
    );
    return addDoc(ref, {
      customer_id: user.uid,
      product_owner_id: this.currReservation.stripe_metadata_owner || '',
      reservation,
      status: 'blocked',
      product: {
        id: this.currReservation.id,
      },
      canceled: false,
      day: this.selected_date.getDate(),
      month: this.selected_date.getMonth(),
      year: this.selected_date.getFullYear(),
    });
  }
}
