const airtableAPI = require('../airtableAPI');
const sendVerificationEmail = require('../emailService'); // módulo ficticio

exports.register = async (req, res) => {
  const { username, email, password, age } = req.body;
  if(+age < 18) return res.json({ success: false, message: "18+" });
  const code = Math.floor(100000 + Math.random()*900000).toString();
  try {
    await airtableAPI.createUser({ fields: { username, email, password, age, code, verified: false } });
    await sendVerificationEmail(email, code);
    res.json({ success: true });
  } catch(e) { res.json({ success: false, error: e.message }); }
};

exports.verify = async (req, res) => {
  const { code } = req.body;
  try {
    const user = await airtableAPI.findUserByCode(code);
    if(user) { await airtableAPI.updateUser(user.id, { verified: true }); res.json({ verified: true }); }
    else res.json({ verified: false });
  } catch(e) { res.json({ verified: false, error: e.message }); }
};

exports.login = async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await airtableAPI.findUserByEmail(email);
    if(user && user.fields.password === password && user.fields.verified)
      res.json({ success: true });
    else res.json({ success: false });
  } catch(e) { res.json({ success: false, error: e.message }); }
};
