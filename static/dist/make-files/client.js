window.sharedb = require("sharedb/lib/client");
var ottext = require("ot-text");
window.ottext = ottext;

var types = require("sharedb/lib/types");
types.register(ottext.type);
