module.exports = {
  passthroughPaths: [
    "src/assets/css",
    "src/assets/fonts",
    "src/assets/js",
    "src/static",
    {
      "node_modules/mermaid/dist/mermaid.esm.min.mjs": "assets/vendor/mermaid/mermaid.esm.min.mjs",
      "node_modules/mermaid/dist/chunks/mermaid.esm.min": "assets/vendor/mermaid/chunks/mermaid.esm.min"
    }
  ]
};
