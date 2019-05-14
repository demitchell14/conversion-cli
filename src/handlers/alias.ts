import {SqlClient} from 'msnodesqlv8';
import {IRow} from 'mssql'

// import {Connection} from '../connection';
import {writeErrorToFile, writeStatementToFile, writeSuccessToFile} from '../file';
// import {Loader, LoaderProps} from '../load';

import {Handler, HandlerProps, IIDARowData, IIDMRowData, IRowData} from './index'
const sql: SqlClient = require('msnodesqlv8');

export default class NamesHandler extends Handler {
  selectors: string | '*';
  offset: number;

  constructor(props: NamesHandlerProps) {
    super(props);
    this.selectors = props.selectors || '*'
    this.offset = props.offset || 1;

  }

  import = (data:IRowData[]) => {
    if (typeof this.fields === "undefined") {
      throw "No fields are set to be imported. please run calculateFields"
    }
    let query = `INSERT INTO dbo.DCT_Person_Aliases_Staging (${this.fields}) VALUES `
    data.map(row => {
      query += "(" + Object.values(row).join(",") + "), "
    })
    query = query.substr(0, query.length - 2) + ";";
    // console.log(query)
    return this.query(query);
  }

  convert = (data: IIDARowData | any) => {
    // console.log(data)
    const name = data.IDA_ALIAS.trim().replace("'", "''");
    const splitName =  name.split(/,\s*/);
    const tmp = splitName[1] ? splitName[1].split(' ') : [];
    const lastName = (splitName[0])
    const firstName = (tmp ? tmp[0] ? tmp[0] : '' : '')
    const middleName = (tmp ? tmp[1] ? tmp[1] : '' : '')
    const suffixName = (tmp ? tmp[2] ? tmp[2] : '' : '')

    const response = {
      SPN: `'${data.IDA_IDM_NO.trim()}'`,
      DISPLAY_NAME: `'${name}'`,
      LAST_NAME: `'${lastName}'`,
      FIRST_NAME: `'${firstName}'`,
      MIDDLE_NAME: `'${middleName}'`,
      SUFFIX_NAME: `'${suffixName}'`
    };

    // console.log(Object.values(response).join(", "))
    return response;
  }

}

export interface NamesHandlerProps extends HandlerProps {}
