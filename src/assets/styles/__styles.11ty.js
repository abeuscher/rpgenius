const sass = require("sass");
const path = require("path");
const CleanCSS = require("clean-css");
const fs = require("fs");
const { promisify } = require("util");
const readFile = promisify(fs.readFile);

// Ensure entry file exists
const ENTRY_FILE_PATH = path.join(__dirname, "main.scss");

module.exports = class {
  data() {
    return {
      permalink: "/assets/styles/main.css",
      eleventyExcludeFromCollections: true,
    };
  }

  async render() {
    try {
      // Check if entry file exists
      await readFile(ENTRY_FILE_PATH, "utf8");

      // Process SASS to CSS
      const result = sass.compile(ENTRY_FILE_PATH, {
        style: "compressed",
        loadPaths: [path.join(__dirname)],
      });

      // Minify with clean-css in production
      if (process.env.NODE_ENV === "production") {
        const minified = new CleanCSS({}).minify(result.css);
        return minified.styles;
      }

      return result.css;
    } catch (e) {
      console.error("Error in style processing:", e);
      // Return an empty CSS file instead of null to avoid build failures
      return "/* CSS processing error occurred */";
    }
  }
};
