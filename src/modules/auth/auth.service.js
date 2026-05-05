const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const env = require('../../config/env');
const repo = require('./auth.repository');

const REFRESH_MS = 7 * 24 * 60 * 60 * 1000;

const buildPayload = (user) => ({
  id: user.id,
  email: user.email,
  role: user.role,
  organizationId: user.organizationId,
  branchId: user.branchId,
});

const generateTokens = (user) => ({
  accessToken: jwt.sign(buildPayload(user), env.JWT_SECRET, { expiresIn: env.JWT_EXPIRES_IN }),
  refreshToken: jwt.sign(buildPayload(user), env.JWT_REFRESH_SECRET, { expiresIn: env.JWT_REFRESH_EXPIRES_IN }),
});

const sanitize = ({ passwordHash, ...user }) => user;

const storeRefresh = (userId, refreshToken) =>
  repo.saveRefreshToken({ token: refreshToken, userId, expiresAt: new Date(Date.now() + REFRESH_MS) });

const TRIAL_DAYS = 7;

const registerOrganization = async (data) => {
  const passwordHash = await bcrypt.hash(data.adminPassword, 12);
  const trialExpiry = new Date(Date.now() + TRIAL_DAYS * 24 * 60 * 60 * 1000);

  const { organization, user } = await repo.createOrgWithAdmin({
    org: {
      name: data.orgName, slug: data.orgSlug, email: data.orgEmail, phone: data.orgPhone,
      platformPlan: 'TRIAL', platformExpiresAt: trialExpiry,
    },
    admin: { name: data.adminName, email: data.adminEmail, phone: data.adminPhone, passwordHash, role: 'ORG_ADMIN' },
  });

  const tokens = generateTokens(user);
  await storeRefresh(user.id, tokens.refreshToken);
  return { organization, user: sanitize(user), ...tokens };
};

const login = async ({ email, password }) => {
  const user = await repo.findUserByEmail(email);
  if (!user || !user.isActive) throw Object.assign(new Error('Invalid credentials'), { statusCode: 401 });

  const valid = await bcrypt.compare(password, user.passwordHash);
  if (!valid) throw Object.assign(new Error('Invalid credentials'), { statusCode: 401 });

  const tokens = generateTokens(user);
  await storeRefresh(user.id, tokens.refreshToken);
  return { user: sanitize(user), ...tokens };
};

const refreshAccessToken = async (refreshToken) => {
  const stored = await repo.findRefreshToken(refreshToken);
  if (!stored || stored.expiresAt < new Date()) {
    throw Object.assign(new Error('Invalid or expired refresh token'), { statusCode: 401 });
  }

  try {
    jwt.verify(refreshToken, env.JWT_REFRESH_SECRET);
  } catch {
    await repo.deleteRefreshToken(refreshToken);
    throw Object.assign(new Error('Invalid refresh token'), { statusCode: 401 });
  }

  const tokens = generateTokens(stored.user);
  await repo.deleteRefreshToken(refreshToken);
  await storeRefresh(stored.user.id, tokens.refreshToken);
  return tokens;
};

const logout = async (refreshToken) => {
  if (refreshToken) await repo.deleteRefreshToken(refreshToken).catch(() => {});
};

const getMe = async (userId) => {
  const user = await repo.findUserById(userId);
  if (!user || !user.isActive) throw Object.assign(new Error('User not found'), { statusCode: 404 });
  return user;
};

const updateProfile = async (userId, data) => {
  await getMe(userId);
  return repo.updateUser(userId, data);
};

const changePassword = async (userId, { currentPassword, newPassword }) => {
  const user = await repo.findUserByIdWithHash(userId);
  if (!user) throw Object.assign(new Error('User not found'), { statusCode: 404 });

  const valid = await bcrypt.compare(currentPassword, user.passwordHash);
  if (!valid) throw Object.assign(new Error('Current password is incorrect'), { statusCode: 400 });

  const passwordHash = await bcrypt.hash(newPassword, 12);
  await repo.updateUser(userId, { passwordHash });
  await repo.deleteUserRefreshTokens(userId);
};

module.exports = { registerOrganization, login, refreshAccessToken, logout, getMe, updateProfile, changePassword };
