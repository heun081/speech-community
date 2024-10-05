import { useAuth } from "@/hooks/useAuth";
import { auth } from "@/lib/firebaseConfig";
import { router } from "expo-router";
import { signInWithEmailAndPassword } from "firebase/auth";
import React, { useEffect, useState } from "react";
import { StyleSheet, View } from "react-native";
import { Button, Text, TextInput } from "react-native-paper";

export default function SignIn() {
  const { user } = useAuth();

  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [error, setError] = useState<string | null>(null);

  const handleSignIn = () => {
    signInWithEmailAndPassword(auth, email, password)
      .then(() => {
        console.log("User signed in successfully");

        setError(null); // 에러 메시지 초기화
      })
      .catch((error) => {
        setError(error.message);
      });
  };

  useEffect(() => {
    if (user) {
      router.replace("/(tabs)/");
    }
  }, [user]);

  return (
    <View style={styles.container}>
      <Text variant="headlineMedium" style={styles.title}>
        Sign In
      </Text>
      <TextInput
        label="Email"
        value={email}
        onChangeText={setEmail}
        style={styles.input}
        mode="outlined"
        keyboardType="email-address"
        autoCapitalize="none"
      />
      <TextInput
        label="Password"
        value={password}
        onChangeText={setPassword}
        style={styles.input}
        mode="outlined"
        secureTextEntry
      />
      {error && <Text style={styles.errorText}>{error}</Text>}
      <Button mode="contained" onPress={handleSignIn} style={styles.button}>
        Sign In
      </Button>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    padding: 20,
  },
  title: {
    marginBottom: 20,
    textAlign: "center",
  },
  input: {
    marginBottom: 10,
  },
  button: {
    marginTop: 20,
  },
  errorText: {
    color: "red",
    marginTop: 10,
  },
});
