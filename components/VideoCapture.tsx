import { storage } from "@/lib/firebaseConfig";
import { CameraView, useCameraPermissions } from "expo-camera";
import { router } from "expo-router";
import { getDownloadURL, ref, uploadBytesResumable } from "firebase/storage";
import { useRef } from "react";
import {
  Alert,
  Button,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useAuth } from "../hooks/useAuth";

export default function VideoCapture() {
  const { user } = useAuth();

  const [permission, requestPermission] = useCameraPermissions();

  const cameraViewRef = useRef<CameraView | null>(null);

  if (!permission) {
    return <View />;
  }

  if (!permission.granted) {
    return (
      <View style={styles.container}>
        <Text style={styles.message}>
          We need your permission to show the camera
        </Text>
        <Button onPress={requestPermission} title="grant permission" />
      </View>
    );
  }

  async function start() {
    Alert.alert("", "30초 동안 동영상 촬영을 시작합니다.", [
      {
        text: "시작",
        onPress: async () => {
          try {
            const data = await cameraViewRef.current?.recordAsync({
              maxDuration: 30,
            });

            console.log(data);

            uploadVideo(data?.uri);
          } catch (err) {
            console.error(err);
          }
        },
      },
    ]);
  }

  async function stop() {
    cameraViewRef.current?.stopRecording();

    Alert.alert("완료", "촬영이 완료 되었습니다. 잠시만 기다려 주세요.");
  }

  const uploadVideo = async (videoUri: string) => {
    const extension = Platform.OS === "ios" ? "mov" : "mp4";

    if (!videoUri) return;

    try {
      // Firebase Storage에 저장할 파일 경로 설정
      // iOS 확장자: .mov
      // Android 확장자: .mp4

      const storageRef = ref(
        storage,
        `videos/${user?.uid}/${Date.now()}.${extension}`
      );
      const blob = await (await fetch(videoUri)).blob();

      // Firebase Storage에 파일 업로드
      const uploadTask = uploadBytesResumable(storageRef, blob);

      // 업로드 진행 상태 확인
      uploadTask.on(
        "state_changed",
        (snapshot) => {
          const progress =
            (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
          console.log(`Upload is ${progress}% done`);
        },
        (error) => {
          console.error("Upload failed: ", error);
        },
        async () => {
          const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);

          console.log("File available at", downloadURL);

          Alert.alert("완료", "업로드가 완료 되었습니다.", [
            {
              text: "저장 페이지로 이동",
              onPress: () => {
                router.push({
                  pathname: "/video-title",
                  params: { videoUri: downloadURL },
                });
              },
            },
          ]);

          console.log(user?.uid);

          return downloadURL; // 업로드 완료 후 다운로드 URL 반환
        }
      );
    } catch (error) {
      console.error("VideoCapture.tsx: ", error);
    }
  };

  return (
    <View style={styles.container}>
      <CameraView
        style={styles.camera}
        facing={"front"}
        videoQuality="1080p"
        flash="on"
        ref={cameraViewRef}
        mode="video"
      >
        <View style={styles.buttonContainer}>
          <TouchableOpacity style={styles.button} onPress={start}>
            <Text style={styles.text}>Start</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.button} onPress={stop}>
            <Text style={styles.text}>Stop</Text>
          </TouchableOpacity>
        </View>
      </CameraView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
  },
  message: {
    textAlign: "center",
    paddingBottom: 10,
  },
  camera: {
    flex: 1,
  },
  buttonContainer: {
    flex: 1,
    flexDirection: "row",
    backgroundColor: "transparent",
    margin: 64,
  },
  button: {
    flex: 1,
    alignSelf: "flex-end",
    alignItems: "center",
  },
  text: {
    fontSize: 24,
    fontWeight: "bold",
    color: "white",
  },
});
