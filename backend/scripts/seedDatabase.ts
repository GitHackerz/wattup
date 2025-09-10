import { connectDatabase } from '../src/config/database';
import { Organization } from '../src/models/Organization';
import { User } from '../src/models/User';
import { EnergyData } from '../src/models/EnergyData';
import { Anomaly } from '../src/models/Anomaly';
import { UserRole, AnomalySeverity } from '../src/types';

const seed = async () => {
  try {
    console.log('Starting database seeding...');
    
    // Use the same MongoDB URI as in development environment
    process.env.MONGODB_URI = process.env.MONGODB_URI || 'mongodb://admin:password123@localhost:27017/wattup?authSource=admin';
    
    await connectDatabase();

    // Check if data already exists
    const existingOrgs = await Organization.countDocuments();
    const existingUsers = await User.countDocuments();
    const existingEnergyData = await EnergyData.countDocuments();
    
    if (existingOrgs > 0 || existingUsers > 0 || existingEnergyData > 0) {
      console.log('Database already contains data. Skipping seed to avoid duplicates.');
      console.log(`Found: ${existingOrgs} organizations, ${existingUsers} users, ${existingEnergyData} energy records`);
      process.exit(0);
    }

    // Seed Organizations
    const organizations = [
      {
        name: 'Green Energy Co',
        domain: 'greenenergy.com',
        settings: {
          defaultThresholds: { warning: 1500, critical: 2000 },
          notifications: { email: true, sms: false }
        }
      },
      {
        name: 'BrightGrid Solutions',
        domain: 'brightgrid.io',
        settings: {
          defaultThresholds: { warning: 1200, critical: 1800 },
          notifications: { email: true, sms: true }
        }
      },
      {
        name: 'PowerMetrics',
        domain: 'powermetrics.net',
        settings: {
          defaultThresholds: { warning: 1000, critical: 1500 },
          notifications: { email: true, sms: false }
        }
      },
      {
        name: 'UrbanWatts',
        domain: 'urbanwatts.org',
        settings: {
          defaultThresholds: { warning: 1800, critical: 2500 },
          notifications: { email: false, sms: true }
        }
      },
      {
        name: 'VoltVision',
        domain: 'voltvision.co',
        settings: {
          defaultThresholds: { warning: 1300, critical: 1900 },
          notifications: { email: true, sms: true }
        }
      }
    ];

    const createdOrgs = await Organization.insertMany(organizations);
    console.log(`Created ${createdOrgs.length} organizations`);

    // Seed Users
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
        organizationId: createdOrgs[0]._id,
        isActive: true,
        emailVerified: true
      },
      {
        email: 'worker@greenenergy.com',
        password: 'worker123',
        firstName: 'Alice',
        lastName: 'Worker',
        role: UserRole.WORKER,
        organizationId: createdOrgs[0]._id,
        isActive: true,
        emailVerified: true
      },
      {
        email: 'manager@brightgrid.io',
        password: 'manager123',
        firstName: 'Sarah',
        lastName: 'Smith',
        role: UserRole.MANAGER,
        organizationId: createdOrgs[1]._id,
        isActive: true,
        emailVerified: true
      },
      {
        email: 'worker@brightgrid.io',
        password: 'worker123',
        firstName: 'Bob',
        lastName: 'Johnson',
        role: UserRole.WORKER,
        organizationId: createdOrgs[1]._id,
        isActive: true,
        emailVerified: true
      },
      {
        email: 'manager@powermetrics.net',
        password: 'manager123',
        firstName: 'Michael',
        lastName: 'Brown',
        role: UserRole.MANAGER,
        organizationId: createdOrgs[2]._id,
        isActive: true,
        emailVerified: true
      }
    ];

    const createdUsers = await User.insertMany(users);
    console.log(`Created ${createdUsers.length} users`);

    // Seed Energy Data
    const energyData: any[] = [];
    const lineNames = [
      'Main Distribution Line A',
      'Main Distribution Line B',
      'Secondary Line 1',
      'Secondary Line 2',
      'Industrial Load Line',
      'Residential Block 1',
      'Residential Block 2',
      'Commercial District',
      'Emergency Backup Line',
      'Renewable Energy Feed'
    ];

    const locations = [
      'North Grid',
      'South Grid',
      'East Grid',
      'West Grid',
      'Central Hub',
      'Industrial Zone',
      'Residential Area A',
      'Residential Area B',
      'Commercial District',
      'Emergency Station'
    ];

    // Generate data for the last 30 days
    const now = new Date();
    const thirtyDaysAgo = new Date(now.getTime() - (30 * 24 * 60 * 60 * 1000));

    for (let orgIndex = 0; orgIndex < createdOrgs.length; orgIndex++) {
      const org = createdOrgs[orgIndex];
      
      for (let lineIndex = 0; lineIndex < lineNames.length; lineIndex++) {
        const lineName = lineNames[lineIndex];
        const lineId = `LINE_${orgIndex + 1}_${lineIndex + 1}`;
        const baseConsumption = 800 + (lineIndex * 200) + Math.random() * 300;
        const threshold = org.settings.defaultThresholds.warning;

        // Generate hourly data for 30 days
        for (let day = 0; day < 30; day++) {
          for (let hour = 0; hour < 24; hour++) {
            const timestamp = new Date(thirtyDaysAgo.getTime() + (day * 24 * 60 * 60 * 1000) + (hour * 60 * 60 * 1000));
            
            // Simulate realistic consumption patterns
            let consumption = baseConsumption;
            
            // Add daily pattern (higher during business hours)
            if (hour >= 8 && hour <= 18) {
              consumption *= 1.3;
            } else if (hour >= 19 && hour <= 22) {
              consumption *= 1.1;
            } else {
              consumption *= 0.7;
            }
            
            // Add some randomness
            consumption += (Math.random() - 0.5) * 200;
            
            // Occasionally create anomalies (5% chance)
            const isAnomaly = Math.random() < 0.05;
            if (isAnomaly) {
              consumption = threshold + Math.random() * 500;
            }
            
            energyData.push({
              lineId,
              lineName,
              consumption: Math.max(0, consumption),
              timestamp,
              threshold,
              isAnomaly,
              organizationId: org._id,
              metadata: {
                voltage: 220 + (Math.random() - 0.5) * 20,
                current: consumption / 220,
                powerFactor: 0.85 + Math.random() * 0.1,
                location: locations[lineIndex]
              }
            });
          }
        }
      }
    }

    const createdEnergyData = await EnergyData.insertMany(energyData);
    console.log(`Created ${createdEnergyData.length} energy data records`);

    // Seed Anomalies (based on energy data with isAnomaly = true)
    const anomalyData: any[] = [];
    const anomalyEnergyData = createdEnergyData.filter(data => data.isAnomaly);

    for (const energyRecord of anomalyEnergyData) {
      const deviation = energyRecord.consumption - energyRecord.threshold;
      let severity: AnomalySeverity;
      
      if (deviation > 1000) {
        severity = AnomalySeverity.CRITICAL;
      } else if (deviation > 500) {
        severity = AnomalySeverity.HIGH;
      } else if (deviation > 200) {
        severity = AnomalySeverity.MEDIUM;
      } else {
        severity = AnomalySeverity.LOW;
      }

      const isResolved = Math.random() < 0.7; // 70% of anomalies are resolved
      const resolvedBy = isResolved ? createdUsers.find(u => u.organizationId?.toString() === energyRecord.organizationId?.toString())?._id : undefined;
      const resolvedAt = isResolved ? new Date(energyRecord.timestamp.getTime() + Math.random() * 24 * 60 * 60 * 1000) : undefined;

      anomalyData.push({
        lineId: energyRecord.lineId,
        lineName: energyRecord.lineName,
        consumption: energyRecord.consumption,
        threshold: energyRecord.threshold,
        deviation,
        severity,
        timestamp: energyRecord.timestamp,
        resolved: isResolved,
        resolvedBy,
        resolvedAt,
        notes: isResolved ? generateRandomNote(severity) : undefined,
        organizationId: energyRecord.organizationId
      });
    }

    const createdAnomalies = await Anomaly.insertMany(anomalyData);
    console.log(`Created ${createdAnomalies.length} anomaly records`);

    console.log('✅ Database seeding completed successfully!');
    console.log('\n📊 Summary:');
    console.log(`- Organizations: ${createdOrgs.length}`);
    console.log(`- Users: ${createdUsers.length}`);
    console.log(`- Energy Data Records: ${createdEnergyData.length}`);
    console.log(`- Anomaly Records: ${createdAnomalies.length}`);
    
    console.log('\n👤 Test Accounts:');
    console.log('Admin: admin@wattup.com / admin123');
    console.log('Manager: manager@greenenergy.com / manager123');
    console.log('Worker: worker@greenenergy.com / worker123');

    process.exit(0);
  } catch (error) {
    console.error('❌ Seeding failed:', error);
    process.exit(1);
  }
};

function generateRandomNote(severity: AnomalySeverity): string {
  const notes = {
    [AnomalySeverity.LOW]: [
      'Minor fluctuation detected, monitored and resolved automatically',
      'Temporary increase due to equipment startup',
      'Weather-related minor consumption spike'
    ],
    [AnomalySeverity.MEDIUM]: [
      'Investigated and found to be caused by scheduled maintenance',
      'Equipment calibration resolved the issue',
      'Load balancing adjustment applied'
    ],
    [AnomalySeverity.HIGH]: [
      'Faulty equipment replaced and system restored',
      'Emergency load shedding procedure activated',
      'Maintenance team dispatched and issue resolved'
    ],
    [AnomalySeverity.CRITICAL]: [
      'Emergency shutdown procedure executed, system restored',
      'Critical equipment failure repaired by emergency team',
      'Major grid instability addressed with immediate intervention'
    ]
  };

  const severityNotes = notes[severity];
  return severityNotes[Math.floor(Math.random() * severityNotes.length)];
}

seed();
