---
date: 2016-06-28 14:20:28+00:00
title: Swift asserts - the missing manual
categories:
- swift
---

> **2026-10-28 검토·정정:** 저자의 허가를 받은 번역 기록이며 Swift 2.x 문맥을 유지합니다. Swift 2.2 표준 라이브러리 소스로 assertionFailure의 -O 동작과 -Ounchecked의 의미를 정정했습니다. 예전 스크린샷·역어셈블 결과는 역사적 관찰이며 현재 도구로 재현하지 않았습니다.

<blockquote>**assertion** - 사실 혹은 신념에 대한 확고하고 강력한 주장. 증명에 대한 확인이나 입증 없이 어떤 명백한 상태에 있을 것으로 공인하거나 정의하는 것.</blockquote>

[Swift asserts - the missing manual](https://t.co/bQ00QfnC46) 의 원문을 저자의 허가를 받아 번역합니다. swift 2.x에 적합한 내용으로 3이 정식 배포할 때, 저자의 업데이트를 반영할 예정입니다.

assertion은 훌륭한  [디버깅 툴](https://developer.apple.com/library/prerelease/ios/documentation/Swift/Conceptual/Swift_Programming_Language/TheBasics.html#//apple_ref/doc/uid/TP40014097-CH5-ID335)입니다. 언제든 필요할 경우, 기대하는 상태에 대해 코드를 체크할 필요가 있을 때, assertion의 기능을 사용하면 기대와 다른 결과를 만날 경우 트랩 등으로 프로그램 실행이 중단될 수 있습니다. 여기서 말하는 실패는 `throw`로 던져 `catch`하는 Swift 오류와 다릅니다.

Standard Swift library는 코드의 흐름에 대해 다른 방식으로 영향을 끼치는 5가지 함수를 정의하고 있습니다:

  1. assert()

  2. assertionFailure()

  3. precondition()

  4. preconditionFailure()

  5. fatalError()

저는 여기에서 NSAssert에 대해서는 언급하지 않겠습니다. 이 친구들은 Cocoa Foundation에 속해 있는데다, Swift와의 관계도 깊지 않습니다.

## assert()

C에서부터 명맥을 이어온 assert()함수로 첫 대상을 정해봅시다. 기대하는 대로, Swift 2.2의 `assert()`는 `-Onone`에서 조건을 검사합니다. 다른 언어의 assert까지 같은 규칙이라고 일반화하지는 않겠습니다.

예제:

`transformString()` 함수가 비어있는 optional 값을 받는 경우, 예상하지 못한 nil값을 문자열에 추가하는 작업으로 인해 실행은 종료되며, 어플리케이션은 바로 크래쉬를 발생합니다.

```swift
func transformString(string: String?) -> String {
    return string! + "_transforme" // expected error if string == nil
}
```

결과가 그렇게 다르진 않겠지만, 어쨌거나 저는 체크 코드를 추가할 수 있고, 제가 정한 규칙과 다른 경우 실패를 알려줄 것입니다. 저는 다음 함수에 추가로 **assert()** 함수를 사용하여 필요한 조건을 정의해 놓았고, 만약 그 정의에 맞지 않는다면 그 내용을  개발자에게 깔끔하게 알려줄 것입니다.

```swift
func transformString(string: String?) -> String {
    assert(string != nil, "Invalid parameter") // here
    return string! + "_transforme"
}
```

Assertion방식의 종료는 내 코드가 버그나 생각하지 못한 결과를 마주쳤음을 알려줄 것이고, 저는 왜 이런일이 발생했는지에 대해 고민할 필요가 생겼습니다.

이런 형태의 체크 방식은 "programmer errors"라고 지칭하며, 디버그 모드의 빌드에서만 이용됩니다. 배포용도로 빌드를 실행할 경우 assert()함수 구문은 빌드과정에서 생략되며, 그 결과로 transformString()의 안전성은 모호해집니다. (어찌됐건 크래쉬는 발생하겠지만, 그 이유는 미궁에 빠집니다.)

## Debug 혹은 Release?

이 타이밍에 어떤 옵션이 Debug 혹은 Release를 지칭하는지에 대해 아는 것이 중요합니다.  [Swift](https://developer.apple.com/swift/) 에 대해서는 **SWIFT_OPTIMIZATION_LEVEL** 이  결정하게 됩니다.(***역자 주. 여기에서 이야기하는 debug, release는 우리가 아이폰 어플리케이션을 빌드할 때 Debug, Release(배포)로 빌드를 결정하는 것과는 다른 이야기입니다.**)

SWIFT_OPTIMIZATION_LEVEL

![SWIFT_OPTIMIZATION_LEVEL](/assets/images/posts/swift-optimization-level.png)

>SWIFT_OPTIMIZATION_LEVEL = -Onone      // debug<br/>
>SWIFT_OPTIMIZATION_LEVEL = -O          // release<br/>
>SWIFT_OPTIMIZATION_LEVEL = -Ounchecked // unchecked release

메모(Note를 메모로 번역하다니 좀 부끄럽네요.. 좋은 대안을 알려주세요): DEBUG flags 설정에  `GCC_PREPROCESSOR_DEFINITIONS`건 `ENABLE_NS_ASSERTIONS`이 내용과는 관계가 없습니다.

## assertionFailure()

**assertionFailure()**는 내부적으로 도달해서는 안 되는 경로를 디버그 중에 발견하기 위한 함수입니다. Swift 2.2에서는 `-Onone`에서 실행을 중단하지만, `-O`에서는 효과가 없어서 다음 문장으로 진행합니다. **`@noreturn` 함수가 아닙니다.** `-Ounchecked`에서는 최적화기가 이 호출에 도달하지 않는다고 가정할 수 있습니다.

```swift
func tassertionFailure() {
    assertionFailure("nope")
    print("ever") // -O에서는 실행할 수 있음
}
```

예전 글의 경고 화면은 당시 관찰 기록으로 남깁니다. 이를 Release에서 `@noreturn` 효과가 유지된다는 근거로 볼 수는 없습니다.

![당시 assertionFailure 경고 화면; Swift 2.2의 일반 동작 근거와는 구별해야 함](/assets/images/posts/assertion-failure.png)

## precondition()

**precondition()** 은 기본적으로 **assert()**함수와 동일합니다. 다른 점은  debug 와 release 빌드 모두 실행한다는 점입니다. **assert()는 내부 불변식 검토에, precondition은 배포 빌드에서도 진행을 막아야 하는 잘못된 사용을 검출하는 데 씁니다.** 사용자 입력 오류처럼 회복 가능한 실패는 별도의 오류 처리로 다루어야 합니다.

```
func tprecodition() {
    precondition(1 == 2, "not equal")
    print("not equal") // will never be executed
}
```

`-Ounchecked`에서는 조건을 검사하지 않지만, 최적화기는 조건이 참이라고 가정할 수 있습니다. 거짓 조건을 넘긴 경우 안전하게 다음 줄을 실행한다고 기대해서는 안 됩니다.

## preconditionFailure()

**preconditionFailure()** 는 치명적인 에러를 의미합니다. 이 함수는 **assertionFailure()** 와 비슷하며, Swift 2.2에서는 `@noreturn`으로 선언되어, 반환할 수 있는 `assertionFailure()`와 구별됩니다. 조건에 따라 정상 진행하는 `precondition()` 자체가 `@noreturn`인 것은 아닙니다. release unchecked옵션(아래의 주의사항을 봐주세요)을 제외하고 debug, release모두 앱을 강제로 종료시킵니다.:

```
func tpreconditionFailure() {
    preconditionFailure("fatal error")
    print("not") // will never be executed
}
```

주의: `-Ounchecked`에서 `preconditionFailure()` 호출 경로는 도달 불가능하다고 가정할 수 있습니다. 이를 “아무 일 없이 반환한다”는 뜻으로 읽으면 안 됩니다. 최적화 옵션과 관계없이 중단해야 하는 경로는 `fatalError()`로 표현합니다.

##### 함정은 어디?

저는 preconditionFailure()함수의 결과로 SIGTRAP 시그널을 핸들링 할 수 없었습니다. 원래 발생했어야하지만, 발견할 수 없었죠. 저는 preconditionFailure() 함수와 assertionFailure()함수를 역어셈블링 했고, 둘다 비슷해보입니다. (Hopper 어플리케이션으로부터 얻어난 pseudo code입니다.)

`func tpreconditionFailure()`

```
int __TF6result20tpreconditionFailureFT_T_() {
    rax = _TFSSCfMSSFT21_builtinStringLiteralBp8byteSizeBw7isASCIIBi1__SS();
    var_18 = 0x1;
    var_20 = rcx;
    var_28 = "AssertionPlayground.playground/contents.swift";
    var_30 = LODWORD(0x2d);
    var_38 = LODWORD(0x18);
    _TTSf4s_s_s_s___TFSs16_assertionFailedFTVSs12StaticStringSSS_Su_T_("fatal error", LODWORD(0xb), LODWORD(0x2), rax, var_18, var_20, var_28, 0x2d, 0x2, 0x18);
    rax = (*_TFSSCfMSSFT21_builtinStringLiteralBp8byteSizeBw7isASCIIBi1__SS)();
    return rax;
}
```

`func tassertionFailure()`

```
int __TF6result17tassertionFailureFT_T_() {
    rax = _TFSSCfMSSFT21_builtinStringLiteralBp8byteSizeBw7isASCIIBi1__SS();
    var_18 = 0x1;
    var_20 = rcx;
    var_28 = "AssertionPlayground.playground/contents.swift";
    var_30 = LODWORD(0x2d);
    var_38 = LODWORD(0x1d);
    _TTSf4s_s_s_s___TFSs16_assertionFailedFTVSs12StaticStringSSS_Su_T_("fatal error", LODWORD(0xb), LODWORD(0x2), rax, var_18, var_20, var_28, 0x2d, 0x2, 0x1d);
    rax = (*_TFSSCfMSSFT21_builtinStringLiteralBp8byteSizeBw7isASCIIBi1__SS)();
    return rax;
}
```

둘다 굉장히 비슷합니다.

`_TTSf4s_s_s_s___TFSs16_assertionFailedFTVSs12StaticStringSSS_Su_T_`.

실질적으로 내가 맞는지, 뭔가 큰 실수를 했는지 알 수가 없습니다. 말할 수 있는건 Xcode 6.3 (6D532l)버전에서 저는 시그널 핸들링을 받을 수 없었습니다.  **당시 역자 메모:** Xcode 7.3에서는 처리 가능하게 관찰되어 버전 문제를 의심했습니다. 다만 원인을 확인한 결과는 아닙니다.

## CheatSheet

아래는 **Swift 2.2** 기준입니다. `assert`와 `precondition`은 조건이 거짓일 때를 뜻합니다.

| 함수 | `-Onone` | `-O` | `-Ounchecked` |
| --- | --- | --- | --- |
| `assert` | 실행 중단 | 조건 평가·효과 없음 | 조건이 참이라고 가정 가능 |
| `assertionFailure` | 실행 중단 | 효과 없음, 반환 가능 | 호출에 도달하지 않는다고 가정 가능 |
| `precondition` | 실행 중단 | 실행 중단 | 조건이 참이라고 가정 가능 |
| `preconditionFailure` | 실행 중단 | 실행 중단 | 호출에 도달하지 않는다고 가정 가능 |
| `fatalError` | 실행 중단 | 실행 중단 | 실행 중단 |

`-Ounchecked` 열의 가정을 위반한 프로그램은 결과를 예측할 수 없습니다. “중단 YES/NO”로 정리하면 이 중요한 차이가 사라집니다. 이 표의 실행 중단은 복구 가능한 Swift `Error`를 던진다는 의미가 아닙니다.

[정정 근거: Swift 2.2 Assert.swift](https://github.com/swiftlang/swift/blob/swift-2.2-RELEASE/stdlib/public/core/Assert.swift#L12-L157)

## 결론

당신의 코드에 Assert를 사용하는건 좋은 습관입니다. 언제나 말이죠. 스위프트에서 자신에게 큰 피해를 주지 않으려면 현명하게 assertion의 방식을 선택해야합니다. debug, release를 위한 모든 assertion처리의 결과를 항상 명심해야 합니다. **항상 앱스토어 배포전에 품질관리를 하셔야합니다.**

저자 트위터: [@krzyzanowskim](http://twitter.com/krzyzanowskim)

Updated to Xcode 6.3 (6D554n, beta4)

