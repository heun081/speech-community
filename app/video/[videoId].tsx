import { db } from "@/lib/firebaseConfig";
import { useLocalSearchParams } from "expo-router";
import { doc, getDoc } from "firebase/firestore";
import React, { useEffect, useState } from "react";
import { SafeAreaView, ScrollView, StyleSheet, Text } from "react-native";
import { Card } from "react-native-paper";

export default function RatingDetail() {
  const { videoId } = useLocalSearchParams();

  const [ratings, setRatings] = useState<Array<any>>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchRatings = async () => {
    try {
      const videoDocRef = doc(db, "videos", String(videoId));
      const videoDocSnapshot = await getDoc(videoDocRef);

      if (videoDocSnapshot.exists()) {
        const videoData = videoDocSnapshot.data();

        setRatings(videoData.ratings || []);
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
