

const suffixes = [
  "JR", "SR", "II", "IV", "III", "V", "VI", "VII"
]

export function splitName (data:string) {
  const name = {} as NameSplit;

  const splitNames = data.split(",");
  name.last = splitNames[0].trim();

  if (splitNames.length > 1) {
    const tmp = splitNames[1].split(" ");
    name.first = tmp[0];
    if (tmp.length > 1) {
      name.middle = tmp[1];
      if (tmp.length === 3) {
        if (suffixes.findIndex(k => k === tmp[2].toUpperCase()) >= 0) {
          // suffix exists
          name.suffix = tmp[2];
        }
      }
    }
  }

  if (typeof name.last === "undefined")
    name.last = "";
  if (typeof name.first === "undefined")
    name.first = "";
  if (typeof name.middle === "undefined")
    name.middle = "";
  if (typeof name.suffix === "undefined")
    name.suffix = "";

  return name;
}

type NameSplit = {
  first: string;
  last: string;
  middle: string;
  suffix: string;
};


export function splitCSZ(data:string) {
  data = data.trim().replace("/W+", " ");
  const ret = {} as any;
  const spl = data.split(",");
  if (spl.length > 1) {
    ret.city = spl[0].trim();
    if (spl.length > 2) {
      ret.state = spl[1].trim();
      ret.zip = spl[2].trim();
    } else {
      ret.state = spl[1].substr(0, spl[1].lastIndexOf(" ")).trim();;
      ret.zip = spl[1].substr(spl[1].lastIndexOf(" ")).trim();
    }
  } else {
    let tmp = "" + data;
    ret.zip = tmp.substr(tmp.lastIndexOf(" ")).trim();
    if (ret.zip.length < 5) {
      let tmpZip = ret.zip + "";
      delete ret.zip;
      if (tmpZip.match(/^\d+$/g)) {
        let nTmp = tmp.substr(0, tmp.lastIndexOf(" "));
        nTmp = nTmp.substr(nTmp.lastIndexOf(" "), nTmp.length-1).trim();
        if (nTmp.match(/^\d+$/g)) {
          ret.zip = nTmp + "-" + tmpZip;
          tmp = tmp.substr(0, tmp.lastIndexOf(" ")).trim();
          tmp = tmp.substr(0, tmp.lastIndexOf(" ")).trim();
        }
      }

      // delete ret.zip;
    } else {
      tmp = tmp.substr(0, tmp.lastIndexOf(" ")).trim();
    }
    ret.state = tmp.substr(tmp.lastIndexOf(" ")).trim();
    if (ret.state.match(/[0-9\-]/g)) {
      ret.zip = ret.state;
      delete ret.state;
    } else {
      tmp = tmp.substr(0, tmp.lastIndexOf(" "));
    }

    if (ret.zip && ret.state) {
      ret.city = tmp.trim();
    }
  }

  if (typeof ret.state === "undefined" || ret.state === "") {
    if (typeof ret.zip === "string" && ret.zip.match(/^\d+$/g) && typeof ret.city === "string") {
      ret.state = ret.city.substr(ret.city.lastIndexOf(" "));
      ret.city = ret.city.substr(0, ret.city.lastIndexOf(" "));
    } else {
      ret.state = ret.zip;
      delete ret.zip;
    }
  }

  // if (typeof ret.zip === "string" && ret.zip.match(/^\D+$/g)) {
  //   if (ret.city === "") {
  //     ret.city = ret.zip;
  //     delete ret.zip;
  //   }
  // }

  if (!ret.state)
    ret.state = "";
  if (!ret.city)
    ret.city = "";
  if (!ret.zip)
    ret.zip = "";

  // removeWhatever("asdfas", /af/);

  ret.zip = ret.zip.substr(0, 10);
  // ret.city = ret.city
  // ret.state = ret.state.substr(0, 2);
  return ret;
}

export function removeRelationshipFromAddresses(data: string) {
  const relationships = [
    "PARENT",
    "PAR:",
    "FATHER",
    "MOTHER",
    "CHILD",
    "GRANDMOTHER",
    "GRANDFATHER",
    "GRANDPARENT",
    "GUARDIAN",
  ]

  function shouldRemove(toSearch:string, regex:string|RegExp) {
    if (typeof regex === "string") {
      return toSearch.indexOf(regex) >= 0;// ? "" : toSearch;
    } else {
      return toSearch.match(regex);// ? "" : toSearch;
    }
  }

  relationships.map(rel => {
    if (data === "") return;
    if (shouldRemove(data, rel))
      data = "";
  })
  return data;
}