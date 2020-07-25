import {createStore, applyMiddleware} from 'redux';
import {persistStore, persistReducer} from 'redux-persist';
import reduxLogger from 'redux-logger';
import reduxPromiseMiddleware from 'redux-promise-middleware';
import AsyncStorage from '@react-native-community/async-storage';

import rootReducers from './reducers';

const persistConfig = {
  key: 'root',
  storage: AsyncStorage,
  whitelist: ['auth'],
};

const persistedReducer = persistReducer(persistConfig, rootReducers);
const store = createStore(
  persistedReducer,
  applyMiddleware(reduxLogger, reduxPromiseMiddleware),
);

const persistor = persistStore(store);

export default {store, persistor};
