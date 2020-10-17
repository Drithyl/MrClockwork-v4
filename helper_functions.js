/*************************
*		AUXILIARY FUNCTIONS		*
**************************/

module.exports.extendPrototypes = extendPrototypes;

function extendPrototypes()
{
  Array.prototype.forEachPromise = function(asyncFn, callback)
  {
    var index = 0;

    //the context of 'this' will change in the loop
    var array = this;

    return new Promise((resolve) =>
    {
      (function loop()
      {
        if (index >= array.length)
        {
          if (typeof callback === "function")
          {
            callback();
          }

          else resolve();

          return;
        }

        asyncFn(array[index], index++, () => loop());
      })();
    });
  };

  Object.defineProperty(Object.prototype, "forEachPromise",
  {
    value: function(asyncFn)
    {
      var array = this.convertToArray();

      return array.forEachPromise(asyncFn);
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

    if (arrL < 1)	arrL = 1;

    if (spaceFirst) return Array(arrL).join(spacingChar) + this;
    else 						return this + Array(arrL).join(spacingChar);
  };

  //``` ``` is the markup that Discord uses to send messages as a code box,
  //this is just a short-hand way of doing that
  String.prototype.toBox = function()
  {
    if (this !== "" && this != null && this.length && /\S+/.test(this))
    {
      return "```" + this + "```";
    }

    else return this;
  };
}
