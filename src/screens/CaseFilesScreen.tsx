import { useLocalSearchParams } from "expo-router";
import { View, Text } from "react-native";
export function CaseFilesScreen(){const params=useLocalSearchParams();return <View style={{flex:1,backgroundColor:"#0B0D10",padding:20}}><Text style={{color:"#F4F5F7",fontSize:26}}>CaseFiles</Text><Text style={{color:"#9AA3AF",marginTop:8}}>{JSON.stringify(params)}</Text></View>}
