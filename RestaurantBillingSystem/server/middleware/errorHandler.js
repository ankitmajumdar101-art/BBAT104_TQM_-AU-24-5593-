const db = require('../config/db');

/**
 * Centralized Error Recovery & Logging Middleware (TQM Q01 Reliability feature)
 */
async function errorHandler(err, req, res, next) {
  const errorType = err.name || 'Error';
  const description = err.message || 'Unknown Server Error';
  const moduleName = req.originalUrl || 'Express API';
  const stackTrace = err.stack || '';

  console.error(`[ERROR] ${errorType} in ${moduleName}:`, description);

  // Store error in MySQL error_logs table
  try {
    await db.query(
      `INSERT INTO error_logs (error_type, description, module, stack_trace)
       VALUES (?, ?, ?, ?)`,
      [errorType, description, moduleName, stackTrace]
    );
  } catch (logErr) {
    console.error('Failed to record in error_logs:', logErr.message);
  }

  const statusCode = err.status || 500;
  res.status(statusCode).json({
    success: false,
    message: description,
    errorType: errorType,
    recoveryGuidance: 'The error has been logged automatically. Please verify your request data and retry.'
  });
}

module.exports = errorHandler;
