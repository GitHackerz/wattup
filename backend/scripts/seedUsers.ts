import { connectDatabase } from '../src/config/database';
import { Organization } from '../src/models/Organization';
import { User } from '../src/models/User';
import { UserRole } from '../src/types';

const seedUsers = async () => {
  try {
    console.log('Starting user seeding...');
    
    // Use the same MongoDB URI as in development environment
    process.env.MONGODB_URI = process.env.MONGODB_URI || 'mongodb://admin:password123@localhost:27017/wattup?authSource=admin';
    
    await connectDatabase();

    // Get existing organizations
    const organizations = await Organization.find();
    if (organizations.length === 0) {
      console.log('No organizations found. Please run the main seed script first.');
      process.exit(1);
    }

    // Check existing users
    const existingUsers = await User.countDocuments();
    console.log(`Found ${existingUsers} existing users`);

    // Create additional test users
    const users = [
      // Admin user
      {
        email: 'admin@wattup.com',
        password: 'admin123',
        firstName: 'System',
        lastName: 'Administrator',
        role: UserRole.ADMIN,
        isActive: true,
        emailVerified: true
      },
      // Users for each organization
      {
        email: 'manager@greenenergy.com',
        password: 'manager123',
        firstName: 'John',
        lastName: 'Manager',
        role: UserRole.MANAGER,
        organizationId: organizations[0]._id,
        isActive: true,
        emailVerified: true
      },
      {
        email: 'worker@greenenergy.com',
        password: 'worker123',
        firstName: 'Alice',
        lastName: 'Worker',
        role: UserRole.WORKER,
        organizationId: organizations[0]._id,
        isActive: true,
        emailVerified: true
      },
      {
        email: 'manager@brightgrid.io',
        password: 'manager123',
        firstName: 'Sarah',
        lastName: 'Smith',
        role: UserRole.MANAGER,
        organizationId: organizations[1]._id,
        isActive: true,
        emailVerified: true
      },
      {
        email: 'worker@brightgrid.io',
        password: 'worker123',
        firstName: 'Bob',
        lastName: 'Johnson',
        role: UserRole.WORKER,
        organizationId: organizations[1]._id,
        isActive: true,
        emailVerified: true
      },
      {
        email: 'manager@powermetrics.net',
        password: 'manager123',
        firstName: 'Michael',
        lastName: 'Brown',
        role: UserRole.MANAGER,
        organizationId: organizations[2]._id,
        isActive: true,
        emailVerified: true
      },
      {
        email: 'test@test.com',
        password: 'test123',
        firstName: 'Test',
        lastName: 'User',
        role: UserRole.WORKER,
        organizationId: organizations[0]._id,
        isActive: true,
        emailVerified: true
      }
    ];

    // Only create users that don't already exist
    let createdCount = 0;
    for (const userData of users) {
      const existing = await User.findOne({ email: userData.email });
      if (!existing) {
        await User.create(userData);
        createdCount++;
        console.log(`Created user: ${userData.email}`);
      } else {
        console.log(`User already exists: ${userData.email}`);
      }
    }

    console.log(`✅ User seeding completed! Created ${createdCount} new users.`);
    console.log('\n👤 Test Accounts:');
    console.log('Admin: admin@wattup.com / admin123');
    console.log('Manager: manager@greenenergy.com / manager123');
    console.log('Worker: worker@greenenergy.com / worker123');
    console.log('Test User: test@test.com / test123');

    process.exit(0);
  } catch (error) {
    console.error('❌ User seeding failed:', error);
    process.exit(1);
  }
};

seedUsers();
