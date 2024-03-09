
const asserter = require("../../asserter.js");

const MAX_EMBED_LENGTH = 6000;
const MAX_TITLE_LENGTH = 256;
const MAX_DESCRIPTION_LENGTH = 2048;

const MAX_FIELDS = 24;
const MAX_FIELD_LENGTH = 1024;
const MAX_FIELD_NAME_LENGTH = 256;

const MAX_FOOTER_LENGTH = 2048;
const MAX_AUTHOR_NAME_LENGTH = 256;


module.exports = MessageEmbedBuilder;

function MessageEmbedBuilder()
{
    const _timestamp = new Date();

    let _title = "";
    let _description = "";
    let _color = 0;
    let _fields = [];
    let _embedLength = 0;

    this.setTitle = (title) =>
    {
        if (asserter.isString(title) === false)
            throw new Error(`Expected title string, got ${typeof title} instead.`);

        if (this.isTitleTooLong(title.length) === true)
            throw new Error(`Title cannot be over ${MAX_TITLE_LENGTH} chars.`);

        _title = title;
        _embedLength += title.length;

        return this;
    };

    this.setDescription = (description) =>
    {
        if (asserter.isString(description) === false)
            throw new Error(`Expected description string, got ${typeof description} instead.`);

        if (this.isDescriptionTooLong(description.length) === true)
            throw new Error(`Description cannot be over ${MAX_DESCRIPTION_LENGTH} chars.`);

        _description = description;
        _embedLength += description.length;

        return this;
    };

    this.setColor = (hexString) =>
    {
        if (asserter.isString(hexString) === false)
            throw new Error(`Expected color hex string, got ${typeof hexString} instead.`);

        if (/^(\d|[a-fA-F]){6}$/.test(hexString) === false)
            throw new Error(`Color hex string must be of the format "0055FF", got ${hexString} instead.`);

        _color = parseInt(`0x${hexString}`);

        return this;
    };

    this.addField = (fieldName, fieldValue, inline = false) =>
    {
        if (asserter.isString(fieldName) === false)
            throw new Error(`Expected field name string, got ${typeof fieldName} instead.`);

        if (asserter.isString(fieldValue) === false)
            throw new Error(`Expected field value string, got ${typeof fieldValue} instead.`);

        if (asserter.isBoolean(inline) === false)
            inline = false;

        if (this.hasMaxFields() === true)
            throw new Error(`Embed cannot have more than ${MAX_FIELDS} fields.`);

        if (this.isFieldNameTooLong(fieldName.length) === true)
            throw new Error(`Field name cannot be over ${MAX_FIELD_NAME_LENGTH} chars.`);

        if (this.isFieldValueTooLong(fieldValue.length) === true)
            throw new Error(`Field value cannot be over ${MAX_FIELD_LENGTH} chars.`);

        if (this.isFieldTooLong(fieldName.length + fieldValue.length) === true)
            throw new Error(`Field would make embed go over limit of ${MAX_EMBED_LENGTH} chars.`);

        _fields.push({
            name: fieldName,
            value: fieldValue,
            inline: inline
        });

        _embedLength += fieldName.length + fieldValue.length;

        return this;
    };

    this.canAddToLastFieldValue = (additionalFieldValue) =>
    {
        let fieldIndex = (this.getNbrOfFields() > 0) ? this.getNbrOfFields() - 1 : 0;
        let fieldName = this.getFieldName(fieldIndex);
        let lastFieldValue = this.getFieldValue(fieldIndex);

        if (asserter.isString(additionalFieldValue) === false)
            throw new Error(`Expected field value string, got ${typeof additionalFieldValue} instead.`);

        if (this.getNbrOfFields() <= 0)
            return false;

        if (this.isFieldValueTooLong(lastFieldValue.length + additionalFieldValue.length) === true)
            return false;

        //Only count the additionalFieldValue length here since the fieldName and previous value
        //were factored into the _embedLength when they were first added
        if (this.isFieldTooLong(additionalFieldValue.length) === true)
            return false;

        else return true;
    };

    this.addToLastFieldValue = (additionalFieldValue) =>
    {
        let fieldIndex = (this.getNbrOfFields() > 0) ? this.getNbrOfFields() - 1 : 0;
        let fieldName = this.getFieldName(fieldIndex);
        let lastFieldValue = this.getFieldValue(fieldIndex);

        if (asserter.isString(additionalFieldValue) === false)
            throw new Error(`Expected field value string, got ${typeof additionalFieldValue} instead.`);

        if (this.isFieldValueTooLong(lastFieldValue.length + additionalFieldValue.length) === true)
            throw new Error(`Field value cannot be over ${MAX_FIELD_LENGTH} chars.`);

        if (this.isFieldTooLong(fieldName.length + lastFieldValue.length + additionalFieldValue.length) === true)
            throw new Error(`Field would make embed go over limit of ${MAX_EMBED_LENGTH} chars.`);

        this.getField(fieldIndex).value += additionalFieldValue;
        _embedLength += additionalFieldValue.length;

        return this;
    };

    this.toEmbedStruct = () =>
    {
        const struct = {
            title: _title,
            description: _description,
            color: _color,
            timestamp: _timestamp,
            fields: [..._fields]
        };

        return struct;
    };

    this.canFitField = (fieldName, fieldValue) =>
    {
        if (this.canFitFieldName(fieldName) === false)
            return false;

        if (this.canFitFieldValue(fieldValue) === false)
            return false;

        if (this.isFieldTooLong(fieldName.length + fieldValue.length) === true)
            return false;

        else return true;
    };

    this.canFitFieldName = (fieldName) =>
    {
        if (asserter.isString(fieldName) === false)
            throw new Error(`Expected field name string, got ${typeof fieldName} instead.`);

        if (this.hasMaxFields() === true)
            return false;

        return !this.isFieldNameTooLong(fieldName.length);
    };

    this.canFitFieldValue = (fieldValue) =>
    {
        if (asserter.isString(fieldValue) === false)
            throw new Error(`Expected field value string, got ${typeof fieldValue} instead.`);

        if (this.hasMaxFields() === true)
            return false;

        return !this.isFieldValueTooLong(fieldValue.length);
    };

    this.getLength = () => _embedLength;
    this.getNbrOfFields = () => _fields.length;
    this.getField = (index) => _fields[index];
    this.getFieldName = (index) =>
    {
        if (_fields[index] == null)
            return null;

        return _fields[index].name;
    };

    this.getFieldValue = (index) =>
    {
        if (_fields[index] == null)
        {
            return null;
        }

        return _fields[index].value;
    };

    this.hasMaxFields = () => _fields.length === MAX_FIELDS;
    this.isTitleTooLong = (titleLength) => titleLength > MAX_TITLE_LENGTH;
    this.isFieldTooLong = (fieldLength) => fieldLength + _embedLength > MAX_EMBED_LENGTH;
    this.isFieldNameTooLong = (fieldNameLength) => fieldNameLength > MAX_FIELD_NAME_LENGTH;
    this.isFieldValueTooLong = (fieldValueLength) => fieldValueLength > MAX_FIELD_LENGTH;
    this.isDescriptionTooLong = (descriptionLength) => descriptionLength > MAX_DESCRIPTION_LENGTH;
}