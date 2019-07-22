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
  IDApersons: "./destination/ida/persons",
  ATYaddress: "./destination/aty/address",
  ATYpersons: "./destination/aty/persons",
  CLTPersons: "./destination/clt/persons",
  CLTAddress: "./destination/clt/address",
}

export const SourceHandlers = {
  idmAll: "./source/retrieve",
  idmAddr: "./source/retrieve",
  idaAll: "./source/retrieve",
  atyAll: "./source/retrieve",
  removeDupIDA: "./source/retrieve",
  removeDupIDL: "./source/retrieve",
  idm2DL: "./source/retrieve",
  idm2demogr: "./source/retrieve",
  idm2PhoneMain: "./source/retrieve",
  idm2PhoneCell: "./source/retrieve",
  idm2PhoneFax: "./source/retrieve",
  idv2Vehicle: "./source/retrieve",
  aty2email: "./source/retrieve",
  aty2phoneMain: "./source/retrieve",
  aty2phoneFax: "./source/retrieve",
  aty2phoneCel: "./source/retrieve",
  aty2phoneBep: "./source/retrieve",
  aty2phonePag: "./source/retrieve",
  aty2aty: "./source/retrieve",
  aty2bnd: "./source/retrieve",
  fixSuffix: "./source/retrieve",
  allDTNameCLT: "./source/retrieve",
  allCANameCLT: "./source/retrieve",
  allCAAddrCLT: "./source/retrieve",
  allDTAddrCLT: "./source/retrieve",
  allCAPhoneCLT: "./source/retrieve",
  allDTPhoneCLT: "./source/retrieve",
  FixSuffixSR: "./source/retrieve",
  FixSuffixJR: "./source/retrieve",
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
