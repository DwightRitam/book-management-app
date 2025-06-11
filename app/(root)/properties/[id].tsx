import {
  FlatList,
  Image,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
  Dimensions,
  Platform,
  Alert,
  Linking,
  Button,
} from "react-native";
import AsyncStorage from '@react-native-async-storage/async-storage';
import { router, useLocalSearchParams } from "expo-router";
import Ionicons from '@react-native-vector-icons/ionicons';

import icons from "@/constants/icons";
import images from "@/constants/images";
import { facilities } from "@/constants/data";

import { useAppwrite } from "@/lib/useAppwrite";
import { getPropertyById } from "@/lib/appwrite";
import Comment from "@/components/Comment";
import { useCallback, useEffect, useState } from "react";
import { isLoading } from "expo-font";

const Property = () => {
  const { id } = useLocalSearchParams<{ id?: string }>();
  const [loading,isLoading] =useState<boolean>(true);
  const windowHeight = Dimensions.get("window").height;

  const { data: property } = useAppwrite({
    fn: getPropertyById,
    params: {
      id: id!,
    },
  }
);

  // console.log(property);
  
  const [bookmark,setBookmark]=useState<boolean>(false);

  const saveBookmark = async(itemId : string) => {
    // console.log(itemId);
    alert(`${property?.name} saved`)
    setBookmark(true);
    await AsyncStorage.getItem('bookmark').then((token)=>{
      const res=JSON.parse(token);
      if(res!==null)
      {
        let data=res.find((val:string)=>val=== itemId);
        if(data == null)
          {
            res.push(itemId);
            AsyncStorage.setItem('bookmark', JSON.stringify(res));
            alert(`${property?.name} saved`);
          } 
      }
      else{
        let bookmark=[];
        bookmark.push(itemId);
        AsyncStorage.setItem('bookmark', JSON.stringify(bookmark));
        alert(`${property?.name} saved!!!`);
      }
    })
  };

  const removeBookmark =async(itemId : string) =>{
    setBookmark(false);
      const bookmark= await AsyncStorage.getItem('bookmark').then((token)=>{
        const res=JSON.parse(token);
        return res.filter((id:string)=> id !== itemId)
      });
      await  AsyncStorage.setItem('bookmark', JSON.stringify(bookmark));
      alert(`${property?.name} unsaved!!!`);

  }

  

  const renderBookmark =async(itemId : string) =>{
    // setBookmark(false);
      await AsyncStorage.getItem('bookmark').then((token)=>{
        const res=JSON.parse(token);
        if(res!=null)
        {
          let data= res.find((val:string)=>val=== itemId);
          data==null ? setBookmark(false) : setBookmark(true);
          // console.log(data);
          
        }
      });
  }

  renderBookmark(property?.$id);

    const supportedURL = `${property?.link}`
    
    const unsupportedURL = 'slack://open?team=123456';
    
    type OpenURLButtonProps = {
      url: string;
      children: string;
    };
    
    const OpenURLButton = ({url, children}: OpenURLButtonProps) => {
      const handlePress = useCallback(async () => {
        // Checking if the link is supported for links with custom URL scheme.
        const supported = await Linking.canOpenURL(url);
    
        if (supported) {
          // Opening the link with some app, if the URL scheme is "http" the web link should be opened
          // by some browser in the mobile
          await Linking.openURL(url);
        } else {
          Alert.alert(`Don't know how to open this URL: ${url}`);
        }
      }, [url]);
    
      return <Button title={children} onPress={handlePress} />;
    };
    
  return (
    <View>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerClassName="pb-32 bg-white"
      >
        <View className="relative w-full" style={{ height: windowHeight / 2 }}>
          <Image
            source={{ uri: property?.image }}
            className="size-full"
            resizeMode="cover"
          />
          <Image
            source={images.whiteGradient}
            className="absolute top-0 w-full z-40"
          />

          <View
            className="z-50 absolute inset-x-7"
            style={{
              top: Platform.OS === "ios" ? 70 : 20,
            }}
          >
            <View className="flex flex-row items-center w-full justify-between">
              <TouchableOpacity
                onPress={() => router.back()}
                className="flex flex-row bg-primary-200 rounded-full size-11 items-center justify-center"
              >
                <Image source={icons.backArrow} className="size-5" />
              </TouchableOpacity>

              <View
                className="flex flex-row items-center gap-3">
                <TouchableOpacity
                onPress={()=> bookmark? removeBookmark(property?.$id): saveBookmark(property?.$id)}
                className="flex flex-row bg-primary-200 rounded-full size-11 items-center justify-center"
              >
                <Ionicons name={bookmark ? "heart" : "heart-outline"} color={bookmark ? "red": "#333"} size={22}/>
              </TouchableOpacity>
              </View>
            </View>
          </View>
        </View>

        <View className="px-5 mt-7 flex gap-2">
          <Text className="text-2xl font-rubik-extrabold">
            {property?.name}
          </Text>

          <View className="flex flex-row items-center gap-3">
            <View className="flex flex-row items-center px-4 py-2 bg-primary-100 rounded-full">
              <Text className="text-xs font-rubik-bold text-primary-300">
                {property?.type}
              </Text>
            </View>

            <View className="flex flex-row items-center gap-2">
              <Image source={icons.star} className="size-5" />
              <Text className="text-black-200 text-sm mt-1 font-rubik-medium">
                {property?.rating} 
              </Text>
            </View>
          </View>

         

          <View className="w-full border-t border-primary-200 pt-7 mt-5">
            <Text className="text-black-300 text-xl font-rubik-bold">
              Author
            </Text>

            <View className="flex flex-row items-center justify-between mt-4">
              <View className="flex flex-row items-center">
                <Image
                  source={{ uri: property?.agent.avatar }}
                  className="size-14 rounded-full"
                />

                <View className="flex flex-col items-start justify-center ml-3">
                  <Text className="text-lg text-black-300 text-start font-rubik-bold">
                  {property?.author}
                  </Text>
                  {/* <Text className="text-sm text-black-200 text-start font-rubik-medium">
                    {property?.agent.email}
                  </Text> */}
                </View>
              </View>

              <View className="flex flex-row items-center gap-3">
                <Image source={icons.chat} className="size-7" />
                <Image source={icons.phone} className="size-7" />
              </View>
            </View>
          </View>

          <View className="mt-7">
            <Text className="text-black-300 text-xl font-rubik-bold">
              Overview
            </Text>
            <Text className="text-black-200 text-base font-rubik mt-2">
              {property?.description}
            </Text>
          </View>

          <View className="mt-7">
            <Text className="text-black-300 text-xl font-rubik-bold">
              Book Publisher
            </Text>
            
            <Text className="text-black-200 text-[2rem] uppercase font-serif">
             {property?.publisher}
            </Text>
           
          </View>

        
          <View className="mt-7">
            <Text className="text-black-300 text-xl font-rubik-bold">
              Author's description ({property?.author})
            </Text>
            <View className="flex flex-row items-center justify-start mt-4 gap-2">
              {/* <Image source={icons.location} className="w-7 h-7" /> */}
              <Text className="text-black-200 text-[1.2rem] font-serif">
                {property?.Authors_description}
              </Text>
            </View>
          </View>
        </View>
      </ScrollView>

      <View className="absolute bg-white bottom-0 w-full rounded-t-2xl border-t border-r border-l border-primary-200 p-7">
        <View className="flex flex-row items-center justify-between gap-10">
          <View className="flex flex-col items-start">
            <Text className="text-black-200 text-xs font-rubik-medium">
              Price
            </Text>
            <Text
              numberOfLines={1}
              className="text-primary-300 text-start text-2xl font-rubik-bold"
            >
              ₹{property?.price}
            </Text>
          </View>

          <View className="container flex-1 justify-center align-middle  rounded-xl" >
           <OpenURLButton url={supportedURL}>book now</OpenURLButton>
       </View>
        </View>
      </View>
    </View>
  );
};

export default Property;