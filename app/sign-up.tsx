import { useAuth } from "@/hooks/useAuth";
import { auth } from "@/lib/firebaseConfig";
import { router } from "expo-router";
import { createUserWithEmailAndPassword } from "firebase/auth";
import React, { useEffect, useState } from "react";
import { StyleSheet, View } from "react-native";
import { Button, Text, TextInput } from "react-native-paper";

export default function SignUp() {
  const { user } = useAuth();

  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [error, setError] = useState<string | null>(null);

  const handleSignUp = () => {
    createUserWithEmailAndPassword(auth, email, password)
      .then(() => {
        console.log("사용자 회원가입 성공");
        setError(null);
      })
      .catch((error) => {
        setError(error.message);
      });
  };

  useEffect(() => {
    if (user) {
      console.log(user);

      router.replace("/(tabs)/");
    }
  }, [user]);

  const navigateToSignIn = () => {
    router.push("/sign-in");
  };

  return (
    <View style={styles.container}>
      <Text variant="headlineMedium" style={styles.title}>
        회원가입
      </Text>
      <TextInput
        label="이메일"
        value={email}
        onChangeText={setEmail}
        style={styles.input}
        mode="outlined"
        keyboardType="email-address"
        autoCapitalize="none"
      />
      <TextInput
        label="비밀번호"
        value={password}
        onChangeText={setPassword}
        style={styles.input}
        mode="outlined"
        secureTextEntry
      />
      {error && <Text style={styles.errorText}>{error}</Text>}
      <Button mode="contained" onPress={handleSignUp} style={styles.button}>
        회원가입
      </Button>
      <Button
        mode="text"
        onPress={navigateToSignIn}
        style={styles.signInButton}
      >
        이미 계정이 있으신가요? 로그인
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
  signInButton: {
    marginTop: 10,
    textAlign: "center",
  },
  errorText: {
    color: "red",
    marginTop: 10,
  },
});
