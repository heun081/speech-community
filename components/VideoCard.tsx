import { useAuth } from "@/hooks/useAuth";
import { db } from "@/lib/firebaseConfig";
import { getVideoUrl } from "@/lib/getVideoUrl";
import { Video } from "expo-av";
import { useRouter, useNavigation } from "expo-router";
import {
  doc,
  getDoc,
  updateDoc,
  deleteDoc,
  collection,
  addDoc,
  query,
  orderBy,
  onSnapshot,
} from "firebase/firestore";
import React, { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  StyleSheet,
  Text,
  Alert,
  FlatList,
  View,
} from "react-native";
import { Button, Card, TextInput } from "react-native-paper";
import { Rating } from "react-native-ratings";

interface VideoCardProps {
  item: any;
  onDelete: (id: string) => void; // 삭제 후 리스트에서 제거하는 콜백 함수
}

interface Comment {
  id: string;
  userId: string;
  userName: string;
  comment: string;
  createdAt: any;
}

export const VideoCard: React.FC<VideoCardProps> = ({ item, onDelete }) => {
  const { user } = useAuth();
  const router = useRouter();
  const navigation = useNavigation();

  const isFocused = navigation.isFocused();

  const [voiceSpeedRating, setVoiceSpeedRating] = useState<number>(3);
  const [postureRating, setPostureRating] = useState<number>(3);
  const [endingEvaluationRating, setEndingEvaluationRating] =
    useState<number>(3);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [loadingVideo, setLoadingVideo] = useState<boolean>(true);

  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState<string>("");

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

  // 댓글을 실시간으로 가져오는 함수
  const fetchComments = (videoId: string) => {
    const commentsRef = collection(db, "videos", videoId, "comments");
    const q = query(commentsRef, orderBy("createdAt", "asc"));

    const unsubscribe = onSnapshot(
      q,
      (querySnapshot) => {
        const commentsData: Comment[] = [];
        querySnapshot.forEach((doc) => {
          commentsData.push({ id: doc.id, ...doc.data() } as Comment);
        });
        setComments(commentsData);
      },
      (error) => {
        console.error("댓글 로딩 중 오류 발생:", error);
      }
    );

    return unsubscribe;
  };

  useEffect(() => {
    const fetchVideoUrl = async () => {
      const url = await getVideoUrl(`${item.videoUrl}`);

      if (url) {
        setVideoUrl(url);
      }

      setLoadingVideo(false);
    };

    if (isFocused) {
      fetchVideoUrl();
      fetchExistingRating(item.id);

      const unsubscribeComments = fetchComments(item.id);

      if (videoRef.current) {
        videoRef.current.replayAsync().then(() => {
          videoRef.current?.stopAsync();
        });

        if (videoUrl) {
          videoRef.current?.loadAsync({ uri: videoUrl }).then(() => {});
        }
      }

      return () => {
        unsubscribeComments();
      };
    }
  }, [item.id, isFocused]);

  const handleRatingSave = async (videoId: string) => {
    try {
      const videoDocRef = doc(db, "videos", videoId);
      const videoDocSnapshot = await getDoc(videoDocRef);

      if (videoDocSnapshot.exists()) {
        const videoData = videoDocSnapshot.data();
        const currentRatings = videoData.ratings || [];

        const existingRatingIndex = currentRatings.findIndex(
          (rating: any) => rating.userId === user.uid
        );

        if (existingRatingIndex >= 0) {
          currentRatings[existingRatingIndex] = {
            userId: user.uid,
            voiceSpeed: voiceSpeedRating,
            posture: postureRating,
            endingEvaluation: endingEvaluationRating,
          };
        } else {
          currentRatings.push({
            userId: user.uid,
            voiceSpeed: voiceSpeedRating,
            posture: postureRating,
            endingEvaluation: endingEvaluationRating,
          });
        }

        await updateDoc(videoDocRef, { ratings: currentRatings });
        Alert.alert("성공", "별점이 성공적으로 저장되었습니다!");
      }
    } catch (error) {
      console.error("별점 저장 중 오류 발생:", error);
      Alert.alert("실패", "별점 저장에 실패했습니다.");
    }
  };

  // 동영상 삭제 기능 추가
  const handleDelete = async (videoId: string) => {
    try {
      const videoDocRef = doc(db, "videos", videoId);
      await deleteDoc(videoDocRef); // Firestore에서 삭제

      onDelete(videoId); // UI에서 해당 동영상 제거
      Alert.alert("성공", "동영상이 성공적으로 삭제되었습니다!");
    } catch (error) {
      console.error("동영상 삭제 중 오류 발생:", error);
      Alert.alert("실패", "동영상 삭제에 실패했습니다.");
    }
  };

  // 댓글 작성 함수
  const handleAddComment = async () => {
    if (newComment.trim() === "") {
      Alert.alert("경고", "댓글을 입력해주세요.");
      return;
    }

    try {
      const commentsRef = collection(db, "videos", item.id, "comments");
      await addDoc(commentsRef, {
        userId: user.uid,
        userName: user.displayName || "익명",
        comment: newComment.trim(),
        createdAt: new Date(),
      });
      setNewComment("");
      Alert.alert("성공", "댓글이 성공적으로 작성되었습니다!");
    } catch (error) {
      console.error("댓글 작성 중 오류 발생:", error);
      Alert.alert("실패", "댓글 작성에 실패했습니다.");
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

        <Text style={styles.ratingLabel}>목소리 속도</Text>
        <Rating
          showRating
          startingValue={voiceSpeedRating}
          onFinishRating={setVoiceSpeedRating}
          style={styles.rating}
        />

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
          }}
        >
          친구들 평가 보기
        </Button>

        {/* 동영상 삭제 버튼: 사용자가 자신의 동영상일 경우에만 표시 */}
        {user.uid === item.creatorId && (
          <Button
            mode="contained"
            onPress={() =>
              Alert.alert("삭제 확인", "정말 이 동영상을 삭제하시겠습니까?", [
                {
                  text: "취소",
                  style: "cancel",
                },
                {
                  text: "삭제",
                  onPress: () => handleDelete(item.id),
                  style: "destructive",
                },
              ])
            }
            style={styles.deleteButton}
          >
            동영상 삭제
          </Button>
        )}

        {/* 댓글 섹션 */}
        <View style={styles.commentsSection}>
          <Text style={styles.commentsTitle}>댓글</Text>
          <FlatList
            data={comments}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <View style={styles.commentItem}>
                <Text style={styles.commentUser}>{item.userName}</Text>
                <Text style={styles.commentText}>{item.comment}</Text>
                <Text style={styles.commentDate}>
                  {item.createdAt.toDate().toLocaleString()}
                </Text>
              </View>
            )}
            style={styles.commentsList}
          />

          {/* 댓글 작성 폼 */}
          <View style={styles.commentInputContainer}>
            <TextInput
              label="댓글을 입력하세요"
              value={newComment}
              onChangeText={setNewComment}
              style={styles.commentInput}
              mode="outlined"
              multiline
            />
            <Button
              mode="contained"
              onPress={handleAddComment}
              style={styles.addButton}
            >
              추가
            </Button>
          </View>
        </View>
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
  deleteButton: {
    marginTop: 20,
    backgroundColor: "red",
  },
  commentsSection: {
    marginTop: 20,
  },
  commentsTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 10,
  },
  commentsList: {
    maxHeight: 200,
  },
  commentItem: {
    paddingVertical: 5,
    borderBottomWidth: 1,
    borderBottomColor: "#ddd",
  },
  commentUser: {
    fontWeight: "bold",
  },
  commentText: {
    marginTop: 2,
    fontSize: 16,
  },
  commentDate: {
    marginTop: 2,
    fontSize: 12,
    color: "#999",
  },
  commentInputContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 10,
  },
  commentInput: {
    flex: 1,
    marginRight: 10,
  },
  addButton: {
    height: 50,
    justifyContent: "center",
  },
});
