import * as fs from 'fs';
import * as path from "path";
import {IIDMRowData} from './handlers'



export const writeStatementToFile = async statement => {
  fs.appendFileSync('./statements.sql', statement + '\n', {encoding: 'UTF-8'});
}
export const writeSuccessToFile = async (file:string, data: Partial<IIDMRowData>[]) => {
    // console.log(res, data);
  // @ts-ignore
  const msg = [`Successfully inserted ${data.length}. Last IDM Number: ${data[data.length - 1].IDM_IDM_NO.trim()}`,
    ''
  ]
  fs.appendFileSync(path.join(process.cwd(), file), msg.join('\n'), {encoding: 'UTF-8'});
}
export const writeErrorToFile = async (error, other) => {
  const msg = [
    new Date().toDateString(),
    JSON.stringify(error),
    other,
    '--------------------------------',
    ''
  ]
  fs.appendFileSync('./errors.log', msg.join('\n'), {encoding: 'UTF-8'})
}
