import React from 'react';
import { ApolloProvider } from '@apollo/client';
import { BrowserRouter as Router } from 'react-router-dom';
import apolloClient from './apollo';
import AppRouter from './router';
import './App.css';

function App() {
  return (
    <ApolloProvider client={apolloClient}>
      <Router>
        <AppRouter />
      </Router>
    </ApolloProvider>
  );
}

export default App;