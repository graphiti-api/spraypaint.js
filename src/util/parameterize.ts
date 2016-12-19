export default function parameterize(obj : any, prefix? : string) : string {
  let str = [];

  for (let key in obj) {
    let value = obj[key];

    if (key == 'include') {
    }

    if (!!value) {
      if (prefix) {
        key = `${prefix}[${key}]`;
      }

      if (Array.isArray(value)) {
        str.push(`${key}=${value.join(',')}`);
      } else if (typeof value == "object") {
        str.push(parameterize(value, key));
      } else {
        str.push(`${key}=${value}`);
      }
    }
  }

  // remove blanks
  str = str.filter((p) => {
    return !!p;
  });

  return str.join("&");
}
