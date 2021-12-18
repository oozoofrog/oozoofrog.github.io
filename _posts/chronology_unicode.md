---
layout  : wiki
title   : 유니코드 1.0 연대기
summary : 유니코드의 초창기부터 연대별 정리
date    : 2018-04-14 23:47:46 +0900
updated : 2019-03-20 23:59:48 +0900
tags    : unicode chronology
toc     : true
public  : true
parent  : unicode
parenttitle : 유니코드(Unicode)
latex   : false
---
* TOC
{:toc}

# 유니코드 1.0 연대기

*이 글은 unicode.org에 수록되어있는 [unicode version 1.0](https://www.unicode.org/history/versionone.html)가 나오기 까지의 연대별 히스토리입니다.*

## 1986~1987

제록스(Xerox)에서, Huan-mei Liao, Nelson Ng, Dave Opstad,  그리고 Lee Collins는 중국어 문자들을 확장하기 위한 폰트 작업을 빠르게 진행하기 위해 일본어(JIS)와 중국어(간체와 번체) 문자들 사이에서 공통문자들의 맵을 데이터베이스화하는 작업을 시작했다. 실제로도 토론토의 나카지마와 같은 제록스의 사용자들은 부족한 중국어 문자를 확장하기 위해 JIS를 이용하기도 했다. 이는 Eric Mader에 의해 작성된 Han Unification에 대한 찬반 논의로 이어졌다.

한편, 애플에서는(아 나 이런거 정말 좋아), [Apple File Exchange](https://en.wikipedia.org/wiki/Apple_File_Exchange )의 개발이 범용 문자셋에 대한 논의로 이어졌다. 애플의 Mark Davis가 [ANSI X3L2](http://sova.si.edu/record/NMAH.AC.0311 )(무료 스미스소니언 온라인 아카이브에 정보가 있군요. 컴퓨터 문자셋과 코드에 대한 논의였나봅니다.)에 참여를 시작했다.

## 1987년 4월

Peter Fenwick(신경심리학자가 여기서 왜 나와?냐면 Joe[seph D.] Becker가 바로 제록스에서 인공지능 신경망 연구자였거든요.)가 제록스를 방문하며 "0에서 시작하여 다음 문자를 추가"라는 Unicode의 원래 아키텍처에 영감을 줬단다. 또한, RLG(The Research Libraries Group)의 Alan Tucker와 Karen Smith-Yoshimura와 토론토 대학의 Nakajima도 참석했다.

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

Microsoft Japan의 키타노, Apple Japan의 야마무라 그리고 McGowan 세 명은 일본 유니코드 스터디 그룹을 발족한다. 후에 Apple Japan의 타카하시, 야마다, IBM 재팬의 키도, 스즈키, Syn Microsystems Japan의 쿠로사카, Fujitsu의 세키구치가 참여한다.
