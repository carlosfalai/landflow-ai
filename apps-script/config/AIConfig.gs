/**
 * AIConfig.gs
 * Configuration for AI API integrations (Claude/OpenAI)
 */

var AI_CONFIG = {
  // API provider: 'openai' or 'claude'
  provider: 'openai',
  
  // OpenAI configuration
  openai: {
    apiKey: '', // Set via Properties Service
    model: 'gpt-4',
    baseUrl: 'https://api.openai.com/v1/chat/completions',
    maxTokens: 500,
    temperature: 0.3
  },
  
  // Claude configuration
  claude: {
    apiKey: '', // Set via Properties Service
    model: 'claude-3-sonnet-20240229',
    baseUrl: 'https://api.anthropic.com/v1/messages',
    maxTokens: 500
  },
  
  // Classification prompt template
  classificationPrompt: `Analyze the following email reply from a real estate agent or property seller and classify it. Return a JSON object with these fields:
- sentiment: One of "Interested", "Counteroffer", "Not Interested", "Spam", "Neutral"
- replyType: One of "Acceptance", "Counteroffer", "Rejection", "Question", "Unclear"
- confidence: A number between 0 and 100 representing your confidence level
- counterofferAmount: The counteroffer price if mentioned (0 if not mentioned)
- summary: A brief summary of the reply (max 200 characters)
- nextAction: Recommended next action (e.g., "Send confirmation", "Generate counteroffer", "Mark as dormant")

Email to analyze:
{{EMAIL_BODY}}

Return ONLY valid JSON, no other text.`,
  
  // Summarization prompt template
  summarizationPrompt: `Summarize the following email conversation thread about a real estate transaction. Extract key points: property address, offer amounts discussed, seller responses, current status, and next steps.

Conversation:
{{CONVERSATION_TEXT}}

Return a concise summary (max 300 words).`
};

/**
 * Get AI configuration
 * @return {Object} AI configuration object
 */
function getAIConfig() {
  return AI_CONFIG;
}

/**
 * Get API key for configured provider
 * @return {String} API key
 */
function getAPIKey() {
  var properties = PropertiesService.getScriptProperties();
  var provider = AI_CONFIG.provider;
  
  var key = properties.getProperty('AI_API_KEY');
  
  if (!key) {
    // Try provider-specific keys
    if (provider === 'openai') {
      key = properties.getProperty('OPENAI_API_KEY');
    } else if (provider === 'claude') {
      key = properties.getProperty('CLAUDE_API_KEY');
    }
  }
  
  return key || '';
}

/**
 * Set API key
 * @param {String} apiKey - API key
 */
function setAPIKey(apiKey) {
  var properties = PropertiesService.getScriptProperties();
  properties.setProperty('AI_API_KEY', apiKey);
}

/**
 * Set AI provider
 * @param {String} provider - Provider name ('openai' or 'claude')
 */
function setAIProvider(provider) {
  if (provider === 'openai' || provider === 'claude') {
    AI_CONFIG.provider = provider;
    var properties = PropertiesService.getScriptProperties();
    properties.setProperty('AI_PROVIDER', provider);
  }
}

/**
 * Get AI provider
 * @return {String} Provider name
 */
function getAIProvider() {
  var properties = PropertiesService.getScriptProperties();
  var provider = properties.getProperty('AI_PROVIDER');
  return provider || AI_CONFIG.provider;
}

/**
 * Get classification prompt with email body inserted
 * @param {String} emailBody - Email body text
 * @return {String} Formatted prompt
 */
function getClassificationPrompt(emailBody) {
  return AI_CONFIG.classificationPrompt.replace('{{EMAIL_BODY}}', emailBody);
}

/**
 * Get summarization prompt with conversation text
 * @param {String} conversationText - Conversation text
 * @return {String} Formatted prompt
 */
function getSummarizationPrompt(conversationText) {
  return AI_CONFIG.summarizationPrompt.replace('{{CONVERSATION_TEXT}}', conversationText);
}

