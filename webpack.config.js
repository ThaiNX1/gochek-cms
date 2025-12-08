const { shareAll, withModuleFederationPlugin } = require("@angular-architects/module-federation/webpack");
module.exports = withModuleFederationPlugin({
  shared: {
    ...shareAll({ singleton: true, strictVersion: false, requiredVersion: "auto" }),
    // "@angular/core": { singleton: true, strictVersion: false, requiredVersion: "auto" },
    // "@angular/common": { singleton: true, strictVersion: false, requiredVersion: "auto" },
    // "@angular/router": { singleton: true, strictVersion: false, requiredVersion: "auto" }
  }
});