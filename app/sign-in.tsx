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

  const navigateToSignUp = () => {
    router.push("/sign-up");
  };

  return (
    <View style={styles.container}>
      <Text variant="headlineMedium" style={styles.title}>
        로그인
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
      <Button mode="contained" onPress={handleSignIn} style={styles.button}>
        로그인
      </Button>
      <Button
        mode="text"
        onPress={navigateToSignUp}
        style={styles.signUpButton}
      >
        계정이 없으신가요? 회원가입
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
  signUpButton: {
    marginTop: 10,
    textAlign: "center",
  },
  errorText: {
    color: "red",
    marginTop: 10,
  },
});
