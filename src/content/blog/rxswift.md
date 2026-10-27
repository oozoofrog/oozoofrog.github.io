---
title   : RxSwift의 이것저것
summary :
date    : 2018-07-24 08:55:38 +0900
updated : 2018-07-24 10:34:51 +0900
tags    :
toc     : true
public  : true
parent  : swift
parenttitle : swift
latex   : false
---

> **2026-10-28 검토:** 2018년의 ARC 실험 메모입니다. 아래 `Observable`, `Observer`, `Bag`는 직접 만든 모형이며 실제 RxSwift 구현이 아닙니다. 두 순환 참조를 구분하고 Completable의 후속 연결 방법을 보완했습니다.


# Observable, Observer의 상호참조 조사

일단 참조 구조를 순환 참조구성을 목표로 간단히 흉내내 봤다.

```swift

class Bag {
    var items: [Any] = []
}

class Observer<Element> {
    var handle: (Element) -> Void

    init(_ handle: @escaping (Element) -> Void) {
        self.handle = handle
    }

    deinit {
        print("deinit observer for \(type(of: Element.self))")
    }
}

class Observable<Element> {

    var element: Element?
    var observers: [(Element) -> Void] = []
    var subscribes: [(Element) -> Void] = []

    func just(_ element: Element) -> Observable<Element> {
        let observer: Observer<Element> = Observer { event in
            self.subscribes.forEach({ (handle) in
                handle(event)
            })
        }
        observers.append(observer.handle)
        self.element = element
        return self
    }

    func subscribe(_ handle: @escaping (Element) -> Void) -> Observable {
        self.subscribes.append(handle)
        guard let element = self.element else {
            return self
        }
        observers.forEach { (handle) in
            handle(element)
        }
        return self
    }

    deinit {
        print("deinit observable for \(type(of: Element.self))")
    }

}

class ViewController {

    let bag = Bag()

    init() {
        self.viewDidLoad()
    }

    var value: Int = 0 {
        didSet {
            print(value)
        }
    }

    func viewDidLoad() {
        let observable = Observable<Int>()
            .just(10)
            .subscribe { value in
                print(value)
                self.value = value
        }
        self.bag.items.append(observable)

//        self.bag.items.removeAll()
//        observable.observers.removeAll()
    }

    deinit {
        print("deinit \(type(of: self))")
    }
}

var vc: ViewController? = ViewController()
// 아래 설명의 두 강한 참조 순환을 각각 끊어야 한다.
// Bag 항목 제거와 Observable 내부 closure 제거는 서로 다른 역할이다.
vc = nil

```

## 이 모형에서 생기는 두 순환

1. `ViewController → Bag → Observable → subscribes의 closure → ViewController`: 구독 closure가 `self`를 강하게 잡는다. 약한 캡처나 적절한 구독 해제로 화면의 수명과 구독 수명을 분리해야 한다.
2. `Observable → observers의 closure → Observable`: `just`에서 만든 closure 자체가 `self`를 강하게 잡는다. Bag만 비워도 이 내부 순환은 남는다. 반대로 내부 observers만 비워도 첫 번째 순환은 남는다.

따라서 원래 예제의 주석 한 줄만 해제하면 모두 정리된다고 생각하면 안 된다. `Observer` 객체와 그 객체에서 꺼낸 `handle` closure의 수명도 별개다. 이 모형에는 실제 RxSwift의 종료·dispose 처리와 구독 객체가 구현되어 있지 않으므로 RxSwift 자체에 같은 누수가 있다는 증거로 쓸 수 없다.

# Completable 뒤에 다음 스트림 연결하기

원래 “왜 연결할 수 없는가?”로 남긴 질문은 `andThen`으로 해결할 수 있다. Completable은 값을 내보내지 않고 완료 또는 에러를 보낸다. 성공적으로 완료한 뒤 다음 시퀀스를 구독하려면 다음처럼 쓴다(RxSwift 6 API 기준).

```swift
import RxSwift

let next: RxSwift.Observable<String> = Completable.empty()
    .andThen(RxSwift.Observable.just("next"))
```

첫 Completable이 error로 끝나면 다음 시퀀스는 구독하지 않는다. 이는 이벤트 계약을 보여 주는 최소 예이며 실제 비동기 작업의 실행 결과는 아니다. [PrimitiveSequenceType의 andThen 문서](https://docs.rxswift.org/protocols/primitivesequencetype)를 참고한다.
