import React, { useEffect, useState } from "react";
import { SafeAreaView, ScrollView, StyleSheet, Text, View } from "react-native";
import { Card } from "react-native-paper";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebaseConfig"; // Firebase 설정 가져오기
import { useLocalSearchParams } from "expo-router"; // Expo Router에서 전달된 params 사용
import { getVideoUrl } from "@/lib/getVideoUrl";

export default function RatingDetail() {
  const { videoId } = useLocalSearchParams(); // videoId를 받아옴
  const [ratings, setRatings] = useState<Array<any>>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchRatings = async () => {
    try {
      const videoDocRef = doc(db, "videos", String(videoId)); // videoId를 문자열로 변환
      const videoDocSnapshot = await getDoc(videoDocRef);

      if (videoDocSnapshot.exists()) {
        const videoData = videoDocSnapshot.data();
        setRatings(videoData.ratings || []); // ratings 필드를 가져옴
      } else {
        setError("해당 비디오를 찾을 수 없습니다.");
      }
    } catch (error) {
      setError("데이터를 불러오는 중 오류가 발생했습니다.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRatings(); // videoId가 변경될 때마다 데이터 로드
    getVideoUrl("").then((D) => {
      console.log(d);
    });
  }, [videoId]);

  if (loading) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <Text>로딩 중...</Text>
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
    <SafeAreaView style={styles.container}>
      <ScrollView>
        {ratings.length === 0 ? (
          <Text style={styles.noRatingsText}>아직 평가가 없습니다.</Text>
        ) : (
          ratings.map((rating: any, index: number) => (
            <Card key={index} style={styles.card}>
              <Card.Content>
                <Text style={styles.title}>User ID: {rating.userId}</Text>
                <Text style={styles.subtitle}>
                  목소리 속도: {rating.voiceSpeed}
                </Text>
                <Text style={styles.subtitle}>자세 평가: {rating.posture}</Text>
                <Text style={styles.subtitle}>
                  맺음말 평가: {rating.endingEvaluation}
                </Text>
              </Card.Content>
            </Card>
          ))
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
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
  noRatingsText: {
    textAlign: "center",
    fontSize: 18,
    marginTop: 20,
  },
  card: {
    marginBottom: 15,
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
  },
  subtitle: {
    fontSize: 16,
    color: "#666",
  },
});
