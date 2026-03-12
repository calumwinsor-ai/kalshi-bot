const fs = require('fs');
const path = require('path');

class DailyScheduler {
  constructor(analysisAgent) {
    this.agent = analysisAgent;
    this.scheduleTime = '06:00'; // 6 AM UTC by default
    this.lastRunDate = null;
    this.configFile = path.join(__dirname, '../data/scheduler-config.json');
    this.loadConfig();
  }

  /**
   * Load scheduler configuration
   */
  loadConfig() {
    try {
      if (fs.existsSync(this.configFile)) {
        const config = JSON.parse(fs.readFileSync(this.configFile, 'utf8'));
        this.scheduleTime = config.scheduleTime || '06:00';
        this.lastRunDate = config.lastRunDate;
      }
    } catch (error) {
      console.error('Error loading scheduler config:', error.message);
    }
  }

  /**
   * Save scheduler configuration
   */
  saveConfig() {
    try {
      const dir = path.dirname(this.configFile);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }

      fs.writeFileSync(
        this.configFile,
        JSON.stringify({
          scheduleTime: this.scheduleTime,
          lastRunDate: this.lastRunDate,
        }, null, 2)
      );
    } catch (error) {
      console.error('Error saving scheduler config:', error.message);
    }
  }

  /**
   * Check if analysis should run today
   */
  shouldRun() {
    const now = new Date();
    const todayDate = now.toISOString().split('T')[0];

    // If last run was today, don't run again
    if (this.lastRunDate === todayDate) {
      return false;
    }

    // Check if current time is past schedule time
    const [scheduleHour, scheduleMin] = this.scheduleTime.split(':').map(Number);
    const scheduleDate = new Date();
    scheduleDate.setHours(scheduleHour, scheduleMin, 0, 0);

    return now >= scheduleDate;
  }

  /**
   * Run the daily analysis
   */
  async runDaily() {
    console.log('\n🕐 Daily scheduler check...');

    if (!this.shouldRun()) {
      return null;
    }

    console.log('✅ Running daily analysis...');

    try {
      const results = await this.agent.runDailyAnalysis();

      if (results) {
        this.lastRunDate = new Date().toISOString().split('T')[0];
        this.saveConfig();
        console.log('✅ Daily analysis completed and saved');
        return results;
      }
    } catch (error) {
      console.error('Daily analysis error:', error.message);
    }

    return null;
  }

  /**
   * Start continuous scheduling
   */
  startScheduler(intervalMinutes = 60) {
    console.log(`\n🕐 Daily Scheduler Started`);
    console.log(`   Schedule Time: ${this.scheduleTime} UTC`);
    console.log(`   Check Interval: Every ${intervalMinutes} minutes`);

    // Check every X minutes
    setInterval(() => {
      this.runDaily().catch(error => {
        console.error('Scheduler error:', error.message);
      });
    }, intervalMinutes * 60 * 1000);

    // Run immediately on startup if needed
    this.runDaily().catch(error => {
      console.error('Initial scheduler run error:', error.message);
    });
  }

  /**
   * Set custom schedule time
   */
  setScheduleTime(hours, minutes) {
    const h = String(hours).padStart(2, '0');
    const m = String(minutes).padStart(2, '0');
    this.scheduleTime = `${h}:${m}`;
    this.saveConfig();
    console.log(`✅ Schedule time set to ${this.scheduleTime} UTC`);
  }
}

module.exports = DailyScheduler;
