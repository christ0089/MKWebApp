import { Component, OnInit, ViewChild } from '@angular/core';
import {
  Firestore,
  where,
  collectionGroup,
  query,
  collectionSnapshots,
  collection,
  doc,
} from '@angular/fire/firestore';
import { UntypedFormGroup } from '@angular/forms';
import { MatDrawer } from '@angular/material/sidenav';
import { MatTabChangeEvent } from '@angular/material/tabs';
import { addDoc, setDoc, Timestamp, updateDoc } from '@firebase/firestore';
import { collectionData } from 'rxfire/firestore';
import {
  BehaviorSubject,
  combineLatest,
  EMPTY,
  map,
  Observable,
  of,
  shareReplay,
  switchMap,
} from 'rxjs';
import { DropdownQuestion } from 'src/app/Models/Forms/dropdown';
import { QuestionBase } from 'src/app/Models/Forms/question-base';
import { AuthService } from 'src/app/Services/Auth/auth.service';
import {
  INotification,
  IQuestions,
  NotificationIssueStatus,
} from 'src/app/Services/QuestionsService/product_questionaire';
import { QuestionControlService } from 'src/app/Services/QuestionsService/question-control-service';
import { WarehouseService } from 'src/app/Services/WarehouseService/warehouse.service';
import { genericConverter } from '../products/products.component';

@Component({
  selector: 'app-notifications',
  templateUrl: './notifications.component.html',
  styleUrls: ['./notifications.component.sass'],
})
export class NotificationsComponent implements OnInit {
  w$: Observable<any> = EMPTY;
  notifications$: Observable<INotification[]> = EMPTY;
  selectedType$ = new BehaviorSubject<NotificationIssueStatus>('testing');
  status: NotificationIssueStatus[] = [
    'testing',
    'tested',
    'approved',
    'failed',
  ];
  size = 0;

  questions!: IQuestions;
  form!: UntypedFormGroup;
  currNotification!: INotification;
  loading = false;

  @ViewChild('edit_prod_drawer') editDrawer!: MatDrawer;
  @ViewChild('new_prod_drawer') newDrawer!: MatDrawer;

  constructor(
    private firestore: Firestore,
    private qcs: QuestionControlService,
    private auth: AuthService,
    private readonly warehouse: WarehouseService
  ) {
    const warehouse$ = this.warehouse.selectedWarehouse$.pipe(shareReplay(1));
    this.w$ = warehouse$.pipe(
      switchMap((warehouse) => {
        if (
          warehouse === null ||
          (warehouse.active === false && warehouse.name !== 'General')
        ) {
          return of([]);
        }
        let queryRef = query(
          collectionGroup(this.firestore, 'locations').withConverter(
            genericConverter<any>()
          ),
          where('warehouse_id', '==', warehouse.id)
        );
        if (warehouse.name === 'General') {
          queryRef = query(
            collectionGroup(this.firestore, 'tokens').withConverter(
              genericConverter<any>()
            )
          );
        }
        return collectionSnapshots(queryRef).pipe(
          map((data) => {
            return new Set(data.map((snap) => snap.ref.parent.parent?.id));
          })
        );
      })
    );

    this.notifications$ = combineLatest([warehouse$, this.selectedType$]).pipe(
      switchMap(([warehouse, selectedType]) => {
        if (
          warehouse === null
        ) {
          return of([]);
        }
        const collectionRef = collection(
          this.firestore,
          'notifications'
        ).withConverter<INotification>(genericConverter<INotification>());
        const queryRef = query(
          collectionRef,
          where('warehouse_id', '==', warehouse.id),
          where('type', '!=', 'user'),
          where('issue_status', '==', selectedType)
        );
        return collectionData<INotification>(queryRef, { idField: 'id' });
      })
    );

    this.w$.subscribe((set) => {
      this.size = 0;
      if (set.size < 10) {
        this.size = set.size;
      } else {
        this.size = set.size;
      }
    });
  }

  newNotification() {
    this.questions = this.qcs.notification_questionaire();
    if (this.auth.isSuperAdmin) {
      this.questions.questions.push(
        new DropdownQuestion({
          key: 'type',
          label: 'Tipo de Notificacion',
          value: 'region',
          required: false,
          order: 0,
          options: [
            {
              key: 'region',
              value: 'Region',
            },
            {
              key: 'general',
              value: 'General',
            },
          ],
          verfication: false,
        })
      );
    }
    this.form = this.qcs.toFormGroup(this.questions.questions);
    this.newDrawer.toggle();
  }

  editNotification(notification: INotification) {
    this.questions = this.qcs.notification_questionaire();
    this.questions.action = 'notification.update';
    this.currNotification = notification;
    const questions: QuestionBase<any>[] = this.qcs.mapToQuestion(
      this.questions.questions,
      notification
    );
    this.form = this.qcs.toFormGroup(questions);
    this.newDrawer.toggle();
  }

  async notificationAction(event: string, notification?: INotification) {
    const collectionRef = collection(this.firestore, 'notifications');
    let id = doc(collectionRef).id;


    let notificationData: INotification = notification || this.form.value as INotification;



    if (!notificationData) {
      alert('Error: Notification is not defined');
      this.form.enable();
      this.loading = false;
      return
    }
    
    if (this.form) {
      this.form.disable();
      this.loading = true;
    }

    let docRef = doc(this.firestore, `notifications/${id}`);
    notificationData.createdAt = Timestamp.now();


    if (this.warehouse.selectedWarehouse$.value?.id) {
      notificationData.warehouse_id =
        this.warehouse.selectedWarehouse$.value.id;
    } else {
      alert('No se selecciono una zona');
      this.loading = false;
      return
    }


    if (event === 'notification.approve') {
      notificationData.issue_status = 'approved';
      notificationData.status = 'pending';
      notificationData.approver = this.auth.userData$.value.uid;
      docRef = doc(this.firestore, `notifications/${notificationData.id}`);
      await updateDoc(docRef, {...notificationData}).catch(console.error);
      return 
    }

    if (event == 'notification.delete') {
      notificationData.issue_status = 'deleted';
      notificationData.status = 'delivered';
      docRef = doc(this.firestore, `notifications/${notificationData.id}`);
      await updateDoc(docRef, {...notificationData}).catch(console.error);
      return 
    }

    if (event == 'notification.update') {
      if (this.currNotification) {
        id = this.currNotification.id as string;
        notificationData.status = 'pending';
        notificationData.issue_status = 'testing';
        notificationData.issuer = this.auth.userData$.value.uid;
      } else {
        alert('Error: Notification is not defined');
        this.form.enable();
        this.loading = false;
        return
      }
    }

    if (event == 'notification.create') {
      notificationData.issue_status = 'testing';
      notificationData.issuer = this.auth.userData$.value.uid;
      notificationData.type = notificationData.type || "region"
    }

    try {
      await setDoc(docRef, notificationData, { merge: true });
      if (this.form) {
        this.form.enable();
        this.loading = false;
      }
    } catch (e) {
      alert(e);
      console.error(e);
    }
    
  }

  changedTab(event: MatTabChangeEvent) {
    this.selectedType$.next(
      this.status[event.index] as NotificationIssueStatus
    );
  }

  ngOnInit(): void { }
}
