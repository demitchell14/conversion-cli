import {Command, flags} from '@oclif/command'
import * as Parser from '@oclif/parser';
import {writeErrorToFile, writeSuccessToFile} from '../file'
import {getHandler} from "../handlers";
import NamesHandler from '../handlers/names'
import RetrieveHandler from '../handlers/retrieve'
import {ImportHandler} from "../ImportHandler";

export default class Convert extends Command {
  static description = 'describe the command here'

  static examples = [
    `$ cli convert [from] [to] [handler]
    hello world from ./src/hello.ts!
`,
  ]

  static flags = {
    help: flags.help({char: 'h'}),
    limit: flags.integer({char: "l", description: "Number to indicate how many records to import at a time"}),
    key: flags.integer({char: "k", description: "This is required in order to offset / limit in SQLExpress. It is the ORDER BY [Key]"}),
    offset: flags.integer({char: "o", description: "Number to Indicate the start point where to begin importing from"}),
    // flag with a value (-n, --name=VALUE)
    selector: flags.string({char: 's', description: 'String indicating field names to select delimited by a single comma in between'}),
    errors: flags.string({char: 'E', description: "File name to output errors to. Leave blank to not receive error logs"}),
    logs: flags.string({char: 'L', description: "File name to output conversion information to. Leave blank to not receive conversion logs"}),
    statements: flags.string({char: 'S', description: "File name to output query statements to. Leave blank to not receive statement logs"}),
    // flag with no value (-f, --force)
    // force: flags.boolean({char: 'f'}),
  }

  static args = [
    {name: 'source', required: true, description: "The handler identifier that is used to aggregate data to be converted"},
    {name: 'destination', required: true, description: "The handler identifier that is used to tell the program how to convert"},
  ] as Parser.args.IArg[];


  async run() {
    const {args, flags} = this.parse(Convert);
    const {source, destination} = args;

    const Retriever = new ImportHandler({
      table: source,
      limit: flags.limit,
      offset: flags.offset,
    });

    const importerClass = await getHandler(destination);
    // @ts-ignore
    const importer = new importerClass({
      limit: flags.limit,
      offset: flags.offset,
    }) as NamesHandler;

    const generator = Retriever.execute();
    let i = 0;
    while (true) {
      const rows = (await generator.next());
      // console.log(rows);
      if (rows.done) {
        break;
      }
      if (rows.value && rows.value.length > 0) {
        // console.log(rows.value);
        importer.calculateFields(importer.convert(rows.value[0]));
        const values = rows.value.map(row => importer.convert(row));

        importer.import(values)
          .then(() => console.log(`Loop #${++i} completed`))
          .then((res) => flags.logs ? writeSuccessToFile(flags.logs, rows.value) : undefined)
          .catch(err => flags.errors ? writeErrorToFile(flags.errors, err) : undefined)
          .catch(err => console.error(err));

      }
    }

    // const name = flags.name || 'world'
    // this.log(`hello ${name} from .\\src\\commands\\hello.ts`)
    // if (args.file && flags.force) {
    //   this.log(`you input --force and --file: ${args.file}`)
    // }
  }
}
