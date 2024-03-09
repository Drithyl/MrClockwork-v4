
module.exports.processRolls = function(input)
{
  let inputCopy = input.replace(/\%|\?|\s/g, "");
  let rollList = [];
  let literalList = [];
  let total = 0;
  let msg = "";

  //single number so just return it
  if (isNaN(input) === false)
  {
    return `\`\`\`${input}\`\`\``;
  }

  while (/\d+/.test(inputCopy) === true)
  {
    if (/^\+?\d+D\d+/i.test(inputCopy) === true)
    {
      let rollStr = inputCopy.match(/\d+D\d+\+?/i)[0];
      let d = rollStr.toLowerCase().replace(/\+|\s/g, "").split("d");
    	let num = d[0] || 0;
    	let max = d[1] || 0;
    	let explode = false;
      let result;
      rollList.push({num: +num, max: +max});
      inputCopy = inputCopy.slice(inputCopy.indexOf(rollStr) + rollStr.length).trim();

      if (rollStr.includes("+") === true && (inputCopy.length <= 0 || /^\+/.test(inputCopy) === true))
      {
        explode = true;
      }

    	if (isNaN(+num) || isNaN(+max))
    	{
    		return "Make sure you introduce only numbers separated by a 'd', like `?5d6`. Use a + to roll exploding dice.";
    	}

    	if (+num <= 0 || +num > 20  || +max <= 0 || +max > 100)
    	{
    		return "The number of dice must be between 1 and 20 and the dice sides must be between 1 and 100";
    	}

      result = roll(+num, +max, explode);
      total += result.total;

      for (let i = 0; i < result.rolls.length; i++)
      {
        msg += `${result.rolls[i]} + `;
      }
    }

    else if (/^\+?\d+/i.test(inputCopy) === true)
    {
      let nbr = inputCopy.match(/\d+/)[0];
      inputCopy = inputCopy.slice(inputCopy.indexOf(nbr) + nbr.length).trim();

      if (isNaN(+nbr) === true)
      {
        continue;
      }

      total += +nbr;
      msg += `${+nbr} + `;
      literalList.push(+nbr);
    }

    else break;
  }

  //no single number, no dice to roll so don't include average
  if (input.toLowerCase().includes("d") === false)
  {
    return (`${msg.trim().slice(0, msg.lastIndexOf("+"))}= ${total}.`).toBox();
  }

  else return (`${msg.trim().slice(0, msg.lastIndexOf("+"))}= ${total} (Avg: ${findAverage(rollList, literalList)}).`).toBox();
};

  //The Dom4 DRN is a 2d6 roll in which a result of 6 is exploded, but substracting 1 from it.
module.exports.DRN = function()
{
	return explodeDRN() + explodeDRN();
};

module.exports.DRNvsDRN = function(atkMod = 0, defMod = 0)
{
  drn1 = DRN();
  drn2 = DRN();
	return {roll1: drn1 + atkMod, natRoll1: drn1, roll2: drn2 + defMod, natRoll2: drn2, diff: (drn1 + atkMod) - (drn2 + defMod)};
};

function findAverage(rolls, literals)
{
  let result = 0;

  for (let i = 0; i < rolls.length; i++)
  {
    result += ((rolls[i].max + 1) * 0.5) * rolls[i].num;
  }

  for (let j = 0; j < literals.length; j++)
  {
    result += literals[j];
  }

  return Math.round(result);
}

function roll(diceNum, max, explosive = false)
{
  let result = {rolls: [], total: 0};

  for (let i = 0; i < diceNum; i++)
  {
    let r = Math.floor((Math.random() * max) + 1);

    if (explosive === true && r == max)
    {
      r += explodeDie(max);
    }

    result.total += r;
    result.rolls.push(r);
  }

  return result;
}

function explodeDie(max)
{
	let rndm = Math.floor((Math.random() * max) + 1);

	if (rndm == max)
	{
		rndm += explodeDie(max);
	}

	return rndm;
}

function explodeDRN()
{
  let rndm = Math.floor((Math.random() * 6) + 1);

  if (rndm == 6)
  {
    rndm += -1 + explodeDRN();
  }

  return rndm;
}
