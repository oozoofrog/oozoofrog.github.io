export type CardKeeperLocale = 'en' | 'ko' | 'ja' | 'zh-hans' | 'zh-hant';

export interface CardKeeperFeature {
  icon: string;
  title: string;
  description: string;
  note?: string;
}

export interface CardKeeperScreen {
  src: string;
  width: number;
  height: number;
  alt: string;
  caption: string;
  device: 'iPhone' | 'Mac';
}

export interface CardKeeperPlatform {
  device: 'iPhone' | 'Mac';
  label: string;
}

export interface CardKeeperPageContent {
  locale: CardKeeperLocale;
  lang: string;
  ogLocale: string;
  seoTitle: string;
  seoDescription: string;
  ogImage: string;
  localeNavLabel: string;
  subtitle: string;
  lead: string;
  appStoreLabel: string;
  appStoreAriaLabel: string;
  platformsLabel: string;
  platforms: CardKeeperPlatform[];
  featuresTitle: string;
  features: CardKeeperFeature[];
  screensTitle: string;
  screensNote?: string;
  screens: CardKeeperScreen[];
  supportLabel: string;
  privacyLabel: string;
}

export const cardKeeperAppStoreUrl = 'https://apps.apple.com/app/id6836199766';

// App Store availability. ios: false hides every App Store button and marks the
// project as in development; mac: false hides the Mac platform line and tag.
export const cardKeeperRelease = { ios: true, mac: true };

export const cardKeeperLocales: { locale: CardKeeperLocale; lang: string; label: string }[] = [
  { locale: 'en', lang: 'en', label: 'EN' },
  { locale: 'ko', lang: 'ko', label: '한국어' },
  { locale: 'ja', lang: 'ja', label: '日本語' },
  { locale: 'zh-hans', lang: 'zh-Hans', label: '简体中文' },
  { locale: 'zh-hant', lang: 'zh-Hant', label: '繁體中文' },
];

export function cardKeeperPath(section: '' | 'support/' | 'privacy/', locale: CardKeeperLocale): string {
  return `/cards/${section}${locale === 'en' ? '' : `${locale}/`}`;
}

export function cardKeeperAlternates(siteUrl: string): { hreflang: string; href: string }[] {
  return [
    ...cardKeeperLocales.map((item) => ({ hreflang: item.lang, href: `${siteUrl}${cardKeeperPath('', item.locale)}` })),
    { hreflang: 'x-default', href: `${siteUrl}/cards/` },
  ];
}

const iphone = { width: 598, height: 1300, device: 'iPhone' as const };
const mac = { width: 1600, height: 1000, device: 'Mac' as const };

function screens(
  prefix: 'en' | 'ko',
  text: { alt: string; caption: string }[],
): CardKeeperScreen[] {
  const files = [
    [`${prefix}-iphone-list.jpg`, iphone],
    [`${prefix}-iphone-card.jpg`, iphone],
    [`${prefix}-iphone-safari.jpg`, iphone],
    [`${prefix}-iphone-barcode.jpg`, iphone],
    [`${prefix}-mac-menubar.jpg`, mac],
  ] as const;
  return files.map(([file, size], index) => ({
    src: `/cards/images/${file}`,
    ...size,
    ...text[index],
  }));
}

const barcodeFormats = 'Codabar, Code 39, Code 128, EAN-8, EAN-13';

export const cardKeeperPageEn: CardKeeperPageContent = {
  locale: 'en',
  lang: 'en',
  ogLocale: 'en_US',
  seoTitle: 'Card Keeper: Cards & Barcodes for iPhone and Mac',
  seoDescription:
    'Scan a card to add it, fill Safari checkout after you authenticate, and show barcodes in a Home Screen widget. Stored in iCloud Keychain. No data collected.',
  ogImage: '/cards/images/en-mac-card.jpg',
  localeNavLabel: 'Language selector',
  subtitle: 'Scan a card, fill checkout',
  lead: 'Keep your payment cards and membership barcodes in one place, ready when you need them. No account required.',
  appStoreLabel: 'Download on the App Store',
  appStoreAriaLabel: 'Download on the App Store: Card Keeper (opens in a new tab)',
  platformsLabel: 'Platforms',
  platforms: [
    { device: 'iPhone', label: 'iPhone · iOS 26 or later' },
    { device: 'Mac', label: 'Mac · macOS 26 or later' },
  ],
  featuresTitle: 'What you can do',
  features: [
    {
      icon: '📷',
      title: 'Add a card with the camera',
      description:
        'Point your iPhone camera at a card and Card Keeper reads the card number, expiration date and cardholder name. On Mac, drop a card photo into the window or take one with a camera. Check and correct the values before you save, or type them in yourself.',
    },
    {
      icon: '🧾',
      title: 'Fill checkout forms in Safari',
      description:
        'On a checkout page, open the Card Keeper extension and pick a card. After you confirm with Face ID, Touch ID or your passcode on iPhone, or Touch ID or your login password on Mac, it fills in the card number, expiration date, name and CVC. You can choose just the fields you want. It fills only on https pages.',
      note: 'Pages that use a secure keypad or a separate payment window can’t be filled. Copy the values and paste them instead.',
    },
    {
      icon: '🔖',
      title: 'Membership and library card barcodes',
      description:
        `Point your camera at a barcode or choose an image, or type in the number. ${barcodeFormats}, QR Code, PDF417 and Aztec are drawn as barcodes. On iPhone, the Barcode widget (medium or large) shows a barcode you choose on the Home Screen.`,
    },
    {
      icon: '🔄',
      title: 'Synced through iCloud Keychain',
      description:
        'Cards and barcodes are stored in the keychain and sync between your iPhone and Mac when iCloud Keychain is on. Turn on the option to keep a card or barcode on this device only, and it won’t sync.',
    },
    {
      icon: '📋',
      title: 'Copy when a form can’t be filled',
      description:
        'Viewing or copying the card number, name or CVC requires authentication. On Mac, copy from Card Keeper in the menu bar. Copied values can be pasted only on the device you copied them on and are cleared from the clipboard after 60 seconds.',
    },
    {
      icon: '🔒',
      title: 'No data collected',
      description:
        'There’s no account and no developer-run server, and Card Keeper doesn’t send your card information anywhere. Camera frames and photos you choose are only read on your device and are never saved.',
    },
  ],
  screensTitle: 'Screens',
  screens: screens('en', [
    {
      caption: 'Payment cards and barcodes in one list',
      alt: 'Card Keeper on iPhone: a list with two payment cards, a Visa and a Mastercard, and two barcodes, a library card and a grocery rewards card.',
    },
    {
      caption: 'Card number, name and CVC stay hidden until you authenticate',
      alt: 'Card detail screen on iPhone. Only the last four digits, 4242, and the expiration date of a Visa card are visible, with show and copy buttons next to the card number, cardholder name and CVC.',
    },
    {
      caption: 'Pick a card and the fields to fill in Safari',
      alt: 'The Card Keeper Safari extension on iPhone with one card selected, checkboxes for card number, expiration date, cardholder name and CVC, and Fill All and Fill Selected buttons.',
    },
    {
      caption: 'A library card barcode, ready to show',
      alt: 'Barcode detail screen on iPhone showing a Codabar library card barcode and its number, a Copy Number button and a Keep on This iPhone Only switch.',
    },
    {
      caption: 'Copy card details from the menu bar',
      alt: 'Card Keeper on Mac with its menu bar menu open, offering to copy a card’s number, expiration date, cardholder name or CVC.',
    },
  ]),
  supportLabel: 'Support',
  privacyLabel: 'Privacy Policy',
};

export const cardKeeperPageKo: CardKeeperPageContent = {
  locale: 'ko',
  lang: 'ko',
  ogLocale: 'ko_KR',
  seoTitle: 'Card Keeper: 결제 카드와 바코드 | iPhone·Mac',
  seoDescription:
    '카드를 카메라에 비춰 등록하고, Safari 결제 페이지에서는 본인 확인 뒤 입력란을 채웁니다. 회원증 바코드는 홈 화면 위젯으로 보여 줍니다. iCloud 키체인에 보관하며 정보를 수집하지 않습니다.',
  ogImage: '/cards/images/ko-mac-card.jpg',
  localeNavLabel: '언어 선택',
  subtitle: '카드 촬영 등록, 결제란 채우기',
  lead: '결제 카드와 회원증 바코드를 한곳에 보관하고 필요할 때 꺼내 씁니다. 계정을 만들지 않아도 됩니다.',
  appStoreLabel: 'App Store에서 다운로드',
  appStoreAriaLabel: 'App Store에서 다운로드: Card Keeper (새 탭에서 열림)',
  platformsLabel: '지원 기기',
  platforms: [
    { device: 'iPhone', label: 'iPhone · iOS 26 이상' },
    { device: 'Mac', label: 'Mac · macOS 26 이상' },
  ],
  featuresTitle: '할 수 있는 일',
  features: [
    {
      icon: '📷',
      title: '카메라로 카드 등록',
      description:
        '카드를 iPhone 카메라에 비추면 카드번호, 유효기간, 소유자 이름을 읽습니다. Mac에서는 카드 사진을 창에 끌어다 놓거나 Mac 카메라나 iPhone으로 찍으면 같은 정보를 읽어 칸을 채웁니다. 읽은 값은 저장하기 전에 확인하고 고칠 수 있고, 직접 입력해도 됩니다.',
    },
    {
      icon: '🧾',
      title: 'Safari 결제 입력란 채우기',
      description:
        '결제 페이지에서 Card Keeper 확장 프로그램을 열고 카드를 고르세요. iPhone에서는 Face ID나 Touch ID, 기기 암호로, Mac에서는 Touch ID나 로그인 암호로 확인하면 카드번호, 유효기간, 이름, CVC를 입력란에 넣습니다. 넣을 항목만 고를 수도 있습니다. https 페이지에서만 입력합니다.',
      note: '보안 키패드, 앱카드, ISP 결제창을 쓰는 페이지에는 입력할 수 없습니다. 이때는 값을 복사해 붙여 넣으세요.',
    },
    {
      icon: '🔖',
      title: '회원증·도서관 카드 바코드',
      description:
        `바코드를 카메라에 비추거나 이미지를 골라 등록하고, 번호를 직접 입력해도 됩니다. ${barcodeFormats}, QR 코드, PDF417, Aztec은 바코드로 그려 보여 줍니다. iPhone에서는 '바코드' 위젯(중간·큰 크기)으로 고른 바코드를 홈 화면에 띄울 수 있습니다.`,
    },
    {
      icon: '🔄',
      title: 'iCloud 키체인으로 동기화',
      description:
        "카드와 바코드는 키체인에 보관하고, iCloud 키체인을 켠 iPhone과 Mac 사이에서 동기화합니다. 항목마다 '이 iPhone에만 보관'(Mac에서는 '이 Mac에만 보관')을 켜면 동기화하지 않습니다.",
    },
    {
      icon: '📋',
      title: '입력할 수 없을 때는 복사',
      description:
        '카드번호, 이름, CVC는 본인 확인을 거친 뒤 보거나 복사할 수 있습니다. Mac에서는 메뉴 막대의 Card Keeper에서 복사합니다. 복사한 값은 복사한 기기에서만 붙여 넣을 수 있고 60초 뒤 클립보드에서 지워집니다.',
    },
    {
      icon: '🔒',
      title: '수집하는 정보 없음',
      description:
        '계정도, 개발자가 운영하는 서버도 없고, 앱은 카드 정보를 어디에도 보내지 않습니다. 촬영한 화면과 고른 사진은 기기 안에서 읽기만 하고 저장하지 않습니다.',
    },
  ],
  screensTitle: '화면',
  screens: screens('ko', [
    {
      caption: '결제 카드와 바코드를 한 목록에서 봅니다.',
      alt: 'iPhone의 Card Keeper 카드 목록. 결제 카드 2장(Visa, Mastercard)과 바코드 2개(도서관 회원증, 마트 멤버십)가 있습니다.',
    },
    {
      caption: '카드번호, 이름, CVC는 본인 확인 뒤에 보입니다.',
      alt: 'iPhone의 카드 상세 화면. Visa 카드의 끝 4자리 4242와 유효기간만 보이고, 카드번호·소유자 이름·CVC 옆에 보기와 복사 버튼이 있습니다.',
    },
    {
      caption: 'Safari에서 카드와 채울 항목을 고릅니다.',
      alt: 'iPhone Safari 결제 페이지 위에 열린 Card Keeper 확장 프로그램. 카드 하나가 선택되어 있고 카드번호, 유효기간, 소유자 이름, CVC 항목이 체크되어 있습니다.',
    },
    {
      caption: '도서관 회원증 바코드를 바로 보여 줍니다.',
      alt: "iPhone의 바코드 상세 화면. 도서관 회원증의 Codabar 바코드와 번호, 번호 복사 버튼, '이 iPhone에만 보관' 스위치가 있습니다.",
    },
    {
      caption: '메뉴 막대에서 카드 정보를 복사합니다.',
      alt: 'Mac의 Card Keeper 창 위에 메뉴 막대 메뉴가 열려 있고, 카드번호·유효기간·소유자 이름·CVC 복사 항목이 보입니다.',
    },
  ]),
  supportLabel: '지원',
  privacyLabel: '개인정보 처리방침',
};

export const cardKeeperPageJa: CardKeeperPageContent = {
  locale: 'ja',
  lang: 'ja',
  ogLocale: 'ja_JP',
  seoTitle: 'Card Keeper: クレカと会員証バーコード | iPhone・Mac',
  seoDescription:
    'カードをカメラにかざして登録し、Safariの支払いページでは本人確認のあとでフォームに入力。会員証のバーコードはホーム画面のウィジェットに表示できます。iCloudキーチェーンに保存し、データは収集しません。',
  ogImage: '/cards/images/en-mac-card.jpg',
  localeNavLabel: '言語を選択',
  subtitle: 'カードを撮って登録、支払いフォームに入力',
  lead: '支払い用のカードと会員証のバーコードをひとつにまとめて、必要なときに取り出して使えます。アカウント登録は不要です。',
  appStoreLabel: 'App Storeからダウンロード',
  appStoreAriaLabel: 'App Storeからダウンロード：Card Keeper（新しいタブで開きます）',
  platformsLabel: '対応デバイス',
  platforms: [
    { device: 'iPhone', label: 'iPhone・iOS 26以降' },
    { device: 'Mac', label: 'Mac・macOS 26以降' },
  ],
  featuresTitle: 'できること',
  features: [
    {
      icon: '📷',
      title: 'カメラでカードを登録',
      description:
        'カードをiPhoneのカメラにかざすと、カード番号、有効期限、名義人名を読み取ります。Macでは、カードの写真をウインドウにドロップするか、カメラで撮影します。読み取った内容は保存する前に確認・修正でき、手入力もできます。',
    },
    {
      icon: '🧾',
      title: 'Safariで支払いフォームに入力',
      description:
        '支払いページでCard Keeper機能拡張を開いてカードを選びます。iPhoneではFace ID、Touch ID、またはパスコード、MacではTouch IDかログインパスワードで確認すると、カード番号、有効期限、名義人名、CVCをフォームに入力します。入力する項目だけを選ぶこともできます。入力するのはhttpsのページだけです。',
      note: 'セキュリティキーパッドや専用決済ウインドウを使うページには入力できません。その場合は値をコピーしてペーストしてください。',
    },
    {
      icon: '🔖',
      title: '会員証・図書館カードのバーコード',
      description:
        `バーコードをカメラにかざすか画像を選んで登録します。番号を手入力することもできます。${barcodeFormats.replace(/, /g, '、')}、QRコード、PDF417、Aztecはバーコードとして描画して表示します。iPhoneでは「バーコード」ウィジェット（中・大サイズ）で、選んだバーコードをホーム画面に表示できます。`,
    },
    {
      icon: '🔄',
      title: 'iCloudキーチェーンで同期',
      description:
        'カードとバーコードはキーチェーンに保存され、iCloudキーチェーンをオンにしているiPhoneとMacの間で同期されます。カードやバーコードごとに「このiPhoneにのみ保存」（Macでは「このMacにのみ保存」）をオンにすると、同期しません。',
    },
    {
      icon: '📋',
      title: '入力できないときはコピー',
      description:
        'カード番号、名義人名、CVCは本人確認のあとで表示・コピーできます。Macではメニューバーの Card Keeper からコピーできます。コピーした値はコピーしたデバイスでのみペーストでき、60秒後にクリップボードから消去されます。',
    },
    {
      icon: '🔒',
      title: 'データの収集なし',
      description:
        'アカウントも、デベロッパが運営するサーバもなく、アプリがカード情報をどこかへ送信することはありません。撮影した画面や選んだ写真はデバイス内で読み取るだけで、保存しません。',
    },
  ],
  screensTitle: '画面',
  screensNote: '画面は英語表示のものです。',
  screens: screens('en', [
    {
      caption: '支払いカードとバーコードをひとつのリストで',
      alt: 'iPhoneのCard Keeperのリスト画面。支払いカード2枚（VisaとMastercard）と、バーコード2件（図書館カードとポイントカード）が並んでいます。',
    },
    {
      caption: 'カード番号、名義人名、CVCは本人確認のあとで表示',
      alt: 'iPhoneのカード詳細画面。Visaカードの下4桁4242と有効期限だけが見え、カード番号・名義人名・CVCの横に表示とコピーのボタンがあります。',
    },
    {
      caption: 'Safariでカードと入力する項目を選択',
      alt: 'iPhoneのCard Keeper Safari機能拡張。カードが1枚選ばれ、カード番号、有効期限、名義人名、CVCのチェックボックスと、すべて入力・選択項目を入力のボタンがあります。',
    },
    {
      caption: '図書館カードのバーコードをすぐに表示',
      alt: 'iPhoneのバーコード詳細画面。図書館カードのCodabarバーコードと番号、番号をコピーするボタン、「このiPhoneにのみ保存」スイッチがあります。',
    },
    {
      caption: 'メニューバーからカード情報をコピー',
      alt: 'MacのCard Keeperウインドウの上にメニューバーのメニューが開き、カード番号、有効期限、名義人名、CVCをコピーする項目が並んでいます。',
    },
  ]),
  supportLabel: 'サポート',
  privacyLabel: 'プライバシーポリシー',
};

export const cardKeeperPageZhHans: CardKeeperPageContent = {
  locale: 'zh-hans',
  lang: 'zh-Hans',
  ogLocale: 'zh_CN',
  seoTitle: 'Card Keeper: 银行卡与条形码 | iPhone 和 Mac',
  seoDescription:
    '将卡片对准相机即可录入；在 Safari 浏览器付款页面验证身份后即可填写表单；会员卡条形码可通过主屏幕小组件显示。卡片存储在 iCloud 钥匙串中，不收集任何数据。',
  ogImage: '/cards/images/en-mac-card.jpg',
  localeNavLabel: '选择语言',
  subtitle: '拍照录入卡片，填写付款栏',
  lead: '将银行卡和会员卡条形码集中存放，需要时随时取用。无需注册账户。',
  appStoreLabel: '在 App Store 下载',
  appStoreAriaLabel: '在 App Store 下载：Card Keeper（在新标签页中打开）',
  platformsLabel: '支持的设备',
  platforms: [
    { device: 'iPhone', label: 'iPhone · iOS 26 或更高版本' },
    { device: 'Mac', label: 'Mac · macOS 26 或更高版本' },
  ],
  featuresTitle: '可以做什么',
  features: [
    {
      icon: '📷',
      title: '用相机录入卡片',
      description:
        '将卡片对准 iPhone 相机，即可读取卡号、有效期和持卡人姓名。在 Mac 上，可将卡片照片拖到窗口中或用相机拍摄。读取的信息可在保存前检查和修改，也可以手动输入。',
    },
    {
      icon: '🧾',
      title: '在 Safari 浏览器中填写付款表单',
      description:
        '在付款页面打开 Card Keeper 扩展并选择卡片。在 iPhone 上通过面容 ID、触控 ID 或设备密码验证，在 Mac 上通过触控 ID 或登录密码验证后，即可将卡号、有效期、姓名和 CVC 填入表单。也可以只选择需要填写的项目。仅在 https 页面中填写。',
      note: '使用安全键盘或独立支付窗口的页面无法填写。此时请拷贝信息后粘贴。',
    },
    {
      icon: '🔖',
      title: '会员卡、图书馆卡条形码',
      description:
        `将条形码对准相机或选取图片即可录入，也可以手动输入号码。${barcodeFormats.replace(/, /g, '、')}、二维码、PDF417 和 Aztec 会以条形码图形显示。在 iPhone 上，“条形码”小组件（中号或大号）可在主屏幕上显示所选条形码。`,
    },
    {
      icon: '🔄',
      title: '通过 iCloud 钥匙串同步',
      description:
        '卡片和条形码存储在钥匙串中，并在开启了 iCloud 钥匙串的 iPhone 和 Mac 之间同步。可为每张卡片或每个条形码单独设置仅保存在这台设备上，这样它就不会同步。',
    },
    {
      icon: '📋',
      title: '无法填写时拷贝',
      description:
        '卡号、姓名和 CVC 需通过身份验证后才能查看或拷贝。在 Mac 上，可从菜单栏中的 Card Keeper 拷贝。拷贝的内容只能在拷贝时所用的设备上粘贴，60 秒后会从剪贴板中清除。',
    },
    {
      icon: '🔒',
      title: '不收集任何数据',
      description:
        '无需账户，开发者也不运营任何服务器，App 不会将卡片信息发送到任何地方。拍摄的画面和选取的照片仅在设备上读取，不会被保存。',
    },
  ],
  screensTitle: '界面',
  screensNote: '截图为英文界面。',
  screens: screens('en', [
    {
      caption: '在一个列表中查看银行卡和条形码',
      alt: 'iPhone 上的 Card Keeper 列表：两张银行卡（Visa 和 Mastercard）和两个条形码（图书馆卡和超市积分卡）。',
    },
    {
      caption: '卡号、姓名和 CVC 需验证身份后才会显示',
      alt: 'iPhone 上的卡片详情界面。Visa 卡只显示末四位 4242 和有效期，卡号、持卡人姓名和 CVC 旁边有显示和拷贝按钮。',
    },
    {
      caption: '在 Safari 浏览器中选择卡片和要填写的项目',
      alt: 'iPhone 上的 Card Keeper Safari 浏览器扩展：已选择一张卡片，有卡号、有效期、持卡人姓名和 CVC 复选框，以及“全部填写”和“填写所选项”按钮。',
    },
    {
      caption: '随时出示图书馆卡条形码',
      alt: 'iPhone 上的条形码详情界面：图书馆卡的 Codabar 条形码和号码、拷贝号码按钮，以及仅保存在这台 iPhone 上的开关。',
    },
    {
      caption: '从菜单栏拷贝卡片信息',
      alt: 'Mac 上的 Card Keeper 窗口，菜单栏菜单已打开，可拷贝卡片的卡号、有效期、持卡人姓名或 CVC。',
    },
  ]),
  supportLabel: '支持',
  privacyLabel: '隐私政策',
};

export const cardKeeperPageZhHant: CardKeeperPageContent = {
  locale: 'zh-hant',
  lang: 'zh-Hant',
  ogLocale: 'zh_TW',
  seoTitle: 'Card Keeper: 信用卡與條碼收納 | iPhone 和 Mac',
  seoDescription:
    '把卡片對準相機就能加入；在 Safari 結帳頁面確認身分後即可填入付款欄位；會員卡條碼也能用主畫面小工具顯示。卡片儲存在 iCloud 鑰匙圈，不收集任何資料。',
  ogImage: '/cards/images/en-mac-card.jpg',
  localeNavLabel: '選擇語言',
  subtitle: '拍照加入卡片，填好結帳表單',
  lead: '把信用卡、簽帳金融卡等付款卡片和會員卡條碼收在同一個地方，需要時隨時拿出來用。不需要註冊帳號。',
  appStoreLabel: '在 App Store 下載',
  appStoreAriaLabel: '在 App Store 下載：Card Keeper（在新分頁中開啟）',
  platformsLabel: '支援的裝置',
  platforms: [
    { device: 'iPhone', label: 'iPhone・iOS 26 或以上版本' },
    { device: 'Mac', label: 'Mac・macOS 26 或以上版本' },
  ],
  featuresTitle: '可以做什麼',
  features: [
    {
      icon: '📷',
      title: '用相機加入卡片',
      description:
        '把卡片對準 iPhone 相機，就會讀取卡號、有效期限和持卡人姓名。在 Mac 上，可以把卡片照片拖進視窗或用相機拍攝。讀到的內容可以在儲存前確認和修改，也可以手動輸入。',
    },
    {
      icon: '🧾',
      title: '在 Safari 填寫付款欄位',
      description:
        '在結帳頁面開啟 Card Keeper 延伸功能並選擇卡片。在 iPhone 上以 Face ID、Touch ID 或裝置密碼確認，在 Mac 上以 Touch ID 或登入密碼確認後，就會把卡號、有效期限、姓名和 CVC 填入欄位。也可以只選擇要填寫的項目。只在 https 頁面上填寫。',
      note: '使用安全鍵盤或獨立付款視窗的頁面無法填寫。這時請拷貝後貼上。',
    },
    {
      icon: '🔖',
      title: '會員卡、借書證條碼',
      description:
        `用相機對準條碼或選擇圖片即可加入，也可以手動輸入號碼。${barcodeFormats.replace(/, /g, '、')}、QR 碼、PDF417、Aztec 會繪製成條碼顯示。在 iPhone 上，「條碼」小工具（中型或大型）可以在主畫面顯示選好的條碼。`,
    },
    {
      icon: '🔄',
      title: '透過 iCloud 鑰匙圈同步',
      description:
        '卡片和條碼儲存在鑰匙圈中，並在開啟 iCloud 鑰匙圈的 iPhone 和 Mac 之間同步。可以為每張卡片或每個條碼設定只保留在這部裝置上，不透過 iCloud 鑰匙圈同步。',
    },
    {
      icon: '📋',
      title: '無法填寫時就拷貝',
      description:
        '卡號、姓名和 CVC 需要先確認是你本人，才能檢視或拷貝。在 Mac 上，可以從選單列的 Card Keeper 拷貝。拷貝的內容只能在拷貝時使用的裝置上貼上，60 秒後會從剪貼板清除。',
    },
    {
      icon: '🔒',
      title: '不收集任何資料',
      description:
        '不需要帳號，開發者也沒有架設任何伺服器，App 不會把卡片資訊傳送到任何地方。拍攝的畫面和選取的照片只會在裝置上讀取，不會儲存。',
    },
  ],
  screensTitle: '畫面',
  screensNote: '截圖為英文介面。',
  screens: screens('en', [
    {
      caption: '在同一個列表查看付款卡片和條碼',
      alt: 'iPhone 上的 Card Keeper 列表：兩張付款卡片（Visa 和 Mastercard）和兩個條碼（借書證和超市集點卡）。',
    },
    {
      caption: '卡號、姓名和 CVC 要確認身分後才會顯示',
      alt: 'iPhone 上的卡片詳細資料畫面。Visa 卡只顯示末四碼 4242 和有效期限，卡號、持卡人姓名和 CVC 旁有顯示和拷貝按鈕。',
    },
    {
      caption: '在 Safari 選擇卡片和要填寫的項目',
      alt: 'iPhone 上的 Card Keeper Safari 延伸功能：已選擇一張卡片，有卡號、有效期限、持卡人姓名和 CVC 核取方塊，以及「全部填入」和「填入所選項目」按鈕。',
    },
    {
      caption: '隨時出示借書證條碼',
      alt: 'iPhone 上的條碼詳細資料畫面：借書證的 Codabar 條碼和號碼、拷貝號碼按鈕，以及只保留在這部 iPhone 上的開關。',
    },
    {
      caption: '從選單列拷貝卡片資訊',
      alt: 'Mac 上的 Card Keeper 視窗，選單列選單已打開，可以拷貝卡片的卡號、有效期限、持卡人姓名或 CVC。',
    },
  ]),
  supportLabel: '支援',
  privacyLabel: '隱私權政策',
};
