const {
  shareAll,
  withModuleFederationPlugin,
} = require("@angular-architects/module-federation/webpack");

module.exports = withModuleFederationPlugin({
  name: "shop",

  exposes: {
    "./Module": "./projects/shop/src/app/remote-entry/entry.module.ts",
  },

  shared: {
    ...shareAll({
      singleton: true,
      strictVersion: false,
      requiredVersion: "auto",
    }),
  },

  sharedMappings: ["@angular-architects/module-federation-tools"],
});
