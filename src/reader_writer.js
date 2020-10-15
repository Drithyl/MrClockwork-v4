const fs = require("fs");
const config = require("./config/config.json");

if (fs.existsSync(config.tmpDir) === false)
{
	fs.mkdirSync(config.tmpDir);
}

module.exports.copyFileSync = function(source, target)
{
	try
	{
		let data = fs.readFileSync(source);
		module.exports.checkAndCreateDir(target);
		fs.writeFileSync(target, data);
	}

	catch(err)
	{
		module.exports.log("error", true, {source: source, target: target, err: err});
		throw err;
	}
};

module.exports.copyFile = function(source, target, cb)
{
	return new Promise((resolve, reject) =>
	{
		module.exports.checkAndCreateDir(target);

		fs.readFile(source, function(err, buffer)
		{
			if (err)
			{
				module.exports.log("error", true, {source: source, target: target, err: err});

				if (typeof cb === "function") return cb(err);
				else return reject(err);
			}

			fs.writeFile(target, buffer, function(err)
			{
				if (err)
				{
					module.exports.log("error", true, {source: source, target: target, err: err});

					if (typeof cb === "function") return cb(err);
					else return reject(err);
				}

				if (typeof cb === "function") cb();
				else resolve();
			});
		});
	});
};

module.exports.copyDir = function(source, target, deepCopy, extensionFilter, cb)
{
	let filenames;

	return new Promise((resolve, reject) =>
	{
		if (fs.existsSync(source) === false)
		{
			let err = new Error(`The source path ${source} does not exist.`);
			if (typeof cb === "function") return cb(err);
			else return reject(err);
		}

		fs.readdir(source, (err, filenames) =>
		{
			if (err)
			{
				module.exports.log("error", true, {source: source, target: target, deepCopy: deepCopy, extensionFilter: extensionFilter, err: err});

				if (typeof cb === "function") return cb(err);
				else return reject(err);
			}

			filenames.forEachPromise((file, index, next) =>
			{
				//if there's a directory inside our directory and no extension filter, copy its contents too
				if (deepCopy === true && fs.lstatSync(`${source}/${file}`).isDirectory() === true)
				{
					module.exports.copyDir(`${source}/${file}`, `${target}/${file}`, deepCopy, extensionFilter, function(err)
					{
						if (err)
						{
							module.exports.log("error", true, {source: source, target: target, deepCopy: deepCopy, extensionFilter: extensionFilter, err:err});

							if (typeof cb === "function") return cb(err);
							else return reject(err);
						}

						else next();
					});
				}

				//run code if no extension filter was designated or if there was one and the file extension is included
				//or if there is an extension filter that includes empty extensions "" (files without extensions)
				else if (Array.isArray(extensionFilter) === false ||
								 (Array.isArray(extensionFilter) === true && extensionFilter.includes(file.slice(file.lastIndexOf(".")).toLowerCase()) === true) ||
								 (Array.isArray(extensionFilter) === true && extensionFilter.includes("") === true) && file.includes(".") === false)
				{
					module.exports.copyFile(`${source}/${file}`, `${target}/${file}`, function(err)
					{
						if (err)
						{
							if (typeof cb === "function") return cb(err);
							else return reject(err);
						}

						else next();
					});
				}

				//ignore file and loop
				else next();

			}, function finalCallback()
			{
				if (typeof cb === "function") cb();
				else resolve();
			});
		});
	});
};

//Guarantees that the targeted path will be left either completely deleted,
//or exactly as it was before this function was called. The files are renamed
//to a tmp directory. It may happen that the files moved to the tmp dir fail
//to be cleaned up, in which case no error will be emitted, and instead it will
//call back as if successful. DOES NOT SUPPORT CROSS-DEVICE (i.e. paths between
//different hard drives or devices) DELETING. Both the tmp dir specified in the
//config and the target must be on the same drive
module.exports.atomicRmDir = function(target, filter)
{
	let renamedFiles = [];
	let untouchedFiles = [];
	let targetName = (target.indexOf("/") === -1) ? target : target.slice(target.lastIndexOf("/") + 1);

	return new Promise((resolve, reject) =>
	{
		if (fs.existsSync(target) === false)
		{
			return reject(new Error(`ENOENT: target path "${target}" does not exist.`));
		}

		fs.stat(target, (err, stats) =>
		{
			if (err)
			{
				return reject(err);
			}

			if (stats.isDirectory() === false)
			{
				return reject(new Error(`Target is not a directory.`));
			}

			//clone the target dir into the tmp dir to rename the files into it
			fs.mkdir(`${config.tmpDir}/${targetName}`, (err) =>
			{
				if (err) return reject(err);

				//fetch filenames of the target dir
				fs.readdir(target, (err, filenames) =>
				{
					if (err) return reject(err);

					//rename each of the subfiles into the cloned tmp dir
					//rename guarantees atomicity of the file contents
					for (var i = 0; i < filenames.length; i++)
					{
						let filename = filenames[i];

						//if there is a filter and the file doesn't pass it, ignore it
						//and add it to the untouchedFiles array to make sure the target
						//dir doesn't get removed at the end of the operation
						if (Array.isArray(filter) === true)
						{
							//no extension in this file
							if (/\./.test(filename) === false && filter.includes("") === false)
							{
								untouchedFiles.push(`${target}/${filename}`);
								continue;
							}

							else if (/\./.test(filename) === true && filter.includes(filename.slice(filename.lastIndexOf(".")).toLowerCase()) === false)
							{
								untouchedFiles.push(`${target}/${filename}`);
								continue;
							}
						}

						//if it passes the filter, rename the file away into the tmp dir
						try
						{
							let fileStat = fs.statSync(`${target}/${filename}`);

							if (fileStat.isFile() === true)
							{
								fs.renameSync(`${target}/${filename}`, `${config.tmpDir}/${targetName}/${filename}`);

								//keep track of the renamedFiles by pushing an array with [0] oldPath and [1] newPath
								renamedFiles.push([`${target}/${filename}`, `${config.tmpDir}/${targetName}/${filename}`]);
							}
						}

						//call undo (defined at the end of this function) to undo the earlier
						//successfully renamed files if even one of them fails
						catch(err)
						{
							return undo(err, cb);
						}
					}

					//delete dir if it's left empty and the files were not filtered
					if (untouchedFiles.length < 1 && Array.isArray(filter) === false)
					{
						try
						{
							fs.rmdirSync(target);
						}

						catch(err)
						{
							//call undo if the remaining empty dir fails to be removed
							return undo(err, cb);
						}
					}

					//renaming to tmp directory complete,
					//now delete all those files to clean up
					renamedFiles.forEachPromise((filepaths, index, next) =>
					{
						//unlink renamed file at new tmp path
						fs.unlink(filepaths[1], (err) =>
						{
							//do not stop execution of the loop on error since failure to clean
							//the tmp files is not critical to this operation
							if (err) module.exports.log("error", `Error occurred when cleaning the tmp path:`, err.stack);
							next();
						});
					},

					//renaming to tmp and clean up of tmp complete;
					//remove the now empty target dir and callback
					function finalCallback()
					{
						fs.rmdir(`${config.tmpDir}/${targetName}`, (err) =>
						{
							//if the empty dir fails to be deleted we must undo the renamings
							if (err) module.exports.log("error", `Error occurred when cleaning the leftover tmp dir:`, err.stack);
							resolve();
						});
					});
				});
			});
		});
	});

	//if one of the rename operations fail, call undo to undo the successfully
	//renamed files to enforce the atomicity of the whole operation
	function undo(err, cb)
	{
		for (var i = 0; i < renamedFiles.length; i++)
		{
			let filepaths = renamedFiles[i];

			try
			{
				fs.renameSync(filepaths[1], filepaths[0]);
			}

			catch(undoErr)
			{
				return cb(new Error(`CRITICAL ERROR: undo failed due to Error:\n\n${undoErr.message}\n\natomicDelete() operation failed due to Error:\n\n${err.stack}\n\nBoth the old path and new paths are now in an incomplete state!!!`), undo);
			}
		}

		//remove leftover tmp dir
		fs.rmdir(`${config.tmpDir}/${targetName}`, (rmdirErr) =>
		{
			//if the empty dir fails to be deleted we must undo the renamings
			if (rmdirErr) module.exports.log("error", `Error occurred when cleaning the leftover tmp dir:`, rmdirErr.message);
			cb(err);
		});
	}
};

module.exports.deleteDirContents = function(path, extensionFilter, cb)
{
	let filenames = fs.readdirSync(path);

	//will use promise whenever the cb is null, so that the function supports both
	//promises and callbacks
	return new Promise((resolve, reject) =>
	{
		filenames.forEachPromise((file, index, next) =>
		{
			//if there's a directory inside our directory and no extension filter, delete its contents too
			if (fs.lstatSync(`${path}/${file}`).isDirectory() === true)
			{
				return next();
			}

			if (Array.isArray(extensionFilter) === true &&
					extensionFilter.includes(file.slice(file.lastIndexOf(".")).toLowerCase()) === false &&
					(extensionFilter.includes("") === false && file.includes(".") === false))
			{
				return next();
			}

			//run code if no extension filter was designated or if there was one and the file extension is included
			//or if there is an extension filter that includes empty extensions "" (files without extensions)
			fs.unlink(`${path}/${file}`, function(err)
			{
				if (err)
				{
					module.exports.logError({path: path, extensionFilter: extensionFilter}, `fs.unlink Error:`, err);

					if (typeof cb === "function") cb(err);
					else reject(err);
				}

				else next();
			});

			//async loop ends so run the last callback/promise
		}, function finalCallback()
		{
			if (typeof cb === "function") cb();
			else resolve();
		});
	});
};

module.exports.deleteDir = function(path, cb)
{
	return new Promise((resolve, reject) =>
	{
		fs.readdir(path, (err, filenames) =>
		{
			if (err)
			{
				module.exports.log("error", true, {path: path, extensionFilter: extensionFilter, err: err});

				if (typeof cb === "function") return cb(err);
				else return reject(err);
			}

			filenames.forEachPromise((filename, index, next) =>
			{
				//delete contained dir through recursion as well
				if (fs.lstatSync(`${path}/${filename}`).isDirectory() === true)
				{
					module.exports.deleteDir(`${path}/${filename}`, () =>
					{
						if (err)
						{
							if (typeof cb === "function") return cb(err);
							else return reject(err);
						}

						else next();
					});
				}

				else
				{
					fs.unlink(`${path}/${filename}`, function(err)
					{
						if (err)
						{
							module.exports.log("error", true, {path: path, extensionFilter: extensionFilter, err: err});

							if (typeof cb === "function") return cb(err);
							else return reject(err);
						}

						else next();
					});
				}

				//final callback, remove the dir specified after having removed all files within
			}, function removeDir()
			{
				fs.rmdir(path, (err) =>
				{
					if (err)
					{
						module.exports.log("error", true, {path: path, extensionFilter: extensionFilter, err: err});
						if (typeof cb === "function") return cb(err);
						else return reject(err);
					}

					if (typeof cb === "function") cb();
					else resolve();
				});
			});
		});
	});
};

//If a directory does not exist, this will create it
module.exports.checkAndCreateDir = function(filepath)
{
	var splitPath = filepath.split("/");
	var compoundPath = splitPath.shift();

	//It's length >= 1 because we don't want the last element of the path, which will be a file, not a directory
	while (splitPath.length != null && splitPath.length >= 1)
	{
		//prevent empty paths from being created
		if (fs.existsSync(compoundPath) === false && /[\w]/.test(compoundPath) === true)
	  {
	    fs.mkdirSync(compoundPath);
	  }

		compoundPath += "/" + splitPath.shift();
	}
};

module.exports.readJSON = function(path, reviver, cb)
{
	var obj = {};

	return new Promise((resolve, reject) =>
	{
		fs.readFile(path, "utf8", (err, data) =>
	 	{
			if (err)
			{
				let myErr = new Error(`There was an error while trying to read the JSON file ${path}:\n\n${err.message}`);
				module.exports.log("error", true, {path: path, reviver: reviver, err: myErr});

				if (typeof cb === "function") return cb(myErr);
				else return reject(myErr);
			}

			if (/[\w\d]/.test(data) === false)
			{
				let myErr = new Error(`No data in ${path}.`);
				module.exports.log("error", true, `File contains only whitespace`, {path: path});

				if (typeof cb === "function") return cb(myErr);
				else return reject(myErr);
			}

			if (reviver == null) obj = JSON.parse(data);
			else obj = JSON.parse(data, reviver);

			if (typeof cb === "function") cb(null, obj);
			else resolve(obj);
		});
	});
};

module.exports.saveJSON = function(path, obj, cb)
{
	return new Promise((resolve, reject) =>
	{
		fs.writeFile(path, module.exports.JSONStringify(obj), (err) =>
		{
			if (err)
			{
				module.exports.log("error", true, {path: path, obj: obj, err: err});

				if (typeof cb === "function") return cb(err);
				else return reject(err);
			}

			if (typeof cb === "function") cb();
			else resolve();
		});
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

exports.readDirContentsSync = (path) =>
{
	var filenames = getOnlyDirFilenamesSync(path);
	var contents = [];

	filenames.forEach((filename) =>
	{
		var data = fs.readFileSync(`${path}/${filename}`, "utf8");
		contents.push(data);
	});

	return contents;
};

exports.fetchAllDirFilenames = (path) =>
{
	return Promise.resolve()
	.then(() => fs.readdir(path, "utf8", (error, filenames) =>
	{
		if (error)
			return Promise.reject(error);

		else return Promise.resolve(filenames);
	}));
};

exports.fetchOnlyDirFilenames = (path) =>
{
	var onlyFilenames = [];

	return exports.fetchAllDirFilenames(path)
	.then((filenames) =>
	{
		filenames.forEach((filename) =>
		{
			var stat = fs.statSync(`${path}/${filename}`);
			var isDirectory = stat.isDirectory();

			if (isDirectory === false)
				onlyFilenames.push();
		});

		return Promise.resolve(onlyFilenames);
	});
};

exports.fetchDirSubfolderNames = (path) =>
{
	var subfolderNames = [];

	return exports.fetchAllDirFilenames(path)
	.then((filenames) =>
	{
		filenames.forEach((filename) =>
		{
			var stat = fs.statSync(`${path}/${filename}`);
			var isDirectory = stat.isDirectory();

			if (isDirectory === true)
				subfolderNames.push();
		});

		return Promise.resolve(subfolderNames);
	});
};

exports.readDirContents = function(path)
{
	var contents = [];

	return exports.fetchOnlyDirFilenames(path)
	.then((filenames) =>
	{
		return filenames.forEachPromise((filename, index, nextIteration) =>
		{
			fs.readFile(`${path}/${filename}`, "utf8", (err, data) =>
			{
				if (error)
					return Promise.reject(error);

				contents.push(data);
				nextIteration();
			});
		});
	})
	.then(() => Promise.resolve(contents));
};

module.exports.log = function(tags, trace, ...inputs)
{
	var msg = module.exports.timestamp() + "\n";

	if (Array.isArray(tags) === false)
	{
		tags = [tags];
	}

	//no trace argument was provided
	if (typeof trace !== "boolean")
	{
		if (Array.isArray(trace) === false)
		{
			trace = [trace];
		}

		inputs = trace.concat(inputs);
	}

	inputs.forEach(function(input)
	{
		if (typeof input === "string")
		{
			//add tab characters to each line so that they are all indented relative to the timestamp
			input.split("\n").forEach(function(line)
			{
				msg += `\t${line}\n`;
			});
		}

		else
		{
			msg += `\t${module.exports.JSONStringify(input)}\n`;
		}
	});

	console.log(`${msg}\n`);

	if (trace === true)
	{
		console.log("\n\n");
		console.trace();
		console.log("\n\n");
	}

	tags.forEachPromise(function(tag, index, next)
	{
		let path = `${config.pathToLogs}/${tag}.txt`;
		let writeFn = (fs.existsSync(path)) ? fs.appendFile : fs.writeFile;

		if (typeof tag !== "string")
		{
			next();
			return;
		}

		writeFn(path, `${msg}\r\n\n`, function(err)
		{
			if (err)
			{
				console.log(err);
			}

			next();
		});
	});
};

module.exports.timestamp = function()
{
	var now = new Date();
	var hours = now.getHours();
	var minutes = now.getMinutes();
	var seconds = now.getSeconds();
	var ms = now.getMilliseconds();

	if (hours < 10)
	{
		hours = `0${hours}`;
	}

	if (minutes < 10)
	{
		minutes = `0${minutes}`;
	}

	if (seconds < 10)
	{
		seconds = `0${seconds}`;
	}

	if (ms < 10)
	{
		ms = `00${ms}`;
	}

	else if (ms < 100)
	{
		ms = `0${ms}`;
	}

	return `${hours}:${minutes}:${seconds}:${ms}, ${now.toDateString()}`;
};

module.exports.throwAndLogError = function(input)
{
	module.exports.log(input);
	throw input;
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
