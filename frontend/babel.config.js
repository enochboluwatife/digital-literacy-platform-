export default {
  presets: [
    ["@babel/preset-react", { "runtime": "automatic", "importSource": "@emotion/react" }]
  ],
  plugins: [
    ["@emotion/babel-plugin", {
      "autoLabel": "dev-only",
      "labelFormat": "[local]"
    }],
    "@babel/plugin-syntax-import-assertions"
  ]
};
