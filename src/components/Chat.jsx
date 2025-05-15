import React, { useState, useEffect, useRef } from 'react';
import { useMutation, useQuery } from '@apollo/client';
import { CHAT_COMPLETION, GET_MODEL_INFO } from '../graphql/queries';
import './Chat.css';

function Chat() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);
  const messagesContainerRef = useRef(null);
  
  // 获取模型信息
  const { data: modelData, loading: modelLoading, error: modelError } = useQuery(GET_MODEL_INFO);
  
  // 聊天完成变更
  const [sendMessage, { error: chatError }] = useMutation(CHAT_COMPLETION);
  
  // 自动滚动到最新消息
  const scrollToBottom = () => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  };
  
  // 监听消息更新并滚动
  useEffect(() => {
    scrollToBottom();
  }, [messages]);
  
  // 处理模型信息或错误
  useEffect(() => {
    if (modelData?.modelInfo) {
      console.log("连接到 AI 模型:", modelData.modelInfo.name);
    }
    if (modelError) {
      console.error("连接 AI 模型时出错:", modelError);
      setMessages([{
        role: "system",
        content: `无法连接到 AI 服务: ${modelError.message}`
      }]);
    }
  }, [modelData, modelError]);
  
  // 处理发送消息
  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!input.trim()) return;
    
    // 添加用户消息到列表
    const userMessage = { role: "user", content: input };
    const updatedMessages = [...messages, userMessage];
    setMessages(updatedMessages);
    setInput('');
    setLoading(true);
    
    try {
      // 发送 GraphQL 请求
      const { data } = await sendMessage({
        variables: {
          messages: updatedMessages.map(msg => ({
            role: msg.role,
            content: msg.content
          }))
        }
      });
      
      console.log("AI 响应:", data);
      
      // 检查响应
      if (data?.chatCompletion?.message) {
        const aiResponse = data.chatCompletion.message;
        
        setMessages(prev => [...prev, {
          role: aiResponse.role,
          content: aiResponse.content
        }]);
        
        // 记录使用的 token (如果可用)
        if (data.chatCompletion.usage) {
          console.log("Token 使用情况:", data.chatCompletion.usage);
        }
      } else {
        console.error("无效的响应格式:", data);
        setMessages(prev => [...prev, {
          role: "system",
          content: "发生错误: 收到无效的响应格式"
        }]);
      }
    } catch (error) {
      console.error('发送消息时出错:', error);
      
      setMessages(prev => [...prev, {
        role: "system",
        content: `发送消息时出错: ${error.message}`
      }]);
    } finally {
      setLoading(false);
    }
  };
  
  // 处理键盘发送
  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage(e);
    }
  };
  
  return (
    <div className="chat-container">
      {/* 模型信息 */}
      {modelData?.modelInfo && (
        <div className="model-info">
          <span>模型: {modelData.modelInfo.name} (v{modelData.modelInfo.version})</span>
          <span className="model-capabilities">
            {modelData.modelInfo.capabilities.join(' • ')}
          </span>
        </div>
      )}
      
      {/* 消息列表 */}
      <div className="messages-area">
        <div className="messages-container" ref={messagesContainerRef}>
          {messages.length === 0 ? (
            <div className="empty-state">
              {modelLoading ? (
                <div className="connecting-indicator">
                  <div className="spinner"></div>
                  <p>正在连接到 AI 服务...</p>
                </div>
              ) : (
                <>
                  <div className="empty-icon">💬</div>
                  <h3>开始与 AI 助手对话</h3>
                  <p>在下方输入框中发送消息开始对话</p>
                </>
              )}
            </div>
          ) : (
            messages.map((msg, index) => (
              <div key={index} className={`message-wrapper message-${msg.role}`}>
                <div className="message">
                  <div className="message-header">
                    {msg.role === 'user' ? '您' : 
                     msg.role === 'assistant' ? 'AI 助手' : '系统消息'}
                  </div>
                  <div className="message-content">
                    {msg.content}
                  </div>
                </div>
              </div>
            ))
          )}
          
          {/* 加载指示器 */}
          {loading && (
            <div className="message-wrapper message-assistant">
              <div className="message loading-message">
                <div className="message-header">AI 助手</div>
                <div className="message-content">
                  <div className="typing-indicator">
                    <span></span>
                    <span></span>
                    <span></span>
                  </div>
                </div>
              </div>
            </div>
          )}
          
          {/* 滚动参考点 */}
          <div ref={messagesEndRef} />
        </div>
      </div>
      
      {/* 输入区域 */}
      <div className="input-area">
        <form onSubmit={handleSendMessage} className="input-form">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="输入您的问题..."
            disabled={loading || !!modelError}
            className="message-input"
          />
          <button 
            type="submit" 
            disabled={loading || !input.trim() || !!modelError}
            className="send-button"
          >
            发送
          </button>
        </form>
        
        {/* 错误消息 */}
        {(modelError || chatError) && (
          <div className="error-message">
            {modelError ? `连接错误: ${modelError.message}` : 
             chatError ? `聊天错误: ${chatError.message}` : ""}
          </div>
        )}
      </div>
    </div>
  );
}

export default Chat;