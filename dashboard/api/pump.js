// Vercel Serverless Function: /api/pump
// Proxy handler to telemetry for manual pump actions
const telemetryHandler = require('./telemetry');

module.exports = (req, res) => {
  if (req.method === 'POST') {
    let body = req.body || {};
    if (typeof body === 'string') {
      try {
        body = JSON.parse(body);
      } catch (e) {
        body = {};
      }
    }
    const isAuto = body.action === 'resume_auto' || body.mode === 'auto';
    let status = false;
    if (body.action === 'on' || body.status === true || body.action === true) {
      status = true;
    } else if (body.action === 'off' || body.status === false || body.action === false) {
      status = false;
    }

    req.body = isAuto ? { action: 'set_mode', mode: 'auto' } : { action: 'set_pump', status: status };
  }
  return telemetryHandler(req, res);
};
