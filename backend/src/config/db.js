import mongoose from 'mongoose';
import env from './env.js';
import logger from '../utils/logger.js';

let isConnected = false;
let lastConnectionError = null;

/**
 * Safely sanitizes and URL-encodes credentials in MongoDB URI without leaking secrets
 */
export const normalizeMongoUri = (rawUri) => {
  if (!rawUri || typeof rawUri !== 'string') return rawUri;

  // 1. Strip surrounding quotes and whitespace
  let uri = rawUri.trim().replace(/^["']|["']$/g, '');

  if (!uri.startsWith('mongodb://') && !uri.startsWith('mongodb+srv://')) {
    return uri;
  }

  const isSrv = uri.startsWith('mongodb+srv://');
  const proto = isSrv ? 'mongodb+srv://' : 'mongodb://';
  const remainder = uri.slice(proto.length);

  // Find credentials section before the LAST '@' preceding the host
  const lastAt = remainder.lastIndexOf('@');
  if (lastAt === -1) return uri;

  const creds = remainder.substring(0, lastAt);
  let hostAndRest = remainder.substring(lastAt + 1);

  const firstColon = creds.indexOf(':');
  if (firstColon === -1) return uri;

  const rawUser = creds.substring(0, firstColon);
  let rawPass = creds.substring(firstColon + 1);

  // Strip accidental angle brackets from copy-pasting Atlas documentation templates (<password>)
  if (rawPass.startsWith('<') && rawPass.endsWith('>') && rawPass.length > 2) {
    rawPass = rawPass.slice(1, -1);
  }

  // Safe URI component encoding (decoding first prevents double-encoding)
  const safeUser = encodeURIComponent(decodeURIComponent(rawUser));
  const safePass = encodeURIComponent(decodeURIComponent(rawPass));

  // Ensure Atlas SRV connections include authSource=admin if not present
  if (isSrv && !hostAndRest.includes('authSource=')) {
    const separator = hostAndRest.includes('?') ? '&' : '?';
    hostAndRest = `${hostAndRest}${separator}authSource=admin`;
  }

  return `${proto}${safeUser}:${safePass}@${hostAndRest}`;
};

/**
 * Returns URI with password masked for safe logging
 */
export const maskMongoUri = (uri) => {
  if (!uri || typeof uri !== 'string') return '';
  return uri.replace(/(:\/\/)(.*?):(.*?)@/, '$1$2:****@');
};

export const connectDB = async () => {
  if (isConnected && mongoose.connection.readyState === 1) {
    logger.info('Using existing database connection');
    return mongoose.connection;
  }

  const rawUri = env.MONGODB_URI;
  const normalizedUri = normalizeMongoUri(rawUri);

  logger.info(`Connecting to MongoDB: ${maskMongoUri(normalizedUri)}`);

  try {
    const conn = await mongoose.connect(normalizedUri, {
      serverSelectionTimeoutMS: 8000,
      connectTimeoutMS: 10000,
      retryWrites: true
    });

    isConnected = conn.connection.readyState === 1;
    lastConnectionError = null;
    logger.info(`MongoDB Connected successfully to host: ${conn.connection.host}`);
    return conn.connection;
  } catch (error) {
    isConnected = false;
    lastConnectionError = error;

    logger.error('MongoDB connection failure:', error.message);

    if (error.message && error.message.includes('bad auth')) {
      logger.error('CRITICAL: MongoDB Atlas authentication failed.');
      logger.error('Diagnostic checklist:');
      logger.error(' 1. Check your database username and password in Render MONGODB_URI environment variable.');
      logger.error(' 2. If password contains special characters (@, #, $, %, etc.), URL encoding has been applied automatically.');
      logger.error(' 3. Ensure the database user exists in MongoDB Atlas under Database Access.');
      logger.error(' 4. Ensure Network Access in Atlas includes 0.0.0.0/0 (Allow from anywhere) for Render.');
    } else {
      logger.error('Verify your MONGODB_URI environment variable in the hosting dashboard (Render).');
    }

    return null;
  }
};

export const getDBStatus = () => {
  const states = {
    0: 'disconnected',
    1: 'connected',
    2: 'connecting',
    3: 'disconnecting'
  };

  const stateName = states[mongoose.connection.readyState] || 'unknown';

  return {
    state: stateName,
    isConnected: mongoose.connection.readyState === 1,
    host: mongoose.connection.host || null,
    name: mongoose.connection.name || null,
    lastError: lastConnectionError ? lastConnectionError.message : null
  };
};

export default connectDB;
