---
date: 2016-07-15 03:10:56+00:00
title: Observe in initializer
categories:
- swift
---

> **2026-10-28 정정:** 2016년의 초기화 실수 경험은 남기고, “initializer에서는 모두 무시된다”는 일반화와 초기화 순서를 생략했던 예제를 고쳤습니다. 아래 보완 예제는 Swift 5 계열 문법이며 실행 검증은 하지 않았습니다.

## 자신의 저장 프로퍼티 초기화와 상속 프로퍼티 변경은 다르다

특히 Objective C에서 넘어온 swift개발자라면 swift의 **observer**가 얼마나 큰 축복인지 잘 아시리라 생각합니다.

그런데, 생각없이 여기저기 사용하던 중, 에러를 만나게된 경우가 있어 공유를 하려고합니다. 뒷북인 분들도 계시겠지만, 저처럼 아직 앞북이신 분들도 계시리라 생각합니다.

제가 만든 클래스는 객체 생성시 인수로 받은 클래스의 내용으로 다른 변수에 내부에서 사용할 값을 만들어 선언하는 작업을 편하게 하기 위해서 옵저버를 사용했습니다.

그런데, 다른 변수에 들어가야할 값이 생성되지 않고, nil로 되어 있어 앱에서 크래쉬가 발생하고 있었습니다. 디버깅을 해보니 옵저버가 호출되지 않고 있더군요.

이것저것 테스트를 몇 번 해보며 문제를 파악할 수 있었습니다.


`init` 본문에서 **자기 클래스의 저장 프로퍼티를 초기화할 때**는 그 프로퍼티의 `willSet`·`didSet`에 초기 설정을 맡기면 안 된다. 반면 하위 클래스의 initializer에서 `super.init()` 뒤에 **상속받은 프로퍼티**를 변경하면 observer가 호출될 수 있다. initializer 안이라는 이유만으로 전부 생략되는 것은 아니다. [Swift Properties의 Property Observers 설명](https://docs.swift.org/swift-book/documentation/the-swift-programming-language/properties/#Property-Observers)을 참고한다.

당시 예제는 `characterSet`과 `scanner`의 초기값을 생략한 채 `super.init()`을 먼저 불렀다. 완성된 초기화 코드로는 사용할 수 없다. 자신의 저장 프로퍼티에 값을 준비한 다음 `super.init()`을 호출해야 한다.

## 초기 설정은 명시적으로

옵저버를 우회해서 호출하려고 closure나 별도 setter를 사용하는 대신, 필요한 값을 만드는 함수를 분리해 초기화와 변경 처리에서 쓰는 편이 명확하다. 이 예제에서는 문자 집합이 scanner와 무관하므로 처음부터 한 번만 만들면 된다.

```swift
import Foundation

final class XMLTokenizer: NSObject {
    let characterSet: CharacterSet
    var scanner: Scanner

    init(scanner: Scanner) {
        var characters = CharacterSet.whitespacesAndNewlines
        characters.insert(charactersIn: "=>")
        self.characterSet = characters
        self.scanner = scanner
        super.init()
    }
}

let tokenizer = XMLTokenizer(scanner: Scanner(string: "a=>b"))
assert(tokenizer.characterSet.contains("=".unicodeScalars.first!))
```

실제 프로젝트에서 scanner가 바뀔 때마다 다시 계산해야 하는 값이라면 계산 함수를 만들어 `init`과 `didSet`에서 각각 호출하면 된다. `didSet`을 실행시키기 위해 초기화 규칙을 우회할 필요는 없다.

## 상속 프로퍼티의 경우

```swift
class Base {
    var count = 0 {
        didSet { print("count changed") }
    }
}

class Child: Base {
    override init() {
        super.init()
        count = 1 // 상속 프로퍼티 변경: observer 호출 대상
    }
}
```

확인할 때는 자기 저장 프로퍼티의 첫 대입, 초기화가 끝난 뒤의 변경, `super.init()` 이후 상속 프로퍼티 변경을 각각 나누어 보자. 예외를 한 문장으로 뭉뚱그린 것이 원래 글의 문제였다.

<details>
<summary>당시 문제 설명과 우회 실험 (권장 예제 아님)</summary>

아래는 2016년 원문의 문제 설명과 closure/setter 우회 실험이다. 코드 서식만 정리해 보존한다. **초기값과 초기화 순서를 생략한 코드이며 그대로 컴파일할 수 없다.** “init 밖에서 대입하면 된다”는 당시 결론을 일반적인 해결책으로 권하지 않는다. 올바른 초기화와 상속 프로퍼티의 차이는 위 정정 본문을 참고한다.

여기 제가 어떤 실수를 범했는지 세세한 문법은 좀 생략한 예제를 써보겠습니다.

```swift
class XMLTokenizer: NSObject {
        var characterSet: NSCharacterSet
        var scanner: NSScanner {
            // scanner의 옵저버
            didSet {
                // 사실 이렇게 할 필요가 없었는데, 그저 재미삼아 써본 옵저버입니다.
                // 내용을 보면 아시겠지만, 그냥 characterSet에 처음부터 선언해도 됩니다 ㅡㅡa ㅎㅎ
                let characterSet = NSCharacterSet.whitespaceAndNewlineCharacterSet().mutableCopy()
                characterSet.addCharactersInString("=>")
                self.characterSet = characterSet
            }
        }

        init(scanner: NSScanner) {
            super.init()
            // 이 과정에서 저는 characterSet이 생성되기를 기대했습니다.
            // 결과는 꽝이지요.
            self.scanner = scanner
        }
    }
```

init안에서 scanner의 didSet observer가 호출되기를 기대하고 앱을 실행하니 짜짠, **_크래쉬!_**

검색을 해보니 역시 같은 문제를 겪은 선현들이 있어, 몇가지 해결방법을 나열해보겠습니다. 요점은 간단한데, init scope안에서 self.scanner를 대입하지 말고 scope밖에서 대입하라는 것이 요점입니다.

```swift
1.
    init(scanner: NSScanner) {
        super.init() // NSObject를 상속하지 않았다면 오히려 에러가 날 겁니다. 반대로, 제 경우 NSObject를 상속하고 있기 때문에, super의 init을 호출해야 에러가 없습니다.
        // init scope의 밖에서 scanner를 설정하기 위해 이름없는 closure를 하나 만들어 실행해줍니다.
        ({self.scanner = scanner})()
    }
    2.
    init(scanner: NSScanner) {
        super.init()
        // 세터를 별도로 만들어서 건네줍니다.
        // 이 경우도 NSObject를 상속했기 때문에, setScanner메소드를 쓰지 못했습니다. 컴파일러가 생성해버리거든요. NSObject를 상속하지 않는다면, setScanner로 하셔도 무방합니다.
        setInnerScanner(scanner)
    }

    func setInnerScanner(scanner: NSScanner) {
        self.scanner = scanner
    }
```

이정도면, init안에서 값을 넣는다 하더라도 옵저버를 호출할 수 있습니다.

</details>
