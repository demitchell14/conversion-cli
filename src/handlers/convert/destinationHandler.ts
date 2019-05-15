import {SqlClient} from 'msnodesqlv8';
import {HandlerProps} from '../../interfaces'
const sql: SqlClient = require('msnodesqlv8');

export declare interface DestinationHandler {
  new (props: HandlerProps);

  forceStop: boolean;
  connectString: string;
  fields?: string;

  query(query:string): Promise<any>;
  calculateFields(row:any): string;

  import(a:any): any;
}

export class DestinationHandler {
  forceStop: boolean;
  connectString: string;
  fields?: string;
  constructor(props: HandlerProps) {
    this.forceStop = false;
    this.connectString = `Driver={${process.env.db_driver || ''}};Server=${process.env.db_server || ''};Database=${process.env.db_name || ''};Trusted_Connection=Yes;`

  }



  /**
   * This is a standardized function I've made to convert a callback system of database querying to
   * use promises, which are much more fiendly to use.
   * @param query string
   * @return Promise<any>
   */
  query = (query: string): Promise<any> => {
    return new Promise((resolve, reject) => {
      sql.query(this.connectString, query, (err, rows) => {
        if (err) {
          reject(err);
        } else {
          resolve(rows)
        }
      })
    })
  }

  calculateFields = (row:any) => {
    // console.log(Object.keys(row));
    this.fields = Object.keys(row).map(r => r).join(",");
    return this.fields
  }
}
