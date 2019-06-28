import {SqlClient} from 'msnodesqlv8'
import {DT, IIDMRowData, IRowData, STAGING} from '../../../../tables'
import {DestinationHandler} from '../../destinationHandler'
import {splitCSZ} from '../../functions'
import {AddressHandlerProps} from '../address'

const sql: SqlClient = require('msnodesqlv8');

export default class AddressHandler extends DestinationHandler {
  table?: string;
  selectors: string | '*';
  offset: number;

  constructor(props: AddressHandlerProps) {
    super(props);
//    this.table = props.table;
    this.selectors = props.selectors || '*'
    this.offset = props.offset || 1;

  }

  import = (data:STAGING.DCT_ADDRESSESS_STAGING[]) => {
    if (data.length > 0) {
      let query =  `INSERT INTO dbo.DCT_Addresses_Staging (${Object.keys(data[0]).map(k => k).join(",")}) VALUES `
      query += data.map(data => `(${Object.values(data).map(k => k).join(",")})`).join(",")
      // console.log(query);
      // const response = await this.query(query)
      // console.log(response)

      // return new Promise(resolve => resolve({ response: query, data }));
      query
      const response = this.query(query);
      return new Promise((resolve, reject) => {
        response.then(res => resolve({response: res, data}));
        response.catch(err => reject(err));
      })
    }
    return new Promise((resolve) => resolve());
  }



  convert = (data: DT.ATYP | any) => {

    const CSZ = splitCSZ(data.CLT_CITY_ST_ZIP);
    const timestamp = new Date().toISOString().replace("T", " ").replace("Z", "");

    const response:STAGING.DCT_ADDRESSESS_STAGING|any = {
      SPN: `'${data.LOCATION}-${data.CLT_NUMBER.replace(/\s+/g, " ").replace(/'/g, "''").trim()}-${data.CLT_CLT_SEQ_NO.toString()}'`,
      ADDRESSTYP: `'HOME'`,
      PostedDate: `'${timestamp}'`,
      CurrentAddressFlag: `'Y'`,
      BadAddressFlag: `'N'`,
      Addressline1: `'${data.CLT_ADDRESS1.replace(/'/g, "''").trim()}'`,
      Addressline2: `'${data.CLT_ADDRESS2.replace(/'/g, "''").trim()}'`,
      state: `'${CSZ.state.replace(/'/g, "''")}'`,
      //state: "'" + CSZ.state.replace(/'/g, "''") + "'",
      city: `'${CSZ.city.replace(/'/g, "''")}'`,
      postalCD: `'${CSZ.zip.length > 10 ? CSZ.zip.replace("-", "").replace(/'/g, "''") : CSZ.zip.replace(/'/g, "''")}'`,
      RestrictedAddressFlag: `'N'`,
      PrimaryFlag: `'Y'`,
      ProcessedFlag: `'N'`,
      AddressSeq: 1,
      Date_time_created: `'${timestamp}'`,
      date_time_modified: `'${timestamp}'`,
      user_id: `'bwilder'`,
    };

    return response;
  }



}
