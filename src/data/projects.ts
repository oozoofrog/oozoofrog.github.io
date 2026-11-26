import { cardKeeperAppStoreUrl, cardKeeperRelease } from './cardKeeperPage';

export interface ProjectScreen {
  device: "iPhone" | "iPad" | "Apple Watch" | "Mac";
  src: string;
  description: string;
}

export interface Project {
  name: string;
  slug: string;
  tagline: string;
  description: string;
  status: 'released' | 'opensource' | 'development';
  featured: boolean;
  icon: string;
  screens: ProjectScreen[];
  tags: string[];
  appstore?: string;
  github?: string;
  page?: string;
}

const catalog: Project[] = [
  {
    name: "RunnersHeart",
    slug: "runners-heart",
    screens: [
      { device: "Apple Watch", src: "/assets/images/projects/screens/runners-heart-watch.webp", description: "운동 목표 진행률" },
      { device: "iPhone", src: "/assets/images/projects/screens/runners-heart-route.webp", description: "실시간 러닝 경로" },
    ],
    tagline: "심박 구간 러닝 코치",
    description: "iPhone에서 러닝 목표를 정하고 Apple Watch에서 운동을 시작합니다. 달리는 동안 심박 구간을 확인하고 운동 후 기록을 분석할 수 있습니다.",
    status: "released",
    featured: true,
    icon: "/assets/images/projects/runners-heart-icon.png",
    tags: ["SwiftUI", "HealthKit", "watchOS", "TRIMP"],
    appstore: "https://apps.apple.com/us/app/runners-heart/id6758222219",
    page: "/runners-heart/",
  },
  {
    name: "Card Keeper",
    slug: "cards",
    screens: [
      { device: "iPad", src: "/assets/images/projects/screens/cards-wallet.webp", description: "결제 카드와 멤버십 목록" },
      { device: "iPhone", src: "/assets/images/projects/screens/cards-barcode.webp", description: "멤버십 바코드" },
    ],
    tagline: "카드 스캔과 결제 양식 자동 완성",
    description: "결제 카드와 멤버십 바코드를 iCloud 키체인에 보관합니다. 인증 후 Safari 결제 양식을 채우거나 홈 화면 위젯에서 바코드를 꺼낼 수 있습니다.",
    status: cardKeeperRelease.ios ? "released" : "development",
    featured: true,
    icon: "/cards/images/card-keeper-icon.png",
    tags: ["iPhone", ...(cardKeeperRelease.mac ? ["Mac"] : []), "Safari Extension", "iCloud Keychain", "Widget"],
    appstore: cardKeeperRelease.ios ? cardKeeperAppStoreUrl : undefined,
    page: "/cards/",
  },
  {
    name: "RemoteDebug",
    slug: "remotedebug",
    screens: [
      { device: "Mac", src: "/assets/images/projects/screens/remotedebug-publish.webp", description: "개발 빌드 게시 목록" },
      { device: "iPhone", src: "/assets/images/projects/screens/remotedebug-install.webp", description: "미리보기 Mac에 연결된 빌드 설치 목록" },
    ],
    tagline: "Mac에서 iPhone으로 개발 빌드 전송",
    description: "Mac에서 개발 서명한 빌드를 게시하고 페어링한 iPhone에 설치합니다. Tailscale을 통해 다른 네트워크에서도 연결할 수 있습니다.",
    status: "opensource",
    featured: true,
    tags: ["SwiftUI", "Tailscale", "NetworkExtension", "MCP"],
    icon: "/assets/images/projects/remotedebug-icon.webp",
    github: "https://github.com/oozoofrog/remotedebug",
    page: "/remotedebug/",
  },
  {
    name: "HideFaces",
    slug: "hidefaces",
    screens: [
      { device: "iPad", src: "/assets/images/projects/screens/hidefaces-photo.webp", description: "사진 속 얼굴을 이모지로 가린 편집 화면" },
      { device: "iPhone", src: "/assets/images/projects/screens/hidefaces-video.webp", description: "영상 속 얼굴 가림 확인" },
    ],
    tagline: "이모지로 얼굴 가리기",
    description: "사진과 영상에서 얼굴을 찾아 이모지로 가립니다. 미리보기에서 위치를 조정한 뒤 편집본을 저장할 수 있습니다.",
    status: "released",
    featured: true,
    icon: "/assets/images/projects/hidefaces-icon.png",
    tags: ["사진", "동영상"],
    appstore: "https://apps.apple.com/app/id6835463326",
  },
  {
    name: "Ribbonpage",
    slug: "ribbonpage",
    screens: [
      { device: "iPhone", src: "/assets/images/projects/screens/ribbonpage-library.webp", description: "저장한 문서 목록" },
      { device: "iPhone", src: "/assets/images/projects/screens/ribbonpage-reader.webp", description: "저장한 기사 본문" },
    ],
    tagline: "웹 기사를 Markdown으로 보관",
    description: "공유 메뉴에서 웹 기사를 저장하면 본문과 원문 주소가 함께 남습니다. 저장한 글은 오프라인에서 읽거나 검색할 수 있습니다.",
    status: "released",
    featured: true,
    icon: "/assets/images/projects/ribbonpage-icon.png",
    tags: ["Markdown", "오프라인 읽기"],
    appstore: "https://apps.apple.com/app/id6836562181",
  },
];

export const projects = catalog.filter(
  (project) => (project.status === "released" && project.appstore) || project.slug === "remotedebug",
);
