/**
 * ClaudeClassifier.gs
 * AI-powered email classification using Claude or OpenAI API
 */

/**
 * Classify email reply using AI
 * @param {String} emailBody - Email body text
 * @return {Object} Classification result
 */
function classifyEmailReply(emailBody) {
  if (!emailBody || emailBody.trim() === '') {
    return createDefaultClassification();
  }
  
  try {
    var provider = getAIProvider();
    
    if (provider === 'openai') {
      return classifyWithOpenAI(emailBody);
    } else if (provider === 'claude') {
      return classifyWithClaude(emailBody);
    } else {
      Logger.log('Unknown AI provider: ' + provider);
      return createDefaultClassification();
    }
    
  } catch (error) {
    Logger.log('Error classifying email: ' + error.toString());
    logError('ClaudeClassifier', error);
    return createDefaultClassification();
  }
}

/**
 * Classify with OpenAI API
 * @param {String} emailBody - Email body text
 * @return {Object} Classification result
 */
function classifyWithOpenAI(emailBody) {
  var apiKey = getAPIKey();
  if (!apiKey) {
    throw new Error('OpenAI API key not set');
  }
  
  var config = getAIConfig();
  var prompt = getClassificationPrompt(emailBody);
  
  var payload = {
    model: config.openai.model,
    messages: [
      {
        role: 'system',
        content: 'You are a real estate email classifier. Always return valid JSON only.'
      },
      {
        role: 'user',
        content: prompt
      }
    ],
    temperature: config.openai.temperature,
    max_tokens: config.openai.maxTokens,
    response_format: { type: 'json_object' }
  };
  
  var options = {
    method: 'post',
    contentType: 'application/json',
    headers: {
      'Authorization': 'Bearer ' + apiKey
    },
    payload: JSON.stringify(payload),
    muteHttpExceptions: true
  };
  
  var response = UrlFetchApp.fetch(config.openai.baseUrl, options);
  var responseCode = response.getResponseCode();
  var responseText = response.getContentText();
  
  if (responseCode !== 200) {
    Logger.log('OpenAI API error: ' + responseCode + ' - ' + responseText);
    throw new Error('OpenAI API error: ' + responseCode);
  }
  
  var jsonResponse = JSON.parse(responseText);
  var classificationText = jsonResponse.choices[0].message.content;
  
  return parseClassificationResult(classificationText);
}

/**
 * Classify with Claude API
 * @param {String} emailBody - Email body text
 * @return {Object} Classification result
 */
function classifyWithClaude(emailBody) {
  var apiKey = getAPIKey();
  if (!apiKey) {
    throw new Error('Claude API key not set');
  }
  
  var config = getAIConfig();
  var prompt = getClassificationPrompt(emailBody);
  
  var payload = {
    model: config.claude.model,
    max_tokens: config.claude.maxTokens,
    messages: [
      {
        role: 'user',
        content: prompt
      }
    ]
  };
  
  var options = {
    method: 'post',
    contentType: 'application/json',
    headers: {
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01'
    },
    payload: JSON.stringify(payload),
    muteHttpExceptions: true
  };
  
  var response = UrlFetchApp.fetch(config.claude.baseUrl, options);
  var responseCode = response.getResponseCode();
  var responseText = response.getContentText();
  
  if (responseCode !== 200) {
    Logger.log('Claude API error: ' + responseCode + ' - ' + responseText);
    throw new Error('Claude API error: ' + responseCode);
  }
  
  var jsonResponse = JSON.parse(responseText);
  var classificationText = jsonResponse.content[0].text;
  
  return parseClassificationResult(classificationText);
}

/**
 * Parse classification result from AI response
 * @param {String} responseText - AI response text (should be JSON)
 * @return {Object} Parsed classification object
 */
function parseClassificationResult(responseText) {
  try {
    // Clean up response text (remove markdown code blocks if present)
    var cleaned = responseText.trim();
    if (cleaned.startsWith('```json')) {
      cleaned = cleaned.replace(/```json\s*/, '').replace(/\s*```$/, '');
    } else if (cleaned.startsWith('```')) {
      cleaned = cleaned.replace(/```\s*/, '').replace(/\s*```$/, '');
    }
    
    var result = JSON.parse(cleaned);
    
    // Validate and normalize result
    return {
      sentiment: result.sentiment || 'Neutral',
      replyType: result.replyType || 'Unclear',
      confidence: Math.min(100, Math.max(0, result.confidence || 50)),
      counterofferAmount: parseFloat(result.counterofferAmount || 0),
      summary: result.summary || '',
      nextAction: result.nextAction || ''
    };
    
  } catch (error) {
    Logger.log('Error parsing classification result: ' + error.toString());
    Logger.log('Response text: ' + responseText);
    return createDefaultClassification();
  }
}

/**
 * Create default classification result
 * @return {Object} Default classification object
 */
function createDefaultClassification() {
  return {
    sentiment: 'Neutral',
    replyType: 'Unclear',
    confidence: 0,
    counterofferAmount: 0,
    summary: 'Unable to classify email',
    nextAction: 'Review manually'
  };
}

/**
 * Summarize conversation thread
 * @param {String} conversationText - Full conversation text
 * @return {String} Summary text
 */
function summarizeConversation(conversationText) {
  if (!conversationText || conversationText.trim() === '') {
    return 'No conversation to summarize';
  }
  
  try {
    var provider = getAIProvider();
    var prompt = getSummarizationPrompt(conversationText);
    var apiKey = getAPIKey();
    
    if (!apiKey) {
      return 'API key not configured';
    }
    
    var config = getAIConfig();
    
    if (provider === 'openai') {
      var payload = {
        model: config.openai.model,
        messages: [
          {
            role: 'system',
            content: 'You are a real estate transaction summarizer. Provide concise summaries.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.3,
        max_tokens: 300
      };
      
      var options = {
        method: 'post',
        contentType: 'application/json',
        headers: {
          'Authorization': 'Bearer ' + apiKey
        },
        payload: JSON.stringify(payload),
        muteHttpExceptions: true
      };
      
      var response = UrlFetchApp.fetch(config.openai.baseUrl, options);
      
      if (response.getResponseCode() === 200) {
        var jsonResponse = JSON.parse(response.getContentText());
        return jsonResponse.choices[0].message.content.trim();
      }
      
    } else if (provider === 'claude') {
      var payload = {
        model: config.claude.model,
        max_tokens: 300,
        messages: [
          {
            role: 'user',
            content: prompt
          }
        ]
      };
      
      var options = {
        method: 'post',
        contentType: 'application/json',
        headers: {
          'x-api-key': apiKey,
          'anthropic-version': '2023-06-01'
        },
        payload: JSON.stringify(payload),
        muteHttpExceptions: true
      };
      
      var response = UrlFetchApp.fetch(config.claude.baseUrl, options);
      
      if (response.getResponseCode() === 200) {
        var jsonResponse = JSON.parse(response.getContentText());
        return jsonResponse.content[0].text.trim();
      }
    }
    
    return 'Unable to generate summary';
    
  } catch (error) {
    Logger.log('Error summarizing conversation: ' + error.toString());
    return 'Error generating summary: ' + error.toString();
  }
}

