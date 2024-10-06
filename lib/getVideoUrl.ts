import { storage } from "@/lib/firebaseConfig";
import { getDownloadURL, ref } from "firebase/storage";

// 파일 URL을 가져오는 함수
export async function getVideoUrl(videoPath: string) {
  try {
    // Firebase Storage에서 파일의 참조 생성
    const videoRef = ref(storage, videoPath);

    // 파일의 다운로드 URL 가져오기
    const url = await getDownloadURL(videoRef);

    // 유효한 URL 반환
    return url;
  } catch (error) {
    console.error("파일 URL 가져오기 중 오류 발생:", error);
  }
}

// 사용 예시
const videoPath =
  "https://firebasestorage.googleapis.com/v0/b/video-upload-8a7ee.appspot.com/o/videos/rof0t9NZuffRgEnptgp0JKWSEal2/1728196210601.mp4?alt=media&token=01c90595-8777-42bc-b6af-454cc121b4c3";
getVideoUrl(videoPath).then((url) => {
  console.log("Before: " + videoPath);
  console.log("비디오 URL:", url);
});
