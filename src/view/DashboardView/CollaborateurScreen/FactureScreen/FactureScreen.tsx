import React, { Children, useEffect, useState } from 'react';
import { Alert, Button, Dimensions, FlatList, Image, ImageBackground, Keyboard, Pressable, RefreshControl, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import Base from '../../../../components/Base';
import tw from 'twrnc';
import { useDispatch, useSelector } from 'react-redux';
import { DashboardHeaderSimple } from '../../../../components/DashboardHeaderSimple';
import { account, baseUri, componentPaddingHeader, fetchUri, formatDate, getCurrency, getUser, validatePassword, windowHeight } from '../../../../functions/functions';
import { ActivityIndicator, DataTable } from 'react-native-paper';
import { CommonActions } from '@react-navigation/native';
import { default as HeaderP } from '../../../../components/Header';
import { CodeColor } from '../../../../assets/style';
import { refreshColor } from '../../../../functions/helperFunction';
import { Divider } from '@rneui/base';
import '../../../../data/i18n';
import { useTranslation } from 'react-i18next';

interface FactureScreenProps {
    navigation?: any,
    route?: any
}
const FactureScreen: React.FC<FactureScreenProps> = (props) => {
    const { t } = useTranslation();

    const {navigation, route} = props

    const dispatch = useDispatch();

    // @ts-ignore
    const user = useSelector(state => state.user.data)

    const [data, setData] = useState({
        facture: route.params.facture,
        tranches: [],
        solde: false
    });

    const [refreshing, setRefreshing] = useState(false);

    const [visible, setVisible] = useState(false);

    const [endFetch, setEndFetch] = useState(false)

    const onHandle = () => {
        setVisible(true);
        const formData = new FormData()
        formData.append('js', null)
        formData.append('account', account)
        formData.append(`validation-facture`, null)
        formData.append('facture', route.params.facture.slug)
        formData.append('key', route.params.facture.id)
        // @ts-ignore
        formData.append('token', user.slug)
        fetch(fetchUri, {
            method: 'POST',
            body: formData
        })
        .then(response => response.json())
        .then(json => {
            setVisible(false);
            if(json.success) {
                setData((prevState) => ({ ...prevState, facture: json.facture, tranches: json.tranches, solde: json.est_solde }))
            } else {
                console.warn(json.errors)
            }
        })
        .catch(e => {
            setVisible(false);
            console.warn(e)
        })
    }

    const getData = () => {
        const formData = new FormData()
        formData.append('js', null)
        formData.append(`data-facture`, null)
        formData.append('key', route.params.facture.slug)
        // @ts-ignore
        formData.append('token', user.slug)
        fetch(fetchUri, {
            method: 'POST',
            body: formData
        })
        .then(response => response.json())
        .then(json => {
            if(json.success) {
                setData((prevState) => ({ ...prevState, facture: json.facture, tranches: json.tranches, solde: json.est_solde }))
                setEndFetch(true)
            } else {
                console.warn(json.errors)
            }
            setRefreshing(false)
        })
        .catch(e => console.warn(e))
    }

    const onRefresh = () => {
        setRefreshing(true);
        getData();
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
            getData();
        } else {
            goHome()
        }
    }, [user])

    return (
        <Base>
            <HeaderP
                elevated={true}
                backgroundColor={CodeColor.code1}
                containerStyle={{ paddingTop: componentPaddingHeader }}
                leftComponent={
                    <DashboardHeaderSimple navigation={navigation} title={`${t('invoice_screen.title_screen')}`} />
                }
            />
                <View style={[tw`bg-white flex-1`]}>
                    <ScrollView
                        refreshControl={
                            <RefreshControl
                                colors={refreshColor}
                                refreshing={refreshing}
                                onRefresh={onRefresh}
                            />
                        }
                    >
                    <View style={[tw`py-4 px-3`]}>
                        {data.facture && (
                            <>
                                <View style={[tw`bg-slate-100 p-2 rounded-lg`, { elevation: 4 }]}>
                                    <Text style={[tw`font-extrabold text-lg mb-2 text-black`]}>{`${t('invoice_screen.invoice')}`} N° {data.facture.code}</Text>
                                    <Text style={[tw`font-semibold text-base mb-1 text-black`]}>{t('invoice_screen.date')} : {formatDate(data.facture.dat)}</Text>
                                    <Text style={[tw`font-semibold text-base mb-1 text-black`]}>{t('invoice_screen.project')} : {data.facture.cdc_nom}</Text>
                                    <Text style={[tw`font-semibold text-base mb-1 text-black`]}>{t('invoice_screen.total_price')} : {getCurrency(data.facture.mnt)} XOF</Text>
                                    {data.facture.valide == 1 && (
                                        <Text style={[tw`font-semibold text-base text-right italic mb-1 text-black`]}>{t('invoice_screen.status')} : {data.solde ? <Text style={[tw`text-green-600`]}>{t('invoice_screen.pay')}</Text> : <Text style={[tw`text-red-600`]}>{t('invoice_screen.still_to_pay')}</Text>}</Text>
                                    )}
                                </View>

                                {data.facture.valide != 1
                                    ?
                                    <TouchableOpacity disabled={visible} onPress={onHandle} activeOpacity={0.5} style={[tw`rounded-lg mt-8 flex-row items-center justify-center p-4 border ${visible ? 'bg-red-100' : ''}`, { borderColor: CodeColor.code1 }]}>
                                        {visible && (
                                            <ActivityIndicator size='small' color={CodeColor.code1} style={tw`mr-2`} />
                                        )}
                                        <Text style={tw`${visible ? 'text-gray-500' : 'text-black'} font-bold`}>{t('invoice_screen.validate')}</Text>
                                    </TouchableOpacity>
                                    :
                                    <View style={[tw`mt-8 flex-1`]}>
                                        <Text style={tw`text-center text-gray-500`}>{t('invoice_screen.summary_payments')}</Text>
                                        <Divider style={tw`mt-2 mb-5`} />

                                        <DataTable style={tw``}>
                                            <DataTable.Header style={[tw`bg-slate-200`]}>
                                                <DataTable.Title style={tw`flex-1`} textStyle={[tw`font-extrabold`]}>{t('invoice_screen.slice')}</DataTable.Title>
                                                <DataTable.Title style={tw`flex-3`} numeric textStyle={[tw`font-extrabold`]}>{t('invoice_screen.amount')}(XOF)</DataTable.Title>
                                                <DataTable.Title style={tw`flex-3`} numeric textStyle={[tw`font-extrabold`]}>{t('invoice_screen.payment_date')}</DataTable.Title>
                                            </DataTable.Header>
                                            {!endFetch
                                                ?
                                                <DataTable.Row style={[tw`px-0`]}>
                                                    <DataTable.Cell style={tw`justify-center`}>
                                                        <ActivityIndicator color='silver' />
                                                    </DataTable.Cell>
                                                </DataTable.Row>
                                                :
                                                data.tranches.length == 0
                                                    ?
                                                    <DataTable.Row style={[tw`px-0`]}>
                                                        <DataTable.Cell style={tw`justify-center`}>
                                                            {t('invoice_screen.no_files_found')}
                                                        </DataTable.Cell>
                                                    </DataTable.Row>
                                                    :
                                                    data.tranches.map((item: any, index: number) => (
                                                        <DataTable.Row key={index.toString()}>
                                                            <DataTable.Cell style={tw`flex-1`}>{(index + 1).toString()}</DataTable.Cell>
                                                            <DataTable.Cell style={tw`flex-3`} numeric>{getCurrency(item.mnt)}</DataTable.Cell>
                                                            <DataTable.Cell style={tw`flex-3`} numeric>{item.dat_paiement ? formatDate(item.dat_paiement) : '#'}</DataTable.Cell>
                                                        </DataTable.Row>
                                                    ))
                                            }
                                            <DataTable.Header style={[tw`bg-white border-t border-b`]}>
                                                <DataTable.Cell textStyle={[tw`font-bold text-black`]}>{t('invoice_screen.rest')}</DataTable.Cell>
                                                <DataTable.Cell numeric textStyle={[tw`font-bold text-black`]}>
                                                    {endFetch
                                                        ?
                                                            `${getCurrency(data.facture.mnt_restant)} XOF`
                                                        : <ActivityIndicator color='silver' />
                                                    }
                                                </DataTable.Cell>
                                            </DataTable.Header>
                                        </DataTable>
                                    </View>
                                }
                            </>
                        )}
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
    },
    container: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#fff',
      },
    btnCon: {
        height: 45,
        width: '70%',
        elevation: 1,
        backgroundColor: '#00457C',
        borderRadius: 3,
    },
    btn: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
    },
    btnTxt: {
        color: '#fff',
        fontSize: 18,
    },
    webViewCon: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
    },
    wbHead: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#f9f9f9',
        zIndex: 25,
        elevation: 2,
    }
})

export default FactureScreen;