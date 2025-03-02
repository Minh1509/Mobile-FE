import { GestureHandlerRootView } from 'react-native-gesture-handler';
import Router from './router';
import '../global.css';

export default function Index() {
  return (
    <GestureHandlerRootView>
      <Router />
    </GestureHandlerRootView>
  );
}
