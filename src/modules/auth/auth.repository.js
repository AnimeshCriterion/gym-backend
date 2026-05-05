const prisma = require('../../config/db');

const SAFE_SELECT = {
  id: true, name: true, email: true, phone: true, role: true,
  isActive: true, organizationId: true, branchId: true, trainerId: true,
  profilePicUrl: true, dateOfBirth: true, gender: true, address: true,
  emergencyContact: true, createdAt: true, updatedAt: true,
  branch: { select: { id: true, name: true } },
};

const findUserByEmail = (email) => prisma.user.findUnique({ where: { email } });

const findUserById = (id) => prisma.user.findUnique({ where: { id }, select: SAFE_SELECT });

const findUserByIdWithHash = (id) => prisma.user.findUnique({ where: { id } });

const updateUser = (id, data) => prisma.user.update({ where: { id }, data, select: SAFE_SELECT });

const createOrgWithAdmin = ({ org, admin }) =>
  prisma.$transaction(async (tx) => {
    const organization = await tx.organization.create({ data: org });
    const user = await tx.user.create({ data: { ...admin, organizationId: organization.id } });
    return { organization, user };
  });

const saveRefreshToken = (data) => prisma.refreshToken.create({ data });

const findRefreshToken = (token) =>
  prisma.refreshToken.findUnique({ where: { token }, include: { user: true } });

const deleteRefreshToken = (token) => prisma.refreshToken.delete({ where: { token } });

const deleteUserRefreshTokens = (userId) => prisma.refreshToken.deleteMany({ where: { userId } });

module.exports = {
  findUserByEmail,
  findUserById,
  findUserByIdWithHash,
  updateUser,
  createOrgWithAdmin,
  saveRefreshToken,
  findRefreshToken,
  deleteRefreshToken,
  deleteUserRefreshTokens,
};
