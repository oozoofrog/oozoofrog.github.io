---
title   : RxSwift
summary :
date    : 2018-04-09 17:21:34 +0900
updated : 2018-04-24 17:58:27 +0900
tags    :
toc     : true
public  : true
parent  : developing
latex   : false
comments : true
---

> **2026-10-28 검토:** 2018년 RxSwift 메모입니다. `catchError`의 동작 설명을 정정했습니다. 이 이름은 당시 API이며 RxSwift 6 문서에서는 `catch` 이름을 사용합니다.


# 여러가지 상황에서의 Rx 사용

### catchError와 종료

- 원본 시퀀스가 error를 보내면 그 시퀀스는 끝난다. `catchError`는 에러를 처리할 대체 Observable을 구독해 downstream을 이어 주는 연산자다. 이는 hot Observable에만 적용되는 규칙이 아니다.
- 원본 구독의 해제, 대체 시퀀스의 완료·에러, 전체 구독의 명시적 dispose를 구분해야 한다. 대체 Observable을 반환했다고 전체 스트림이 즉시 dispose되는 것으로 설명하면 안 된다.
- hot source에서 이후 이벤트를 계속 받고 싶다면 에러가 어느 스트림을 끝내는지와 `catch`를 적용한 위치부터 확인해야 한다. 종료된 Subject가 다시 이벤트를 보내는 것으로 기대해서는 안 된다.

[RxSwift ObservableType 문서의 시퀀스 계약과 catch 연산자](https://docs.rxswift.org/protocols/observabletype)를 참고한다.

### UIView

- UIButton들의 rx.tap 이벤트를 하나의 스트림으로 처리할 경우
~~~swift
import UIKit
import RxSwift
import RxCocoa

let firstButton = UIButton(type: .system)
let secondButton = UIButton(type: .system)
let buttons = [firstButton, secondButton]
let taps = buttons.map { $0.rx.tap.asObservable() }
let observable = Observable<Void>.merge(taps)
~~~
이것으로 각 이벤트를 하나의 스트림으로 엮을 수 있다.

위 코드는 타입 `[UIButton]` 자체가 아니라 실제 버튼 인스턴스 배열에서 스트림을 만든다. 구독의 수명은 화면의 `DisposeBag` 등으로 관리한다. RxSwift/RxCocoa 버전을 고정한 iOS target에서 두 버튼의 이벤트와 화면 해제 후 구독 정리를 확인해야 한다. 이 글에는 그 실행 결과는 기록하지 않았다.
