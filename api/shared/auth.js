// Extract authenticated user from Azure Static Web Apps header
function getAuthUser(req) {
  var header = req.headers['x-ms-client-principal'];
  if (!header) return null;
  try {
    var buffer = Buffer.from(header, 'base64');
    var principal = JSON.parse(buffer.toString('utf8'));
    return principal && principal.userId ? principal : null;
  } catch (e) {
    return null;
  }
}

module.exports = { getAuthUser };
