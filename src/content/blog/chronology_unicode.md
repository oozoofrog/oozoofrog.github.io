---
title   : 유니코드 1.0 연대기
summary : 유니코드 1.0이 탄생하기까지의 연대기 (1986~1992)
date    : 2019-03-20 23:59:48 +0900
updated : 2026-03-01
categories : unicode chronology
---

# 유니코드 1.0 연대기

*이 글은 unicode.org에 수록되어있는 [unicode version 1.0](https://www.unicode.org/history/versionone.html)가 나오기 까지의 연대별 히스토리입니다.*

## 1986~1987

제록스(Xerox)에서, Huan-mei Liao, Nelson Ng, Dave Opstad,  그리고 Lee Collins는 중국어 문자들을 확장하기 위한 폰트 작업을 빠르게 진행하기 위해 일본어(JIS)와 중국어(간체와 번체) 문자들 사이에서 공통문자들의 맵을 데이터베이스화하는 작업을 시작했다. 실제로도 토론토의 나카지마와 같은 제록스의 사용자들은 부족한 중국어 문자를 확장하기 위해 JIS를 이용하기도 했다. 이는 Eric Mader에 의해 작성된 Han Unification에 대한 찬반 논의로 이어졌다.

한편, 애플에서는(아 나 이런거 정말 좋아), [Apple File Exchange](https://en.wikipedia.org/wiki/Apple_File_Exchange )의 개발이 범용 문자셋에 대한 논의로 이어졌다. 애플의 Mark Davis가 [ANSI X3L2](http://sova.si.edu/record/NMAH.AC.0311 )(무료 스미스소니언 온라인 아카이브에 정보가 있군요. 컴퓨터 문자셋과 코드에 대한 논의였나봅니다.)에 참여를 시작했다.

## 1987년 4월

Peter Fenwick(역주: 동명의 신경심리학자가 아니라, 오클랜드 대학의 컴퓨터과학자로 추정됩니다. 후에 [펜윅 트리](https://en.wikipedia.org/wiki/Fenwick_tree)를 고안한 것으로도 유명합니다.)가 제록스를 방문하며 "0에서 시작하여 다음 문자를 추가"라는 Unicode의 원래 아키텍처에 영감을 줬단다. 또한, RLG(The Research Libraries Group)의 Alan Tucker와 Karen Smith-Yoshimura와 토론토 대학의 Nakajima도 참석했다.

## 1987년 가을

Joe Becker의 제록스 그룹은 Davis와 다국어에 대한 문제를 논의하기 시작했다. 새 캐릭터 인코딩이 주요 주제였다.

7년간의 Xeros [XCCS](https://ipfs.io/ipfs/QmXoypizjW3WknFiJnKLwHCnL72vedxjQkDDP1mXWo6uco/wiki/Xerox_Character_Code_Standard.html )(Xerox Character Code Standard) 체계에 대한 Opstad에서의 경험에 의한 평가는 고정폭을 가진 디자인이 바람직하게 보였다. (어렵네, 네 그냥 고정폭이 좋은거 같어 라고 읽으세요.)

## 1987년 12월

Becker가 작성한 문서에서 유일하고(unique), 범용적이고(universal) 그리고, 일관성(uniform)있는 문자 인코딩이라는 의미에서 "Unicode"라는 용어가 처음 사용되었다. 

## 1988년 2월

애플에서는 Collins가 작업을 시작했다. 첫 번째 작업들 중 하나는 "High Text(Ascii는 Low Text)"라고 부르는 Davis의 고정폭을 가진 16비트 문자 인코딩을 애플의 차기 시스템에 고려하는 것이었다. 조사는 다음 세 가지로 모아졌다:
    a. 고정, 가변 폭 텍스트의 접근성 비교
    b. 2바이트 문자열에 대한 모든 시스텀 저장소의 요구사항 조사
    c. 세계의 모든 알파벳에 대해 준비한 문자 수
여러 문자열 인코딩에 대한 경험과 이런 조사 결과를 기반으로 유니코드의 기본 아키텍처를 만들어졌다. 이것은 Collins의 **유니코드 원칙** 문서에 더해졌다.

Becker는 달라스에서 열린 Uniforum(유닉스 컨퍼런스)에서 /usr/group 국제 소위원회에 유니코드 원칙들을 소개했다.

## 1988년 4월

애플에서 첫 유니코드 문자 인코딩의 프로토타입을 시작했다. 유니코드 지원을 [TrueType](https://ko.wikipedia.org/wiki/트루타입 )에 포함하기로 결정했다.

## 1988년 여름

Becker와 Collins는 한자 통합을 위한 표준을 논의하기 위해 팔로알토 다운타운의 RLG별관에서 RLG의 Tucker와 Smith-Yoshimura와의 만남을 가졌다.

## 1988년 7월

애플은 **Han Unification**의 연구를 위해 RLG의 CJK 문자 데이터베이스를 구입했다.

## 1988년 9월

Becker와 Collins는 **Han Unification**과 ISO DP 10646에서 [C0 C1](https://en.wikipedia.org/wiki/C0_and_C1_control_codes ) 제어 문자의 사용을 제안하기 위해 ANSI X3L2를 방문했다. 후에, Becker는 ISO WG2에서 **Unicode '88'**(에 에어리어 88...)을 소개했다.

## 1988년 10월

Collins와 Becker는 Association of Font Information(이하 AFII)의 Ed Smura의 권고로 한자에 대한 논의를 위해 도쿄에서 열린 AFII 회합에 참여했다. Han Unification과 관련한 Xerox Han 상호 참조 도구에 대한 Fuji Xerox에서의 데모가 포함되었다.

## 1988년 11월

Collins가 Unicode Non-Han 데이터베이스를 만들고, Unicode의 명칭과 매핑을 위한 첫 데이터베이스의 초기 범위를 정의하기 시작했다. 계속된 회의를 통해 핵심 내용과 문제가 개선되었다. 원 디자인은 복합 문자를 제외하고 텍스트 크기와 텍스트 형태의 구분에 기초했다.

## 1989년 1월

Collins는 제록스의 표준을 구현하는 Ed Smura, Abhay Busha, Becker와 만나 Han Unification을 위해 데이터베이스를 공유하는 문제에 대해 논의했다. 제록스는 [ISO 10646](https://ko.wikipedia.org/wiki/국제_문자_세트 )에 대한 다양한 기업의 대안을 지원한다. 양 사의 데이터베이스의 조화를 목표로 데이터 교환에 동의한다.

Metaphor는 자사의 소프트웨어의 국제화를 지원하기 위해 16비트 문자 인코딩을 포함하기로 결정한다.

## 1989년 2월

유니코드 회합에 Metaphor (Mike Kernaghan과 Ken Whistler), RLG(Karen Smith-Yoshimura와 Joan Aliprand)가 참여했다.

Sun Microsystems의 Glenn Wright와 Adobe의 John Renner, Claris의 Joe Bosurgi, HP의 Mike Ksar, NeXT의 James Higa, 그리고 Pacific Rim Connections의 James Caldwell이 참여하며 유니코드 회합은 격월로 열리게 되었다.

1991년 유니코드 협회 발족과 함께 유니코드 기술 위원회로 바뀌게 되는 모임에 번호를 매기기 시작한 것은 1989년 2월 회합에서 시작되었다.

초창기에 Xerox, Metaphor, Appple, 그리고 HP에서 열리던 회의를 거쳐 RLG가 공식적인 회합장소를 제공했다.

Glenn Wright는 유니코드에 대한 넷상의 토론을 위해 Unicode@sun.com을 만들고 관리하기 시작했다.

## 1989년 3월

Collins는 RLG와 CCCII의 데이터를 사용해서 [Hypercard](https://ko.wikipedia.org/wiki/하이퍼카드 )로 유니코드 Han Database 만들기 시작했다. [Big Five/CNS](https://ko.wikipedia.org/wiki/Big5 ), [GB](https://en.wikipedia.org/wiki/GB_18030 ), [JIS](https://en.wikipedia.org/wiki/JIS_encoding ), [KS](https://en.wikipedia.org/wiki/KS_X_1001 ), 그리고 EACC로 이루어진 Han 표준은 5월에 완성되었다.

## 1989년 4월

당시까지의 ISO 등록 표준에 모든 복합 문자를 포함하고, 현존하는 모든 표준에 round trip 변환을 보장한다는 결정을 내렸다.

## 1989년 5월

Becker와 Collins는 일반적인 Han 문자에 대해 논의하기 위해 홍콩에서 열린 AFII 모임에 참석했다. AFII는 ISO DP 10646을 통해 Han Unification의 지원을 결정한다.

## 1989년 8월

Becker와 Collins는 Apple과 Xerox의 Han 데이터베이스의 차이점을 해결하여 통합한다. 기존의 표준에서 모든 특징을 유지하고 변형을 해결하기 위해 JIS와 Chinese 가이드라인을 따르기로 결정한다.

양방향 (중동) 그리고 인도어 텍스트를 위해 논리적 순번을 사용하기로 결정한다. 다중 임베딩(역주: 화면에 표시하는 문자가 아닌 문자열의 좌우 순서 등을 지시하는 특수한 유니코드등을 삽입하는 것에 대한 지칭입니다. 아마도..)에 대한 문제가 처음 논의된다.

## 1989년 9월

Becker와 Collins는 (Becker가 인쇄한) Unicode의 첫 초안을 ANSI X3L2에 제안한다. 그 결과로 ANSI측에서 Han Unification과 C0, C1의 사용의 절충안을 ISO에 제시한다. Apple, Claris, Metaphor, NeXT 그리고 Sun이 Unicode를 대변하여 참여했다. 이 첫번째 초안은 Han의 정렬을 위해 Davis의 Gray code 체계를 사용한다.
이 절충안으로 유니코드 작업그룹은 스크립트 하위 집합을 위해 기존의 ISO 정렬과 ISO 명명 체계를 사용하기로 결정한다.

## 1989년 10월

Collins는 TrueType에 대한 Apple과 Microsoft간의 협조를 통해 Microsoft와IBM에 Unicode를 제공한다.
Collins는 ANSI와 Unicode를 대표하여 베이징에서 열린 Han Unification에 대한 ISO Ad Hoc에 참석한다. 이 회합을 통해 Han 문자에 대한 인간 친화적 문자 순서를 권고한다. Unicode는 Han 통합을 위해 중국과 협력하기로 결의한다.
Collins는 Apple의 일본인 기술자와 Unicode에 대해 논의하고 지원을 얻는다.
Davis는 요르단의 암만에서 열린 ISO SC2/WG2에서 Unicode를 대표하여 참석한다. WG2는 [분음 기호](https://support.microsoft.com/ko-kr/help/4033601/diacritical-marks-described)(역주: ü등의 문자위에 붙는 발음 기호)를 허용하기로 한다.
도쿄에서 AT&T Unix Pacific의 Rick McGowan은 unicode@sun.com을 통해 Unicode의 지원을 위한 활발한 토론을 시작한다.

## 1989년 11월

Unicode Han Set에 JIS X 0212-1990과 GB1을 포함하기 위한 맵핑을 식별하기 위해 Cora Zhang를 고용한다.

## 1989년 12월

Collins는 TrueType 폰트인 Jamboree에서 애플의 다음 문자열 셋으로 Unicode을 제시한다.
Becker는 Unix 국제화 회의에서 Unicode를 발표한다.

## 1990년 1월

True Type에 대한 Apple과 Microsoft의 협력으로 Microsoft는 Unicode에 흥미를 보이기 시작한다. Microsoft의 Michel Suignard와 Asmus Freytag는 Unicode 회의에 참여하기 시작한다.
McGowan 나중에 도쿄에서 처음 열린 Unicode회의에 Apple Japan, Microsoft KK 등과 함께 참가한다.
JIS 위원회가 Unicode에 대해 논의하기 위한 만난다. Collins는 이 회의의 결과로 나온 Pro Tajima의 논의를 번역한다. Becker와 Collins는 답변서를 작성한다.
Sebold Report on Desktop Publishing은 폰트에 대한 논의의 부분으로 Unicode 프로젝트를 하일라이트로 싣는다. Becker, Collins 그리고 Davis는 4월 이슈에 두 가지에 대한 긴 정정문으로 응답한다.

## 1990년 3월

Collins와 Becker는 대한민국에서 열린 ISO WG2 Ad Hoc on Han Unification에 참가한다. 유니코드의 새로운 구성은 강희자전식 부수 획 순서에 근거해서 배포되었다.

Han을 제외한 유니코드는 이 시점에서 기본적으로는 완료되었다. 크로스 맵핑(아직 정확한 의미를 모르겠다.)과 명명 작업이 시작된다.

호환성을 위해서 0x0080-0x009F C1 영역에서 문자를 제거했다. **Roundtrip**이 ISO 8859 와 ISO 6937을 통해 보증되었다.

Sun Microsystems의 Glenn Wright와 Metaphor의 Mike Kernaghan은 유니코드 협회의 법인체를 설립하는 작업에 들어간다.

Joan Winters는 유니코드 모임에서 SHARE(1955년에 결성된 최초의 IT 사용자 그룹)를 대표해 참석하기 시작한다. (SHARE는 신문지상이나 컨퍼런스에서 Unicode가 주목 받을 수 있도록 활동한다.)

Microsoft Japan의 키타노, Apple Japan의 야마무라 그리고 McGowan 세 명은 일본 유니코드 스터디 그룹을 발족한다. 후에 Apple Japan의 타카하시, 야마다, IBM 재팬의 키도, 스즈키, Sun Microsystems Japan의 쿠로사카, Fujitsu의 세키구치가 참여한다.

## 1990년 4월

ISO SC2 워싱턴 회의. ANSI의 한자 통합 제안이 거부되고, WG2의 분음 기호(floating diacritics) 결정이 번복되었다. (정치의 세계...) 유니코드 팀은 가능한 곳에서 ISO 10646의 문자 명명 체계에 맞추기로 결정한다.

## 1990년 5월

Becker가 첫 유니코드 문자 이름 완성 초안을 배포했다. Whistler가 이름과 매핑을 위한 [4th Dimension](https://en.wikipedia.org/wiki/4th_Dimension_%28software%29) 데이터베이스 구축을 시작했다. Davis는 애플의 WWDC(Worldwide Developer's Conference)에서 유니코드를 발표했다.

## 1990년 6월

IBM이 본격적으로 참여하기 시작한다. J.G. Van Stee가 IBM의 정규 유니코드 대표로 합류한다. (빅 블루가 왔다.)

## 1990년 7월

Sun이 유니코드 문서 편집을 위해 James Caldwell을 고용했다. Whistler가 Collins로부터 Non-Han 데이터베이스를 인수했다. Metaphor와 Microsoft가 대규모 문자 매핑 작업에 들어갔다.

임시 임원이 선출되었다: Mark Davis(대표), Bill English(재무), Ken Whistler(총무). (드디어 조직다운 조직이.)

## 1990년 8월

IBM의 Isai Scheinberg가 IBM 내부의 유니코드 검토와 토론토 대학의 한자 통합 연구를 조직했다. [Aldus](https://en.wikipedia.org/wiki/Aldus_Corporation)(역주: PageMaker로 유명한, 후에 Adobe에 인수된 회사)가 유니코드에 합류했다.

Davis가 양방향 텍스트를 위한 포맷 코드를 제안하고, WYSIWYG 프로토타입을 시연했다.

## 1990년 9월

IBM 검토 결과가 반영되었다. 특히 [반각 문자](https://ko.wikipedia.org/wiki/반각)를 위한 호환 영역과 아랍어 글리프가 추가되었다.

## 1990년 10월

유니코드 한자 최종 검토안이 완성되었다. 토론토 대학이 한자 섹션 검토를 시작했다.

Claris의 Joe Bosurgi가 유니코드에 합류했다. Microsoft의 Asmus Freytag가 양방향 소위원회를 이끌며, Davis와 IBM의 텍스트 순서 제안을 비교 검토했다.

McGowan은 향후 표준 버전을 위한 문자 데이터베이스를 구축하기 시작했다.

## 1990년 11월

Freytag와 Anas Jerrah에 의해 최종 검토안이 국제적으로 배포되었다. Davis와 Collins가 IEEE 컨퍼런스에서 유니코드 논문을 발표했다.

## 1990년 12월

IBM Japan의 Yasuo Kida가 도쿄에서 열린 SEA Forum에서 유니코드를 대표했다.

인도어 문자 문제가 해결되었다. 남아시아 문자에 논리적 순서를 사용하기로 결정하고, H.M. Ross의 피드백을 반영해 길이 표시(length marks)를 추가했다.

추가 임시 임원이 선출되었다: Mike Kernaghan(부대표), Joe Becker(기술 부대표).

## 1991년 1월

**1월 3일, 유니코드 협회(Unicode, Inc.)가 캘리포니아에서 법인으로 설립되었다.**

1월 25일에 첫 이사회가 소집되어 정관이 승인되고 임원이 확정되었다. (작업 그룹에서 법인으로, 점점 커지는 유니코드.)

유니코드 작업 그룹의 마지막 모임. 이후 새로운 절차와 함께 유니코드 기술 위원회(UTC, Unicode Technical Committee)로 전환되었다.

## 1991년 2월

Andrew Pollack의 기사 "Universal Computer Code Due"가 [뉴욕 타임스](https://ko.wikipedia.org/wiki/뉴욕_타임스)에 실렸다. 유니코드에 대한 최초의 주요 언론 보도 중 하나. (뉴욕 타임스라니, 이 정도면 메이저.)

Erica Liederman이 유니코드 북 편집자로 고용되었다. 2월 19일에 첫 보도자료가 배포되었다.

[Digital](https://ko.wikipedia.org/wiki/디지털_이큅먼트_코퍼레이션), [Lotus](https://en.wikipedia.org/wiki/Lotus_Software), [Novell](https://ko.wikipedia.org/wiki/노벨_(기업))이 기업 회원으로 합류했다.

## 1991년 3월

3월 15일에 하루 종일 유니코드 북 편집 세션이 열렸다. UTC #46이 3월 26-27일에 열리며 5월 7일 책 전달 목표를 확정했다.

기술 이사가 임명되었다: Asmus Freytag와 Lee Collins. Ecological Linguistics가 기업 회원으로 합류했다.

## 1991년 4월

미국 정부가 ISO 10646 DIS1에 "No" 입장을 취했다. 두 번째 편집 회의가 열렸으며, 5월 7일 출간 일정을 연기하라는 압박이 있었다. 한자 초안이 배포되었고, UTC가 적합성과 양방향 텍스트에 대한 서면 투표를 실시했다.

## 1991년 5월

5월 8일, 예정대로 사전 교정 원고가 [Addison-Wesley](https://ko.wikipedia.org/wiki/애디슨웨슬리)에 전달되었다. (일정 사수 성공!) 위기 관리 수요로 인해 여러 저자가 빠졌다.

유니코드-ISO 10646 합병 제안이 등장했다. [Borland International](https://ko.wikipedia.org/wiki/볼랜드)이 기업 회원으로 합류했다.

## 1991년 6월

**ISO 10646 DIS 1이 부결되었다.** 샌프란시스코에서 열린 ISO WG2 임시 회의에서 "합병(The Merger)" 절차가 시작되었다. (10646과 유니코드, 두 표준의 운명적 만남이 시작된다.)

한자 섹션이 지연되었다. 6월 27일에 최종 텍스트 검토판이 발송되었다. UTC #47이 6월 7일에 소집되어 10646U 제안을 권고했다.

외자(Gaiji), 한글, CJK, 신규 문자를 위한 UTC 소위원회가 설립되었다.

## 1991년 7월

카메라 레디 원고 제작이 시작되었다. 한자 통합을 위한 **CJK-JRG**(Chinese, Japanese, and Korean Joint Research Group)가 설립되었다. (후에 [IRG](https://en.wikipedia.org/wiki/Ideographic_Research_Group)로 발전한다.)

10646 합병을 지원하기 위해 유니코드 책이 **2권으로 분리** 결정되었다. Metaphor가 자사의 문자 데이터베이스를 Unicode, Inc.에 라이선스했다.

## 1991년 8월

비공식 2일간의 유니코드 워크숍이 성공적으로 개최되었다. 8월 9일에 제작용 최종 원고가 전달되었다.

제네바의 WG2 회의에서 유니코드의 주요 기능들이 채택되었다: C0/C1, 분음 기호, 한자 통합, 그리고 유니코드 문자들. (합병의 첫 열매가 맺히다.) ISO 관계에 대한 안내가 책에 추가되었다.

## 1991년 9월

베트남어 사전 조합 문자에 대한 집중적인 로비가 이어졌다. UTC #48에서 지원과 문자 논의가 진행되었다.

[Adobe](https://ko.wikipedia.org/wiki/어도비)가 기업 회원으로 합류했다. 제휴(Affiliate) 회원 카테고리가 정의되었다.

## 1991년 10월

WG2가 파리에서, SC2가 렌에서 각각 열렸다. 10646 합병을 위해 아랍어 합자(ligature)를 중심으로 수천 개의 호환 문자가 추가되었다.

UTC #49가 토론토에서 열려 합병 영향과 Volume 2 계획을 논의했다. Apple이 DIS 1.2 차트 인쇄를 자원했다.

**10월 18일, Addison-Wesley에서 유니코드 표준 1.0 Volume 1이 출판되었다.** (역사적인 순간이다. 1987년 Becker의 첫 문서에서 시작해 약 4년 만에 공식 표준이 세상에 나왔다.)

## 1991년 11~12월

10646 DIS 1.2 작업이 계속되었다. Apple이 자사의 UniHan 데이터베이스를 Unicode, Inc.에 라이선스했다. IAPS가 1992년 3월 워크숍을 위한 전문 교육 과정 제작을 의뢰받았다.

CJK-JRG가 한자 통합(Han Unification) 1.0을 승인했고, 최종 제안이 Apple에서 검증되었다. UniHan 1.0 데이터베이스가 배포되었다. Apple, Metaphor, Digital이 DIS 1.2 인쇄를 위해 협력했다.

## 1992년 1~2월

Volume 2가 교정 단계에 진입했다. 한자 변경 요청이 제출되었다. ISO 10646 DIS 1.2가 4개월간의 투표를 위해 배포되었다.

CJK-JRG 회의에서의 정렬 문제로 인해 Volume 2 출판이 지연되었다.

## 1992년 3월

제2회 유니코드 구현자 워크숍이 열렸다. 예상의 세 배에 달하는 참석자가 모였다. (유니코드에 대한 관심이 폭발적으로 커지고 있다.)

Volume 2의 표지가 [강희자전](https://ko.wikipedia.org/wiki/강희자전) 페이지 스타일을 사용해 디자인되었다. Volume 1의 [로제타석](https://ko.wikipedia.org/wiki/로제타석) 표지와 대비되는 디자인. (한자 권을 담은 Volume 2에 강희자전이라니, 센스 있다.)

CJK-JRG가 한자 변경을 승인하여, Volume 2 작업이 진행될 수 있게 되었다.

## 1992년 4~5월

Microsoft에서 비공식 유니코드 교육 리허설이 진행되었다. 개인 회원 및 준회원 카테고리가 추가되었다.

샌프란시스코 베이 에어리어, 프랑크푸르트, 일본에서 새로운 워크숍이 기획되었다. Volume 2 카메라 레디 원고가 전달되었다.

ISO 10646 투표는 극도로 접전이었다. 서울에서의 의견 해결 준비가 시작되었다. [Hewlett-Packard](https://ko.wikipedia.org/wiki/휴렛_팩커드)가 유니코드 협회에 합류했다.

## 1992년 6월

**유니코드 표준 1.0 Volume 2가 출판되었다.** (드디어 완성! Volume 1의 비한자 문자에 이어, 한자를 포함한 완전한 유니코드 1.0이 세상에 나왔다.)

## 1992년 9월

PC Magazine에 John C. Dvorak의 기사 **"Kiss your ASCII Goodbye"**가 실렸다. (대중 매체에서의 유니코드에 대한 의미 있는 보도. 제목이 참 인상적이다.)

---

*이렇게 유니코드 1.0이 완성되기까지, 1986년의 한자 데이터베이스 작업에서 시작해 약 6년에 걸친 여정이 마무리되었다. 수많은 기업과 개인의 헌신, ISO와의 합병이라는 정치적 격류, 그리고 "세상의 모든 문자를 하나의 코드로"라는 비전이 만들어낸 결과물이다.*
