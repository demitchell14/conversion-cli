import {SqlClient} from 'msnodesqlv8'
import {DT, IIDMRowData, STAGING} from '../../../../tables'
import {DestinationHandler} from '../../destinationHandler'
import {splitName} from '../../functions'
import {AddressHandlerProps} from '../address'

const sql: SqlClient = require('msnodesqlv8');

export default class NamesHandler extends DestinationHandler {
  table: string;


  constructor(props: AddressHandlerProps) {
    super(props);
    this.table = "dbo.DCT_Persons_Staging" // props.table;
  }

  import = (data: STAGING.DCT_PERSONS_STAGING[]) => {
    if (data.length > 0) {
      let query = `INSERT INTO ${this.table} (${Object.keys(data[0]).map(k => k).join(",")}) VALUES `
      query += data.map(data => `(${Object.values(data).map(k => k).join(",")})`).join(",")

      const response = this.query(query);
      return new Promise((resolve, reject) => {
        response.then(res => resolve({response: res, data}));
        response.catch(err => reject(err));
      });
      // return query;
    }
    return "";
  }

  convert = (data: IIDMRowData | any) => {
    const name = splitName(data.IDA_ALIAS.replace(/\s+/g, " ").replace(/'/g, "''"));
    const timestamp = new Date().toISOString().replace("T", " ").replace("Z", "");

    const response = {
      spn: `'${data.IDA_IDM_NO}'`,
      firstname: `'${name.first}'`,
      middlename: `'${name.middle}'`,
      lastname: `'${name.last}'`,
      displayname: `'${data.IDA_ALIAS.replace(/\s+/g, " ").replace(/'/g, "''")}'`,
      sealedflag: `'N'`,
      corp: `'N'`,
      is_attorney: `'N'`,
      suffix_name: `'${name.suffix}'`,
      comment_text: `'From NETD'`,
      date_time_created: `'${timestamp}'`,
      date_time_modified: `'${timestamp}'`,
      user_id: `'bwilder'`,
    } as STAGING.DCT_PERSONS_STAGING;

    return response;
  }

}