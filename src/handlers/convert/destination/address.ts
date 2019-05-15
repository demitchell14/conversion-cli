import {SqlClient} from 'msnodesqlv8';
import {IRow} from 'mssql'
import {DestinationHandler,} from '../'
import {HandlerProps} from '../../../interfaces'
import {IIDMRowData, IRowData} from '../../../tables'

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

    /**
     * This is called an asynchronous generator. It basically has the ability to
     * make continuous, asynchronous calls until its told to stop, and after
     * each response it sends out, it waits to be called again. In this use case,
     * we call an SQL Statement and return a defined amount of rows. Once those defined
     * rows have been dealt with, instead of resetting, this function already knows where
     * we are, so we can just call it again, and it will resume from the the CurrentOffset + offset
     * @param dataGenerator Generator
     */
    import = async (data:IRowData[]) => {
      if (typeof this.fields === "undefined") {
        throw "No fields are set to be importered. please run calculateFields"
      }
      let query = `INSERT INTO ${this.table} (${this.fields}) VALUES `
      data.map(row => {
        query += "(" + Object.values(row).join(",") + "), "
      })
      query = query.substr(0, query.length - 2);
      console.log(query)
      return true;
    }

  convert = (data: IIDMRowData | any) => {


    const response = {
        spn: `'${data.IDM_IDM_NO.trim()}'`,
        address1: data.IDM_ADDRESS1,
      };

    return response;
  }

}

export interface AddressHandlerProps extends HandlerProps {}
