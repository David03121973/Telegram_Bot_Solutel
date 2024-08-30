"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getPrecio = getPrecio;
var fs = require("fs");
function getPrecio() {
    var data = fs.readFileSync("./CAMBIO.txt", "utf-8");
    return parseInt(data);
}
