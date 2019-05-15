import {SqlClient} from 'msnodesqlv8'
import {DT, IIDMRowData, IRowData, STAGING} from '../../../../tables'
import {DestinationHandler} from '../../destinationHandler'
import {AddressHandlerProps} from '../address'

const sql: SqlClient = require('msnodesqlv8');

export default class AddressHandler extends DestinationHandler {
  table?: string;
  selectors: string | '*';
  offset: number;

  constructor(props: AddressHandlerProps) {
    super(props);
    this.table = props.table;
    this.selectors = props.selectors || '*'
    this.offset = props.offset || 1;

  }

  import = async (data:STAGING.DCT_ADDRESSESS_STAGING[]) => {
    if (data.length > 0) {
      let query =  `INSERT INTO dbo.DCT_Addresses_Staging (${Object.keys(data[0]).map(k => k).join(",")}) VALUES `
      query += data.map(data => `(${Object.values(data).map(k => k).join(",")})`).join(",")
      // console.log(query);
      // const response = await this.query(query)
      // console.log(response)
      return query;
    }
    return "";
  }



  convert = (data: DT.ATYP | any) => {

    const CSZ = this.splitCSZ(data.ATY_CITY_ST_ZIP);

    const timestamp = new Date().toISOString().replace("T", " ").replace("Z", "");

    const response:STAGING.DCT_ADDRESSESS_STAGING = {
      SPN: `'ATY_${data.ATY_BAR_NO.trim()}'`,
      ADDRESSTYP: `'WORK'`,
      PostedDate: `'${timestamp}'`,
      CurrentAddressFlag: `'Y'`,
      BadAddressFlag: `'N'`,
      Addressline1: `'${data.ATY_ADDRESS1.replace(/'/g, "''").trim()}'`,
      Addressline2: `'${data.ATY_ADDRESS2.replace(/'/g, "''").trim()}'`,
      state: `'${CSZ.state.replace(/'/g, "''")}'`,
      city: `'${CSZ.city.replace(/'/g, "''")}'`,
      postalCD: `'${CSZ.zip.replace(/'/g, "''")}'`,
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

  splitCSZ = (data:string) => {
    data = data.trim().replace("/W+", " ");
    const ret = {} as any;
    const spl = data.split(",");
    if (spl.length > 1) {
      ret.city = spl[0].trim();
      if (spl.length > 2) {
        ret.state = spl[1].trim();
        ret.zip = spl[2].trim();
      } else {
        ret.state = spl[1].substr(0, spl[1].lastIndexOf(" ")).trim();;
        ret.zip = spl[1].substr(spl[1].lastIndexOf(" ")).trim();
      }
    } else {
      let tmp = "" + data;
      ret.zip = tmp.substr(tmp.lastIndexOf(" ")).trim();
      if (ret.zip.length < 5) {
        let tmpZip = ret.zip + "";
        delete ret.zip;
        if (tmpZip.match(/^\d+$/g)) {
          let nTmp = tmp.substr(0, tmp.lastIndexOf(" "));
          nTmp = nTmp.substr(nTmp.lastIndexOf(" "), nTmp.length-1).trim();
          if (nTmp.match(/^\d+$/g)) {
            ret.zip = nTmp + "-" + tmpZip;
            tmp = tmp.substr(0, tmp.lastIndexOf(" ")).trim();
            tmp = tmp.substr(0, tmp.lastIndexOf(" ")).trim();
          }
        }

        // delete ret.zip;
      } else {
        tmp = tmp.substr(0, tmp.lastIndexOf(" ")).trim();
      }
      ret.state = tmp.substr(tmp.lastIndexOf(" ")).trim();
      if (ret.state.match(/[0-9\-]/g)) {
        ret.zip = ret.state;
        delete ret.state;
      } else {
        tmp = tmp.substr(0, tmp.lastIndexOf(" "));
      }

      if (ret.zip && ret.state) {
        ret.city = tmp.trim();
      }
    }

    if (typeof ret.state === "undefined" || ret.state === "") {
      if (typeof ret.zip === "string" && ret.zip.match(/^\d+$/g) && typeof ret.city === "string") {
        ret.state = ret.city.substr(ret.city.lastIndexOf(" "));
        ret.city = ret.city.substr(0, ret.city.lastIndexOf(" "));
      } else {
        ret.state = ret.zip;
        delete ret.zip;
      }
    }

    if (!ret.state)
      ret.state = "";
    if (!ret.city)
      ret.city = "";
    if (!ret.zip)
      ret.zip = "";

    return ret;
  }

}
