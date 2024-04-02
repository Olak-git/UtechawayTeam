import { configureStore, combineReducers } from "@reduxjs/toolkit";
import picturesReducer from '../feature/picture.slice';
import userReducer from '../feature/user.slice';
import switchNotificationReducer from '../feature/switch.notification.slice';
import avatarReducer from '../feature/avatar.slice';
import drawerReducer from '../feature/drawer.slice';
import focusedReducer from '../feature/focused.slice';
import messagesReducer from '../feature/messages.slice';
import initReducer from '../feature/init.slice';
import refreshReducer from '../feature/refresh.slice';
import reloadReducer from '../feature/reload.slice';
import notificationsReducer from '../feature/notifications.slice';
import videosdkAuthTokenReducer from '../feature/videosdk.authtoken.slice';
import meetingReducer from '../feature/meeting.slice';
import { persistReducer } from "redux-persist";
import thunk from 'redux-thunk';
import AsyncStorage from "@react-native-async-storage/async-storage";

const persistConfig = {
    key: 'root',
    storage: AsyncStorage,
    // whitelist: ['user']
}

const reducers = combineReducers({
    init: initReducer,
    refresh: refreshReducer,
    pictures: picturesReducer,
    user: userReducer,
    reload: reloadReducer,
    notifications: notificationsReducer,
    switch_notification: switchNotificationReducer,
    avatar: avatarReducer,
    drawer: drawerReducer,
    focused: focusedReducer,
    messages: messagesReducer,
    videosdk: videosdkAuthTokenReducer,
    meeting: meetingReducer,
})

const persistedReducer = persistReducer(persistConfig, reducers)

const store = configureStore({
    reducer: persistedReducer,
    devTools: process.env.NODE_ENV != 'production',
    middleware: [thunk]
})

export default store
