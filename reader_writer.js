
const fs = require("fs");
const path = require("path");
const fsp = require("fs").promises;
const log = require("./logger.js");


module.exports.copyFile = function(source, target)
{
	return exports.checkAndCreateFilePath(target)
	.then(() => fsp.readFile(source))
    .then((buffer) => fsp.writeFile(target, buffer))
    .catch((err) => Promise.reject(err));
};

module.exports.walkDir = function(dir)
{
	const results = [];
	const path = require('path');

	return _walk(dir);

	function _walk(dir)
	{
		return new Promise((resolve, reject) =>
		{
			fsp.readdir(dir)
			.then((list) =>
			{
				let pending = list.length;

				if (pending <= 0)
					return resolve(results);

				list.forEach((file) =>
				{
					file = path.resolve(dir, file);

					fsp.stat(file)
					.then((stat) =>
					{
						if (stat.isDirectory() === true)
						{
							_walk(file)
							.then((res) => 
							{
								results.concat(res);
								pending--;

								if (pending <= 0)
									return resolve(results);
							});
						}

						else
						{
							results.push(file);
							pending--;

							if (pending <= 0)
								return resolve(results);
						}
					});
				})
			})
			.catch((err) => reject(err));
		});
	}
};

//If the dir path up to a filename does not exist, this will create it
module.exports.checkAndCreateFilePath = async function(filePath)
{
    let directories = [];
    let currentPath = path.dirname(filePath);

	if (fs.existsSync(currentPath) === true)
		return;

    while (currentPath !== path.dirname(currentPath))
    {
        directories.unshift(currentPath);
        currentPath = path.dirname(currentPath);
    }

	for (const dir of directories) {
		if (fs.existsSync(dir) === false)
		{
			await fsp.mkdir(dir);
		}
	}
};

module.exports.getDirFilenames = async function(dirPath, extensionFilter = "")
{
	let readFilenames = [];
	let filenames;

	if (fs.existsSync(dirPath) === false)
		return Promise.reject(new Error(`The directory ${dirPath} was not found on the server.`));

	filenames = await fsp.readdir(dirPath, "utf8");

	filenames.forEach((filename) =>
	{
		if (extensionFilter === "" || path.extname(filename) === extensionFilter)
			readFilenames.push(filename);
	});

	return readFilenames;
};

//gets an array with all the filenames inside a directory, NOT including folders
exports.getOnlyDirFilenamesSync = (dirPath) =>
{
	let filenames = fs.readdirSync(dirPath);
	let onlyFilenames = [];
	
	filenames.forEach((filename) =>
	{
		let stat = fs.statSync(`${dirPath}/${filename}`);
		let isDirectory = stat.isDirectory();

		if (isDirectory === false)
			onlyFilenames.push(filename);
	});

	return onlyFilenames;
};

//gets an array with all the folder names inside a directory
exports.getDirSubfolderNamesSync = (dirPath) =>
{
	let filenames = fs.readdirSync(dirPath);
	let subfolderNames = [];
	
	filenames.forEach((filename) =>
	{
		let stat = fs.statSync(path.join(dirPath, filename));
		let isDirectory = stat.isDirectory();

		if (isDirectory === true)
			subfolderNames.push(filename);
	});

	return subfolderNames;
};

module.exports.append = async (filePath, stringData) =>
{
	const dirPath = filePath.replace(/\/.+$/, "");

	if (fs.existsSync(dirPath) === false)
		throw new Error(`Directory ${dirPath} does not exist.`);

	if (fs.existsSync(filePath) === false)
		await fsp.writeFile(filePath, stringData);
		
	else await fsp.appendFile(filePath, stringData);
};

//Stringify that prevents circular references taken from https://antony.fyi/pretty-printing-javascript-objects-as-json/
module.exports.JSONStringify = function(obj, spacing = 2)
{
	let cache = [];

	//custom replacer function gets around the circular reference errors by discarding them
	let str = JSON.stringify(obj, function(key, value)
	{
		if (typeof value === "object" && value != null)
		{
			//value already found before, discard it
			if (cache.indexOf(value) !== -1)
			{
				return;
			}

			//not found before, store this value for reference
			cache.push(value);
		}

		return value;

	}, spacing);

	//enable garbage collection
	cache = null;
	return str;
};