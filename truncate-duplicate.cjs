const fs = require("fs");
const path = require("path");
const file = path.join(__dirname, "src", "screens", "OrderConfirmedScreen.jsx");
const source = fs.readFileSync(file, "utf8");
const marker = '\nimport React, { useState, useEffect, useRef } from "react";';
const index = source.indexOf(marker);
if (index < 0) {
  throw new Error("Duplicate import marker not found");
}
fs.writeFileSync(file, source.slice(0, index).trimEnd() + "\n");
console.log("Removed duplicate from line after first StyleSheet.create close.");
