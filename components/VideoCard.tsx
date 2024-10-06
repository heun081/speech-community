import { useAuth } from "@/hooks/useAuth";
import { db } from "@/lib/firebaseConfig";
import { getVideoUrl } from "@/lib/getVideoUrl";
import { Video } from "expo-av";
import { useRouter, useNavigation } from "expo-router";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import React, { useEffect, useRef, useState } from "react";
import { ActivityIndicator, StyleSheet, Text } from "react-native";
import { Button, Card } from "react-native-paper";
import { Rating } from "react-native-ratings";

interface VideoCardProps {
  item: any;
}

export const VideoCard: React.FC<VideoCardProps> = ({ item }) => {
  const { user } = useAuth();
  const router = useRouter(); // 라우터 훅 사용
  const navigation = useNavigation();

  const isFocused = navigation.isFocused();

  const [voiceSpeedRating, setVoiceSpeedRating] = useState<number>(3);
  const [postureRating, setPostureRating] = useState<number>(3);
  const [endingEvaluationRating, setEndingEvaluationRating] =
    useState<number>(3);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [loadingVideo, setLoadingVideo] = useState<boolean>(true);

  const videoRef = useRef<Video | null>(null);

  // 기존 평가 데이터를 가져와 UI에 미리 채워 넣기
  const fetchExistingRating = async (videoId: string) => {
    try {
      const videoDocRef = doc(db, "videos", videoId);
      const videoDocSnapshot = await getDoc(videoDocRef);

      if (videoDocSnapshot.exists()) {
        const videoData = videoDocSnapshot.data();
        const currentRatings = videoData.ratings || [];

        const existingRating = currentRatings.find(
          (rating: any) => rating.userId === user.uid
        );

        if (existingRating) {
          setVoiceSpeedRating(existingRating.voiceSpeed);
          setPostureRating(existingRating.posture);
          setEndingEvaluationRating(existingRating.endingEvaluation);
        }
      }
    } catch (error) {
      console.error("기존 평가 로딩 중 오류 발생:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const fetchVideoUrl = async () => {
      const url = await getVideoUrl(`${item.videoUrl}`);

      if (url) {
        setVideoUrl(url);
        console.log("Hello");
        console.log(url);
      }

      setLoadingVideo(false);
    };

    if (isFocused) {
      console.log("called");

      fetchVideoUrl();

      fetchExistingRating(item.id);

      if (videoRef.current) {
        videoRef.current.replayAsync().then(() => {
          videoRef.current?.stopAsync();
        });

        if (videoUrl) {
          videoRef.current?.loadAsync({ uri: videoUrl }).then(() => {});
        }
      }
    }
  }, [item.id, isFocused]);

  const handleRatingSave = async (videoId: string) => {
    try {
      const videoDocRef = doc(db, "videos", videoId);
      const videoDocSnapshot = await getDoc(videoDocRef);

      if (videoDocSnapshot.exists()) {
        const videoData = videoDocSnapshot.data();
        const currentRatings = videoData.ratings || [];

        // 이미 존재하는 사용자의 평가가 있는지 확인
        const existingRatingIndex = currentRatings.findIndex(
          (rating: any) => rating.userId === user.uid
        );

        if (existingRatingIndex >= 0) {
          // 이미 평가한 사용자가 있으면 해당 평가를 업데이트
          currentRatings[existingRatingIndex] = {
            userId: user.uid,
            voiceSpeed: voiceSpeedRating,
            posture: postureRating,
            endingEvaluation: endingEvaluationRating,
          };
        } else {
          // 새로운 평가 추가
          currentRatings.push({
            userId: user.uid,
            voiceSpeed: voiceSpeedRating,
            posture: postureRating,
            endingEvaluation: endingEvaluationRating,
          });
        }

        // Firestore에 업데이트
        await updateDoc(videoDocRef, { ratings: currentRatings });
        alert("별점이 성공적으로 저장되었습니다!");
      }
    } catch (error) {
      console.error("별점 저장 중 오류 발생:", error);
      alert("별점 저장에 실패했습니다.");
    }
  };

  if (isLoading) {
    return <Text>로딩 중...</Text>; // 로딩 상태 표시
  }

  return (
    <Card style={styles.card}>
      <Card.Content>
        <Text style={styles.title}>{item.title}</Text>
        <Text style={styles.subtitle}>UID: {item.creatorId}</Text>

        {/* 비디오 로딩 상태 처리 */}
        {loadingVideo ? (
          <ActivityIndicator size="large" color="#0000ff" />
        ) : (
          videoUrl && (
            <Video
              ref={videoRef}
              source={{
                uri: videoUrl,
              }}
              rate={1.0}
              volume={1.0}
              isMuted={false}
              resizeMode="cover"
              style={{ width: "100%", height: 600 }}
            />
          )
        )}

        <Button
          onPress={async () => {
            if (videoRef.current) {
              await videoRef.current?.playAsync();
              await videoRef.current?.replayAsync();
            }
          }}
        >
          실행
        </Button>

        {/* 목소리 속도 별점 */}
        <Text style={styles.ratingLabel}>목소리 속도</Text>
        <Rating
          showRating
          startingValue={voiceSpeedRating}
          onFinishRating={setVoiceSpeedRating}
          style={styles.rating}
        />

        {/* 자세 평가 별점 */}
        <Text style={styles.ratingLabel}>자세 평가</Text>
        <Rating
          showRating
          startingValue={postureRating}
          onFinishRating={setPostureRating}
          style={styles.rating}
        />

        {/* 맺음말 평가 별점 */}
        <Text style={styles.ratingLabel}>맺음말 평가</Text>
        <Rating
          showRating
          startingValue={endingEvaluationRating}
          onFinishRating={setEndingEvaluationRating}
          style={styles.rating}
        />

        {/* 평가 저장 버튼 */}
        <Button onPress={() => handleRatingSave(item.id)}>평가 저장</Button>

        {/* 디테일 페이지로 이동하는 버튼 */}
        <Button
          onPress={() => {
            router.push(`/video/${item.id}`);

            videoRef.current?.stopAsync();
          }} // Expo Router 사용하여 디테일 페이지로 이동
        >
          친구들 평가 보기
        </Button>
      </Card.Content>
    </Card>
  );
};

const styles = StyleSheet.create({
  card: {
    marginBottom: 15,
  },
  title: {
    fontSize: 22,
    fontWeight: "bold",
  },
  subtitle: {
    fontSize: 18,
    color: "#666",
  },
  ratingLabel: {
    fontSize: 20,
    marginTop: 10,
  },
  rating: {
    paddingVertical: 10,
  },
});
