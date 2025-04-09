const webpack = require("webpack");
const path = require("path");
const { promisify } = require("util");
const fs = require("fs");
const readFile = promisify(fs.readFile);

// Ensure entry file exists
const ENTRY_FILE_PATH = path.join(__dirname, "main.js");

module.exports = class {
  // Define the output template
  data() {
    return {
      permalink: "/assets/scripts/main.js",
      eleventyExcludeFromCollections: true,
    };
  }

  async render() {
    try {
      // Check if entry file exists before proceeding
      await readFile(ENTRY_FILE_PATH, "utf8");

      // Set up webpack configuration
      const webpackConfig = {
        mode: process.env.NODE_ENV === "production" ? "production" : "development",
        entry: ENTRY_FILE_PATH,
        output: {
          path: path.resolve(__dirname, "dist"),
          filename: "main.js",
        },
        module: {
          rules: [
            {
              test: /\.js$/,
              exclude: /node_modules/,
              use: {
                loader: "babel-loader",
                options: {
                  presets: ["@babel/preset-env"],
                  plugins: ["@babel/plugin-transform-runtime"],
                },
              },
            },
          ],
        },
      };

      // Run webpack and return the built file content
      return new Promise((resolve, reject) => {
        webpack(webpackConfig, (err, stats) => {
          if (err || stats.hasErrors()) {
            console.error("Webpack compilation error:", err || stats.toString());
            // Instead of returning null which causes 11ty to fail, return an error message as JS
            return resolve('console.error("JavaScript build failed");');
          }

          // Read the output file from memory
          fs.readFile(path.join(webpackConfig.output.path, "main.js"), "utf8", (err, data) => {
            if (err) {
              console.error("Error reading webpack output:", err);
              // Again, return error message instead of null
              return resolve(
                'console.error("JavaScript build failed - could not read output file");'
              );
            }
            resolve(data);
          });
        });
      });
    } catch (e) {
      console.error("Error in script processing:", e);
      // Always return a string, even in case of failure
      return 'console.error("Script processing error occurred");';
    }
  }
};
