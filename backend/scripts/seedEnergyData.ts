import { connectDatabase } from '../src/config/database';
import { Organization } from '../src/models/Organization';
import { EnergyData } from '../src/models/EnergyData';
import { Anomaly } from '../src/models/Anomaly';
import { AnomalySeverity } from '../src/types';

const seedEnergyData = async () => {
  try {
    console.log('Starting energy data seeding...');
    
    // Use the same MongoDB URI as in development environment
    process.env.MONGODB_URI = process.env.MONGODB_URI || 'mongodb://admin:password123@localhost:27017/wattup?authSource=admin';
    
    await connectDatabase();

    // Get existing organizations
    const organizations = await Organization.find();
    if (organizations.length === 0) {
      console.log('No organizations found. Please run the main seed script first.');
      process.exit(1);
    }

    // Check if energy data already exists
    const existingEnergyData = await EnergyData.countDocuments();
    if (existingEnergyData > 0) {
      console.log(`Energy data already exists (${existingEnergyData} records). Skipping to avoid duplicates.`);
      process.exit(0);
    }

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

    // Generate data for the last 7 days (to reduce data volume)
    const now = new Date();
    const sevenDaysAgo = new Date(now.getTime() - (7 * 24 * 60 * 60 * 1000));

    for (let orgIndex = 0; orgIndex < organizations.length; orgIndex++) {
      const org = organizations[orgIndex];
      
      for (let lineIndex = 0; lineIndex < lineNames.length; lineIndex++) {
        const lineName = lineNames[lineIndex];
        const lineId = `LINE_${orgIndex + 1}_${lineIndex + 1}`;
        const baseConsumption = 800 + (lineIndex * 200) + Math.random() * 300;
        const threshold = org.settings?.defaultThresholds?.warning || 1500;

        // Generate hourly data for 7 days
        for (let day = 0; day < 7; day++) {
          for (let hour = 0; hour < 24; hour += 2) { // Every 2 hours to reduce data
            const timestamp = new Date(sevenDaysAgo.getTime() + (day * 24 * 60 * 60 * 1000) + (hour * 60 * 60 * 1000));
            
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
            
            // Occasionally create anomalies (3% chance)
            const isAnomaly = Math.random() < 0.03;
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
        resolvedAt,
        notes: isResolved ? generateRandomNote(severity) : undefined,
        organizationId: energyRecord.organizationId
      });
    }

    const createdAnomalies = await Anomaly.insertMany(anomalyData);
    console.log(`Created ${createdAnomalies.length} anomaly records`);

    console.log('✅ Energy data seeding completed successfully!');
    console.log('\n📊 Summary:');
    console.log(`- Energy Data Records: ${createdEnergyData.length}`);
    console.log(`- Anomaly Records: ${createdAnomalies.length}`);

    process.exit(0);
  } catch (error) {
    console.error('❌ Energy data seeding failed:', error);
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

seedEnergyData();
