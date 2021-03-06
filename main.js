import Exponent from 'exponent';
import React from 'react';
import {
  AppRegistry,
  Platform,
  StatusBar,
  StyleSheet,
  View,
  AsyncStorage,
  Text,
} from 'react-native';
import {
  NavigationProvider,
  StackNavigation,
} from '@exponent/ex-navigation';
import {
  FontAwesome,
} from '@exponent/vector-icons';

import Router from './navigation/Router';
import cacheAssetsAsync from './utilities/cacheAssetsAsync';

/* Redux */
import {Provider} from 'react-redux';
import 'babel-polyfill'; 
import configureStore from './store/configureStore';
import {
  setAuthToken,
  setCurrentChef,
  setCurrentUser,
} from './actions/authActions';

// Create instance of store, can take in parameter of initial state
const store = configureStore();

// ############# Redux addition #############

class AppContainer extends React.Component {
  state = {
    appIsReady: false,
  }

  componentWillMount() {
    this._loadAssetsAsync();
  }

  async _loadAssetsAsync() {
    try {
      await cacheAssetsAsync({
        images: [
          require('./assets/images/exponent-wordmark.png'),
        ],
        fonts: [
          FontAwesome.font,
          {'space-mono': require('./assets/fonts/SpaceMono-Regular.ttf')},
        ],
      });
    } catch(e) {
      console.warn(
        'There was an error caching assets (see: main.js), perhaps due to a ' +
        'network timeout, so we skipped caching. Reload the app to try again.'
      );
      console.log(e.message);
    } finally {
      let context = this;
      AsyncStorage.multiGet([
        'AuthToken',
        'currentChef',
        'currentUser',
      ])
      .then(function(data) {
        store.dispatch(setAuthToken(data[0][1]));
        store.dispatch(setCurrentChef(JSON.parse(data[1][1])));
        store.dispatch(setCurrentUser(data[2][1]));
        context.setState({appIsReady: true});
      })
      .catch(function(err) {
        alert(err);
      });
    }
  }

  render() {
    if (this.state.appIsReady) {
      return (
        <Provider store={store}>
          <View style={styles.container}>
            <NavigationProvider router={Router}>
              <StackNavigation id="root" initialRoute={Router.getRoute('rootNavigation')} />
            </NavigationProvider>

            {Platform.OS === 'ios' && <StatusBar barStyle="default" />}
            {Platform.OS === 'android' && <View style={styles.statusBarUnderlay} />}
          </View>
        </Provider>
      );
    } else {
      return (
        <Exponent.Components.AppLoading />
      );
    }
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  statusBarUnderlay: {
    height: 24,
    backgroundColor: 'rgba(0,0,0,0.2)',
  },
});

Exponent.registerRootComponent(AppContainer);
