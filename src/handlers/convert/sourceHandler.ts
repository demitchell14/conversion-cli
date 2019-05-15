import {SqlClient} from 'msnodesqlv8';
import {IIDMRowData} from '../../tables'
const sql: SqlClient = require('msnodesqlv8');


export declare interface SourceHandler {
  limit: number;
  offset: number;
  table?: string;
  connectString: string;
  new (props: ImportHandlerProps);
  execute(offset:number): AsyncIterableIterator<Array<Partial<any>>>
  query(query: string): Promise<any>
}

export class SourceHandler {
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
    idap: (offset:number) => `SELECT * FROM dbo.IDAP ORDER BY IDA_IDM_NO OFFSET ${offset} ROWS FETCH NEXT ${this.limit} ROWS ONLY;`,
    test: (offset?) => `SELECT * FROM dbo.IDMP ORDER BY IDM_IDM_NO OFFSET ${offset} ROWS FETCH NEXT ${this.limit} ROWS ONLY;`,
    atyp: (offset:number) => `SELECT * FROM dt.atyp WHERE SUBSTRING(aty_bar_no,1,3) <> 'BND' AND aty_bar_no <> '       1' ORDER BY ATY_BAR_NO OFFSET ${offset} ROWS FETCH NEXT ${this.limit} ROWS ONLY;`
  }

  async *execute(offset = this.offset): AsyncIterableIterator<Array<Partial<any>>> {
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
  table?: string;
}
