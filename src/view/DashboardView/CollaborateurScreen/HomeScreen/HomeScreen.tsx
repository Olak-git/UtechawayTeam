import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, useWindowDimensions, View } from 'react-native';
import Base from '../../../../components/Base';
import tw from 'twrnc';
import { Card, Header, Icon, ListItem, SpeedDial, Tab, TabView, Text as TextRNE } from '@rneui/themed';
import { useDispatch, useSelector } from 'react-redux';
import { DashboardHeader } from '../../../../components/DashboardHeader';
import { account, baseUri, componentPaddingHeader, fetchUri, formatDate, getCurrency, getRandomInt, getUser, toast, windowHeight, windowWidth } from '../../../../functions/functions';
import { TabProject } from './components/TabProject';
import { CommonActions } from '@react-navigation/native';
import { CodeColor } from '../../../../assets/style';
import  { default as HeaderP } from '../../../../components/Header';
import { clone } from '../../../../functions/helperFunction';
import { TabContrat } from './components/TabContrat';
import { setUser } from '../../../../feature/user.slice';
import { resetCount, resetNotifications, setCount } from '../../../../feature/notifications.slice';
import { setStopped } from '../../../../feature/init.slice';
import '../../../../data/i18n';
import { useTranslation } from 'react-i18next';

const timer = require('react-native-timer');

interface HomeScreenProps {
    navigation?: any,
    route?: any
}
const HomeScreen: React.FC<HomeScreenProps> = (props) => {
    const { t } = useTranslation();

    const {navigation, route} = props

    const dispatch = useDispatch();

    const {width} = useWindowDimensions();

    const refresh = useSelector((state: any) => state.refresh.historique_contrats);

    // const dispatch = useDispatch();
    // const focused = useSelector((state: any) => state.focused)

    const [refreshing, setRefreshing] = useState(false);

    // @ts-ignore
    const user = useSelector(state => state.user.data)

    const stopped = useSelector((state: any) => state.init.stopped);

    const [index, setIndex] = useState(0)

    const [noFetch, setNoFetch] = useState(false)

    const notifies = useSelector((state: any) => state.notifications.data);
    
    const counter = useSelector((state: any) => state.notifications.count)

    const [data, setData] = useState({
        projets: [],
        contrats: [],
        portefeuille: 0,
        messages_unread: 0
    });

    const [open, setOpen] = useState(false);

    const [endFetch, setEndFetch] = useState(false)

    const onRefresh = () => {
        if(stopped) {
            dispatch(setStopped(false))
        }
        setRefreshing(true);
        getData();
    }

    const getData = () => {
        if(!stopped) {
            const formData = new FormData()
            formData.append('js', null)
            formData.append(`${account}_projets_contrats`, null)
            formData.append('token', user.slug)
            fetch(fetchUri, {
                method: 'POST',
                body: formData
            })
            .then(response => response.json())
            .then(json => {
                // console.log(json)
                if(json.success) {
                    setData((prevState) => ({ ...prevState, projets: json.projets, contrats: json.contrats, portefeuille: json.portefeuille, messages_unread: json.messages_unread }))
                    if(json.user) {
                        setNoFetch(true);
                        const _user = json.user;
                        let image = _user.image;
                        const data = clone(_user);
                        if(data.image) {
                            data.image = `${baseUri}/assets/avatars/${image}`;
                        }
                        dispatch(setUser({...data}));
                        let c = 0;
                        const notifications = json.notifications;
                        notifications.map((v: any) => {
                            if(notifies.indexOf(v.id) == -1) {
                                c++;
                            }
                        })
                        dispatch(setCount(c))
                    }
                } else {
                    console.warn(json.errors)
                }
                setEndFetch(true);
                setRefreshing(false)
            })
            .catch(e => {
                console.warn(e)
            })
        }
    }

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
        if(Object.keys(user).length !== 0) {
            if(!noFetch) {
                getData();
            }
        } else {
            goHome()
        }
    }, [user, noFetch, notifies])

    useEffect(() => {
        timer.setInterval('home-get-data', getData, 5000)
        // const timer = setInterval(getData, 5000);
        return () => {
            if(timer.intervalExists('home-get-data')) {
                timer.clearInterval('home-get-data')
            }
            // clearInterval(timer);
        }
    }, [stopped, notifies, counter])

    return (
        <Base>
            <HeaderP
                elevated={true}
                backgroundColor={CodeColor.code1}
                barStyle='default'
                containerStyle={[tw`py-2 px-4`]}
                centerComponent={
                    <DashboardHeader
                        user={user}
                        itemsNavBar={[t('home_top_menu.project'), t('home_top_menu.agreement'), t('home_top_menu.wallet')]}
                        // @ts-ignore
                        userImage={user.image}
                        navigation={navigation} index={index} setIndex={setIndex} />
                }
            />
            <View style={[tw`flex-1`, { backgroundColor: '#ffffff', minHeight: windowHeight }]}>

                <TabView
                    value={index}
                    onChange={setIndex}
                    animationType='timing'
                    tabItemContainerStyle={[tw``, {}]}
                    containerStyle={[tw`flex flex-1`]}>

                    <TabView.Item style={[tw`flex-1`]}>
                        <TabProject endFetch={endFetch} projets={data.projets} navigation={navigation} refreshing={refreshing} onRefresh={onRefresh} />
                    </TabView.Item>

                    <TabView.Item style={[tw`flex-1`]}>
                        <TabContrat endFetch={endFetch} contrats={data.contrats} navigation={navigation} user={user} refreshing={refreshing} onRefresh={onRefresh} />
                    </TabView.Item>

                    <TabView.Item style={[tw`flex-1`]}>
                        <View style={[tw`pt-5 px-2`, {}]}>
                            <Icon type='ionicon' name='wallet' size={70} color='#000000' />
                            <Text style={[tw`text-gray-600 text-sm text-center`]}>{t('dashboard_screen.you_have')} <Text style={tw`text-black font-bold`}>{getCurrency(data.portefeuille)} XOF</Text> {t('dashboard_screen.in_your_wallet')}.</Text>
                            <Text style={[tw`text-black mt-5 text-center`]}>{data.portefeuille == 0 ? t('dashboard_screen.more_in_wallet') : t('dashboard_screen.less_in_wallet')}</Text>
                        </View>
                    </TabView.Item>

                </TabView>
            </View>

            <SpeedDial
                isOpen={open}
                icon={{ type: 'ant-design', name: 'plus', color: '#fff' }}
                openIcon={{ name: 'close', color: '#fff' }}
                color={CodeColor.code1}
                onOpen={() => setOpen(!open)}
                onClose={() => setOpen(!open)}
                title={(!open && data.messages_unread && data.messages_unread != 0) ? data.messages_unread.toString() : undefined}
            >
                <SpeedDial.Action
                    icon={{ type: 'material-community', name: 'history', color: '#fff' }}
                    color={CodeColor.code1}
                    title={`${t('home_bottom_menu.my_applications')}`}
                    onPress={() => {
                        setOpen(false);
                        navigation.navigate('DashboadPanelHistoriqueCandidatures2');
                    }}
                />
                <SpeedDial.Action
                    icon={{ type: 'material-community', name: 'message', color: '#fff' }} 
                    color={user.block == 1 ? 'silver' : CodeColor.code1}
                    title={`${t('home_bottom_menu.my_messages')} ${data.messages_unread && data.messages_unread != 0 ? '(' + data.messages_unread + ')' : ''}`} 
                    onPress={() => {
                        setOpen(false);
                        navigation.navigate('DashboadMessages2');
                    }}
                    disabled={user.block == 1}
                />

                <SpeedDial.Action
                    icon={{ type: 'material-community', name: 'video', color: '#fff' }} 
                    color={user.block == 1 ? 'silver' : CodeColor.code1}
                    title='Meeting' 
                    onPress={() => {
                        setOpen(false);
                        navigation.navigate('DashboadVideoSdkLive');
                    }}
                    disabled={user.block == 1}
                />
            </SpeedDial>
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

export default HomeScreen;