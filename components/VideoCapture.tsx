import { storage } from "@/lib/firebaseConfig";
import { CameraView, useCameraPermissions } from "expo-camera";
import { getDownloadURL, ref, uploadBytesResumable } from "firebase/storage";
import { useRef } from "react";
import {
  Button,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

export default function App() {
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
    console.log("started");

    try {
      const data = await cameraViewRef.current?.recordAsync({ maxDuration: 5 });

      console.log(data);

      uploadVideo(data?.uri);
    } catch (err) {
      console.error(err);
    }
  }

  async function stop() {
    cameraViewRef.current?.stopRecording();
    console.log("stopped");
  }

  const uploadVideo = async (videoUri: string) => {
    const extension = Platform.OS === "ios" ? "mov" : "mp4";

    if (!videoUri) return;

    try {
      // Firebase Storage에 저장할 파일 경로 설정
      // iOS 확장자: .mov
      // Android 확장자: .mp4

      const storageRef = ref(storage, `videos/${Date.now()}.${extension}`);
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
