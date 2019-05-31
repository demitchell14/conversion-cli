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
    idm2: (offset:number) => `SELECT * FROM id.IDMP ORDER BY IDM_IDM_NO OFFSET ${offset} ROWS FETCH NEXT ${this.limit} ROWS ONLY;`,

    idm3: (offset:number) => `SELECT * FROM id.IDMP
    where (idm_address1 <> '' or idm_address2 <> '' 
    or idm_address_city <> '' or idm_zip_first_5 <> '')  
    and IDM_IDM_NO <> '        1'  
    OFFSET ${offset} ROWS FETCH NEXT ${this.limit} ROWS ONLY;`,

    idap: (offset:number) => `SELECT * FROM id.IDAP
    join id.iamp on ida_idm_no = idm_idm_no where ida_idm_no <> '' and ida_alias <> ''
    and ida_seq <> 0 order by ida_idm_no, ida_alias   
    ORDER BY IDA_IDM_NO OFFSET ${offset} ROWS FETCH NEXT ${this.limit} ROWS ONLY;`,

    atyp: (offset:number) => `SELECT * FROM dt.atyp WHERE SUBSTRING(aty_bar_no,1,3) <> 'BND' AND aty_bar_no <> '       1' 
    ORDER BY ATY_BAR_NO OFFSET ${offset} ROWS FETCH NEXT ${this.limit} ROWS ONLY;`,

    removeDupIDA: (offset:number) => `with tempida (duplicateRecCount, ida_idm_no, ida_alias) as (
    select ROW_NUMBER() over(PARTITION BY ida_idm_no, ida_alias 
    order by ida_idm_no, ida_alias) as duplicateRecCount, 
    ida_idm_no, ida_alias as duplicates from id.idap)
    delete from tempida WHERE duplicateRecCount > 1;`,

    removeDupIDL: (offset:number) => `with tempidl (duplicateRecCount, idl_idm_no, idl_dl_number) as (
    select ROW_NUMBER() over(PARTITION BY idl_idm_no, concat(idl_dl_number_key, idl_dl_number_rest) 
    order by idl_idm_no, concat(idl_dl_number_key, idl_dl_number_rest)) as duplicateRecCount, 
    idl_idm_no, concat(idl_dl_number_key, idl_dl_number_rest) as duplicates from id.idlp)
    delete from tempidl WHERE duplicateRecCount > 1;`,

    idm2demogr: (offset:number) =>`insert into dbo.DCT_Person_Demographics_History (
    SPN, DOB, Height, weight, sex, ETHINICITYTYPCD, eyecolor, haircolor, race_cd) select 
    idm_idm_no, 
    case 
    when isdate(concat(idm_dob_yy, '-', idm_dob_mm, '-', idm_dob_dd)) = 1
        then cast(concat(idm_dob_yy, '-', idm_dob_mm, '-', idm_dob_dd) as date)
    end as dob, 
    (idm_height_ft * 12) + idm_height_in, idm_weight, idm_sex, idm_ethnic, idm_eyes, idm_hair, idm_race
    from id.idmp
    where idm_dob_yy <> '' or idm_dob_mm <> '' or idm_dob_dd <> ''
    or idm_height_ft > 0 or idm_height_in > 0 or idm_weight > 0 or idm_sex <> ''
    or idm_ethnic <> '' or idm_eyes <> '' or idm_hair <> '' or idm_race <> '';`,
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
      // console.log(query)
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
