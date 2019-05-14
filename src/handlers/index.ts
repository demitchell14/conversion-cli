import {Command} from '@oclif/config'
import {SqlClient} from 'msnodesqlv8';
import {rows} from 'mssql'
import NamesHandler from './names'
import RetrieveHandler from './retrieve'
const sql: SqlClient = require('msnodesqlv8');

// export * from "./names";
// export * from "./importer";

export function getHandler(name:"names"): Promise<NamesHandler>;
export function getHandler(name:"retrieve"): Promise<RetrieveHandler>;
export function getHandler(name:string) {
  return import(`./${name}`).then(obj => obj.default);
}

export class Handler {
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

export declare interface Handler {
  query: (query:string) => Promise<any>;
  import: (rows:any) => Promise<any>;
}

export interface HandlerProps {
  table: string;
  selectors?: string
  offset?: number;
  limit?: number;
}

export interface IRowData{
    spn: string;
    firstname: string;
    middlename: string;
    lastname: string;
    displayname: string;
    corp: string;
    sealedflag: string;
    suffix_name: string;
    comment_text: string;
    date_time_created: string;
    date_time_modified: string;
    user_id: string;
    count?: number
}

export interface IIDMRowData {
  IDM_IDM_NO: string;
  IDM_IN_USE_ID: string
  IDM_IN_USE_USR: string
  IDM_IN_USE_ACT: string
  IDM_NAME: string
  IDM_ADDRESS1: string
  IDM_ADDRESS2: string
  IDM_ADDRESS_CITY: string
  IDM_ADDRESS_STATE: string
  IDM_ZIP_FIRST_5: string
  IDM_ZIP_LAST_4: string
  IDM_PHONE1: string;
  IDM_PHONE2: string;
  IDM_PHONE3: string;
  IDM_DL_NUMBER_KEY: string;
  IDM_DL_NUMBER_REST: string;
  IDM_DL_STATE: string;
  IDM_DL_TYPE: string;
  IDM_DL_EXPIRE_YY: string;
  IDM_DL_EXPIRE_MM: string;
  IDM_DL_EXPIRE_DD: string;
  IDM_SOC_SEC_NO1: string;
  IDM_SOC_SEC_NO2: string;
  IDM_SOC_SEC_NO3: string;
  IDM_ID_NUMBER_KEY: string;
  IDM_ID_NUMBER_REST: string;
  IDM_ID_STATE: string;
  IDM_MISC_NUMBER: string;
  IDM_MISC_AGENCY: string;
  IDM_SO_NO: string;
  IDM_SID_NO: string;
  IDM_TDC_NO: string;
  IDM_FBI_NO: string;
  IDM_DPS_SID_SW: string;
  IDM_DOB_MM: string;
  IDM_DOB_DD: string;
  IDM_DOB_YY: string;
  IDM_POB: string;
  IDM_RACE: string;
  IDM_ETHNIC: string;
  IDM_SEX: string;
  IDM_HEIGHT_FT: string;
  IDM_HEIGHT_IN: string;
  IDM_WEIGHT: string;
  IDM_HAIR: string;
  IDM_EYES: string;
  IDM_SKIN: string;
  IDM_CITIZENSHIP: string;
  IDM_LAST_OPER: string;
  IDM_LAST_DATE_MM: string;
  IDM_LAST_DATE_DD: string;
  IDM_LAST_DATE_YR: string;
  IDM_LAST_APP: string;
  IDM_PRINT_NO: string;
  IDM_BAD_ADDRESS_SW: string;
  IDM_REMARKS: string;
  IDM_CARRIES_WEAPON: string;
  IDM_CELL1: string;
  IDM_CELL2: string;
  IDM_CELL3: string;
  IDM_FAX1: string;
  IDM_FAX2: string;
  IDM_FAX3: string;
  IDM_MARITAL_STATUS: string;
  IDM_GANG: string;
  IDM_DECEASED: string;
  IDM_LAST_TIME: string;
}

export interface IIDARowData {
  IDA_IDM_NO: string;
  IDA_SEQ: string;
  IDA_ALIAS: string;
  IDA_REPORT_CC: string;
  IDA_REPORT_YY: string;
  IDA_REPORT_MM: string;
  IDA_REPORT_DD: string;
  FILLER001: string;
}
