import { connectDatabase } from '../src/config/database';
import { Organization } from '../src/models/Organization';

const seed = async () => {
  try {
    await connectDatabase();

    const sampleOrgs = [
      { name: 'Green Energy Co', domain: 'greenenergy.com' },
      { name: 'BrightGrid Solutions', domain: 'brightgrid.io' },
      { name: 'PowerMetrics', domain: 'powermetrics.net' },
      { name: 'UrbanWatts', domain: 'urbanwatts.org' },
      { name: 'VoltVision', domain: 'voltvision.co' },
    ];

    for (const org of sampleOrgs) {
      const existing = await Organization.findOne({ domain: org.domain });
      if (!existing) {
        await Organization.create(org);
        console.log('Created organization:', org.name);
      } else {
        console.log('Organization exists:', org.name);
      }
    }

    console.log('Seeding complete');
    process.exit(0);
  } catch (error) {
    console.error('Seeding failed', error);
    process.exit(1);
  }
};

seed();
