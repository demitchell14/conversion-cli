import {SqlClient} from 'msnodesqlv8';
import {HandlerProps} from '../../../interfaces'
import {IIDMRowData, IRowData} from '../../../tables'

// import {writeErrorToFile, writeStatementToFile, writeSuccessToFile} from '../../../../file';

import {SourceHandler, DestinationHandler,} from '../index'
const sql: SqlClient = require('msnodesqlv8');

export default class NamesHandler extends DestinationHandler {
  selectors: string | '*';
  offset: number;

  constructor(props: NamesHandlerProps) {
    super(props);
    this.selectors = props.selectors || '*'
    this.offset = props.offset || 1;

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
  import = (data:IRowData[]) => {
    if (typeof this.fields === "undefined") {
      throw "No fields are set to be imported. please run calculateFields"
    }
    let query = `INSERT INTO dbo.DCT_Persons_Staging (${this.fields}) VALUES `
    data.map(row => {
      query += "(" + Object.values(row).join(",") + "), "
    })
    query = query.substr(0, query.length - 2) + ";";
    return this.query(query);
  }

  convert = (data: IIDMRowData | any) => {

    const name = data.IDM_NAME.trim().replace("'", "''");
    const splitName =  name.split(/,\s*/);
    const tmp = splitName[1] ? splitName[1].split(' ') : [];
    const lastName = (splitName[0])
    const firstName = (tmp ? tmp[0] ? tmp[0] : '' : '')
    const middleName = (tmp ? tmp[1] ? tmp[1] : '' : '')
    const suffixName = (tmp ? tmp[2] ? tmp[2] : '' : '')

    const response = {
      spn: `'${data.IDM_IDM_NO.trim()}'`,
      firstname: `'${firstName}'`,
      middlename: `'${middleName}'`,
      lastname: `'${lastName}'`,
      displayname: `'${name}'`,
      corp: "'N'",
      sealedflag: "'N'",
      suffix_name: `'${suffixName}'`,
      comment_text: "'From NETD'",
      date_time_created: 'CURRENT_TIMESTAMP',
      date_time_modified: 'CURRENT_TIMESTAMP',
      user_id: "'bwilder'",
    } as IRowData;

    // console.log(Object.values(response).join(", "))
    return response;
  }

}

export interface NamesHandlerProps extends HandlerProps {}
