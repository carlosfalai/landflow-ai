/**
 * DashboardUpdater.gs
 * Updates dashboard sheet in real-time
 */

/**
 * Refresh dashboard data
 * Called periodically to update dashboard
 */
function refreshDashboard() {
  Logger.log('Refreshing dashboard at ' + new Date());
  
  try {
    updateDashboardSheet();
    Logger.log('Dashboard refreshed successfully');
  } catch (error) {
    Logger.log('Error refreshing dashboard: ' + error.toString());
    logError('DashboardUpdater', error);
  }
}

