import { useAuth } from "@/hooks/useAuth";
import { storage } from "@/lib/firebaseConfig";
import {
  CameraView,
  useCameraPermissions,
  useMicrophonePermissions,
} from "expo-camera";
import { router } from "expo-router";
import { getDownloadURL, ref, uploadBytesResumable } from "firebase/storage";
import { useEffect, useRef } from "react";
import {
  Alert,
  Button,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

export default function VideoCapture() {
  const { user } = useAuth();

  const [cameraPermission, requestCameraPermission] = useCameraPermissions();
  const [microphonePermission, requestMicrophonePermission] =
    useMicrophonePermissions();

  const cameraViewRef = useRef<CameraView | null>(null);

  // 초기 권한 요청
  useEffect(() => {
    requestMicrophonePermission();
  }, []);

  console.log("cameraPermission" + cameraPermission?.granted);
  console.log("microphonePermission" + microphonePermission?.granted);

  if (!cameraPermission || microphonePermission === null) {
    return <View />;
  }

  if (!cameraPermission.granted || !microphonePermission.granted) {
    return (
      <View style={styles.container}>
        <Text style={styles.message}>
          카메라 및 오디오 녹음 권한이 필요합니다.
        </Text>
        <Button onPress={requestCameraPermission} title="카메라 권한 요청" />
        <Button
          onPress={requestMicrophonePermission}
          title="오디오 권한 요청"
        />
      </View>
    );
  }

  async function start() {
    Alert.alert("", "30초 동안 동영상 촬영을 시작합니다.", [
      {
        text: "시작",
        onPress: async () => {
          try {
            console.log(cameraViewRef.current);
            const data = await cameraViewRef.current?.recordAsync({
              maxDuration: Platform.OS === "android" ? 3000000 : 30,
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

          return downloadURL;
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
