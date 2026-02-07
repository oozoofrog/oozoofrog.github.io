---
title   : Combine(Scheduler) + iOS 13.1 = Crash
date    : 2021-12-31 10:23:56 +0900
categories : swift combine crash
---

# OMG
거두절미하고 Combine에서 Scheduler Type중 DispatchQueue를
사용하는 경우 크래시가 발생하게 되어 가볍게 글을 남깁니다.

## 조건
iOS 13.1

두 DispatchQueue.SchedulerTimeType의 값이 다를때 Comparable 연산자 사용

DispatchQueue.SchedulerTimeType을 그대로 사용하면 문제가 없고, Generic으로
사용할 때 이슈 발생

## 현상
iOS 13.0 에서는 throttling등에서 SchedulerTimeType에 대한 비교를 Comparable을 사용하지 않고, 직접 SchedulerTimeType.Stride
로 비교하고 있어 이슈가 발생하지 않음

iOS 13.1 에서는 Scheduler로 DispatchQueue를 사용시 SchedulerTimeType을 비교에 사용하는데 크래시 발생

## 추정
iOS 13.1에 포함된 libswiftDispatch.dylib의  DispatchQueue.SchedulerTimeType에 대한 Comparable 연산자의 코드에 오류가 존재

### 예
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

### 재현코드
~~~swift
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
iOS 13.1 에서 Combine을 사용할 때 Scheduler가 필요한 경우에는 RunLoop를 사용하자
