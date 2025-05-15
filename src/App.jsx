import React from 'react';
import { ApolloProvider } from '@apollo/client';
import apolloClient from './apollo';
import Chat from './components/Chat';
import './App.css';

function App() {
  return (
    <ApolloProvider client={apolloClient}>
      <div className="app">
        <header className="app-header">
          <h1>AI 助手</h1>
          <p className="app-subtitle">由 DeepSeek AI 提供支持</p>
        </header>
        
        <main className="app-main">
          <Chat />
        </main>
        
        <footer className="app-footer">
          <p>© {new Date().getFullYear()} AI Assistant</p>
        </footer>
      </div>
    </ApolloProvider>
  );
}

export default App;