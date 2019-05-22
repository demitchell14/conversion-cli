import {Command, flags} from '@oclif/command'
import * as Parser from '@oclif/parser';
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

    try {
      readable = new Readable();
      readable._read = () => {};
      readable.push(fs.readFileSync(file, {encoding: "UTF-8"}));
      readable.push(null);
      const results = [] as any;
      readable.pipe(csv({headers: false,}))
        .on("data", (data:any) => {
          results.push(data)
          // console.log(results)
        }).on("error", (err) => {
        console.error(err);
      })
        .on("end", () => complete(results));
    } catch (err) {
      clearTimeout(timeout);
      // console.error(err);
    }

    const complete = (results:any[]) => {
      const toReturn = [] as string[];
      if (results.length > 0) {
        // toReturn.push(Object.keys(results[0]).join("{#}"));
      }
      results.map(row => {
        toReturn.push(Object.values(row).join("{#}"))
      })

      fs.writeFileSync(destination, toReturn.join("\r\n"));
      clearTimeout(timeout)
    };
  }
}
