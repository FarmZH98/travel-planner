import { Injectable } from "@angular/core";
import Dexie from "dexie";
import { Subject } from "rxjs";
import { Upload } from "../model";

@Injectable()
export class FormRepository extends Dexie {

  upload!: Dexie.Table<Upload, string>

  onCount = new Subject<number>()

  constructor() {
    super('upload.db')

    this.version(1).stores({
      upload: 'id'
    })
    this.upload = this.table('upload')
  }

//   projectCount(): Promise<number> {
//     return this.upload.toArray()
//         .then(projects => {
//           this.onCount.next(projects.length)
//           return projects.length
//         })
//   }

}