---
title   : Error(Type)
summary :
date    : 2018-04-26 22:34:53 +0900
updated : 2018-04-26 23:34:31 +0900
tags    :
toc     : true
public  : true
parent  : swift_source
parenttitle : 스위프트 소스코드 분석
latex   : false
---

> **2026-10-28 검토:** 2018년 런타임 소스 탐색 기록입니다. 밑줄 API 관찰과 앱에서 사용할 공개 API를 구분하고, Swift 3부터 제공된 NSError 브리징 방법을 보완했습니다.


# Error(Type)

- 파일명은 ErrorType.swift로 되어있지만, protocol 은 Error로 되어있다.

## Swift <-> NSError

- 당시에는 문서에서 찾지 못했지만, Swift 3부터 `CustomNSError`와 `LocalizedError`라는 공개 프로토콜이 제공된다. 아래 밑줄 프로퍼티는 당시 소스 관찰 기록이며 앱에서 직접 구현할 방법으로 권하지 않는다. `enum SomeError: Error`로 구현한 경우 NSError로 변환시 `Error Domain=__lldb_expr_1.SomeError Code=1 "(null)"`의 형태로 출력된다. 나쁠건 없지만, 그래도 좀 더 읽기 편한게 좋을거 같다.
- ErrorType.swift의 소스를 보면 아래와 같다.

~~~swift
public protocol Error {
    var _domain: String { get } // 1.
    var _code: Int { get } // 2.
    ...
    var _userInfo: AnyObject? { get } // 3.
}
~~~

그냥 봐도 바로 이 부분이 NSError의 domain, code, userInfo인것 같다.

1. _domain은 에러 도메인이다. 난 com.facebook.post 같은 형식으로 하긴 하지만 강요하지 않는다. 구현은 아래와 같다.
~~~swift
enum SomeError: Error {
    ...
    var _domain: String {
        return "com.facebook.post"
    }
    ...
}
~~~
2. _code는 에러 코드이다. 구현은 아래와 같다.
~~~swift
enum SomeError: Error {
    ...
    var _code: Int {
        switch self {
        case ...: return 1
        case ...: return 2
        ...
        }
    }
    ...
}
~~~

3. `_userInfo`는 당시 소스에서 `AnyObject?`로 표현되어 있었다. 원문의 `_userDomain`은 오기다. 아래는 당시 시도했던 코드 조각이며, Swift Dictionary와 NSDictionary의 브리징을 구분해야 한다. 공개 `CustomNSError.errorUserInfo`의 타입은 `[String: Any]`다.

~~~swift
enum SomeError: Error {
    ...
    var _userInfo: AnyObject? {
        return Mirror(reflecting: self).children.reduce([String: Any]()) {
            var info = $0
            if let label = $1.label {
                info[label] = $1.value
            }
            return info
        }
    }
    ...
}
~~~

이 부분은 브리징 내부를 살펴본 메모로 남긴다. 실제 앱의 domain, code, userInfo 지정에는 아래 공개 API를 사용한다.

어따 쓸지는 모르겠지만, 필요할 때가 있겠지.

## 공개 API로 작성하는 예

다음은 Swift 3 이후의 `CustomNSError` 예다. Foundation을 import하고 `NSError`로 브리징한 값을 확인한다.

```swift
import Foundation

enum PostError: CustomNSError {
    case invalidResponse

    static var errorDomain: String { return "com.example.post" }
    var errorCode: Int { return 1 }
    var errorUserInfo: [String: Any] {
        return [NSLocalizedDescriptionKey: "응답 형식이 올바르지 않습니다."]
    }
}

let error = PostError.invalidResponse as NSError
assert(error.domain == "com.example.post")
assert(error.code == 1)
```

`LocalizedError`는 설명·실패 이유·복구 제안 등을 제공하는 별도 공개 방법이다. 밑줄 프로퍼티를 오버라이드하지 않아도 된다. [SE-0112: Improved NSError Bridging](https://github.com/swiftlang/swift-evolution/blob/main/proposals/0112-nserror-bridging.md)에 두 프로토콜과 브리징 규칙이 설명되어 있다. 예제는 API 계약을 보여 주며 이 편집 환경에서는 Swift 실행 검증을 하지 않았다.
