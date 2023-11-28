"use strict";

const http = require("http");
export default function Request(options, data, callback) {
  const cb = callback || ((err, response) => {});
  this.req = http.request(options, (res) => {
    res.setEncoding("utf8");
    const buffers = [];

    res.on("data", (chunk) => buffers.push(Buffer.from(chunk)));
    res.on("end", () => cb(null, Buffer.concat(buffers)));
  });

  this.req.on("error", (e) => {
    console.log("problem with request: " + e.message);
    cb(e, e.message);
  });

  this.invoke = () => {
    if (data) {
      // write data to request body
      this.req.write(data);
    }
    this.req.end();
  };
};
