// In-memory users store for authentication
const users = [
  {
    id: 'admin-001',
    name: 'Admin User',
    email: 'admin@general-store.local',
    phone: '9999999999',
    password: 'admin123', // In production, this should be hashed
    role: 'admin',
    createdAt: new Date().toISOString(),
    isActive: true
  }
];

module.exports = {
  users
};
