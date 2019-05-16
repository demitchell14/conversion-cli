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
  names: "./destination/names",
  address: "./destination/address",
  "atyp-address": "./destination/atyp/address",
  "atyp-names": "./destination/atyp/names",
}

export const SourceHandlers = {
  idmp: "./source/retrieve",
  idap: "./source/retrieve",
  atyp: "./source/retrieve",
  retrieve: "./source/retrieve",
}

// export function getHandler(name:"names"): Promise<SourceHandler>;
// export function getHandler(name:"retrieve"): Promise<DestinationHandler>;
export function getHandler(name:string):Promise<SourceHandler|DestinationHandler> {
  const isDestination = Object.keys(DestinationHandlers).find(k => k === name);
  if (isDestination && DestinationHandlers[isDestination])
    return import(DestinationHandlers[isDestination]).then(obj => obj.default);

  const isSource = Object.keys(SourceHandlers).find(k => k === name);
  if (isSource && SourceHandlers[isSource])
    return import(SourceHandlers[isSource]).then(obj => obj.default);

  throw Error("Unknown Handler")
}
