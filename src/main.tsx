import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import './index.css'

// Redux 
import { Provider } from 'react-redux';
import store from './redux/store.ts';

// Material UI
import theme from './theme.tsx';
import { ThemeProvider } from '@emotion/react';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.Fragment>
      <Provider store={store}>
        <ThemeProvider theme={theme}>
          <App />
        </ThemeProvider>
      </Provider>
  </React.Fragment>
)
