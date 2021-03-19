
const fs = require("fs");
const fsp = require("fs").promises;
const config = require("./config/config.json");
const logsPath = `${config.dataPath}/${config.logsFolder}`;

const logTagsToPaths = {
    "general": `${logsPath}/general.txt`,
    "error": `${logsPath}/error.txt`,
    "upload": `${logsPath}/upload.txt`
};

if (fs.existsSync(logsPath) === false)
{
	fs.mkdirSync(logsPath);
}

module.exports.copyFile = function(source, target)
{
	return exports.checkAndCreateFilepath(target)
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
		return filenames.forEachPromise((filename, index, nextPromise) =>
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
			})
			.then(() => nextPromise());
		});
    })
    .catch((err) => Promise.reject(err));
};

module.exports.deleteDir = function(path)
{
    if (fs.existsSync(path) === false)
        return Promise.resolve();
        
    return fsp.readdir(path)
    .then((filenames) =>
    {
        return filenames.forEachPromise((filename, index, nextPromise) =>
        {
            const filepath = `${path}/${filename}`;

            fsp.lstat(filepath)
            .then((stats) =>
            {
                if (stats.isDirectory() === true)
                    return exports.deleteDir(filepath);

                return fsp.unlink(filepath);
            })
            .then(() => nextPromise());
        });
    })
    .then(() => fsp.rmdir(path))
    .catch((err) => Promise.reject(err));
};

//If a directory does not exist, this will create it
module.exports.checkAndCreateFilepath = function(filepath)
{
	var splitPath = filepath.split("/");
	var compoundPath = splitPath[0];

	return splitPath.forEachPromise((pathSegment, index, nextPromise) =>
	{
		//last element of the path should not be iterated through as it will be a file
		if (index >= splitPath.length - 1)
			return Promise.resolve();

		//prevent empty paths from being created
		if (fs.existsSync(compoundPath) === false && /[\w]/.test(compoundPath) === true)
		{
			return fsp.mkdir(compoundPath)
			.then(() => 
			{
				compoundPath += `/${splitPath[index+1]}`;
				nextPromise();
			});
		}
			
		else
		{
			compoundPath += `/${splitPath[index+1]}`;
			nextPromise();
		}
	});
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

module.exports.log = function(tags, trace, ...inputs)
{
	var msg = _timestamp() + "\n";

	if (Array.isArray(tags) === false)
		tags = [tags];

	//no trace argument was provided
	if (typeof trace !== "boolean")
	{
		if (Array.isArray(trace) === false)
			trace = [trace];

		inputs = trace.concat(inputs);
	}

	inputs.forEach((input) =>
	{
		if (typeof input === "string")
		{
			//add tab characters to each line so that they are all indented relative to the timestamp
			input.split("\n").forEach((line) => msg += `\t${line}\n`);
		}

		else msg += `\t${_toJSON(input)}\n`;
	});

	console.log(`${msg}\n`);

	if (trace === true)
	{
		console.log("\n\n");
		console.trace();
		console.log("\n\n");
	}

	tags.forEachPromise((tag, index, nextPromise) =>
	{
		if (logTagsToPaths[tag] == null)
            return nextPromise();
            
        return Promise.resolve()
        .then(() =>
        {
            if (fs.existsSync(logTagsToPaths[tag]) === false)
                return fsp.writeFile(logTagsToPaths[tag], `${msg}\r\n\n`);

            return fsp.appendFile(logTagsToPaths[tag], `${msg}\r\n\n`);
        })
        .then(() => nextPromise())
        .catch((err) => console.log(err));
	});
};

module.exports.logMemberJoin = function(username, inviteUsed, inviter)
{
	var d = new Date().toString().replace(" (W. Europe Standard Time)", "");
	d = d.replace(" (Central European Standard Time)", "");
	var str = `${username} joined the Guild using the invite ${inviteUsed}, which was created by ${inviter}.`;

	fs.appendFile("memberJoin.log", d + "\r\n\n-- " + str + "\r\n\n", function (err)
	{
		if (err)
		{
			module.exports.log("error", true, {username: username, inviteUsed: inviteUsed, inviter: inviter, err: err});
		}
	});
};

function _timestamp()
{
	var now = new Date();
	var hours = now.getHours();
	var minutes = now.getMinutes();
	var seconds = now.getSeconds();
	var ms = now.getMilliseconds();

	if (hours < 10)
		hours = `0${hours}`;

	if (minutes < 10)
		minutes = `0${minutes}`;

	if (seconds < 10)
		seconds = `0${seconds}`;

	if (ms < 10)
		ms = `00${ms}`;

	else if (ms < 100)
		ms = `0${ms}`;

	return `${hours}:${minutes}:${seconds}:${ms}, ${now.toDateString()}`;
}