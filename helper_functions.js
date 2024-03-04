const path = require("path");
const asserter = require("./asserter");
const config = require("./config/config.json");


module.exports.getDominionsTypeName = function(gameType) {
    if (asserter.isDom6GameType(gameType) === true)
        return "Dominions 6: Rise of the Pantokrator";
    else if (asserter.isDom5GameType(gameType) === true)
        return "Dominions 5: The Warriors of Faith";
};

module.exports.getDominionsDataPath = function(gameType) {
    if (asserter.isDom6GameType(gameType) === true)
        return path.resolve(config.pathToDom6Data);
    else if (asserter.isDom5GameType(gameType) === true)
        return path.resolve(config.pathToDom5Data);
};

module.exports.getDominionsExePath = function(gameType) {
    if (asserter.isDom6GameType(gameType) === true)
        return path.resolve(config.pathToDom6Exe);
    else if (asserter.isDom5GameType(gameType) === true)
        return path.resolve(config.pathToDom5Exe);
};

module.exports.getDominionsSavedgamesPath = function(gameType) {
    return path.resolve(module.exports.getDominionsDataPath(gameType), 'savedgames');
};

module.exports.getDominionsModsPath = function(gameType) {
    return path.resolve(module.exports.getDominionsDataPath(gameType), 'mods');
};

module.exports.getDominionsMapsPath = function(gameType) {
    return path.resolve(module.exports.getDominionsDataPath(gameType), 'maps');
};

module.exports.getDominionsMapExtension = function(gameType) {
    if (asserter.isDom6GameType(gameType) === true)
        return ".d6m";
    else if (asserter.isDom5GameType(gameType) === true)
        return ".map";
};

module.exports.appendDominionsMapExtension = function(filename, gameType) {
    const mapExtension = module.exports.getDominionsMapExtension(gameType);
    const hasExtension = filename.lastIndexOf(mapExtension) === -1;

    if (hasExtension === true)
        return filename;

    return filename + mapExtension;
};



module.exports.extendPrototypes = extendPrototypes;

function extendPrototypes()
{
    Array.prototype.forEachPromise = function(asyncFn)
    {
        var index = 0;

        //the context of 'this' will change in the loop
        var array = this;

        return new Promise((resolve, reject) =>
        {
            (function loop()
            {
                if (index >= array.length)
                    return resolve();

                Promise.resolve(asyncFn(array[index], index++, () => loop()))
                .catch((err) => 
                {
                    index++;
                    reject(err);
                });
            })();
        });
    };

    Array.prototype.forAllPromises = function(asyncFn, breakOnError = true)
    {
        var self = this;
        var results = [];
        var left = self.length;

        if (left <= 0)
            return Promise.resolve([]);

        return new Promise((resolve, reject) =>
        {
            var errorOccurred = false;

            for (var i = 0; i < left; i++)
            {
                var item = self[i];

                Promise.resolve(asyncFn(item, i, self))
                .then((result) =>
                {
                    if (breakOnError === false || errorOccurred === false)
                    {
                        left--;
                        results.push(result);

                        if (left <= 0)
                            resolve(results);
                    }
                })
                .catch((err) =>
                {
                    if (breakOnError === true)
                    {
                        errorOccurred = true;
                        reject(err, results);
                    }

                    else
                    {
                        left--;
                        results.push(err);

                        if (left <= 0)
                            resolve(results);
                    }
                });
            }
        });
    };

    Array.prototype.last = function()
    {
        return this[this.length - 1];
    };

    Object.defineProperty(Object.prototype, "forEachItem",
    {
        value: function(asyncFn)
        {
            var self = this;
            var keyArray = Object.keys(self);

            //Pass the item, the key to the item, and the object
            keyArray.forEach((key, index) => asyncFn(self[key], keyArray[index], self));
        },
        configurable: true
    });

    Object.defineProperty(Object.prototype, "forEachPromise",
    {
        value: function(asyncFn)
        {
            var index = 0;
            var self = this;
            var keyArray = Object.keys(self);

            return new Promise((resolve, reject) =>
            {
                (function loop()
                {
                    if (index >= keyArray.length)
                        return resolve();

                    //Pass the item, the key to the item, and the function to move to the next promise
                    Promise.resolve(asyncFn(self[keyArray[index]], keyArray[index++], () => loop()))
                    .catch((err) => 
                    {
                        index++;
                        reject(err);
                    });
                })();
            });
        },
        configurable: true
    });

    Object.defineProperty(Object.prototype, "forAllPromises",
    {
        value: function(asyncFn, breakOnError = true)
        {
            var self = this;
            var results = [];
            var keyArray = Object.keys(self);
            var left = keyArray.length;
            var errorOccurred = false;

            if (left <= 0)
                return Promise.resolve([]);

            return new Promise((resolve, reject) =>
            {
                for (var i = 0; i < left; i++)
                {
                    var key = keyArray[i];
                    var item = self[key];

                    Promise.resolve(asyncFn(item, key, self))
                    .then((result) =>
                    {
                        if (breakOnError === false || errorOccurred === false)
                        {
                            left--;
                            results.push(result);

                            if (left <= 0)
                                resolve(results);
                        }
                    })
                    .catch((err) =>
                    {
                        if (breakOnError === true)
                        {
                            errorOccurred = true;
                            reject(err, results);
                        }

                        else
                        {
                            left--;
                            results.push(err);

                            if (left <= 0)
                                resolve(results);
                        }
                    });
                }
            });
        },
        configurable: true
    });

    Object.defineProperty(Object.prototype, "convertToArray",
    {
        value: function()
        {
            let arr = [];

            for (var key in this)
            {
                arr.push(this[key]);
            }

            return arr;
        },
        configurable: true
    });

    //Spaces out evenly an item. If the width is set to 50, the entire string
    //will have 50 characters, as long as the item is less than 50.
    String.prototype.width = function (space, spaceFirst = false, spacingChar = " ")
    {
        var arrL = space - this.length + 1;

        if (arrL < 1)
            arrL = 1;

        if (spaceFirst) 
            return Array(arrL).join(spacingChar) + this;

        else return this + Array(arrL).join(spacingChar);
    };

    //``` ``` is the markup that Discord uses to send messages as a code box,
    //this is just a short-hand way of doing that
    String.prototype.toBox = function()
    {
        if (this != null && this.length && /\S+/.test(this))
            return "```\n" + this + "```";

        else return "";
    };
}
