---
title   : Combine(Scheduler) + iOS 13.1 = Crash
date    : 2021-12-31 10:23:56 +0900
categories : swift combine crash
---

> **2026-10-28 검토:** iOS 13.1에서 관찰했던 크래시 기록입니다. Xcode·Swift 버전, OS 빌드 번호, 크래시 스택은 원문에 없으며 현재 환경에서 재현하지 않았습니다. 수정된 OS 버전도 이 기록만으로 확정할 수 없습니다.


# OMG
거두절미하고 Combine에서 Scheduler Type중 DispatchQueue를
사용하는 경우 크래시가 발생하게 되어 가볍게 글을 남깁니다.

## 조건
iOS 13.1

두 DispatchQueue.SchedulerTimeType의 값이 다를때 Comparable 연산자 사용

DispatchQueue.SchedulerTimeType을 그대로 사용하면 문제가 없고, Generic으로
사용할 때 이슈 발생

## 당시 관찰과 해석
당시에는 iOS 13.0의 throttling 경로와 달리 iOS 13.1에서 문제가 드러나는 것으로 보았다. 내부 비교 구현에 대한 설명은 당시의 추정이며, 이 글에는 이를 입증할 런타임 소스나 스택을 남기지 못했다.

iOS 13.1 에서는 Scheduler로 DispatchQueue를 사용시 SchedulerTimeType을 비교에 사용하는데 크래시 발생

## 추정
iOS 13.1에 포함된 libswiftDispatch.dylib의  DispatchQueue.SchedulerTimeType에 대한 Comparable 연산자의 코드에 오류가 존재

### 비교 결과를 설명하기 위한 의사 코드

아래 정수 대입은 실제 `SchedulerTimeType` 초기화 문법이 아니다. 주석은 당시 기록이며 모든 연산자를 지금 재검증한 결과가 아니다.
~~~swift
let a: DispatchQueue.SchedulerTimeType = 2 // 이보다 좀더 복잡하지만 대충할께요
let b: DispatchQueue.SchedulerTimeType = 1

a == b // crash
a != b // crash
a >= b // crash
a > b // OK
a < b // crash
a <= b // OK
~~~

### 당시 재현 코드

UIKit 앱 target의 ViewController에서 버튼을 누르는 구성이다. `import UIKit`, `import Combine`이 필요하다. 일반 비교와 제네릭 `Scheduler` 경유 비교를 같은 기기·빌드에서 따로 실행하고 크래시 스택을 수집해야 한다.
~~~swift
import UIKit
import Combine

class ViewController: UIViewController {

    override func viewDidLoad() {
        super.viewDidLoad()

        let button = UIButton(type: .custom)
        button.setTitle("CLICK", for: .normal)
        button.setTitleColor(.darkText, for: .normal)
        button.addTarget(self, action: #selector(click), for: .touchUpInside)

        view.addSubview(button)

        button.translatesAutoresizingMaskIntoConstraints = false

        NSLayoutConstraint.activate([
            button.centerXAnchor.constraint(equalTo: view.centerXAnchor),
            button.centerYAnchor.constraint(equalTo: view.centerYAnchor),
        ])
    }

    @objc func click() {
        let a: DispatchQueue.SchedulerTimeType = .init(.init(uptimeNanoseconds: 4))
        let b: DispatchQueue.SchedulerTimeType = .init(.init(uptimeNanoseconds: 2))
//        print(a < b)
        self.test(s: DispatchQueue.main, a: a, b: b)
    }

    func test<S>(s: S, a: S.SchedulerTimeType, b: S.SchedulerTimeType) where S: Combine.Scheduler {
        if a == b {
            print("OK")
        } else {
            print("NOT")
        }
    }
}

~~~

## 결론
당시에는 `DispatchQueue` 대신 `RunLoop`를 사용하는 우회를 고려했다. 두 스케줄러는 실행 문맥과 스케줄링 특성이 같지 않으므로 무조건 교체할 처방은 아니다. 지원 대상 OS에서 재현한 뒤, 필요한 큐·스레드 보장과 이벤트 전달 동작을 함께 확인해야 한다.

API의 계약은 [Apple Scheduler 문서](https://developer.apple.com/documentation/combine/scheduler)를 참고한다. 이 문서는 위 크래시의 존재나 수정 버전을 증명하는 자료는 아니다.
