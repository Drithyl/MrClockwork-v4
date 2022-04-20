
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

module.exports.copyDir = function(source, target, deepCopy, extensionFilter = null)
{
	if (fs.existsSync(source) === false)
		return Promise.reject(new Error(`The source path ${source} does not exist.`));

	return fsp.readdir(source)
	.then((filenames) => 
	{
		return filenames.forAllPromises((filename) =>
		{
			return Promise.resolve()
			.then(() =>
			{
				//if there's a directory inside our directory and no extension filter, copy its contents too
				if (deepCopy === true && fs.lstatSync(`${source}/${filename}`).isDirectory() === true)
					return exports.copyDir(`${source}/${filename}`, `${target}/${filename}`, deepCopy, extensionFilter);

				else if (_doesExtensionMatchFilter(filename, extensionFilter) === true)
					return exports.copyFile(`${source}/${filename}`, `${target}/${filename}`);

				//ignore file and loop
				else return Promise.resolve();
			});
		});
    })
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
				var pending = list.length;

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

module.exports.deleteDir = function(path)
{
    if (fs.existsSync(path) === false)
	{
		log.general(log.getLeanLevel(), `deleteDir(): Dir does not exist, no need to delete`, path);
		return Promise.resolve();
	}

	log.general(log.getLeanLevel(), `Deleting dir at path ${path}...`);
        
    return fsp.readdir(path)
    .then((filenames) =>
    {
		log.general(log.getLeanLevel(), `Filenames read, iterating through...`);
        return filenames.forAllPromises((filename) =>
        {
            const filepath = `${path}/${filename}`;
			log.general(log.getLeanLevel(), `Deleting file at ${filepath}...`);

            return fsp.stat(filepath)
            .then((stats) =>
            {
                if (stats.isDirectory() === true)
                    return exports.deleteDir(filepath);

                return fsp.unlink(filepath);
            })
            .then(() => 
			{
				log.general(log.getLeanLevel(), `File deleted.`);
				return Promise.resolve();
			})
			.catch((err) => Promise.reject(err));
        });
    })
    .then(() => fsp.rmdir(path))
    .catch((err) => 
	{
		log.error(log.getLeanLevel(), `deleteDir() ERROR`, err);
		return Promise.reject(err)
	});
};

//If the dir path up to a filename does not exist, this will create it
module.exports.checkAndCreateFilePath = function(filePath)
{
    var directories = [];
    var currentPath = path.dirname(filePath);

	if (fs.existsSync(currentPath) === true)
		return Promise.resolve();

    while (currentPath !== path.dirname(currentPath))
    {
        directories.unshift(currentPath);
        currentPath = path.dirname(currentPath);
    }

    return directories.forEachPromise((dir, index, nextPromise) =>
    {
        if (fs.existsSync(dir) === false)
        {
            return fsp.mkdir(dir)
            .then(() => nextPromise());
        }
            
        else return nextPromise();
    })
    .catch((err) => Promise.reject(err));
};

module.exports.getDirFilenames = async function(dirPath, extensionFilter = "")
{
	var readFilenames = [];
	var filenames;

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

//gets an array with all the filenames inside a directory, folders or not
exports.getAllDirFilenamesSync = (path) =>
{
	return fs.readdirSync(path, "utf8");
};

//gets an array with all the filenames inside a directory, NOT including folders
exports.getOnlyDirFilenamesSync = (path) =>
{
	var filenames = exports.getAllDirFilenamesSync(path);
	var onlyFilenames = [];
	
	filenames.forEach((filename) =>
	{
		var stat = fs.statSync(`${path}/${filename}`);
		var isDirectory = stat.isDirectory();

		if (isDirectory === false)
			onlyFilenames.push(filename);
	});

	return onlyFilenames;
};

//gets an array with all the folder names inside a directory
exports.getDirSubfolderNamesSync = (path) =>
{
	var filenames = exports.getAllDirFilenamesSync(path);
	var subfolderNames = [];
	
	filenames.forEach((filename) =>
	{
		var stat = fs.statSync(`${path}/${filename}`);
		var isDirectory = stat.isDirectory();

		if (isDirectory === true)
			subfolderNames.push(filename);
	});

	return subfolderNames;
};

module.exports.append = (filePath, stringData) =>
{
	const dirPath = filePath.replace(/\/.+$/, "");

	if (fs.existsSync(dirPath) === false)
		return Promise.reject(new Error(`Directory ${dirPath} does not exist.`));

	if (fs.existsSync(filePath) === false)
		return fsp.writeFile(filePath, stringData);
		
	else return fsp.appendFile(filePath, stringData);
};

//Stringify that prevents circular references taken from https://antony.fyi/pretty-printing-javascript-objects-as-json/
module.exports.JSONStringify = function(obj, spacing = 2)
{
	var cache = [];

	//custom replacer function gets around the circular reference errors by discarding them
	var str = JSON.stringify(obj, function(key, value)
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