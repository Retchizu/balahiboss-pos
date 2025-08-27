import { primary } from "@/theme/backgroundTheme";
import React from "react";
import { View, Text, StyleSheet, ScrollView, Image } from "react-native";
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from "react-native-responsive-screen";
import { SafeAreaView } from "react-native-safe-area-context";
const teamMembers = [
  {
    name: "Richmond Baltazar",
    role: "Software Engineer",
    company: "Hypepilot LLC (Austin, Texas - Remote)",
    contribution: `Richmond was responsible for the overall application flow, 
    making sure the architecture is scalable, maintainable, and efficient. 
    He implemented the core features, integrated APIs, and ensured the app’s 
    performance remains smooth across devices. Beyond development, Richmond 
    also collaborated closely with design to bring UI/UX concepts into working code.`,
    image: require("@/assets/riche.jpg"), // Replace with actual profile photo
  },
  {
    name: "Erlyn De Leon",
    role: "UI/UX Designer",
    company: "Media Salt (Australia - Remote)",
    contribution: `Erlyn designed the visual identity of the application, 
    focusing on usability and creating a clean, modern interface. 
    She planned the user experience flow, ensuring that each screen 
    and interaction feels intuitive. Her role bridged creativity and functionality, 
    providing design assets and collaborating with development for seamless execution.`,
    image: require("@/assets/erlyn.jpg"), // Replace with actual profile photo
  },
];

export default function AboutUs() {
  return (
    <SafeAreaView style={{flex:1, backgroundColor:primary}}>
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.title}>About Us</Text>
        {teamMembers.map((member, index) => (
          <View key={index} style={styles.card}>
            <Image source={member.image} style={styles.image} resizeMode="cover"/>
            <View style={styles.textContainer}>
              <Text style={styles.name}>{member.name}</Text>
              <Text style={styles.role}>{member.role}</Text>
              <Text style={styles.company}>{member.company}</Text>
              <Text style={styles.contribution}>{member.contribution}</Text>
            </View>
          </View>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: wp(5),
    alignItems: "center",
  },
  title: {
    fontSize: wp(8),
    fontFamily:"Gantari-Bold",
    marginBottom: 20,
    color: "#333",
  },
  card: {
    width: "100%",
    backgroundColor: "#fff",
    borderRadius: wp(3),
    padding: wp(4),
    marginBottom: hp(2),
    flexDirection: "row",
    alignItems: "flex-start",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  image: {
    width: wp(20),
    height: wp(20),
    borderRadius: wp(10),
    marginRight: 15,
    backgroundColor: "#ddd",
  },
  textContainer: {
    flex: 1,
  },
  name: {
    fontSize: wp(5),
    fontFamily: "Gantari-SemiBold",
    marginBottom: 4,
    color: "#222",
  },
  role: {
    fontSize: wp(4),
    fontFamily:"Gantari-Italic",
    color: "#666",
    marginBottom: 4,
  },
  company: {
    fontSize: wp(3.5),
    fontFamily:"Gantari-Regular",
    color: "#444",
    marginBottom: 8,
  },
  contribution: {
    fontSize: wp(3.5),
    fontFamily:"Gantari-Regular",
    color: "#555",
    lineHeight: 20,
  },
});
