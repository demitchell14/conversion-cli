import NamesHandler from './destination/names'
import {DestinationHandler} from './destinationHandler'
import RetrieveHandler from './source/retrieve'
import {SourceHandler} from './sourceHandler'

export * from "./sourceHandler";
export * from "./destinationHandler";

export {default as RetrieveHandler} from "./source/retrieve";
export {default as NamesHandler} from "./destination/names";
export {default as AddressHandler} from "./destination/address";


export const DestinationHandlers = {
  IDMpersons: "./destination/idm/persons",
  IDMaddress: "./destination/idm/address",
  ATYaddress: "./destination/aty/address",
  ATYnames: "./destination/aty/names",
  IDAnames: "./destination/ida/names",
}

export const SourceHandlers = {
  idm2: "./source/retrieve",
  idm3: "./source/retrieve",
  idap: "./source/retrieve",
  atyp: "./source/retrieve",
  removeDupIDA: "./source/retrieve",
  removeDupIDL: "./source/retrieve",
  idm2demogr: "./source/retrieve",
  retrieve: "./source/retrieve",
}

// export function getHandler(name:"names"): Promise<SourceHandler>;
// export function getHandler(name:"retrieve"): Promise<DestinationHandler>;
export function getHandler(name?:string):Promise<SourceHandler|DestinationHandler>|boolean {

  if (typeof name === "undefined")
    return false;

  const isDestination = Object.keys(DestinationHandlers).find(k => k === name);
  if (isDestination && DestinationHandlers[isDestination])
    return import(DestinationHandlers[isDestination]).then(obj => obj.default);

  const isSource = Object.keys(SourceHandlers).find(k => k === name);
  if (isSource && SourceHandlers[isSource])
    return import(SourceHandlers[isSource]).then(obj => obj.default);

  throw Error("Unknown Handler")
}
