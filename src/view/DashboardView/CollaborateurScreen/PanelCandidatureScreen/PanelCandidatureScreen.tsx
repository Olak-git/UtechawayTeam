import React, { Children, useEffect, useRef, useState } from 'react';
import { Alert, Button, Dimensions, Image, ImageBackground, Keyboard, Pressable, RefreshControl, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { Colors } from 'react-native/Libraries/NewAppScreen';
import Base from '../../../../components/Base';
import tw from 'twrnc';
import { useDispatch, useSelector } from 'react-redux';
import { DashboardHeaderSimple } from '../../../../components/DashboardHeaderSimple';
import { account, baseUri, componentPaddingHeader, downloadFile, fetchUri, headers, toast, validateEmail, validatePhoneNumber } from '../../../../functions/functions';
import { ActivityLoading } from '../../../../components/ActivityLoading';
import InputForm from '../../../../components/InputForm';
import InputForm2 from '../../../../components/InputForm2';
import { ModalValidationForm } from '../../../../components/ModalValidationForm';
import IconSocial from '../../../../components/IconSocial';
import FilePicker, { types } from  'react-native-document-picker';
import { RNFetchBlob } from 'rn-fetch-blob';
import { CommonActions } from '@react-navigation/native';
import { clone, refreshColor } from '../../../../functions/helperFunction';
import { CodeColor } from '../../../../assets/style';
import  { default as HeaderP } from '../../../../components/Header';
import { Icon } from '@rneui/base';
import { Picker } from '@react-native-picker/picker';
import { Divider } from '@rneui/base';
import { refreshHistoriqueCandidatures } from '../../../../feature/refresh.slice';
import '../../../../data/i18n';
import { useTranslation } from 'react-i18next';

const window = Dimensions.get('window');
const screen = Dimensions.get('screen');

interface PanelCandidatureScreenProps {
    navigation?: any,
    route?: any
}
const PanelCandidatureScreen: React.FC<PanelCandidatureScreenProps> = (props) => {

    const { t } = useTranslation();

    const {navigation, route} = props

    const dispatch = useDispatch();

    const user = useSelector((state: any) => state.user.data);

    const {candidature} = route.params;

    const pickerRef = useRef(null);

    const [endFetch, setEndFetch] = useState(false)

    const [showModal, setShowModal] = useState(false)

    const [offres, setOffres] = useState([]);

    const [inputs, setInputs] = useState({
        offre: null,
        cv: {},
        lettre_motivation: {},
    })

    // @ts-ignore
    const lettre_motivation_name = Object.keys(inputs.lettre_motivation).length !== 0 ? inputs.lettre_motivation.name : '';

    // @ts-ignore
    const cv_name = Object.keys(inputs.cv).length !== 0 ? inputs.cv.name : '';

    const [errors, setErrors] = useState({
        offre: null,
        cv: null,
        lettre_motivation: null
    });

    const [selectedItem, setSelectedItem] = useState(0);

    const [refreshing, setRefreshing] = useState(false);

    const handleOnChange = (input: string, text?: any) => {
        setInputs(prevState => ({...prevState, [input]: text}))
    }

    const handleError = (input: string, errorMessage: any) => {
        setErrors(prevState => ({...prevState, [input]: errorMessage}))
    }

    const open = () => {
        // @ts-ignore
        pickerRef?.current?.focus();
    }
      
    const close = () => {
        // @ts-ignore
        pickerRef?.current?.blur();
    }

    const onSubmit = () => {
        Keyboard.dismiss()
        let valid = true;

        if(!inputs.offre) {
            handleError('offre', t('add_application_screen.is_required'))
            valid = false
        } else {
            handleError('offre', null)
        }

        if(!candidature) {
            if(Object.keys(inputs.cv).length == 0) {
                handleError('cv', t('add_application_screen.is_required'))
                valid = false
            } else {
                handleError('cv', null)
            }

            if(Object.keys(inputs.lettre_motivation).length == 0) {
                handleError('lettre_motivation', t('add_application_screen.is_required'))
                valid = false
            } else {
                handleError('lettre_motivation', null)
            }
        }

        if(!valid) {
            console.error('Erreur validation.')
            console.log('errors:', errors)
        } else {
            setShowModal(true)
            const formData = new FormData()
            formData.append('js', null);
            formData.append('csrf', null);
            if(candidature) {
                formData.append('edit-candidature', null);
            } else {
                formData.append('new-candidature', null);
            }
            formData.append('token', user.slug);
            formData.append(`offre_candidature`, inputs.offre);
            if(candidature) {
                formData.append('candidature', candidature.slug);
                if(Object.keys(inputs.cv).length !== 0) {
                    formData.append(`cv`, inputs.cv);
                }
                if(Object.keys(inputs.lettre_motivation).length !== 0) {
                    formData.append(`lettre_motivation`, inputs.lettre_motivation);
                }
            } else {
                formData.append(`cv`, inputs.cv);
                formData.append(`lettre_motivation`, inputs.lettre_motivation);
            }
            console.log('FormData => ', formData);
            fetch(fetchUri, {
                method: 'POST',
                body: formData,
                headers: {
                    'Accept': 'application/json',
                    'content-type': 'multipart/form-data'
                }
            })
            .then(response => response.json())
            .then(json => {
                setShowModal(false);
                if(json.success) {
                    // const user = json.user;
                    // let image = user.image;
                    // const data = clone(user);
                    // if(data.image) {
                    //     data.image = `${baseUri}/assets/avatars/${image}`;
                    // }
                    // dispatch(setUser({...data}));
                    dispatch(refreshHistoriqueCandidatures());
                    toast('success', candidature ? t('add_application_screen.msg_appl_success_edit') : t('add_application_screen.msg_appl_success_sent'), 'Notification', true)
                } else {
                    const errors = json.errors
                    console.log('Errors: ', errors);
                    for(let k in errors) {
                        handleError(k, errors[k]);
                    }
                }
            })
            .catch(e => {
                setShowModal(false)
                console.warn(e)
            })
        }
    }

    const handleFilePicker = async (file: string) => {
        try {
            const _types = file == 'cv' ? types.pdf : [types.pdf, types.doc, types.docx]
            const response = await FilePicker.pick({
                presentationStyle: 'fullScreen',
                type: types.pdf,
                allowMultiSelection: false
            })
            // console.log('ResponseFilePicker: ', response)
            setInputs((prevState) => ({ ...prevState, [file]: response[0] }))
        } catch(err) {
            console.log(err)
        }
    }

    const getOffres = () => {
        const formData = new FormData()
        formData.append('js', null)
        formData.append('offres', null)
        formData.append('token', user.slug)
        fetch(fetchUri, {
            method: 'POST',
            body: formData,
            headers: {}
        })
        .then(response => response.json())
        .then(async json => {
            if(json.success) {
                if(json.offres.length !== 0) {
                    if(candidature) {
                        for (let index = 0; index < json.offres.length; index++) {
                            if(candidature.offre_candidature_id == json.offres[index].id) {
                                setSelectedItem(index);
                                handleOnChange('offre', json.offres[index].id);
                            }
                        }
                    } else {
                        handleOnChange('offre', json.offres[0].id);
                    }
                }
                setOffres(json.offres);
            } else {
                console.warn(json.errors);
            }
            setEndFetch(true);
            setRefreshing(false);
        })
        .catch(e => {
            console.warn(e)
        })
    }

    const onRefresh = () => {
        setRefreshing(true);
        getOffres();
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
        if(Object.keys(user).length == 0) {
            goHome();
        } else {
            getOffres();
        }
    }, [user])

    return (
        <Base>
            <ModalValidationForm showM={showModal} />
            <HeaderP
                elevated={true}
                backgroundColor={CodeColor.code1}
                containerStyle={{ paddingTop: componentPaddingHeader }}
                leftComponent={
                    <DashboardHeaderSimple navigation={navigation} title={`${t('add_application_screen.screen_title')}`} />
                }
            />
            {endFetch
            ?
                <>
                    <View style={[tw`flex-1 mt-5`, { backgroundColor: '#ffffff' }]}>
                        <ScrollView
                            refreshControl={
                                <RefreshControl
                                    colors={refreshColor}
                                    refreshing={refreshing}
                                    onRefresh={onRefresh} />
                            }
                        >
                            <Text style={[tw`text-black text-2xl text-center`, { fontFamily: 'YanoneKaffeesatz-Regular' }]}>
                                {candidature
                                    ? t('add_application_screen.edit_your_application')
                                    : t('add_application_screen.apply_available_offers')
                                }
                            </Text>
                            <View style={tw`px-5 mt-2`}>
                                <Divider orientation='vertical' />
                            </View>

                            <View style={[tw`py-4 px-3 text-base`]}>
                                <View style={[tw``, {}]}>
                                    <View style={[tw`px-5`, {}]}>

                                        <View style={tw`mb-6`}>
                                            <Text style={{ marginBottom: 2, fontSize: 14, color: Colors.dark }}>{t('add_application_screen.choose_an_offer')}</Text>
                                            <View style={[tw`flex-row items-center border rounded-md`, { borderColor: '#cccccc' }]}>
                                                <Picker
                                                    // selectedValue={setSelectedItem}
                                                    selectedValue={inputs.offre}
                                                    onValueChange={(itemValue, itemIndex) => {
                                                        console.log('itemValue: ', itemValue)
                                                        console.log('itemIndex: ', itemIndex)
                                                        setSelectedItem(itemIndex)
                                                        handleOnChange('offre', itemValue)
                                                    }}
                                                    style={tw`flex-1 text-black`}
                                                >
                                                    {offres.map((item, index) =>
                                                        // @ts-ignore
                                                        <Picker.Item key={index.toString()} label={item.intituler} value={item.id} />
                                                    )}
                                                </Picker>
                                                {/* <Icon type='entypo' name='chevron-down' style={tw`mx-1`} /> */}
                                            </View>
                                            {inputs.offre && (
                                                <View style={tw`flex-row mt-2`}>
                                                    <Icon type='entypo' name='info-with-circle' containerStyle={tw`mr-2`} />
                                                    {/* @ts-ignore */}
                                                    <Text style={tw`text-black flex-1`}>{offres[selectedItem].caracteristique}</Text>
                                                </View>
                                            )}
                                            {errors.offre && (
                                                <Text style={[tw`text-orange-700 text-sm`]}>{errors.offre}</Text>
                                            )}
                                        </View>

                                        <InputForm2
                                            label={`${t('add_application_screen.add_your_resume')}`}
                                            placeholder={`${t('add_application_screen.no_file_chosen')}`}
                                            formColor='#ccc'
                                            // className='mb-5'
                                            // helper='Poids (2M maximum)'
                                            constructHelper={
                                                candidature
                                                    ?   <>
                                                            <Text style={[tw`text-black`]}>{t('add_application_screen.weight_max')}</Text>
                                                            <TouchableOpacity onPress={() => downloadFile(baseUri + '/assets/files/cv/' + candidature.cv, `${t('add_application_screen.resume')}`)}>
                                                                <Text style={[tw`text-blue-500`]}>{t('add_application_screen.upload_your_resume')}</Text>
                                                            </TouchableOpacity>
                                                        </>
                                                    : <Text style={[tw`text-black`]}>{t('add_application_screen.weight_max')}</Text>
                                            }
                                            // @ts-ignore
                                            error={errors.cv}
                                            editable={false}
                                            // @ts-ignore
                                            value={cv_name}
                                            rightContent={
                                                <Pressable onPress={() => handleFilePicker('cv')} style={[tw`ml-1`]}>
                                                    <Icon type='ionicon' name='cloud-upload' color={'gray'} size={30} />
                                                </Pressable>
                                            } 
                                        />

                                        <InputForm2
                                            label={`${t('add_application_screen.cover_letter')}`}
                                            placeholder={`${t('add_application_screen.no_file_chosen')}`}
                                            formColor='#ccc'
                                            // helper='Poids (2M maximum)'
                                            constructHelper={
                                                candidature
                                                    ?   <>
                                                            <Text style={[tw`text-black`]}>{`${t('add_application_screen.weight_max')}`}</Text>
                                                            <TouchableOpacity onPress={() => downloadFile(baseUri + '/assets/files/lm/' + candidature.lettre_motivation, 'lettre de motivation')}>
                                                                <Text style={[tw`text-blue-500`]}>{t('add_application_screen.upload_your_m_letter')}</Text>
                                                            </TouchableOpacity>
                                                        </>
                                                    : <Text style={[tw`text-black`]}>{`${t('add_application_screen.weight_max')}`}</Text>
                                            }
                                            // @ts-ignore
                                            error={errors.lettre_motivation}
                                            editable={false}
                                            // @ts-ignore
                                            value={lettre_motivation_name}
                                            rightContent={
                                                <Pressable onPress={() => handleFilePicker('lettre_motivation')} style={[tw`ml-1`]}>
                                                    <Icon type='ionicon' name='cloud-upload' color={'gray'} size={30} />
                                                </Pressable>
                                            } 
                                        />
                                    </View>

                                    <View style={[tw`justify-center px-5 mt-5`]}>
                                        <TouchableOpacity
                                            onPress={onSubmit}
                                            activeOpacity={0.5}
                                            style={[tw`rounded-lg px-2 py-3 border`, { borderColor: CodeColor.code1 }]}>
                                            <Text style={[tw`text-center text-white text-xl`, { fontFamily: 'YanoneKaffeesatz-Regular', color: CodeColor.code1 }]}>{`${t('add_application_screen.validate')}`}</Text>
                                        </TouchableOpacity>
                                    </View>

                                </View>
                            </View>
                        </ScrollView>
                    </View>
                </>
                : <ActivityLoading />
            }
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

export default PanelCandidatureScreen;