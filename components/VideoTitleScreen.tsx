import { useAuth } from "@/hooks/useAuth";
import { db } from "@/lib/firebaseConfig";
import { useLocalSearchParams, useRouter } from "expo-router";
import { addDoc, collection } from "firebase/firestore";
import React, { useState } from "react";
import { Alert, Button, StyleSheet, TextInput, View } from "react-native";

export default function VideoTitleScreen() {
  const { videoUri } = useLocalSearchParams();

  const { user } = useAuth();

  const router = useRouter();

  const [title, setTitle] = useState<string>("");

  const handleSave = async () => {
    try {
      if (!user) {
        return Alert.alert("오류", "로그인이 필요합니다.");
      }

      await addDoc(collection(db, "videos"), {
        title: title,
        videoUrl: videoUri,
        creatorId: user.uid,
      });

      Alert.alert("성공", "영상 제목이 성공적으로 저장되었습니다!", [
        {
          text: "홈으로 이동",
          onPress: () => {
            router.push("/");
          },
        },
      ]);
    } catch (error) {
      console.error("영상 제목 저장 중 오류 발생:", error);

      return Alert.alert("오류", "영상 제목 저장에 실패했습니다.");
    }
  };

  return (
    <View style={styles.container}>
      <TextInput
        style={styles.input}
        placeholder="영상 제목을 입력하세요"
        value={title}
        onChangeText={setTitle}
      />
      <Button title="제목 저장" onPress={handleSave} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    padding: 20,
  },
  input: {
    marginBottom: 20,
    paddingHorizontal: 10,
    paddingVertical: 12,
    borderWidth: 1,
    borderRadius: 5,
    color: "skyblue",
  },
});
