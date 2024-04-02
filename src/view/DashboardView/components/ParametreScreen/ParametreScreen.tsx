import React, { Children, useEffect, useState } from 'react';
import { Button, Dimensions, Image, ImageBackground, Pressable, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { Colors } from 'react-native/Libraries/NewAppScreen';
import Base from '../../../../components/Base';
import tw from 'twrnc';
import { Card, Header, Switch, Tab, TabView, Text as TextRNE } from '@rneui/themed';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useDispatch, useSelector } from 'react-redux';
import { DashboardHeaderSimple } from '../../../../components/DashboardHeaderSimple';
import { componentPaddingHeader, getUser } from '../../../../functions/functions';
import { ActivityLoading } from '../../../../components/ActivityLoading';
import { CommonActions } from '@react-navigation/native';
import  { default as HeaderP } from '../../../../components/Header';
import { CodeColor } from '../../../../assets/style';
import '../../../../data/i18n';

const About = () => {
    return (
        <>
            <Text style={[ tw`text-base text-black font-200` ]}>A props de Amanou Tech</Text>
        </>
    )
}

const Conditions = () => {
    return (
        <>
            <Text style={[ tw`text-base text-black font-200` ]}>Conditions d'utilisation</Text>
        </>
    )
}

const Politique = () => {
    return (
        <>
            <Text style={[ tw`text-base text-black font-200` ]}>Politique de confidentialité</Text>
        </>
    )
}

const Version = () => {
    return (
        <>
            <Text style={[ tw`text-base text-black font-200` ]}>Version</Text>
        </>
    )
}

interface ParametreScreenProps {
    navigation?: any,
    route?: any
}

const ParametreScreen: React.FC<ParametreScreenProps> = (props) => {
    const {navigation, route} = props

    // @ts-ignore
    const user = useSelector(state => state.user.data)

    const goHome = () => {
        navigation.dispatch(
            CommonActions.reset({
                index: 0,
                routes: [
                    {name: 'Home'}
                ]
            })
        )
    }

    useEffect(() => {
        if(Object.keys(user).length == 0) {
            goHome();
        }
    }, [user])

    return (
        <Base>
            <HeaderP
                elevated={true}
                backgroundColor={CodeColor.code1}
                containerStyle={{ paddingTop: componentPaddingHeader }}
                leftComponent={
                    <DashboardHeaderSimple navigation={navigation} title={route.params.title} />
                }
            />
            <View style={[tw`bg-white flex-1`]}>
                <ScrollView>
                    <View style={[tw`py-4 px-3 text-base`]}>
                        {route.params.index == 3 ?
                            <About /> :
                            route.params.index == 4 ?
                                <Conditions /> :
                                route.params.index == 5 ?
                                    <Politique /> :
                                    route.params.index == 7 ?
                                        <Version /> : <></>}
                    </View>
                </ScrollView>
            </View>
        </Base>
    )
}

const styles = StyleSheet.create({
    title: {
        textAlign: 'center',
        color: 'rgb(4,28,84)',
        fontSize: 25,
        fontWeight: '600',
        marginBottom: 18,
        fontFamily: 'serif'
    },
    paragraph: {
        color: 'rgb(4,28,84)',
        lineHeight: 20,
        textAlign: 'justify',
        fontFamily: 'sans-serif'
    }
})

export default ParametreScreen;