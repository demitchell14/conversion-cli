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
    console.log(args);
    const {source, destination} = args;
    let file;
    if (path.isAbsolute(source)) {
      file = source;
    } else {
      file = path.join()
    }

    let readable, timeout;
    timeout = setTimeout(() => {
      if (readable)
        readable.destroy();
      // res.sendStatus(500);
    }, 10000);


    if (fs.existsSync(destination))
      fs.unlinkSync(destination);

    let total = 0;
    let totalAppends = 0;
    let writable:WriteStream;
    try {
      writable = fs.createWriteStream(destination);
      let results = [] as any;
      fs.createReadStream(file, {encoding: "UTF-8"})
        .pipe(csv({headers: false}))
        .on('data', (data) => {
          results.push(data);
          if (results.length >= 100000) {
            complete(writable, results)
            results = [];
          } else {
          }
        }).on("error", (err) => {
          console.log(err)
        })
        .on('end', () => {
          if (results.length > 0) {
            complete(writable, results)
            // total += results.length;
          }
          console.log("Conversion Completed", "\nTotal Records: ", total, "\nTotal File Appends: ", totalAppends);
          writable.close();
        });
    } catch (err) {
      clearTimeout(timeout);
      console.error(err);
    }


    const complete = (stream:WriteStream, results:any) => {
      if (!(results instanceof Array))
        results = [results];
      if (results.length > 0) {
        // toReturn.push(Object.keys(results[0]).join("{#}"));
      }
      results = results.map(row => {
        return (Object.values(row).join("{#}"))
      })

      total += results.length;

      stream.write(results.join("\r\n") + "\r\n", "UTF-8", (err) => {
        if (err)
          console.error(err);
      });
      totalAppends++;



      // fs.appendFileSync(destination, results.join("\r\n"), {});
      clearTimeout(timeout)
    };
  }
}
