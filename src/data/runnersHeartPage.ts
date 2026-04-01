export interface RunnersHeartFeature {
  icon: string;
  title: string;
  description: string;
}

export interface RunnersHeartGalleryItem {
  src: string;
  alt: string;
  title: string;
  description: string;
  device: string;
}

export interface RunnersHeartStat {
  value: string;
  label: string;
}

export interface RunnersHeartLocaleLink {
  href: string;
  label: string;
  active?: boolean;
}

export interface RunnersHeartPageContent {
  locale: 'en' | 'ko';
  lang: 'en' | 'ko';
  seoTitle: string;
  seoDescription: string;
  heroEyebrow: string;
  appName: string;
  heroTagline: string;
  heroDescription: string;
  primaryCta: string;
  secondaryCta: string;
  chips: string[];
  demoKicker: string;
  demoTitle: string;
  demoDescription: string;
  demoCalloutTitle: string;
  demoCalloutBody: string;
  highlightPoints: string[];
  featureKicker: string;
  featureTitle: string;
  featureDescription: string;
  features: RunnersHeartFeature[];
  galleryKicker: string;
  galleryTitle: string;
  galleryDescription: string;
  galleryItems: RunnersHeartGalleryItem[];
  summaryKicker: string;
  summaryTitle: string;
  summaryDescription: string;
  summaryStats: RunnersHeartStat[];
  ctaTitle: string;
  ctaDescription: string;
  ctaButton: string;
  supportLabel: string;
  privacyLabel: string;
  videoSrc: string;
  videoPoster: string;
  localeLinks: RunnersHeartLocaleLink[];
}

const sharedGallery = {
  watchRunning: '/assets/images/projects/runners-heart/watch-running.png',
  watchStandby: '/assets/images/projects/runners-heart/watch-standby.png',
  watchStopped: '/assets/images/projects/runners-heart/watch-stopped.png',
  iphoneToday: '/assets/images/projects/runners-heart/iphone-today.png',
  iphoneRecords: '/assets/images/projects/runners-heart/iphone-records.png',
  iphoneRecordDetail: '/assets/images/projects/runners-heart/iphone-record-detail.png',
  iphoneSettings: '/assets/images/projects/runners-heart/iphone-settings.png',
};

export const runnersHeartPageEn: RunnersHeartPageContent = {
  locale: 'en',
  lang: 'en',
  seoTitle: 'RunnersHeart - Heart Rate Zone Running Coach',
  seoDescription:
    'Train smarter with real-time heart rate zone feedback, Apple Watch haptics, personalized zones, and detailed iPhone workout analysis.',
  heroEyebrow: 'Apple Watch + iPhone running coach',
  appName: 'RunnersHeart',
  heroTagline: 'Heart Rate Zone Running Coach',
  heroDescription:
    'Train by effort, not guesswork. RunnersHeart gives you live heart rate zone feedback on Apple Watch, personalized zone calculations, and a richer iPhone analysis flow after every run.',
  primaryCta: 'Download on the App Store',
  secondaryCta: 'Watch the latest demo',
  chips: ['Apple Watch', 'iPhone', 'HealthKit', 'Offline', 'Privacy-first'],
  demoKicker: 'Latest preview',
  demoTitle: 'See the updated zone gauge in motion',
  demoDescription:
    'This latest composite preview shows the refreshed zone gauge flow across Apple Watch and iPhone. It highlights the updated visual language and the kind of pacing feedback RunnersHeart now delivers during a run.',
  demoCalloutTitle: "What's new in this flow",
  demoCalloutBody:
    'The interface now leans harder into immediate zone awareness: clearer gauge behavior, calmer motion, and retention-focused feedback that helps you stay in your target effort.',
  highlightPoints: [
    '1-second live heart rate updates during workouts',
    'Unique haptic patterns for each heart rate zone',
    'TRIMP-based training load analysis on iPhone',
    'Workout sharing with higher quality export cards',
    'Built for runners who want to train by effort, not guesswork',
  ],
  featureKicker: 'Why runners use it',
  featureTitle: 'Designed around effort-based training',
  featureDescription:
    'From live haptics on your wrist to deeper analysis on your phone, every screen is designed to keep training simple, actionable, and personal.',
  features: [
    {
      icon: '💓',
      title: 'Real-time zone feedback',
      description:
        'Feel zone changes through Apple Watch haptics, so you can adjust pace without staring at the screen.',
    },
    {
      icon: '🎯',
      title: 'Personalized heart rate zones',
      description:
        'Choose %MaxHR or Heart Rate Reserve (HRR) and fine-tune your target zone around your own physiology.',
    },
    {
      icon: '📈',
      title: 'Zone gauge & retention cues',
      description:
        'Follow the updated zone gauge to stay locked into the right intensity with smoother, more encouraging feedback.',
    },
    {
      icon: '🗺️',
      title: 'Detailed workout analysis',
      description:
        'Review route maps, heart rate history, time in zone, and training load after every run on iPhone.',
    },
    {
      icon: '🔄',
      title: 'Watch ↔ iPhone sync',
      description:
        'Target zone and distance goal changes sync between devices, keeping your setup ready wherever you adjust it.',
    },
    {
      icon: '🔒',
      title: 'Private by design',
      description:
        'No account, no server, and no workout upload required. Your health and workout data stay on your device.',
    },
  ],
  galleryKicker: 'App screens',
  galleryTitle: 'A closer look at the updated experience',
  galleryDescription:
    'The app now feels more complete from pre-run setup to post-run review. Here are the key screens runners move through most often.',
  galleryItems: [
    {
      src: sharedGallery.watchStandby,
      alt: 'RunnersHeart Apple Watch standby screen',
      title: 'Ready before the run',
      description: 'Set up the workout on Apple Watch and start with less friction.',
      device: 'Apple Watch',
    },
    {
      src: sharedGallery.watchRunning,
      alt: 'RunnersHeart Apple Watch running screen',
      title: 'Live workout screen',
      description: 'See pace, distance, and zone-driven feedback during the run.',
      device: 'Apple Watch',
    },
    {
      src: sharedGallery.iphoneToday,
      alt: 'RunnersHeart iPhone today screen',
      title: 'Today dashboard',
      description: 'Jump back into recent training with a cleaner home experience.',
      device: 'iPhone',
    },
    {
      src: sharedGallery.iphoneRecords,
      alt: 'RunnersHeart iPhone workout records list',
      title: 'Workout history',
      description: 'Browse your workouts and compare consistency over time.',
      device: 'iPhone',
    },
    {
      src: sharedGallery.iphoneRecordDetail,
      alt: 'RunnersHeart iPhone workout detail screen',
      title: 'Detailed analysis',
      description: 'Inspect route, heart rate flow, time in zone, and training load in one place.',
      device: 'iPhone',
    },
    {
      src: sharedGallery.iphoneSettings,
      alt: 'RunnersHeart iPhone settings screen',
      title: 'Personalization settings',
      description: 'Tune HRR, target zone behavior, and app preferences to fit your training.',
      device: 'iPhone',
    },
  ],
  summaryKicker: 'Built for focused runs',
  summaryTitle: 'Less distraction. Better pacing.',
  summaryDescription:
    'RunnersHeart is for runners who want their watch to coach them quietly while they run, then explain the workout clearly afterwards. The updated app experience sharpens both sides of that loop.',
  summaryStats: [
    { value: 'HRR', label: 'advanced zone calculation option' },
    { value: 'TRIMP', label: 'training load insight on iPhone' },
    { value: 'Offline', label: 'works during runs without internet' },
  ],
  ctaTitle: 'Ready to run in the right zone?',
  ctaDescription:
    'Download RunnersHeart and turn your Apple Watch into a more intuitive heart rate zone coach.',
  ctaButton: 'Download Now',
  supportLabel: 'Support',
  privacyLabel: 'Privacy Policy',
  videoSrc: '/assets/videos/projects/runners-heart-zone-gauge.mp4',
  videoPoster: '/assets/images/projects/runners-heart-zone-gauge-poster.jpg',
  localeLinks: [
    { href: '/runners-heart/', label: 'EN', active: true },
    { href: '/runners-heart/ko/', label: '한국어' },
  ],
};

export const runnersHeartPageKo: RunnersHeartPageContent = {
  locale: 'ko',
  lang: 'ko',
  seoTitle: 'RunnersHeart - 심박수 존 러닝 코치',
  seoDescription:
    '실시간 심박수 존 피드백, Apple Watch 햅틱, 개인화된 존 계산, iPhone 분석 화면으로 더 똑똑하게 달릴 수 있는 러닝 코치 앱.',
  heroEyebrow: 'Apple Watch + iPhone 러닝 코치',
  appName: 'RunnersHeart',
  heroTagline: '심박수 존 러닝 코치',
  heroDescription:
    '감이 아니라 강도로 달리세요. RunnersHeart는 Apple Watch에서 실시간 심박수 존 피드백을 제공하고, 개인화된 존 계산과 iPhone 분석 경험으로 러닝을 더 명확하게 만들어줍니다.',
  primaryCta: 'App Store에서 다운로드',
  secondaryCta: '최신 데모 보기',
  chips: ['Apple Watch', 'iPhone', 'HealthKit', '오프라인', '프라이버시 우선'],
  demoKicker: '최신 미리보기',
  demoTitle: '업데이트된 존 게이지 흐름을 영상으로 확인하세요',
  demoDescription:
    '이 최신 한국어 컴포지트 프리뷰는 Apple Watch와 iPhone 전반에 걸친 새로운 존 게이지 흐름을 보여줍니다. 달리는 동안 어떤 피드백을 받게 되는지 한눈에 확인할 수 있습니다.',
  demoCalloutTitle: '이번 흐름에서 달라진 점',
  demoCalloutBody:
    '인터페이스는 즉각적인 존 인지에 더 집중합니다. 게이지 동작은 더 명확해졌고, 움직임은 더 차분해졌으며, 목표 존에 머무르도록 돕는 피드백이 강화되었습니다.',
  highlightPoints: [
    '운동 중 1초 단위 실시간 심박수 업데이트',
    '각 심박수 존마다 다른 햅틱 패턴',
    'iPhone에서 확인하는 TRIMP 기반 훈련 부하 분석',
    '더 선명해진 운동 공유 카드 내보내기',
    '감에 의존하지 않고 강도로 훈련하고 싶은 러너를 위한 설계',
  ],
  featureKicker: '러너가 쓰는 이유',
  featureTitle: '강도 기반 훈련에 맞춰 설계했습니다',
  featureDescription:
    '손목 위의 즉각적인 햅틱부터 iPhone의 깊이 있는 분석까지, 모든 화면이 단순하고 실전적으로 작동하도록 다듬어졌습니다.',
  features: [
    {
      icon: '💓',
      title: '실시간 존 피드백',
      description:
        'Apple Watch 햅틱으로 존 변화를 느끼며 화면을 계속 보지 않고도 페이스를 조절할 수 있습니다.',
    },
    {
      icon: '🎯',
      title: '개인화된 심박수 존',
      description:
        '%MaxHR 또는 HRR 방식을 선택해 자신의 생리 지표에 맞는 목표 존을 설정할 수 있습니다.',
    },
    {
      icon: '📈',
      title: '개선된 존 게이지',
      description:
        '더 부드러운 게이지와 유지 피드백으로 목표 강도에 머무르기 쉬워졌습니다.',
    },
    {
      icon: '🗺️',
      title: '상세 운동 분석',
      description:
        '러닝 후 iPhone에서 경로, 심박 흐름, 존 체류 시간, 훈련 부하를 자세히 살펴볼 수 있습니다.',
    },
    {
      icon: '🔄',
      title: 'Watch ↔ iPhone 동기화',
      description:
        '목표 존과 거리 목표가 두 기기 사이에서 자연스럽게 동기화되어 설정 흐름이 끊기지 않습니다.',
    },
    {
      icon: '🔒',
      title: '기기 안에 머무는 데이터',
      description:
        '계정도 서버도 필요 없습니다. 건강 데이터와 운동 기록은 사용자의 기기 안에만 저장됩니다.',
    },
  ],
  galleryKicker: '앱 화면',
  galleryTitle: '업데이트된 경험을 더 가까이에서',
  galleryDescription:
    '러닝 전 준비부터 러닝 후 분석까지, 자주 쓰게 되는 핵심 화면들을 한 번에 볼 수 있도록 정리했습니다.',
  galleryItems: [
    {
      src: sharedGallery.watchStandby,
      alt: 'RunnersHeart Apple Watch 대기 화면',
      title: '달리기 전 준비',
      description: 'Apple Watch에서 빠르게 운동을 준비하고 바로 시작할 수 있습니다.',
      device: 'Apple Watch',
    },
    {
      src: sharedGallery.watchRunning,
      alt: 'RunnersHeart Apple Watch 러닝 화면',
      title: '실시간 러닝 화면',
      description: '러닝 중 페이스, 거리, 존 기반 피드백을 직관적으로 확인합니다.',
      device: 'Apple Watch',
    },
    {
      src: sharedGallery.iphoneToday,
      alt: 'RunnersHeart iPhone 오늘 화면',
      title: 'Today 대시보드',
      description: '최근 훈련 상태를 더 정돈된 홈 화면에서 빠르게 이어볼 수 있습니다.',
      device: 'iPhone',
    },
    {
      src: sharedGallery.iphoneRecords,
      alt: 'RunnersHeart iPhone 기록 목록 화면',
      title: '운동 기록 목록',
      description: '지난 러닝들을 확인하며 꾸준함과 패턴을 비교해볼 수 있습니다.',
      device: 'iPhone',
    },
    {
      src: sharedGallery.iphoneRecordDetail,
      alt: 'RunnersHeart iPhone 기록 상세 화면',
      title: '기록 상세 분석',
      description: '경로, 심박 흐름, 존 체류 시간, 훈련 부하를 한 화면에서 확인합니다.',
      device: 'iPhone',
    },
    {
      src: sharedGallery.iphoneSettings,
      alt: 'RunnersHeart iPhone 설정 화면',
      title: '개인화 설정',
      description: 'HRR, 목표 존 동작, 앱 선호도를 자신의 훈련 방식에 맞게 조정합니다.',
      device: 'iPhone',
    },
  ],
  summaryKicker: '달리기에 더 집중하도록',
  summaryTitle: '덜 방해받고, 더 정확하게.',
  summaryDescription:
    'RunnersHeart는 손목 위에서 조용히 코칭하고, 러닝이 끝난 뒤에는 결과를 명확하게 설명해주는 앱을 원하는 러너를 위해 만들어졌습니다. 이번 업데이트는 그 흐름을 더 선명하게 다듬었습니다.',
  summaryStats: [
    { value: 'HRR', label: '고급 존 계산 옵션' },
    { value: 'TRIMP', label: 'iPhone에서 보는 훈련 부하 인사이트' },
    { value: '오프라인', label: '인터넷 없이도 러닝 중 사용 가능' },
  ],
  ctaTitle: '목표 존에서 더 잘 달릴 준비가 되셨나요?',
  ctaDescription:
    'RunnersHeart를 다운로드하고 Apple Watch를 더 직관적인 심박수 존 코치로 바꿔보세요.',
  ctaButton: '지금 다운로드',
  supportLabel: '지원',
  privacyLabel: '개인정보 처리방침',
  videoSrc: '/assets/videos/projects/runners-heart-zone-gauge-ko.mp4',
  videoPoster: '/assets/images/projects/runners-heart-zone-gauge-ko-poster.jpg',
  localeLinks: [
    { href: '/runners-heart/', label: 'English' },
    { href: '/runners-heart/ko/', label: '한국어', active: true },
  ],
};
