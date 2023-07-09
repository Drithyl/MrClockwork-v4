/*************************
*		AUXILIARY FUNCTIONS		*
**************************/

module.exports.extendPrototypes = extendPrototypes;

function extendPrototypes()
{
    Array.prototype.forEachPromise = function(asyncFn)
    {
        let index = 0;

        //the context of 'this' will change in the loop
        let array = this;

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
        let self = this;
        let results = [];
        let left = self.length;

        if (left <= 0)
            return Promise.resolve([]);

        return new Promise((resolve, reject) =>
        {
            let errorOccurred = false;

            for (let i = 0; i < left; i++)
            {
                let item = self[i];

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
            let self = this;
            let keyArray = Object.keys(self);

            //Pass the item, the key to the item, and the object
            keyArray.forEach((key, index) => asyncFn(self[key], keyArray[index], self));
        }
    });

    Object.defineProperty(Object.prototype, "forEachPromise",
    {
        value: function(asyncFn)
        {
            let index = 0;
            let self = this;
            let keyArray = Object.keys(self);

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
        }
    });

    Object.defineProperty(Object.prototype, "forAllPromises",
    {
        value: function(asyncFn, breakOnError = true)
        {
            let self = this;
            let results = [];
            let keyArray = Object.keys(self);
            let left = keyArray.length;
            let errorOccurred = false;

            if (left <= 0)
                return Promise.resolve([]);

            return new Promise((resolve, reject) =>
            {
                for (let i = 0; i < left; i++)
                {
                    let key = keyArray[i];
                    let item = self[key];

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
        }
    });

    Object.defineProperty(Object.prototype, "convertToArray",
    {
        value: function(testFn)
        {
            let arr = [];

            for (let key in this)
            {
                arr.push(this[key]);
            }

            return arr;
        }
    });

    //Spaces out evenly an item. If the width is set to 50, the entire string
    //will have 50 characters, as long as the item is less than 50.
    String.prototype.width = function (space, spaceFirst = false, spacingChar = " ")
    {
        let arrL = space - this.length + 1;

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
