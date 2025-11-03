/**
 * TriggerInstaller.gs
 * One-click trigger installation
 */

/**
 * Install all automation triggers
 * Run this function once to set up all triggers
 */
function installAllTriggers() {
  Logger.log('Installing all triggers at ' + new Date());
  
  try {
    // Delete existing triggers (cleanup)
    deleteAllTriggers();
    
    // Daily triggers
    ScriptApp.newTrigger('runDailyJob')
      .timeBased()
      .everyDays(1)
      .atHour(8) // 8 AM
      .create();
    Logger.log('Daily job trigger installed (8 AM)');
    
    ScriptApp.newTrigger('runDailyBuyerMatching')
      .timeBased()
      .everyDays(1)
      .atHour(10) // 10 AM
      .create();
    Logger.log('Daily buyer matching trigger installed (10 AM)');
    
    // Hourly triggers
    ScriptApp.newTrigger('runHourlyJob')
      .timeBased()
      .everyHours(1)
      .create();
    Logger.log('Hourly job trigger installed');
    
    // Follow-up check (every 4 hours)
    ScriptApp.newTrigger('checkFollowUps')
      .timeBased()
      .everyHours(4)
      .create();
    Logger.log('Follow-up check trigger installed (every 4 hours)');
    
    // Dashboard refresh (every 6 hours)
    ScriptApp.newTrigger('refreshDashboard')
      .timeBased()
      .everyHours(6)
      .create();
    Logger.log('Dashboard refresh trigger installed (every 6 hours)');
    
    Logger.log('All triggers installed successfully');
    return { success: true, message: 'All triggers installed' };
    
  } catch (error) {
    Logger.log('Error installing triggers: ' + error.toString());
    return { success: false, error: error.toString() };
  }
}

/**
 * Delete all existing triggers
 */
function deleteAllTriggers() {
  var triggers = ScriptApp.getProjectTriggers();
  
  for (var i = 0; i < triggers.length; i++) {
    ScriptApp.deleteTrigger(triggers[i]);
  }
  
  Logger.log('Deleted ' + triggers.length + ' existing triggers');
}

/**
 * List all active triggers
 * @return {Array} Array of trigger information
 */
function listTriggers() {
  var triggers = ScriptApp.getProjectTriggers();
  var triggerInfo = [];
  
  for (var i = 0; i < triggers.length; i++) {
    var trigger = triggers[i];
    triggerInfo.push({
      functionName: trigger.getHandlerFunction(),
      triggerSource: trigger.getTriggerSource(),
      eventType: trigger.getEventType()
    });
  }
  
  return triggerInfo;
}

/**
 * Install triggers with custom schedule
 * @param {Object} schedule - Schedule configuration
 */
function installCustomTriggers(schedule) {
  schedule = schedule || {
    dailyTime: 8,
    hourlyEnabled: true,
    followUpInterval: 4
  };
  
  deleteAllTriggers();
  
  // Daily job
  ScriptApp.newTrigger('runDailyJob')
    .timeBased()
    .everyDays(1)
    .atHour(schedule.dailyTime)
    .create();
  
  // Hourly job (if enabled)
  if (schedule.hourlyEnabled) {
    ScriptApp.newTrigger('runHourlyJob')
      .timeBased()
      .everyHours(1)
      .create();
  }
  
  // Follow-up check
  ScriptApp.newTrigger('checkFollowUps')
    .timeBased()
    .everyHours(schedule.followUpInterval)
    .create();
  
  Logger.log('Custom triggers installed with schedule: ' + JSON.stringify(schedule));
}

