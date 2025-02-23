const Airtable = require('airtable');
require('dotenv').config();
const base = new Airtable({ apiKey: process.env.AIRTABLE_API_KEY }).base(process.env.AIRTABLE_BASE_ID);

exports.createUser = async data => await base('Usuarios').create(data);
exports.findUserByCode = async code => {
  const recs = await base('Usuarios').select({ filterByFormula: `{code} = '${code}' AND {verified} = FALSE` }).firstPage();
  return recs[0];
};
exports.updateUser = async (id, fields) => await base('Usuarios').update(id, fields);
exports.findUserByEmail = async email => {
  const recs = await base('Usuarios').select({ filterByFormula: `{email} = '${email}'` }).firstPage();
  return recs[0];
};
