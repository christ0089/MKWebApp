import { Injectable } from '@angular/core'
import { Firestore } from '@angular/fire/firestore';
import { doc } from '@firebase/firestore';
import { docData } from 'rxfire/firestore';
@Injectable({
  providedIn: 'root',
})
export class UserService {
  constructor(
    private firestore: Firestore,
  ) {}

  // async storeToken(uid : string, token: string) {
  // //   return this.firestore
  // //     .collection<any>('users')
  // //     .doc(uid)
  // //     .collection('tokens')
  // //     .doc('currentTokenManager')
  // //     .set({token});
  // // }

  loadUserData(uid: string) {
    const docRef= doc(this.firestore, `users/${uid}`);
    return docData(docRef, {idField : "id"})
  }

  // updateUser(data, uid) {
  //   return this.firestore
  //     .collection<any>('users')
  //     .doc(uid)
  //     .update(Object.assign({}, data));
  // }
}
