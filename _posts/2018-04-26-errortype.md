---
layout: post
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
* TOC
{:toc}

# Error(Type)

- 파일명은 ErrorType.swift로 되어있지만, protocol 은 Error로 되어있다.

## Swift <-> NSError

- 레퍼런스나 interop 가이드를 봐도 swift의 error를 NSError로 변환시 code, domain, userInfo부분을 어떻게 하면 되는지 나오지 않는다. `enum SomeError: Error`로 구현한 경우 NSError로 변환시 `Error Domain=__lldb_expr_1.SomeError Code=1 "(null)"`의 형태로 출력된다. 나쁠건 없지만, 그래도 좀 더 읽기 편한게 좋을거 같다.
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

3. _userDomain은 NSDictionary를 반환한다. [Key: Value]이거 아니다. NSDictionary다. _userDomain의 타입이 Any(타입)가 아니라 AnyObject(오브젝트)라서 그렇다. 구현은 다음과 같다. 아니 나는 보통 이렇게 한다.

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

이렇게 구현하게 되면 NSError로 변환시 code, domain, userInfo가 구현된다.

어따 쓸지는 모르겠지만, 필요할 때가 있겠지.
