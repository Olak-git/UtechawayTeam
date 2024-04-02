import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import ChatScreen from '../view/DashboardView/components/ChatScreen/ChatScreen';
import ParametreScreen from '../view/DashboardView/components/ParametreScreen/ParametreScreen';
import ParametresScreen from '../view/DashboardView/components/ParametresScreen/ParametresScreen';
import PanelScreen from '../view/DashboardView/components/PanelScreen/PanelScreen';
import PanelProfilScreen from '../view/DashboardView/components/PanelProfilScreen/PanelProfilScreen';
import PanelPasswordScreen from '../view/DashboardView/components/PanelPasswordScreen/PanelPasswordScreen';

import HomeView from '../view/HomeView/HomeView';
import SignInView from '../view/SignInView/SignInView';
import SignUpView from '../view/SignUpView/SignUpView';
import SignUpOauthView from '../view/SignUpOauthView/SignUpOauthView';
import PresentationView from '../view/PresentationView/PresentationView';

import { default as CollaborateurHomeScreen } from '../view/DashboardView/CollaborateurScreen/HomeScreen/HomeScreen';
import { useDispatch, useSelector } from 'react-redux';
// import ChatCallAudioScreen from '../view/DashboardView/components/ChatCallAudioScreen/ChatCallAudioScreen';
// import ChatCallVideoScreen from '../view/DashboardView/components/ChatCallVideoScreen/ChatCallVideoScreen';
import PanelCandidatureScreen from '../view/DashboardView/CollaborateurScreen/PanelCandidatureScreen/PanelCandidatureScreen';
import FactureScreen from '../view/DashboardView/CollaborateurScreen/FactureScreen/FactureScreen';
import MessageScreen from '../view/DashboardView/components/MessageScreen/MessageScreen';
import AideScreen from '../view/DashboardView/components/AideScreen/AideScreen';
import WelcomeView from '../view/WelcomeView/WelcomeView';
import CandidaturesScreen from '../view/DashboardView/CollaborateurScreen/CandidaturesScreen/CandidaturesScreen';
import CdcScreen from '../view/DashboardView/components/CdcScreen/CdcScreen';
import ContratScreen from '../view/DashboardView/CollaborateurScreen/ContratScreen/ContratScreen';
import CallScreen from '../view/DashboardView/components/CallScreen/CallScreen';
import ResetPasswordView from '../view/ResetPasswordView/ResetPasswordView';
import OtpView from '../view/OtpView/OtpView';
import NotificationsView from '../view/DashboardView/components/NotificationsView/NotificationsView';
import DetailsNotificationView from '../view/DashboardView/components/DetailsNotificationView/DetailsNotificationView';
import VideoSdkLive from '../view/DashboardView/components/VideoSdkLive/VideoSdkLive';
import VideoLive from '../view/DashboardView/components/VideoLive/VideoLive';

const Stack = createNativeStackNavigator();

interface GenerateViewProps {
}
const GenerateView: React.FC<GenerateViewProps> = () => {

  const dispatch = useDispatch();

  const init = useSelector((state: any) => state.init);

  const { presentation, welcome } = init;

  const user = useSelector((state: any) => state.user.data);

  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName={!welcome ? 'Welcome' : (!presentation ? 'Presentation' : (Object.keys(user).length == 0 ? 'Home' : 'DashboadClientHome'))}
        screenOptions={{
          headerShown: false,
          animation: 'slide_from_right'
        }}
      >

        {!welcome && (
          <Stack.Group>
            <Stack.Screen name='Welcome' component={WelcomeView} />
          </Stack.Group>
        )}

        {!presentation && (
          <Stack.Group>
            <Stack.Screen name='Presentation' component={PresentationView} />
          </Stack.Group>
        )}

        {(welcome && presentation) && (

        Object.keys(user).length == 0
          ?
          <Stack.Group>
            <Stack.Screen name='Home' component={HomeView} />
            <Stack.Screen name='SignUp' component={SignUpView} />
            <Stack.Screen name='SignUpOauth' component={SignUpOauthView} />
            <Stack.Screen name='SignIn' component={SignInView} />
            <Stack.Screen name='ResetPassword' component={ResetPasswordView} />
            <Stack.Screen name='Otp' component={OtpView} />
          </Stack.Group>
          :
          <Stack.Group>
            <Stack.Screen name='DashboadCollaborateurHome' component={CollaborateurHomeScreen} />
            <Stack.Screen name='DashboadSettings' component={ParametresScreen}
              options={{
                animation: 'fade_from_bottom'
              }}
            />
            <Stack.Screen name='DashboadSetting' component={ParametreScreen} />
            <Stack.Screen name='DashNotifications' component={NotificationsView} 
              options={{
                animation: 'fade_from_bottom'
              }}
            />
            <Stack.Screen name='DashDetailsNotification' component={DetailsNotificationView} />
            <Stack.Screen name='DashboadAide' component={AideScreen} />
            <Stack.Screen name='DashboadPanel' component={PanelScreen}
              options={{
                animation: 'fade_from_bottom'
              }}
            />
            <Stack.Screen name='DashboadPanelProfil' component={PanelProfilScreen} />
            <Stack.Screen name='DashboadPanelPassword' component={PanelPasswordScreen} />
            <Stack.Screen name='DashboadPanelHistoriqueCandidatures' component={CandidaturesScreen} />
            <Stack.Screen name='DashboadPanelHistoriqueCandidatures2' component={CandidaturesScreen} 
              options={{
                animation: 'fade_from_bottom'
              }}            
            />
            <Stack.Screen name='DashboadPanelAddCandidature' component={PanelCandidatureScreen} />
            <Stack.Screen name='DashboadCdc' component={CdcScreen}
              options={{
                animation: 'fade_from_bottom'
              }}
            />
            <Stack.Screen name='ContratView' component={ContratScreen}/>
            <Stack.Screen name='DashboadContrat' component={ContratScreen}
              options={{
                animation: 'fade_from_bottom'
              }}
            />
            <Stack.Screen name='DashboadFacture' component={FactureScreen} />

            <Stack.Screen name='DashboadMessages' component={MessageScreen} />
            <Stack.Screen name='DashboadMessages2' component={MessageScreen} 
              options={{
                animation:'fade_from_bottom'
              }}
            />
            <Stack.Screen name='DashboadCall' component={CallScreen}
              options={{
                animation:'slide_from_bottom'
              }}
            />

            <Stack.Screen name='DashboadVideoSdkLive' component={VideoLive} />
            <Stack.Screen name='DashboadChatScreen' component={ChatScreen} />
            {/* <Stack.Screen name='DashboadChatCallAudio' component={ChatCallAudioScreen} />
            <Stack.Screen name='DashboadChatCallVideo' component={ChatCallVideoScreen} /> */}

          </Stack.Group>
        )}

      </Stack.Navigator>
    </NavigationContainer>
  )
}

export default GenerateView;