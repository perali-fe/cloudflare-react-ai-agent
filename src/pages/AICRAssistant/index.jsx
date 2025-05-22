// src/pages/AICRAssistant/index.jsx
import React, { useState, useEffect, useRef } from 'react';
import crService from '../../services/crService';
import './styles.css';

// 开发模式调试组件
const DebugInfo = ({ data, onClose }) => {
  if (!data) return null;
  
  return (
    <div className="debug-overlay">
      <div className="debug-content">
        <div className="debug-header">
          <h3>Debug Information</h3>
          <button onClick={onClose} className="debug-close">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="18" y1="6" x2="6" y2="18"/>
              <line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </div>
        <div className="debug-body">
          <pre>{JSON.stringify(data, null, 2)}</pre>
        </div>
      </div>
    </div>
  );
};

const AICRAssistant = () => {
  const [inputCode, setInputCode] = useState('');
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [debugData, setDebugData] = useState(null);
  const isDevelopment = import.meta.env.DEV || false;
  const messagesEndRef = useRef(null);
  const textareaRef = useRef(null);

  useEffect(() => {
    // 加载历史对话
    const savedMessages = localStorage.getItem('crChatHistory');
    if (savedMessages) {
      try {
        const parsedMessages = JSON.parse(savedMessages);
        setMessages(parsedMessages);
      } catch (e) {
        console.error('Failed to parse chat history', e);
      }
    }
  }, []);

  useEffect(() => {
    // 自动滚动到底部
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  useEffect(() => {
    // 自动调整textarea高度
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = Math.min(textareaRef.current.scrollHeight, 200) + 'px';
    }
  }, [inputCode]);

  const saveToHistory = (newMessages) => {
    localStorage.setItem('crChatHistory', JSON.stringify(newMessages));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!inputCode.trim() || loading) return;
    
    const userMessage = {
      id: Date.now(),
      type: 'user',
      content: inputCode.trim(),
      timestamp: new Date().toISOString()
    };

    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    setInputCode('');
    setLoading(true);
    
    try {
      const result = await crService.submitCodeForReview(inputCode.trim());
      
      // 处理API返回的数据结构
      let responseContent = '';
      let hasError = false;
      
      if (result && typeof result === 'object') {
        // 检查是否有错误
        if (result.error) {
          responseContent = result.error;
          hasError = true;
        } else if (result.text) {
          // 使用返回的text字段
          responseContent = result.text;
        } else if (result.response && result.response.body && result.response.body.choices && result.response.body.choices[0]) {
          // 从OpenAI API响应中提取内容
          responseContent = result.response.body.choices[0].message.content;
        } else if (result.content) {
          responseContent = result.content;
        } else {
          // 如果都没有，显示整个JSON（开发调试用）
          responseContent = JSON.stringify(result, null, 2);
        }
      } else if (typeof result === 'string') {
        responseContent = result;
      } else {
        responseContent = 'Received empty response from server.';
        hasError = true;
      }
      
      const assistantMessage = {
        id: Date.now() + 1,
        type: 'assistant',
        content: responseContent,
        timestamp: new Date().toISOString(),
        isError: hasError,
        rawData: isDevelopment ? result : null // 只在开发环境保存原始数据
      };

      const updatedMessages = [...newMessages, assistantMessage];
      setMessages(updatedMessages);
      saveToHistory(updatedMessages);
    } catch (err) {
      console.error('Error submitting CR request:', err);
      
      let errorMessage = 'Sorry, I encountered an error while reviewing your code.';
      
      // 尝试从错误中提取有用信息
      if (err.response?.data?.message) {
        errorMessage = err.response.data.message;
      } else if (err.response?.data?.error) {
        errorMessage = err.response.data.error;
      } else if (err.message) {
        errorMessage = err.message;
      }
      
      const assistantErrorMessage = {
        id: Date.now() + 1,
        type: 'assistant',
        content: errorMessage + '\n\nPlease try again or check your input.',
        timestamp: new Date().toISOString(),
        isError: true
      };
      
      const updatedMessages = [...newMessages, assistantErrorMessage];
      setMessages(updatedMessages);
      saveToHistory(updatedMessages);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  const newChat = () => {
    setMessages([]);
    setInputCode('');
    localStorage.removeItem('crChatHistory');
  };

  const formatMessageContent = (content, isCode = false) => {
    if (isCode) {
      return content;
    }
    
    // 确保content是字符串
    if (!content || typeof content !== 'string') {
      return String(content || '');
    }
    
    // 处理可能的markdown格式文本
    let formattedContent = content;
    
    // 转换markdown语法
    formattedContent = formattedContent
      // 代码块处理
      .replace(/```(\w+)?\n([\s\S]*?)```/g, '<pre class="code-block-inline"><code>$2</code></pre>')
      // 行内代码
      .replace(/`([^`]+)`/g, '<code class="inline-code">$1</code>')
      // 粗体
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      // 斜体
      .replace(/\*(.*?)\*/g, '<em>$1</em>')
      // 换行处理
      .replace(/\n/g, '<br>');
    
    return formattedContent;
  };

  return (
    <div className="claude-container">
      {/* 侧边栏 */}
      <div className="claude-sidebar">
        <div className="sidebar-header">
          <h2>Code Review</h2>
          <button onClick={newChat} className="new-chat-btn">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M12 2v20M2 12h20"/>
            </svg>
            New chat
          </button>
        </div>
        
        <div className="chat-history">
          {messages.length > 0 && (
            <div className="history-section">
              <h3>Recent</h3>
              <div className="history-item active">
                <span>Code Review Session</span>
                <span className="message-count">{messages.length}</span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* 主聊天区域 */}
      <div className="claude-main">
        <div className="chat-content">
          {messages.length === 0 ? (
            <div className="welcome-container">
              <div className="claude-avatar-large">
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/>
                  <circle cx="12" cy="12" r="10"/>
                  <path d="M12 17h.01"/>
                </svg>
              </div>
              <h1>AI Code Review Assistant</h1>
              <p>I'm here to help you review your code. I can analyze your code for:</p>
              <div className="feature-grid">
                <div className="feature-item">
                  <div className="feature-icon">🔍</div>
                  <div>
                    <h4>Code Quality</h4>
                    <p>Best practices and clean code principles</p>
                  </div>
                </div>
                <div className="feature-item">
                  <div className="feature-icon">🐛</div>
                  <div>
                    <h4>Bug Detection</h4>
                    <p>Potential issues and logical errors</p>
                  </div>
                </div>
                <div className="feature-item">
                  <div className="feature-icon">⚡</div>
                  <div>
                    <h4>Performance</h4>
                    <p>Optimization suggestions and improvements</p>
                  </div>
                </div>
                <div className="feature-item">
                  <div className="feature-icon">🔒</div>
                  <div>
                    <h4>Security</h4>
                    <p>Security vulnerabilities and recommendations</p>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="messages-container">
              {messages.map((message) => (
                <div key={message.id} className={`message-wrapper ${message.type}`}>
                  <div className="message-avatar">
                    {message.type === 'user' ? (
                      <div className="user-avatar">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                          <circle cx="12" cy="7" r="4"/>
                        </svg>
                      </div>
                    ) : (
                      <div className="claude-avatar">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                          <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/>
                          <circle cx="12" cy="12" r="10"/>
                          <path d="M12 17h.01"/>
                        </svg>
                      </div>
                    )}
                  </div>
                  <div className="message-content">
                    <div className="message-header">
                      <span className="sender-name">
                        {message.type === 'user' ? 'You' : 'Claude'}
                      </span>
                    </div>
                    <div className="message-body">
                      {message.type === 'user' ? (
                        <pre className="code-block">{message.content}</pre>
                      ) : (
                        <div className="assistant-message-container">
                          <div 
                            className={`assistant-response ${message.isError ? 'error-message' : ''}`}
                            dangerouslySetInnerHTML={{ 
                              __html: formatMessageContent(message.content) 
                            }}
                          />
                          {isDevelopment && (
                            <button 
                              className="debug-button"
                              onClick={() => setDebugData(message.rawData)}
                              title="View raw response data"
                            >
                              Debug
                            </button>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
              
              {loading && (
                <div className="message-wrapper assistant">
                  <div className="message-avatar">
                    <div className="claude-avatar">
                      <div className="thinking-dots">
                        <span></span>
                        <span></span>
                        <span></span>
                      </div>
                    </div>
                  </div>
                  <div className="message-content">
                    <div className="message-header">
                      <span className="sender-name">Claude</span>
                    </div>
                    <div className="message-body">
                      <div className="thinking-text">Analyzing your code...</div>
                    </div>
                  </div>
                </div>
              )}
              
              <div ref={messagesEndRef} />
            </div>
          )}
        </div>

        {/* 输入区域 */}
        <div className="input-container">
          <form onSubmit={handleSubmit} className="input-form">
            <div className="input-wrapper">
              <textarea
                ref={textareaRef}
                value={inputCode}
                onChange={(e) => setInputCode(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Paste your code here for review..."
                className="code-input"
                disabled={loading}
                rows="1"
              />
              <button 
                type="submit" 
                disabled={loading || !inputCode.trim()} 
                className="send-button"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M22 2L2 8.5l7.5 3L12 19l10-17z"/>
                </svg>
              </button>
            </div>
            <div className="input-footer">
              <span className="input-hint">Press Enter to send, Shift+Enter for new line</span>
            </div>
          </form>
        </div>
      </div>
      
      {/* 调试信息弹窗 */}
      {debugData && (
        <DebugInfo 
          data={debugData} 
          onClose={() => setDebugData(null)} 
        />
      )}
    </div>
  );
};

export default AICRAssistant;