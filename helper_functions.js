/*************************
*		AUXILIARY FUNCTIONS		*
**************************/

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
                .then(() => loop())
                .catch((err) => 
                {
                    index++;
                    reject(err);
                });
            })();
        });
    };

    Object.defineProperty(Object.prototype, "forEachItem",
    {
        value: function(asyncFn)
        {
            var self = this;
            var keyArray = Object.keys(self);

            //Pass the item, the key to the item, and the object
            keyArray.forEach((key, index) => asyncFn(self[key], keyArray[index], self));
        }
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
        }
    });

    Object.defineProperty(Object.prototype, "convertToArray",
    {
        value: function(testFn)
        {
            let arr = [];

            for (var key in this)
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
        if (this !== "" && this != null && this.length && /\S+/.test(this))
            return "```" + this + "```";

        else return this;
    };
}
