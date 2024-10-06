import { db, storage } from "@/lib/firebaseConfig";
import { Video } from "expo-av";
import { collection, getDocs } from "firebase/firestore";
import { getDownloadURL, ref } from "firebase/storage";
import React, { useEffect, useRef, useState } from "react";
import { ActivityIndicator, FlatList, StyleSheet, Text } from "react-native";
import { Button, Card } from "react-native-paper";
import { SafeAreaView } from "react-native-safe-area-context";

export default function VideoList() {
  const [videos, setVideos] = useState<Array<any>>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const videoRef = useRef<Video | null>(null);

  const downloadNy = async (url: string) => {
    console.log("doc.videoUrl: " + url);
    const videoRef = ref(storage, url);
    const downloadURL = await getDownloadURL(videoRef);

    return downloadURL;
  };

  const fetchVideos = async () => {
    try {
      const querySnapshot = await getDocs(collection(db, "videos"));
      const videoData = querySnapshot.docs.map((doc) => {
        return {
          id: doc.id,
          ...doc.data(),
        };
      });

      setVideos(videoData);
    } catch (error) {
      setError("데이터를 불러오는 중 오류가 발생했습니다.");
      console.error("Error fetching videos:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVideos(); // 컴포넌트 마운트 시 데이터 가져오기
  }, []);

  if (loading) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#0000ff" />
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView style={styles.errorContainer}>
        <Text>{error}</Text>
      </SafeAreaView>
    );
  }

  const renderItem = ({ item }: { item: any }) => {
    return (
      <Card style={styles.card}>
        <Card.Content>
          <Text style={styles.title}>{item.title}</Text>
          <Text style={styles.subtitle}>UID: {item.creatorId}</Text>
          {/* 동영상 렌더링 */}
          <Video
            ref={videoRef}
            source={{
              uri: "https://firebasestorage.googleapis.com/v0/b/video-upload-8a7ee.appspot.com/o/videos%2Frof0t9NZuffRgEnptgp0JKWSEal2%2F1728196210601.mp4?alt=media&token=01c90595-8777-42bc-b6af-454cc121b4c3",
            }} // Firestore에서 가져온 videoUrl 사용
            rate={1.0}
            volume={1.0}
            isMuted={false}
            shouldPlay
            resizeMode="cover"
            style={{ width: "100%", height: 600 }} // 원하는 크기로 조정
          />
          <Button
            onPress={async () => {
              if (videoRef.current) {
                await videoRef.current?.playAsync();
                await videoRef.current?.replayAsync();
                console.log("good?");
              } else {
                console.log("bad");
              }
            }}
          >
            실행
          </Button>
        </Card.Content>
      </Card>
    );
  };

  return (
    <SafeAreaView style={styles.listContainer}>
      <FlatList
        data={videos}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  listContainer: {
    flex: 1,
    padding: 20,
  },
  card: {
    marginBottom: 15,
  },
  title: {
    fontSize: 18,
    fontWeight: "bold",
  },
  subtitle: {
    fontSize: 14,
    color: "#666",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  listContent: {
    paddingBottom: 20,
  },
});
