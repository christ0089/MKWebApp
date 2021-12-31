

import { Injectable } from '@angular/core';
import { getDownloadURL, Storage, uploadBytes, uploadString } from '@angular/fire/storage';
import { ref } from '@firebase/storage';

/*
 Generated class for the StoreServiceProvider provider.
 See https://angular.io/guide/dependency-injection for more info on providers
 and Angular DI.
*/
@Injectable({
  providedIn: "root"
})
export class StorageService {
  constructor(private readonly storage: Storage) {

  }

  postPicture(url: File, path: string, domain: string): Promise<string> {
    const imageURL = domain + '_'+ Date.now();
    const newMetadata = {
      cacheControl: 'public,max-age=300',
      contentType: 'image/jpeg'
    };


    return new Promise((resolve, reject) => {
      const storage_ref = ref(this.storage,  `${path}/${domain}/${imageURL}`)
      const storageRef = uploadBytes(storage_ref, url, newMetadata);
      storageRef.then(() => {
        return resolve(getDownloadURL(storage_ref));
      }).catch((error : Error) => {
        return reject(error);
      });
    });
  }
}