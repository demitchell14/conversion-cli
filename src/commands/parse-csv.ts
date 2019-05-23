import {Command, flags} from '@oclif/command'
import * as Parser from '@oclif/parser';
import {WriteStream} from 'fs'
import * as path from "path";
import * as csv from "csv-parser";
import * as fs from "fs";
import {Readable} from 'stream'


export default class ParseCSV extends Command {
  static description = 'describe the command here'

  static examples = [
    `$ run parse-csv <source file> <destination file>
`,
  ]

  static flags = {
    help: flags.help({char: 'h'}),
  }

  static args = [
    {
      name: 'source', required: true, description: "The relative, or absolute location of a CSV that needs to be converted",
    },
    {
      name: 'destination', required: true, description: "The relative, or absolute location to generate the file"
    }
  ] as Parser.args.IArg[];

  async run() {
    const {args, flags} = this.parse(ParseCSV)
    console.log(`Source File:       ${args.source}`);
    console.log(`Destination File:  ${args.destination}`);

    const {source, destination} = args;
    let file;
    if (path.isAbsolute(source)) {
      file = source;
    } else {
      file = path.join()
    }



    if (fs.existsSync(destination))
      fs.unlinkSync(destination);

    let total = 0;
    let writable:WriteStream;
    try {
      writable = fs.createWriteStream(destination);
      fs.createReadStream(file, {encoding: "UTF-8"})
        .pipe(csv({headers: false}))
        .on('data', (data) =>
          complete(writable, data)
        ).on("error", (err) => {
          console.log(err)
        })
        .on('end', () => {
          console.log("Conversion Completed", "\nTotal Records: ", total);
          writable.close();
        });
    } catch (err) {
      console.error(err);
    }


    const complete = (stream:WriteStream, results:Object) => {
      total ++;
      stream.write(Object.values(results).join("{#}") + "\r\n", "UTF-8", (err) => {
        if (err)
          console.error(err);
      });
    };
  }
}
