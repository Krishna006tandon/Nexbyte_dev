const nodemailer = require('nodemailer');

function parseBool(value) {
  if (value === undefined || value === null) return null;
  const s = String(value).trim().toLowerCase();
  if (s === 'true' || s === '1' || s === 'yes') return true;
  if (s === 'false' || s === '0' || s === 'no') return false;
  return null;
}

function parsePort(value, fallback) {
  const n = Number.parseInt(String(value || '').trim(), 10);
  return Number.isFinite(n) ? n : fallback;
}

function getSmtpConfig() {
  // User preference: allow configuring with simple EMAIL_* vars (no SMTP_* required),
  // while still supporting SMTP_* for advanced setups.
  const emailUser = process.env.EMAIL_USER || '';
  const emailPass = process.env.EMAIL_PASSWORD || process.env.EMAIL_PASS || '';

  const host = process.env.EMAIL_HOST || process.env.SMTP_HOST || 'smtp.gmail.com';
  const port = parsePort(process.env.EMAIL_PORT || process.env.SMTP_PORT, 587);
  const secure = parseBool(process.env.EMAIL_SECURE ?? process.env.SMTP_SECURE);

  const user = emailUser || process.env.SMTP_USER || '';
  const pass = emailPass || process.env.SMTP_PASS || '';

  const allowNoAuth = parseBool(process.env.SMTP_NO_AUTH) === true;
  const tlsRejectUnauthorized = parseBool(process.env.SMTP_TLS_REJECT_UNAUTHORIZED);

  return {
    host,
    port,
    secure: secure === null ? port === 465 : secure,
    user,
    pass,
    allowNoAuth,
    tlsRejectUnauthorized,
    debug: parseBool(process.env.EMAIL_DEBUG ?? process.env.SMTP_DEBUG) === true,
    logger: parseBool(process.env.EMAIL_LOGGER ?? process.env.SMTP_LOGGER) === true,
  };
}

function getFromAddress(displayName) {
  if (process.env.EMAIL_FROM) return process.env.EMAIL_FROM;
  const cfg = getSmtpConfig();
  const fromUser = process.env.EMAIL_USER || cfg.user || 'noreply@nexbyte.com';
  const name = displayName || 'NexByte';
  return `"${name}" <${fromUser}>`;
}

function createTransporter() {
  const cfg = getSmtpConfig();

  if (!cfg.allowNoAuth) {
    if (!cfg.user || !cfg.pass) {
      throw new Error(
        'SMTP credentials missing. Set SMTP_USER and SMTP_PASS (recommended) or EMAIL_USER and EMAIL_PASSWORD/EMAIL_PASS.',
      );
    }
  }

  const transport = nodemailer.createTransport({
    host: cfg.host,
    port: cfg.port,
    secure: cfg.secure,
    auth: cfg.allowNoAuth ? undefined : { user: cfg.user, pass: cfg.pass },
    tls:
      cfg.tlsRejectUnauthorized === null
        ? undefined
        : { rejectUnauthorized: cfg.tlsRejectUnauthorized },
    debug: cfg.debug,
    logger: cfg.logger,
  });

  return transport;
}

function getPreviewUrl(info) {
  try {
    return nodemailer.getTestMessageUrl(info) || null;
  } catch {
    return null;
  }
}

module.exports = {
  createTransporter,
  getFromAddress,
  getPreviewUrl,
  getSmtpConfig,
};
