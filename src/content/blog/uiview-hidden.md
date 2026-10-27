---
date: 2016-07-04 08:05:54+00:00
title: UIView hidden을 뒤집어 봅시다.
categories:
- swift
---

> **2026-10-28 정정:** 2016년 Swift 2 문법의 작은 API 실험입니다. 코드 블록·괄호·호출 예를 바로잡고 indicator의 숨김 조건을 명시했습니다. 현재 Swift에서는 `hidden`이 `isHidden`으로 바뀌는 등 문법 차이가 있으며, 여기서는 당시 문법을 유지했습니다.

## UIView hidden을 뒤집어 봅시다.

일하면서 틈틈이 이것저것 시도해보고 있습니다.

이건 오늘 일하다 UIView hidden 속성, UIActivityIndicator 애니메이션 stop, start가 너무 재미없다는 생각이 들어 작성합니다.

보통은 다음처럼 씁니다. indicator의 `stopAnimating()`은 애니메이션을 멈추는 메소드입니다. **`hidesWhenStopped`가 true일 때** 멈추면서 숨겨집니다. `hidden` 설정과 항상 같은 동작은 아닙니다.

```swift
// Swift 2 문법
view.hidden = hidden
indicator.hidesWhenStopped = true
if hidden {
    indicator.stopAnimating()
} else {
    indicator.startAnimating()
}
```

**식상하고 지겹고 재미없습니다.** 그래서 아래처럼 프로토콜을 만들어 봅니다. 다만 이 실험은 indicator를 숨길 때 애니메이션도 멈추고, 보일 때 다시 시작하는 정책까지 함께 갖습니다.

```swift
import UIKit

protocol Hiddenable {
    func hide(reverse r: Bool)
}

extension UIView: Hiddenable {}

extension Hiddenable {
    func hide(reverse r: Bool) {
        switch self {
        case let indicator as UIActivityIndicatorView:
            indicator.hidesWhenStopped = true
            if r {
                indicator.startAnimating()
            } else {
                indicator.stopAnimating()
            }
        case let view as UIView:
            view.hidden = !r
        default:
            break
        }
    }
}

protocol Hiddener {
    func hide<H: Hiddenable>(item item: H?)
    func hide<H: Hiddenable>(items items: H?...)
}

extension Bool: Hiddener {
    func hide<H: Hiddenable>(item item: H?) {
        item?.hide(reverse: !self)
    }

    func hide<H: Hiddenable>(items items: H?...) {
        items.forEach { self.hide(item: $0) }
    }
}

let label = UILabel(frame: CGRect(x: 0, y: 0, width: 100, height: 100))
label.text = "HIDDEN?"
true.hide(item: label)  // 숨김
false.hide(item: label) // 표시

let label1 = UILabel()
let label2 = UILabel()
let label3 = UILabel()
true.hide(items: label1, label2, label3) // 배열이 아닌 가변 인수
```

## 두 번 뒤집히는 Bool 확인

| 호출하는 Bool | reverse에 전달되는 값 | 일반 UIView.hidden | indicator |
| --- | --- | --- | --- |
| true | false | true | 멈춤·숨김 |
| false | true | false | 시작·표시 |

원래 예제의 빠진 괄호와 배열을 가변 인수 자리에 넘긴 부분을 고쳤습니다. 이 진리표는 코드 경로를 읽어 정리한 것이며, 이번 편집에서 UIKit 화면을 실행해 확인한 결과는 아닙니다. 실제 적용할 때는 `nil` 항목, 여러 뷰, 표시→숨김→표시 반복도 확인해야 합니다.

`reverse`가 여러 번 등장해 오히려 읽기 어려울 수 있으니, 실무 API라면 `setHidden`처럼 의도를 직접 드러내는 이름도 고려할 만합니다. 이 글은 간결한 API가 언제나 더 좋다는 주장이 아니라 작은 문법 실험으로 남겨둡니다.

참고: [Apple UIActivityIndicatorView.hidesWhenStopped](https://developer.apple.com/documentation/uikit/uiactivityindicatorview/hideswhenstopped).

swift로 이것저것 재미난 테스트 많이 해보고 계속 공유하겠습니다~

<details>
<summary>당시 프로토콜 실험 코드 (오류를 포함한 역사적 참고)</summary>

아래는 원문 코드다. Swift 2 문법이며, 빠진 괄호·잘못된 호출 레이블·배열을 가변 인수에 넘긴 부분·코드에 섞인 강조 문구 때문에 그대로 실행할 수 없다. indicator의 `hidesWhenStopped` 정책도 원문에는 없었다. 위 본문이 이를 정리한 예제다.

```swift
protocol Hiddenable {

  func hide(reverse r: Bool) -> Void

}

extension UIView: Hiddenable {}

extension Hiddenable {

  func hide(reverse r: Bool) -> Void {

    switch self {

    case let indicator as UIActivityIndicatorView:

      if r {

        indicator.startAnimating()

      } else {

        indicator.stopAnimating()

      }

    case let view as UIView:

      view.hidden = !r

    default:

    break

    }

  }

}

protocol Hiddener {

  func hide<H: Hiddenable>(item item: H?) -> Void
  func hide<H: Hiddenable>(items items: H?...) -> Void

}

extension Bool : Hiddener {

  func hide<H: Hiddenable>(item item: H?) {

    item?.hide(reverse: !self)

  }
  func hide<H: Hiddenable>(items items: H?...) {
    items.forEach {
      self.hide(item: $0)
    }
  }
}
let label = UILabel(frame: CGRect(x: 0, y: 0, width: 100, height: 100)
label.text = "HIDDEN?"
true.hide(label) **HIDDENED~**
false.hide(label) **SHOWNED~**

true.hide([label1, label2, label3] ** all hidden **
```

</details>
