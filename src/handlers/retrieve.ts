import {SqlClient} from 'msnodesqlv8';

import {Handler, HandlerProps, IIDMRowData} from './index'
const sql: SqlClient = require('msnodesqlv8');

export default class RetrieveHandler extends Handler {
  table: string;
  selectors: string | '*';
  statement: (offset: number) => string;
  offset: number;
  limit: number;
  key: string;

  constructor(props: RetrieveHandlerProps) {
    super(props);
    this.table = props.table;
    this.selectors = props.selectors || '*'
    this.offset = props.offset || 0;
    this.limit = props.limit || 1;
    this.key = props.key;

    this.statement = offset => `SELECT ${this.selectors} FROM ${this.table} ORDER BY ${this.key} OFFSET ${offset} ROWS FETCH NEXT ${this.limit} ROWS ONLY;`;

  }

    /**
     * This is called an asynchronous generator. It basically has the ability to
     * make continuous, asynchronous calls until its told to stop, and after
     * each response it sends out, it waits to be called again. In this use case,
     * we call an SQL Statement and return a defined amount of rows. Once those defined
     * rows have been dealt with, instead of resetting, this function already knows where
     * we are, so we can just call it again, and it will resume from the the CurrentOffset + offset
     * @param dataGenerator Generator
     */
  async *load(offset = this.offset): AsyncIterableIterator<Array<Partial<IIDMRowData>>> {
    let rows = [];
    let running = true;

    while (running) {
      rows = await this.query(this.statement(offset))
                .catch(err => { console.error(err); running = false; rows = [] })
            // console.log(rows);
      if (rows && rows.length !== 0) {
                // console.log(`Running: ${running}, Offset: ${offset},  Rows: ${rows.length}, `, `SELECT IDM_IDM_NO, IDM_NAME FROM ${this.table} ORDER BY IDM_IDM_NO OFFSET ${offset} ROWS FETCH NEXT 500 ROWS ONLY;`);
        yield rows;
      } else {
        running = false;
      }
      offset += 1;
    }
        // const data = this.query(query)
        // return data;
  }

}

export interface RetrieveHandlerProps extends HandlerProps {
  key: string;
}
