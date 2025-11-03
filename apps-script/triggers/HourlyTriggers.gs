/**
 * HourlyTriggers.gs
 * Hourly automation triggers
 */

/**
 * Hourly job runner - processes incoming email replies
 * Schedule this to run every hour
 */
function runHourlyJob() {
  Logger.log('Starting hourly job at ' + new Date());
  
  try {
    // Process incoming email replies
    Logger.log('Processing incoming replies...');
    var replyResult = processIncomingReplies();
    Logger.log('Reply processing complete: ' + JSON.stringify(replyResult));
    
    // Refresh dashboard
    refreshDashboard();
    
    Logger.log('Hourly job completed successfully');
    
    return {
      success: true,
      replies: replyResult
    };
    
  } catch (error) {
    Logger.log('Error in hourly job: ' + error.toString());
    logError('HourlyTriggers', error);
    return {
      success: false,
      error: error.toString()
    };
  }
}

/**
 * Check for properties needing follow-up (runs every 4 hours)
 */
function checkFollowUps() {
  Logger.log('Checking follow-ups at ' + new Date());
  
  try {
    var result = processFollowUpEmails();
    Logger.log('Follow-up check complete: ' + JSON.stringify(result));
    return result;
  } catch (error) {
    Logger.log('Error checking follow-ups: ' + error.toString());
    logError('HourlyTriggers-FollowUps', error);
    return { success: false, error: error.toString() };
  }
}

