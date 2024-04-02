import { CommonActions, useNavigation, useNavigationState } from '@react-navigation/native';
import { ScreenHeight } from '@rneui/base';
import React, { useEffect, useState } from 'react';
import { Animated, ActivityIndicator, Dimensions, LogBox, Platform, SafeAreaView, ScrollView, StatusBar, StyleSheet, Text, useColorScheme, View } from 'react-native';
import { Root, Toast } from 'react-native-alert-notification';
import { Colors } from 'react-native/Libraries/NewAppScreen';
import { useDispatch, useSelector } from 'react-redux';
import tw from 'twrnc';
import { CodeColor } from '../assets/style';
import { clearMessages } from '../feature/messages.slice';
import { deleteUser } from '../feature/user.slice';
import { windowWidth } from '../functions/functions';

// LogBox.ignoreLogs(['Warning: Require cycle']);

export type barType = 'default' | 'light-content' | 'dark-content';
interface BaseProps {
    visible?: boolean,
    headNav?: any,
    visibleBottomView?: boolean,
    bottomView?: any,
    componentScroll?: boolean,
    barStyle?: barType,
    hiddenStatusBar?: boolean,
}
const Base: React.FC<BaseProps> = (props) => {

    const { children, hiddenStatusBar, barStyle = 'default' } = props

    const dispatch = useDispatch();

    const user = useSelector((state: any) => state.user.data);

    const barCurrentHeight = StatusBar.currentHeight;

    const isDarkMode = useColorScheme() === 'dark';
  
    const backgroundStyle = {
      backgroundColor: Colors.white
    //   backgroundColor: isDarkMode ? Colors.darker : Colors.lighter
    };

    // useEffect(() => {
    //     console.log('User: ', user);
    // }, [user])

    useEffect(() => {
        if(Object.keys(user).length !== 0 && user.del == 1) {
            dispatch(clearMessages());
            dispatch(deleteUser());
        }
    }, [user])
  
    return (
        // paddingTop: Platform.OS == 'android' ? StatusBar.currentHeight : 0
        <SafeAreaView style={[backgroundStyle, { flex: 1 }]}>
            <StatusBar
                hidden={hiddenStatusBar}
                backgroundColor={CodeColor.code1}
                translucent={false}
                // networkActivityIndicatorVisible={true}
                barStyle={barStyle}
            />
            {user.block == 1 && (
                <View style={[tw`absolute top-1 left-0 px-5`, { width: windowWidth, zIndex: 1 }]}>
                    <View style={[tw`flex-1 rounded p-2`, { backgroundColor: 'rgba(0,0,0,0.5)' }]}>
                        <Text style={[tw`text-yellow-800`, { color: CodeColor.code4 }]}>Votre compte a été bloqué. Veuillez consulter votre boîte de messagerie pour savoir les raisons. Merci</Text>
                    </View>
                </View>
            )}
            {children}
        </SafeAreaView>
    )
}

const styles = StyleSheet.create({
    sectionContainer: {
        marginTop: 32,
        paddingHorizontal: 24,
    },
    sectionTitle: {
        fontSize: 24,
        fontWeight: '600',
    },
    sectionDescription: {
        marginTop: 8,
        fontSize: 18,
        fontWeight: '400',
    },
    highlight: {
        fontWeight: '700',
    },
});

export default Base;