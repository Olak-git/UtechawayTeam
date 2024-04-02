import React, { Children, useCallback, useEffect, useMemo, useState } from 'react';
import { Alert, Dimensions, FlatList, Image, ImageBackground, Keyboard, ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View, RefreshControl, StyleProp, ViewStyle } from 'react-native';
import { Colors } from 'react-native/Libraries/NewAppScreen';
import Base from '../../../../components/Base';
import tw from 'twrnc';
import { Card, Header, Switch, Tab, TabView, ListItem, Avatar, Text as TextRNE, Divider } from '@rneui/themed';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useDispatch, useSelector } from 'react-redux';
import { DashboardHeaderSimple } from '../../../../components/DashboardHeaderSimple';
import { account, baseUri, componentPaddingHeader, customGenerationFunction, downloadFile, fetchUri, formatDate, format_size, getCurrency, getRandomInt, getUser, headers, toast, validatePassword } from '../../../../functions/functions';
import { ActivityLoading } from '../../../../components/ActivityLoading';
import { ColorsPers } from '../../../../components/Styles';
import { ModalValidationForm } from '../../../../components/ModalValidationForm';
import { ActivityIndicator as ActivityIndicatorRNP, Button, Checkbox, DataTable } from 'react-native-paper';
import  { default as HeaderP } from '../../../../components/Header';
import { CommonActions } from '@react-navigation/native';
import { CodeColor } from '../../../../assets/style';
import { CheckBox, Icon, SpeedDial } from '@rneui/base';
import { clone, getErrorsToString, isEmpty, refreshColor } from '../../../../functions/helperFunction';
import { Modal } from 'react-native-form-component';
import InputForm2 from '../../../../components/InputForm2';
import FilePicker, { types } from 'react-native-document-picker';
import { AirbnbRating } from '@rneui/themed';
import { deleteUser } from '../../../../feature/user.slice';
import '../../../../data/i18n';
import { useTranslation } from 'react-i18next';

interface RowProps {
    value: number,
    status: number,
    selected: number,
    setSelected: any,
}
const Row: React.FC<RowProps> = ({value, status, selected, setSelected}) => {

    const [checked, setChecked] = useState((status >= value || value == selected));
    const [disabled, setDisabled] = useState(status >= value);

    const hg = (n: number) => {
        const arr = new Array();
        for (let index = 0; index < n; index++) {
            arr.push(index)
        }
        return arr
    }

    const onChecked = (v: number) => {
        if(v == selected) {
            setSelected(0)    
        } else {
            setSelected(v)
        }
    }

    useEffect(() => {
        setChecked((status >= value || value == selected))
    }, [selected, value])

    return (
        <DataTable.Row style={[tw`px-0`]}>
            <DataTable.Cell style={tw`flex-1`}>
                <CheckBox checked={checked} disabled={disabled} onPress={(event) => onChecked(value)} />
            </DataTable.Cell>
            <DataTable.Cell style={tw`flex-5 items-center`}>
                {hg(value).map((v: number, i: number) => 
                    <Icon key={i.toString()} type='ant-design' name='star' color={checked ? CodeColor.code1 : 'silver'} />
                )}
            </DataTable.Cell>
        </DataTable.Row>
    )
}

interface ParamItemProps {
    title: string,
    description: string,
    rightComponent?: React.ReactElement,
    containerStyle?: StyleProp<ViewStyle>
}
const ParamItem: React.FC<ParamItemProps> = ({title, description, rightComponent, containerStyle}) => {
    return (
        <View style={tw`flex-1 px-3 mb-3`}>
            <Text style={[tw`text-base mb-1 text-black`, { fontFamily: 'YanoneKaffeesatz-Regular', }]}>{title}</Text>
            {rightComponent
                ?
                <View style={[tw`flex-row justify-between`, containerStyle]}>
                    <Text style={tw`flex-1 text-sm text-slate-500`}>{description}</Text>
                    {rightComponent}
                </View>
                :
                <Text style={tw`flex-1 text-sm text-slate-500`}>{description}</Text>
            }
        </View>
    )
}

interface BottomButtonProps {
    navigation: any,
    route: string,
    params?: any,
    title: string,
    reverse?: boolean
}
const BottomButton: React.FC<BottomButtonProps> = ({navigation, route, params={}, title, reverse}) => {
    return (
        <TouchableOpacity 
            activeOpacity={0.5}
            onPress={() => navigation.navigate(route, {...params})}
            style={[ tw`rounded-lg py-4 mb-4`, {minHeight: 40}, reverse ? styles.buttonReverse : styles.buttonUnreverse ]}
        >
            <Text style={[ tw`text-center`, {color: reverse ? '#FFF' : CodeColor.code1} ]}>{title}</Text>
        </TouchableOpacity>
    )
}

interface CdcScreenProps {
    navigation?: any,
    route?: any
}
const CdcScreen: React.FC<CdcScreenProps> = (props) => {
    const { t } = useTranslation();

    const {navigation, route} = props;

    const dispatch = useDispatch();

    const {item} = route.params;

    const refresh = useSelector((state: any) => state.refresh.cdc);

    // @ts-ignore
    const user = useSelector(state => state.user.data)

    const [cdc, setCdc] = useState<any>({});

    const [data, setData] = useState({
        docs: [],
        facture: null,
        contrat: null,
        status: item.statut
    });
    // const [docs, setDocs] = useState([]);

    const [visible, setVisible] = useState(false)

    const [showModal, setShowModal] = useState(false)

    const [open, setOpen] = useState(false);

    const [endFetch, setEndFetch] = useState(false);

    const [refreshing, setRefreshing] = useState(false);

    const [selected, setSelected] = useState(0);

    const getData = () => {
        const formData = new FormData()
        formData.append('js', null)
        formData.append('data-project', null)
        formData.append('token', user.slug)
        formData.append('key', item.cdc_slug);
        fetch(fetchUri, {
            method: 'POST',
            body: formData
        })
        .then(response => response.json())
        .then(json => {
            if(json.success) {
                // console.log('Facture => ', json.facture);
                setCdc((prevState: any) => ({...prevState, ...json.cdc}));
                setData(prevState => ({...prevState, docs: json.docs, facture: json.facture, contrat: json.contrat}))
            } else {
                console.warn(json.errors)
            }
            setEndFetch(true);
            setRefreshing(false);
        })
        .catch(e => {
            setEndFetch(true);
            setRefreshing(false);
            console.warn(e)
        })
    }

    const onHandle = () => {
        let valide = true;
        if(selected <= 0 || selected > 5) {
            valide = false;
            toast('error', 'Veuillez ')
        }
        if(valide) {
            setShowModal(true);
            const formData = new FormData()
            formData.append('js', null)
            formData.append('cdc-update-status', null)
            formData.append('token', user.slug)
            formData.append('key', item.partage_cdc_id);
            formData.append('statut', selected);
            fetch(fetchUri, {
                method: 'POST',
                body: formData
            })
            .then(response => response.json())
            .then(json => {
                setVisible(false);
                if(json.success) {
                    setVisible(false);
                    setData((prevState:any) => ({...prevState, status: selected}));
                    toast('success', json.success_message || t('project_screen.msg_updated_project_status'));
                } else {
                    console.warn(json.errors)
                    toast('error', getErrorsToString(json.errors));
                }
                setShowModal(false);
            })
            .catch(e => {
                setShowModal(false);
                console.warn(e)
            })
        }
    }

    const onRefresh = () => {
        setRefreshing(true);
        // getData();
    }

    const renderItem = (item: any, index: number) => {
        return (
            <DataTable.Row key={index.toString()} style={[tw`px-2`]}>
                <DataTable.Title numberOfLines={2} textStyle={[tw`text-left`, { lineHeight: 15 }]} style={tw`flex-5`}>{item.name_doc}</DataTable.Title>
                <DataTable.Cell style={tw`flex-2 justify-end`}>
                    <View style={[tw`flex-row justify-end items-center`]}>
                        <TouchableOpacity
                            style={[tw``]}
                            onPress={() => downloadFile(`${baseUri}/assets/files/cdc/${item.doc}`, item.name_doc)}>
                            <Icon type='foundation' name='download' size={30} iconStyle={tw``} />
                        </TouchableOpacity>
                    </View>
                </DataTable.Cell>
            </DataTable.Row>
        )
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
        if(refreshing) {
            getData();
        }
    }, [refreshing])

    useEffect(() => {
        console.log('Item => ', item)
        setCdc(()=>({...item, id: item.cdc_id, slug: item.cdc_slug}))
    }, [])

    useEffect(() => {
        if(Object.keys(user).length == 0) {
            goHome();
        } else {
            getData();
        }
    }, [user, refresh])

    const hg = (n: number) => {
        const arr = new Array();
        for (let index = 0; index < n; index++) {
            arr.push(index)
        }
        return arr
    }

    return (
        <Base hiddenStatusBar={visible}>
            <ModalValidationForm showM={showModal} />
            <HeaderP
                elevated={true}
                backgroundColor={CodeColor.code1}
                containerStyle={{ paddingTop: componentPaddingHeader }}
                leftComponent={
                    <DashboardHeaderSimple navigation={navigation} title={route.params.headerTitle ? route.params.headerTitle : `${t('project_screen.project')} - ${cdc.nom}`} />
                }
            />
            <Modal 
                show={visible}
                // backgroundColor='#fff'
                transparent
                animationType='slide'
                style={tw`rounded-lg`}
            >
                <View style={tw`flex-1 bg-white rounded-lg`}>
                    <View style={tw`flex-row justify-end items-center`}>
                        <Icon
                            containerStyle={tw`p-1`}
                            type='antdesign'
                            name='close'
                            color='black'
                            size={35}
                            onPress={() => setVisible(false)} 
                        />
                    </View>
                    <DataTable style={[tw`px-3`]}>
                        <DataTable.Header style={[tw`bg-gray-100`]}>
                            <DataTable.Title textStyle={[tw`font-extrabold`]}>{t('project_screen.project_evolution')}</DataTable.Title>
                            <DataTable.Title>{null}</DataTable.Title>
                        </DataTable.Header>
                        {[1,2,3,4,5].map((item: number, index: number) => <Row status={data.status} value={item} selected={selected} setSelected={setSelected} />)}
                    </DataTable>
                </View>
                <View style={[ tw`bg-white border-t border-slate-200 justify-center px-5`, {height: 70} ]}>
                    <TouchableOpacity 
                        onPress={onHandle}
                        activeOpacity={0.5} 
                        style={[ tw`rounded-lg px-2 py-3 border`, {borderColor: CodeColor.code1} ]}>
                        <Text style={[tw`text-center text-white text-xl`, {fontFamily: 'YanoneKaffeesatz-Regular', color: CodeColor.code1}]}>{t('project_screen.save')}</Text>
                    </TouchableOpacity>
                </View>
            </Modal>

            <View style={[tw`flex-1`, { backgroundColor: '#ffffff' }]}>
                <ScrollView
                    refreshControl={
                        <RefreshControl
                            colors={refreshColor}
                            refreshing={refreshing}
                            onRefresh={onRefresh}
                        />
                    }
                >
                    <View style={[tw`py-4 px-3 text-base`]}>
                        <ParamItem title={t('project_screen.project_name')} description={cdc.nom} rightComponent={<AirbnbRating ratingContainerStyle={tw`self-start`} size={20} reviewSize={20} showRating={false} defaultRating={data.status} count={5} isDisabled />} containerStyle={tw`items-center`} />
                        <ParamItem title={t('project_screen.implementation_deadline')} description={cdc.nb_freq + ' ' + cdc.freq + '(s)'} />
                        <ParamItem title={t('project_screen.description')} description={cdc.description} />
                        {!isEmpty(cdc.existant) && (
                            <ParamItem title={t('project_screen.existing')} description={cdc.existant} />
                        )}
                        {!isEmpty(cdc.fonctionnalite) && (
                            <ParamItem title={t('project_screen.features')} description={cdc.fonctionnalite} />
                        )}
                        {!isEmpty(cdc.prototype) && (
                            <ParamItem title={t('project_screen.prototype')} description={cdc.prototype} />
                        )}
                        {/* @ts-ignore */}
                        <ParamItem title={t('project_screen.invoice_amount')} description={data.facture ? `${getCurrency(data.facture.mnt)} XOF` : '#'} />

                        {(!isEmpty(cdc.fichier_cdc_uploader) || !isEmpty(cdc.fichier_lien_util)) && (
                            <DataTable style={[tw`mb-4`]}>
                                <DataTable.Header style={[tw`bg-slate-200`]}>
                                    <DataTable.Title textStyle={[tw`font-extrabold`]}>{cdc.fichier_cdc_uploader ? t('project_screen.specifications') : t('project_screen.helpful_file')}</DataTable.Title>
                                    <DataTable.Title>{null}</DataTable.Title>
                                </DataTable.Header>
                                <DataTable.Row style={[tw`px-2`]}>
                                    <DataTable.Cell textStyle={[tw`text-left`, { lineHeight: 15 }]} style={tw`flex-5`}>{cdc.nom_fichier_cdc_uploader}</DataTable.Cell>
                                    <DataTable.Cell style={tw`flex-2 justify-end items-center`}>
                                        <TouchableOpacity
                                            onPress={() => downloadFile(`${baseUri}/assets/files/cdc/${cdc.fichier_cdc_uploader ? cdc.fichier_cdc_uploader : cdc.fichier_lien_util}`, cdc.nom_fichier_cdc_uploader)}>
                                            <Text style={[tw`text-cyan-500`, { lineHeight: 15 }]}>{t('project_screen.download')}</Text>
                                        </TouchableOpacity>
                                    </DataTable.Cell>
                                </DataTable.Row>
                            </DataTable>
                        )}

                        <DataTable style={[tw`mb-4`]}>
                            <DataTable.Header style={[tw`bg-slate-200`]}>
                                <DataTable.Title textStyle={[tw`font-extrabold`]}>{t('project_screen.other_files')}</DataTable.Title>
                                <DataTable.Title>{null}</DataTable.Title>
                            </DataTable.Header>
                            {!endFetch
                                ?
                                <DataTable.Row style={[tw`px-0`]}>
                                    <DataTable.Cell style={tw`justify-center`}>
                                        <ActivityIndicatorRNP color='silver' />
                                    </DataTable.Cell>
                                </DataTable.Row>
                                :
                                data.docs.length == 0
                                    ?
                                    <DataTable.Row style={[tw`px-0`]}>
                                        <DataTable.Cell style={tw`justify-center`}>
                                            {t('project_screen.no_files_found')}
                                        </DataTable.Cell>
                                    </DataTable.Row>
                                    :
                                    data.docs.map((item: any, index: number) => 
                                        renderItem(item, index)
                                    )
                            }
                        </DataTable>

                        {data.facture && (
                            // @ts-ignore
                            <BottomButton reverse navigation={navigation} route={'DashboadFacture'} params={{ facture: data.facture }} title={data.facture.valide != 1 ? t('project_screen.invoice') : t('project_screen.my_payments')} />
                        )}

                        {data.contrat && (
                            <BottomButton reverse navigation={navigation} route={'ContratView'} params={{ item: data.contrat }} title={t('project_screen.agreement')} />
                        )}

                    </View>
                </ScrollView>
            </View>
            
            <SpeedDial
                isOpen={open}
                icon={{ name: 'edit', color: '#fff' }}
                openIcon={{ name: 'close', color: '#fff' }}
                color={CodeColor.code1}
                onOpen={() => setOpen(!open)}
                onClose={() => setOpen(!open)}
            >
                {/* @ts-ignore */}
                <SpeedDial.Action
                    icon={{ type: 'material-community', name: 'file-sign', color: '#fff' }}
                    color={CodeColor.code1}
                    title={`${t('project_screen.state_of_progress')}`}
                    onPress={() => {
                        setOpen(false);
                        setVisible(true);
                    }}
                />
            </SpeedDial>
        </Base>
    )
}

const styles = StyleSheet.create({
    buttonReverse: {
        backgroundColor: CodeColor.code1
    },
    buttonUnreverse: {
        borderWidth: 1,
        borderColor: CodeColor.code1, 
        backgroundColor: '#fff'
    },
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

export default CdcScreen;