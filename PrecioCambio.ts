const fs = require("fs");

export function getPrecio() {
  const data = fs.readFileSync("./CAMBIO.txt", "utf-8");
  return parseInt(data);
}
