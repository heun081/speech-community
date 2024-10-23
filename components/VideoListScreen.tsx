import React, { useEffect, useState } from "react";
import { FlatList, View, StyleSheet, Text } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { ActivityIndicator } from "react-native-paper";
import { VideoCard } from "@/components/VideoCard";
import { db } from "@/lib/firebaseConfig";
import { collection, getDocs } from "firebase/firestore";

interface Video {
  id: string;
  title: string;
  creatorId: string;
  videoUrl: string;
}

export default function VideoListScreen() {
  const [videos, setVideos] = useState<Video[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // 동영상 목록을 Firestore에서 가져오는 함수
  const fetchVideos = async () => {
    try {
      const querySnapshot = await getDocs(collection(db, "videos"));
      const videoData: Video[] = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as Video[];

      setVideos(videoData);
    } catch (err) {
      setError("데이터를 불러오는 중 오류가 발생했습니다.");
      console.error("Error fetching videos:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVideos();
  }, []);

  // 동영상 삭제 시 호출되는 함수
  const handleDelete = (id: string) => {
    setVideos((prevVideos) => prevVideos.filter((video) => video.id !== id));
  };

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

  return (
    <SafeAreaView style={styles.listContainer}>
      {videos.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>등록된 동영상이 없습니다.</Text>
        </View>
      ) : (
        <FlatList
          data={videos}
          renderItem={({ item }) => (
            <VideoCard item={item} onDelete={handleDelete} />
          )}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  listContainer: {
    flex: 1,
    padding: 20,
    backgroundColor: "#f5f5f5",
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
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  emptyText: {
    fontSize: 18,
    color: "#666",
  },
});
