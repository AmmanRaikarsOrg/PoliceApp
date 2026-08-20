import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
export default function RootLayout(){return <><StatusBar style="light"/><Stack screenOptions={{headerStyle:{backgroundColor:"#0B0D10"},headerTintColor:"#F4F5F7",contentStyle:{backgroundColor:"#0B0D10"}}}/></>}
