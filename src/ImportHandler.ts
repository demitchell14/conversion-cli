import {SqlClient} from 'msnodesqlv8';
const sql: SqlClient = require('msnodesqlv8');

import {IIDMRowData} from './handlers'

export class ImportHandler {
  limit: number;
  offset: number;
  table?: string;
  connectString: string;

  constructor(props:ImportHandlerProps) {
    this.connectString = `Driver={${process.env.db_driver || ''}};Server=${process.env.db_server || ''};Database=${process.env.db_name || ''};Trusted_Connection=Yes;`
    this.table = props.table || undefined;
    this.limit = props.limit || 1;
    this.offset = props.offset || 0;
  }

  statements = {
    idmp: (offset:number) => `SELECT * FROM dbo.IDMP ORDER BY IDM_IDM_NO OFFSET ${offset} ROWS FETCH NEXT ${this.limit} ROWS ONLY;`,
    idap: (offset:number) => `DELETE FROM dbo.DCT_Persons_Aliases_Staging; SELECT * FROM dbo.IDAP ORDER BY IDA_IDM_NO OFFSET ${offset} ROWS FETCH NEXT ${this.limit} ROWS ONLY;`,
    test: (offset?) => `DELETE FROM dbo.DCT_Persons_Staging;SELECT * FROM dbo.IDMP ORDER BY IDM_IDM_NO OFFSET ${offset} ROWS FETCH NEXT ${this.limit} ROWS ONLY;`,
  }

  async *execute(offset = this.offset): AsyncIterableIterator<Array<Partial<IIDMRowData>>> {
    let rows = [];
    let running = true;

    if (typeof this.table === "undefined")
      throw "No table defined";

    const statementFn = this.statements[this.table];

    while (running) {
      const statementComponenets = statementFn(offset).split(";");
      let query;
      if (statementComponenets.length > 2) {
        statementComponenets.pop();
        query = statementComponenets.pop();
        await Promise.all([statementComponenets.map(c => this.query(c))])
          .catch(err => {
            console.error(err);
            process.abort();
          })
      } else {
        query = statementComponenets[0];
      }
      rows = await this.query(query)
        .catch(err => { console.error(err); running = false; rows = [] })

      // console.log(query, rows.length)
      if (rows && rows.length !== 0) {
        yield rows;
      } else {
        // console.log("done")
        running = false;
      }
      offset += this.limit;
    }
    // const data = this.query(query)
    // return data;
  }

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
}

interface ImportHandlerProps {
  limit?: number;
  offset?: number;
  table: string;
}
