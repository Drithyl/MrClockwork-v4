

// As per NodeJS' guidelines: 
// https://nodejs.org/en/knowledge/file-system/security/introduction/#preventing-directory-traversal

const path = require("path");
const { InvalidPathError } = require("../errors/custom_errors.js");

module.exports = (rootPath, ...paths) =>
{
    const normRoot = path.resolve(rootPath);
    const fullPath = path.resolve(rootPath, ...paths);
  
    if (fullPath.indexOf(normRoot) === 0)
        return fullPath;
  
    throw new InvalidPathError(`Path would result in directory traversal: ${fullPath} (root: ${normRoot})`);
};