const authService = require('./auth.service');
const { success } = require('../../common/utils/response');
const { registerOrgSchema, loginSchema, refreshSchema, updateProfileSchema, changePasswordSchema } = require('./auth.validation');

const registerOrganization = async (req, res, next) => {
  try {
    const data = registerOrgSchema.parse(req.body);
    const result = await authService.registerOrganization(data);
    success(res, result, 'Organization registered successfully', 201);
  } catch (err) { next(err); }
};

const login = async (req, res, next) => {
  try {
    const data = loginSchema.parse(req.body);
    const result = await authService.login(data);
    success(res, result, 'Login successful');
  } catch (err) { next(err); }
};

const refreshToken = async (req, res, next) => {
  try {
    const { refreshToken } = refreshSchema.parse(req.body);
    const tokens = await authService.refreshAccessToken(refreshToken);
    success(res, tokens, 'Token refreshed');
  } catch (err) { next(err); }
};

const logout = async (req, res, next) => {
  try {
    await authService.logout(req.body.refreshToken);
    success(res, null, 'Logged out successfully');
  } catch (err) { next(err); }
};

const me = async (req, res, next) => {
  try {
    success(res, await authService.getMe(req.user.id), 'Current user');
  } catch (err) { next(err); }
};

const updateProfile = async (req, res, next) => {
  try {
    const data = updateProfileSchema.parse(req.body);
    success(res, await authService.updateProfile(req.user.id, data), 'Profile updated');
  } catch (err) { next(err); }
};

const changePassword = async (req, res, next) => {
  try {
    const data = changePasswordSchema.parse(req.body);
    await authService.changePassword(req.user.id, data);
    success(res, null, 'Password changed — please log in again');
  } catch (err) { next(err); }
};

module.exports = { registerOrganization, login, refreshToken, logout, me, updateProfile, changePassword };
