import {SqlClient} from 'msnodesqlv8';
import {IRow} from 'mssql'

// import {Connection} from '../connection';
import {writeErrorToFile, writeStatementToFile, writeSuccessToFile} from '../file';
// import {Loader, LoaderProps} from '../load';

import {Handler, HandlerProps, IIDMRowData, IRowData} from './index'
const sql: SqlClient = require('msnodesqlv8');

export default class AddressHandler extends Handler {
  table: string;
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

export interface AddressHandlerProps extends HandlerProps {

}




// export default async function() {
//     const connection = new Connection({
//         database: process.env.db_name || "",
//         server: process.env.db_server || "",
//         driver: process.env.db_driver || "",
//     });
//
//     const importer = new Loader({
//         database: process.env.db_name || "",
//         server: process.env.db_server || "",
//         driver: process.env.db_driver || "",
//         table: process.env.db_idm_table || "",
//     });
//
//     const data = importer.load();
//
//     const iterate = await (async function (generator) {
//         let idx = 1;
//         let item = await generator.next();
//         while (true) {
//             const data = [] as IIDMRowData[];
//             if (item) {
//                 console.log("Generator Round " + idx++);
//                 if (item.done) {
//                     return data;
//                 } else {
//                     let action = "insert into dbo.DCT_Persons_Staging (spn, firstname, middlename, lastname, displayname, corp, sealedflag, suffix_name, comment_text, date_time_created, date_time_modified, user_id) values ";
//                     item.value.map((row: IIDMRowData) => {
//                         action += convert(row) + ","
//                         data.push(row)
//                         // data.push(convert(row));
//                     })
//                     action = action.substr(0, action.length - 1) + ";";
//
//                     writeStatementToFile(action);
//
//                     connection.query(action)
//                         .then((res) => writeSuccessToFile(res, data))
//                         .catch(err => writeErrorToFile(err, action));
//
//                     // fs.writeFileSync("./test.sql", , {encoding: "UTF-8"})
//
//                 }
//             } else {
//                 throw "Row not found";
//             }
//             item = await generator.next();
//         }
//     })(data);
// }
