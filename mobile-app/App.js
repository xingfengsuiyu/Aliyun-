import React from 'react';
import { Provider } from 'react-redux';
import { Provider as PaperProvider } from 'react-native-paper';
import { store } from './src/store';
import AppNavigator from './src/navigation/AppNavigator';
import { StatusBar } from 'expo-status-bar';
import AlertRoot, { alertRef } from './src/components/GlobalAlert';

export default function App() {
  return (
    <Provider store={store}>
      <PaperProvider>
        <AppNavigator />
        <StatusBar style="auto" />
        <AlertRoot ref={alertRef} />
      </PaperProvider>
    </Provider>
  );
}
