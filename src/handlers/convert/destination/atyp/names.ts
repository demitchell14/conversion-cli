import {SqlClient} from 'msnodesqlv8'
import {DT, STAGING} from '../../../../tables'
import {DestinationHandler} from '../../destinationHandler'
import {AddressHandlerProps} from '../address'

const sql: SqlClient = require('msnodesqlv8');

export default class NamesHandler extends DestinationHandler {
  table: string;

  suffixes = [
    "JR", "SR", "II", "IV", "III", "V", "VI", "VII"
  ]

  constructor(props: AddressHandlerProps) {
    super(props);
    this.table = "dbo.DCT_Persons_Staging" // props.table;
  }

  import = (data:STAGING.DCT_PERSONS_STAGING[]) => {
    if (data.length > 0) {
      let query =  `INSERT INTO ${this.table} (${Object.keys(data[0]).map(k => k).join(",")}) VALUES `
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



  convert = (data: DT.ATYP | any) => {

    const name = this.splitName(data.ATY_NAME.replace(/\s+/g, " ").replace(/'/g, "''"));
    const timestamp = new Date().toISOString().replace("T", " ").replace("Z", "");

    const response = {
      spn: `'${data.ATY_BAR_NO}'`,
      firstname: `'${name.first}'`,
      middlename: `'${name.middle}'`,
      lastname: `'${name.last}'`,
      displayname: `'${data.ATY_NAME.replace(/\s+/g, " ").replace(/'/g, "''")}'`,
      sealedflag: `'N'`,
      corp: `'N'`,
      is_attorney: `'Y'`,
      suffix_name: `'${name.suffix}'`,
      comment_text: `'From NETD'`,
      date_time_created: `'${timestamp}'`,
      date_time_modified: `'${timestamp}'`,
      user_id: `'bwilder'`,
    } as STAGING.DCT_PERSONS_STAGING;

    return response;
  }

  splitName = (data:string) => {
    const name = {} as NameSplit;

    const splitNames = data.split(",");
    name.last = splitNames[0].trim();

    if (splitNames.length > 1) {
      const tmp = splitNames[1].split(" ");
      name.first = tmp[0];
      if (tmp.length > 1) {
        name.middle = tmp[1];
        if (tmp.length === 3) {
          if (this.suffixes.findIndex(k => k === tmp[2].toUpperCase()) >= 0) {
            // suffix exists
            name.suffix = tmp[2];
          }
        }
      }
    }

    if (typeof name.last === "undefined")
      name.last = "";
    if (typeof name.first === "undefined")
      name.first = "";
    if (typeof name.middle === "undefined")
      name.middle = "";
    if (typeof name.suffix === "undefined")
      name.suffix = "";

    return name;
  }

}

type NameSplit = {
  first: string;
  last: string;
  middle: string;
  suffix: string;
};
