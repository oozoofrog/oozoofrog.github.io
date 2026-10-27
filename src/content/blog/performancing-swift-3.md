---
date: 2016-07-05 09:40:13+00:00
title: Performancing swift 3
categories:
- swift
---

> **2026-10-28 검토·정정:** WWDC 2016의 Swift 2.x/Swift 3 전환기 학습 기록입니다. generic 전문화는 실행 중이 아니라 컴파일 최적화 과정이라는 점과 저장 위치의 단정을 정정했습니다. 아래 코드는 생략 부호·가상 타입을 포함한 설명용 조각이며 그대로 컴파일하는 샘플 프로젝트가 아닙니다. 현재 Swift의 `any` 표기로 일괄 변경하지 않았고, 당시 도구로 재실행하지 않았습니다.

이 글은 WWDC 2016 session 416 [Understanding swift performance](https://developer.apple.com/videos/play/wwdc2016/416/)을 중심으로 작성하고 있습니다.

## 상속 혹은 레퍼런스 참조 없는 [다형성](https://ko.wikipedia.org/wiki/다형성)(Polymorphism)

_영화 이야기로 시작해볼께요. 영화 [친절한 금자씨](https://ko.wikipedia.org/wiki/친절한_금자씨)의 후반부에 보면 연쇄살인마 최민식에게 그 동안 당했던 피해자의 가족들이 차례대로 각종 연장으로 민식 아저씨를 고문합니다. 여기서 사람들의 얼굴도, 연장도 다르지만, 고문한다는 기능에서 동일한 능력을 가지고 있습니다. 사람->객체, 연장->함수, 아야야야->결과_

_연장마다 상처의 모습은 좀 다르지만, 결과적으로 공통의 목적을 이뤘습니다. 이게 객체의 다형성(의 일부)입니다._

다음 코드를 볼까요?

```swift

protocol Drawable { func draw() }

struct Point: Drawable {

  var x, y: Double

  func draw() {...}

}

struct Line: Drawable {

  var x1, y1, x2, y2: Double

  func draw() {...}

}

var drawables: [Drawable]

for d in drawables {

  d.draw()

}

```

Drawable protocol은 자신을 준수하는 타입이 draw함수를 작성하길 원합니다.

Point struct는 해당 함수에서 점을 그릴것이고,

Line struct는 해당 함수에서 (x1, y1) - (x2, y2) 사이의 선을 그리겠죠.

그리고 Drawable을 준수하는 값는 drawables배열에 담을 수 있습니다.

소스의 마지막 줄은 배열의 모든 Drawable 준수 값의 draw() 함수를 호출합니다. 그게 무슨 객체건 뭣이 중헌디, 그리면 되었다. 하면서 말이죠. 다형성입니다😁

여기서 우리는 몇가지 의문사항을 접합니다.

  * Method Dispatch와는 다르게 상속한 부모 클래스가 없어 공통으로 접근할 수 있는 함수 포인터가 없습니다. 각 객체는 자기만의 함수 포인터를 가지고 있으니, 배열안에서는 어떻게 공통으로 상속한 함수처럼 접근하고 있을까요?

### Protocol Witness Table(PWT)

답은 Protocol Witness Table(PWT)에 있습니다. 해당 소스를 만드셔서 콘솔에서 swiftc -emit-sil {파일명}을 실행해 Swift intermediate language로 만들어 보시면 대강 그 모습을 알 수 가 있는데요. Point, Line 각각의 구조체를 위한 별도의 PWT가 만들어져 있는 모습을 보실 수 있습니다. protocol을 준수하는 struct의 함수는 이 테이블 통해 실제 호출할 수 있는 함수의 정보를 알게 됩니다.

### 그리고?

  1. PWT가 있는 건 알겠는데, 그건 그렇다치고 배열에서 그 PWT가 있는건 어떻게 아는데요?

  2. 배열에 들어있는 값이 Line struct, Point struct인건 알겠다치고,  Line는 4개의 word(64bit cpu라면 1 word = 64bit 즉, 8 byte입니다. Double은 1 word, 즉 8바이트죠)를 가지고 Point는 2개의 word를 가지는데, 구조체의 바이트 크기가 다르잖아요. 배열은 모두 같은 크기의 요소를 가지고, 고정되어있는 offset값 단위를 통해 배열의 요소를 가져올텐데 그게 어떻게 가능하죠?

    * 1, 2번의 의문에 대해 Swift는 Existential Container라는 메모리 구조를 가지고 해결하고 있습니다.

### Existential Container

Existential Container란 protocol 타입의 구조를 담을 수 있는 메모리 구조입니다.

![스크린샷 2016-07-05 오후 12.16.55](/assets/images/posts/swift-perf3-01.png)

여기서는 64비트 환경의 일반적인 opaque existential을 설명합니다. 클래스 전용 protocol 등은 표현이 다릅니다. 이 구조에서 처음 3 word는 value buffer입니다. 단어 그대로 protocol(struct)의 값을 담는 공간이죠.

Point같은 경우 x, y 두개 뿐이기 때문에 다음과 같이 들어갑니다.

![스크린샷 2016-07-05 오후 12.17.06](/assets/images/posts/swift-perf3-02.png)

_어.. 그런데 Line struct는 4 word(x1, y1, x2, y2)인데요? 3 word넘는데 어떻게 들어가요?_

그런 경우 swift는 Line의 값을 heap으로 저장하고 해당 포인터를 value buffer로 넘깁니다. 아래처럼 말이죠.

![스크린샷 2016-07-05 오후 12.20.39.png](/assets/images/posts/swift-perf3-03.png)

_Line과 Point에 대한 메모리 관리 방법이 다른데, Existential Container는 그들을 어떻게 일괄 관리하나요?_

이 질문에는 Value Witness Table(VWT)라는 답이 있습니다.

### Value Witness Table(이하 VWT)

  * PWT, VWT 모두 테이블 구조에 기반한 데이터 구조입니다. 사실 C++, Objective C등에서  이런 형태의 table(vtable등)은 객체를 구성하는 기본 메모리 구조이기도 하죠. Swift코어 개발자들 중에는 유명한 C++ 연구자 출신들이 많습니다.

  * 모든 값(Value)에 대한 Allocation, Copy, Destruction을 담당합니다. 짧게 말하자면 생명주기를 담당합니다.

  * 한 프로그램의 모든 타입에 대해서 만들어집니다. 이 경우 Point, Line struct의 VWT가 만들어지겠네요.

**VWT for Line struct**

![스크린샷 2016-07-05 오후 1.24.50](/assets/images/posts/swift-perf3-04.png)

**LineVWT가 Existential Container에 Line을 담게 되기까지의 과정**

  1. protocol 타입 변수가 만들어질 때, LineVWT의 allocate: 가 호출됩니다.

  2. allocate: 는 Line struct를 힙에 생성하고 해당 포인터를 existential container에 담습니다.

  3. LiveVWT copy: 가 Line struct가 초기화되면서 인수로 받은 x1, y1, x2, y2값을 heap의 Line struct 메모리로 복사합니다.

  4. Line 값을 사용하지 않는 경우 LineVWT destruct: 가 호출됩니다. Line 힙메모리의 x1, y1, x2, y2값은 초기화되어 사라집니다. 이 과정에서 reference count를 가진 개체가 있을 경우 해당 count도 1이 줄게 되겠죠. Line의 경우 struct와 Double값을 가지고 있을 뿐이므로 refenrece counting은 일어나지 않습니다.

  5. 마지막으로 LineVWT의 deallocate: 가 호출됩니다. 힙메모리와 existential container에서 Line 객체의 흔적은 완전히 사라집니다.

**VWT는 그럼 어디에?**

![스크린샷 2016-07-05 오후 1.39.13](/assets/images/posts/swift-perf3-05.png)

  * 강의 그림은 VWT로 값의 생명주기를 관리한다는 개념을 보여줍니다. 실제 opaque existential 레이아웃에서 value buffer 다음 필드는 타입 메타데이터 포인터이며, VWT는 타입 메타데이터를 통해 접근합니다.

**PWT는 그럼 어디에?**

![스크린샷 2016-07-05 오후 1.42.18](/assets/images/posts/swift-perf3-06.png)

  * PWT 포인터는 타입 메타데이터 포인터 다음에 놓입니다. 프로토콜 조합 등 표현에 따라 witness table 수는 달라질 수 있습니다.

### Existential Container 요약

  * inline value buffer는 총 3 word로 구성

  * inline buffer의 크기·정렬 조건을 넘는 값은 외부 저장 공간이 필요

  * 타입 메타데이터를 통해 Value Witness Table(VWT)에 접근

  * Protocol Witness table(PWT)의 reference를 가짐

  * 강의에서 다루는 opaque existential의 개념입니다. 모든 protocol 표현과 최적화 결과가 동일한 것은 아닙니다.

## Existential Container의 실제 동작을 살펴볼까요?

```swift

func drawACopy(local: Drawable) {

  local.draw()

}

let val: Drawable = Point(x:1, y:1)

drawACopy(val)

```

함수 drawACopy는 Drawable protocol type인 local을 받아서, 원 객체가 뭐간간에 draw함수를 호출합니다.

val 변수는 Drawable protocol타입 변수이며 Point struct를 대입했습니다.

마지막으로  drawACopy함수에 val인수로 건네고 호출합니다.

이 코드가 llvm으로 전달되기 전에 swift 컴파일러는 아래와 같은 형태로 다시 코드를 생성합니다.

물론 진짜 코드는 매우매우 복잡합니다. 이건 원래 생성되는 코드에 대한 pseudo code입니다.

```swift

// pseudo code, real sil will be more very very complexy

struct ExistentialContainerDrawable {

  var valueBuffer: (Int, Int, Int)

  var type: TypeMetadata // 이 메타데이터를 통해 VWT에 접근

  var pwt: DrawableProtocolWitnessTable
}

```

  * drawACopy함수에 val 변수를 넘길 때, 실제로는 drawACopy함수에 existential container를 넘깁니다.

```swift

func drawACopy(val: ExistentialContainerDrawable)

```

  * drawACopy가 처음 호출되면, 함수는 넘겨받은 객체에 대해 상수 인스턴스를 생성합니다.

```swift

func drawACopy(val: ExistentialContainerDrawable) {

  var local = ExistentialContainerDrawable() // 개념적인 로컬 컨테이너; 힙 할당을 뜻하지 않음

  let vwt = val.type.valueWitnessTable

  let pwt = val.pwt // 메타데이터와 컨테이너에서 필요한 테이블을 가져옵니다.

  local.type = val.type

  local.pwt = pwt // 생성한 local existential container에 Point의 pwt를 넘겨줍니다.
  vwt.allocateBufferAndCopyValue(&local, val) // local existential container의 valueBuffer를 초기화하고 val의 값을 복사합니다.
  pwt.draw(vwt.projectBuffer(&local))
  vwt.destructAndDeallocateBuffer(&local)
}

```

  * drawACopy는 Drawable protocol에 대해서 val: ExistentialContainerDrawable(Point)의 값을 새로운 local: ExistentialContainerDrawable에 복사했을 뿐입니다.. 복잡한 메모리 관리 없이 말이죠.

  * Line같이 3 word를 초과하는 타입인 경우 valueBuffer에 대한 heap 메모리를 추가로 생성할 뿐, 기본적인 복사과정은 동일합니다.

  * PWT는 실제 `draw` 구현을 찾는 데 쓰입니다. x, y 같은 데이터는 VWT 안이 아니라 실제 값의 저장 공간에 있습니다.

  * 어라 projectBuffer는 또 뭘까요?

    * 뭐 라기보다 왜 사용하는지가 더 중요합니다.

    * Point같은 경우 existential container의 valueBuffer안에 x, y값을 가지지만, Line같이 큰 값을 가지는 경우 heap에 값을 저장합니다.. 이 두 경우의 차이를 공통화 하기위해 projectBuffer를 통해 stack이나 heap메모리를 신경쓰지 않고 접근할 수 있게 해줍니다.

  * 마지막으로 local 상수는 drawACopy의 scope가 끝났기 때문에 VWT를 통해 모든 값이 해지됩니다.

  * drawACopy 함수 하나 호출에 이렇게 많은 작업이 필요합니다. 저도 여기까지 들으며 강연자와 함께 한숨을 내쉬었습니다 ㅎㅎ

  * 이런 과정들이 있지만, 덕분에 서로 다른 타입의 값을 같은 protocol 인터페이스로 다루고 배열에도 넣을 수 있습니다. class보다 항상 빠르거나 작은 것은 아닙니다.

## Protocol Type Value에 대한 변수 복사와 method dispatch

  * 쉽게 이야기하면 Protocol을 타입으로 가지는 변수와 함수 다형성에 대한 이야기입니다.

```swift

struct Pair {

  init(_ f: Drawable, _ s: Drawable) {

    first = f;

    second = s

  }

  var first: Drawable

  var second: Drawable

}

var pair = Pair(Line(), Point()) // #1
pair.second = Line() // #2
```

_Swift는 이런 경우는 어떻게 값을 저장할까요?_

  * #1의 경우

    * Line 값은 힙에 저장

    * Point 값은 existential container의 inline buffer에 저장됩니다. 컨테이너 자체가 스택인지 힙인지는 이를 담는 값의 위치에 따라 달라집니다.

![스크린샷 2016-07-05 오후 3.35.22](/assets/images/posts/swift-perf3-07.png)

  * #2의 경우

    * 두 Line 값은 모두 힙에 저장

![스크린샷 2016-07-05 오후 3.36.10](/assets/images/posts/swift-perf3-08.png)

**existential container는 inline buffer입니다. 연속으로 값을 저장하는거죠. 결국 지금까지 봐온 구조와 동일합니다. 크기만 늘어났습니다.**

```swift

let copy = pair

```

  * pair 값를 copy변수를 새로 만들어 대입하면 아래처럼 됩니다.

![스크린샷 2016-07-05 오후 3.40.45](/assets/images/posts/swift-perf3-09.png)

## Expensive Copies of Large Values!

_그런데 말입니다. 여기서 우리는 한가지 의문이 들었습니다._

**heap은 느리고 무겁다고 전에 했던거 같은데요?**

### class의 복사

  * 클래스에서 기본적으로 한 변수를 다른 변수에 대입하는 경우 일어나는 복사는 reference복사입니다. 메모리의 객체는 그대로이고, 클래스 객체의 포인터를 그대로 가져오며 해당 객체의 reference count만 1증가하게 되겠죠. 배열에 같은 값을 여러번 넣는 경우 경우 다음 existential container offset에 해당 클래스 객체의 포인터(reference)만 새로 참조 될 뿐, 힙메모리를 새로 allocate한다던가 하는 무거운 일은 없습니다. protocol에 비해 뭔가 생산적으로 보이는군요.

  * 다만, 같은 객체를 가리키는 여러 참조에서는 한 참조를 통한 변경이 다른 참조에서도 보입니다. 😱

  * 독립적인 객체가 필요하면 복사 이니셜라이저나 복사 메소드를 직접 설계해야 합니다. 모든 Swift class에 `copy()`가 자동으로 생기는 것은 아닙니다. Foundation의 `NSCopying`도 별도의 계약입니다.

_그렇다면 우리의 Line struct를 위해서는 어떻게 해야하죠?_

```swift

class LineStorage { var x1, y1, x2, y2: Double }
struct Line : Drawable {
  var storage: LineStorage
  init() { storage = LineStorage(/* 초기 좌표: 설명용 생략 */) }
  func draw() { ... }
  mutating func move() {
    if !isUniquelyReferencedNonObjc(&storage) {
      storage = LineStorage(storage)
    }
    storage.start = ...
  }
}

```

  * isUniquelyReferencedNonObjc 함수는 해당 객체가 nonobjc class인 경우 다른 곳에서 공유되고 있지 않은지 체크해주는 함수입니다.  그 외의 모든 경우 이 함수는 false를 반환합니다.

  * move함수가 호출되면 먼저 storage 변수의 객체가 다른곳에서 쓰이고 있는지 체크한 후, 쓰이고 있다면 기존storage의 값만 복사해 새 LineStorage객체를 만듭니다. 이거 저도 이번에 처음 알았는데, 유용하겠어요.

**이렇게 Line struct를 바꿔봤습니다. Pair struct 타입의 변수 메모리 구조는 어떻게 변할까요?**

![스크린샷 2016-07-05 오후 4.42.44](/assets/images/posts/swift-perf3-10.png)

_existential container의 reference는 모두 하나의 타입을 가르킵니다. 공간을 많이 절약했네요~_

## 퍼포먼스 관점에서 볼 항목

아래는 강의의 비용 모델을 정리한 것이지 모든 실행에 적용되는 순위표는 아닙니다.

| 항목 | 확인할 내용 |
| --- | --- |
| Allocation | existential의 inline buffer에 맞는 값인지, 별도 저장 공간이 필요한지 |
| Reference counting | 값 내부에 참조 타입이나 COW 저장 공간이 있는지 |
| Method dispatch | witness table을 통한 호출인지, 최적화로 직접 호출이 되는지 |
| Copying | 큰 값의 복사가 필요한지, 공유 storage를 이용한 COW로 줄일 수 있는지 |

Indirect storage는 복사 때 저장 공간을 공유해 비용을 줄일 수 있지만, 최초 생성과 공유 중 변경에는 할당이 필요하고 ARC 비용도 생깁니다. “힙 할당이 없다”는 뜻은 아닙니다.

## Protocol Types 요약

  * 동적 다형성을 충족합니다.

  * Witness Table과 Existential Container를 이용합니다.

  * 큰 값을 복사할 경우 heap메모리를 생성하게 됩니다.

    * 아이러니 하죠, 퍼포먼스 때문에 protocol+struct를 택하지만, 퍼포먼스 때문에 class를 이용하는 경우도 생깁니다.

    * 이렇게 protocol vs class는 장점, 단점을 논하는 것이 아니라 상황에 맞게 사용해야 함을 알 수 있습니다.

# Generic Code

_찬양할지어다~ 다른 언어들이 옛부터 generics(특히 자바시키 너)를 가지고 노는 동안, 불쌍한 objc개발자들은 객체지향이라고 사기당한채 일해야했던 암울한 시기도 지나갔습니다._

```swift
protocol Drawable {
  func draw()
}
func drawACopy<T: Drawable>(local: T) {
  local.draw()
}
let line = Line()
drawACopy(line)

let point = Point()
drawACopy(point)
```

_이거 뭐 위에 거랑 다른게 뭐죠? generic 지시자 쓴거 빼곤?_

### Generic은 전문화될 때 직접 호출로 최적화할 기회를 줍니다

  * generic 함수는 타입별 제약을 유지합니다. 전문화되지 않은 경로에서는 메타데이터와 witness table이 필요할 수 있습니다.

  * One type per call context

    * 대충 긴가민가 하긴하는데 정확히 뭐지??

```swift
func foo<T: Drawable>(local: T) {
  bar(local)
}
func bar<T: Drawable>(local: T) { ... }
let point = Point()
foo(point)
```

  * foo함수의 T는 Drawable을 준수하는 타입 매개변수입니다.

  * bar함수의 T도 Drawable을 준수하는 타입 매개변수입니다.

  * foo 함수에 Point객체 변수를 전달하면 foo함수는 변수를 bar함수에 또 넘깁니다.

  * swift는 넘겨 받은 객체의 타입을 호출 연결 구조에 명시합니다. 아래와 같이 말이죠.

![스크린샷 2016-07-05 오후 5.15.47](/assets/images/posts/swift-perf3-11.png)

다시 drawACopy 함수로 돌아가 보죠.

```swift

func drawACopy<T : Drawable>(local: T) {

local.draw()

}

drawACopy(Point(...))

```

  * 기존 protocol+struct와 크게 다른건 없어보입니다.

  * 단 하나 다른 건 existential container를 사용하지 않는다는 겁니다.

![스크린샷 2016-07-05 오후 5.29.05](/assets/images/posts/swift-perf3-12.png)

  * 위의 그림처럼 PointDrawable(PWT), PointVWT를 가지고 바로 Point의 draw함수를 호출하게 됩니다. 어떤 구조일까요?

  * 강의 그림에서는 Point의 값 저장 공간과 타입 정보를 나누어 보여줍니다. generic 값의 저장을 existential의 3-word buffer 규칙과 동일시해서는 안 됩니다.

  * ![스크린샷 2016-07-05 오후 5.31.46](/assets/images/posts/swift-perf3-13.png)

  * Line이었다면? 우린 이미 알죠~?

  * ![스크린샷 2016-07-05 오후 5.31.52.png](/assets/images/posts/swift-perf3-14.png)

  * 강의의 큰 값 예시에서는 간접 저장 비용을 살펴봅니다. 다만 generic 인수가 3 word보다 크면 항상 heap이라는 규칙은 아닙니다. 타입 크기를 언제 알 수 있는지, 저장 문맥과 최적화를 함께 봐야 합니다.

_더 빠른거 맞아요? 퍼포먼스 더 좋아요?_

_여기서 swift뿐만 아니라 컴파일러의 역량이 추가됩니다. swiftc+llvm만세~_

  * 좀전에 제가 generics를 이용하면 static한 함수 다형성이 가능하다고 했습니다.

  * 컴파일러는 구체 타입과 구현을 알 수 있는 호출 문맥에서 generic 함수를 전문화할 수 있습니다. 모든 타입에 대해 반드시 별도 버전을 만든다는 보장은 없습니다.

```swift

drawACopy(Point())
drawACopy(Line())

// 전문화 전에는 타입 메타데이터와 witness table을 이용하는 경로가 필요할 수 있습니다.

drawACopy(Point(...))

// 전문화가 가능한 경우의 개념도: 컴파일 시 다음과 같은 별도 구현을 만들 수 있습니다.

drawACopyOfAPoint(Point(...))
drawACopyOfALine(Line(...))
```

_겉은 같은 데 속은 이리도 다르네요. 역시 사람도 내면이 중요하듯, Swift도 내면이 참 중요합니다._

_그런데, 코드 사이즈 늘어나는거 아니에요??_

_제가 컴파일러를 찬양하는 이유가 여기에 있습니다._

  * 다시 한번 컴파일러의 전문화 과정을 거치면, 아래와 같이 위의 코드가 변신합니다.

```swift

Point().draw()

Line().draw()

```

😱우와, 컴파일러가 그냥 코딩도 해주면 좋겠습니다.

**이런 식으로 컴파일러의 최적화를 거친 소스는 매우 다양한 형태로 작아지고 효율적인 코드로 변모하게 됩니다.**

_Pair, 기억하고 있습니까_ - 제 나이가 드러날듯..

```swift

struct Pair<T: Drawable> {

  init(_ f: T, _ s: T) {

    first = f

    second = s

  }

  var first: T

  var second: T

}

var pair = Pair(Line(), Line())

pair.first = Point() // 이건 불가능합니다. pair는 이미 Line 타입만 인수로 받을 수 있습니다. 이전 소스와는 다른 부분이죠.

```

위 소스의 메모리 구조는 아래와 같습니다.

![스크린샷 2016-07-05 오후 5.52.08](/assets/images/posts/swift-perf3-15.png)

_Existential Container가 아니죠? Generic 타입 최적화를 통해, Line 타입 값을 전달받은 Pair struct는 고ㅈ.. 가 아니라 명시적인 Line 타입의 값만 받을 수 있는 struct가 되었기 때문입니다._

### Whole Module Optimization

![스크린샷 2016-07-05 오후 6.16.23](/assets/images/posts/swift-perf3-16.png)

  * 해당 옵션을 선택함으로 swift로 된 프로젝트는 다양한 최적화의 도움을 받게 됩니다. 느리니까 배포버전에서만 사용하도록 합시다~

## 전문화의 효과와 한계

- 전문화는 **컴파일 시 최적화**입니다. 실행 도중 새로 최적화한다는 이전 설명은 잘못되었습니다.
- 구체 타입이 알려지면 값의 크기와 호출 대상을 알 수 있어 인라이닝, 불필요한 복사·참조 계수 연산 제거 등에 유리합니다.
- struct 안에 참조 타입이 있으면 ARC 비용이 남을 수 있고, class를 사용해도 호출 최적화의 이득이 생길 수 있습니다.
- 전문화되지 않은 generic도 올바르게 동작합니다. 다만 타입 메타데이터와 witness table을 이용하는 비용을 고려해야 합니다.
- WMO는 이러한 기회를 넓히지만 항상 전문화·직접 호출·무할당을 보장하지는 않습니다.

## 최종 요약 - 필요에 맞는 구조를 사용하자

  * struct types: [value semantics](https://akrzemi1.wordpress.com/2012/02/03/value-semantics/)(다음에 한번 논해보겠습니다.)코드 구조에 알맞습니다.

  * class types: OOP 스타일의 다형성 구조에 알맞습니다.

  * Generics: 타입 매개변수로 공통 코드를 표현하고, 전문화에 유리한 문맥을 만들 수 있습니다.

  * Protocol types: dynamic한 다형성 구조에 알맞습니다.

  * 큰 값의 복사가 병목이라면 Indirect Storage와 COW를 검토하되, 실제 작업에서 비용을 측정합시다.

세션 정리를 마칩니다.

제 글은 해당 세션보다 상세한 경우도 있고, 어물쩡 넘어간 경우도 있습니다. 이 글을 보신다음 세션 동영상을 봐주시면 더욱 재미있습니다.

### 정정 참고

- [Swift: Whole-Module Optimization과 generic specialization](https://www.swift.org/blog/whole-module-optimizations/)
- [Swift ABI: Type Layout](https://github.com/swiftlang/swift/blob/main/docs/ABI/TypeLayout.rst)
- [WWDC 2024: Explore Swift performance](https://developer.apple.com/videos/play/wwdc2024/10217/)
- [앞 글: Performancing swift 2](/blog/performancing-swift-2/)
