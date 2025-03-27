import { GestureHandlerRootView } from 'react-native-gesture-handler';
import Router from './router';
import '../global.css';
import { SafeAreaView, StatusBar } from 'react-native';

export default function Index() {
  return (
    <GestureHandlerRootView>
        <StatusBar barStyle="dark-content" />
        <Router />
    </GestureHandlerRootView>
  );
}
