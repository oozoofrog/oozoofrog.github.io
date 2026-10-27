---
date: 2016-07-05 15:15:48+00:00
title: Finish handle for Operation Queue
categories:
- codes
- swift
---

> **2026-10-28 검토·정정:** Xcode 8 beta / Swift 3 시기의 예제를 정리했습니다. `isReady`로 필터링하던 오류를 제거했습니다. 이 방법은 호출 시점에 얻은 작업 목록의 완료를 기다리는 것이며, 앞으로 큐에 들어올 모든 작업의 완료를 뜻하지 않습니다. 현재 SDK에서의 컴파일·실행은 이번 검토에 포함하지 않았습니다.

NSOperationQueue의 마지막 임종의 순간을 알아내는 일은 언제나 개발자들에게 큰 숙제 였습니다. 물론 실력있는 개발자들은 알아서 여러가지 방식으로 큐의 마지막 신호를 체크해 사용하고 있을겁니다.

저 같은 경우 operationCount 프로퍼티를 옵저빙하여 쓰고 있는데, 여기 훌륭한 글을 발견해서 영감을 받아 짧게 코드를 올려봅니다.

출처 -> [Code at the end of the queue](http://blog.krzyzanowskim.com/2015/11/25/code-at-the-end-of-the-queue/) by marcin krzyzanowski

사실 원 글의 소스와 비교해 사소한 차이만 있습니다. 어떻게 보면 더 떨어질 수도 있어요.

```swift
import Foundation

extension Array where Element: Operation {

  func addFinishOperation(finishHandle: @escaping () -> Void) -> Operation {

    let finishOperation = BlockOperation(block: finishHandle)

    forEach {

      finishOperation.addDependency($0)

    }

    return finishOperation

  }

}

extension OperationQueue {

  func addFinishOperation(finishHandle: @escaping () -> Void) {

    addOperation(self.operations.addFinishOperation(finishHandle: finishHandle))

  }

}

let queue = OperationQueue()

queue.maxConcurrentOperationCount = OperationQueue.defaultMaxConcurrentOperationCount

for i in 0..<100 {

  queue.addOperation({

    Thread.sleep(forTimeInterval: Double(arc4random_uniform(10)) / 10.0)

    print(i)

  })

}

queue.addFinishOperation {

  print("finish")

}

```

## 무엇의 완료를 기다리나요?

`operations`를 읽은 시점의 목록을 대상으로 finish operation이 모든 작업에 의존하게 합니다. 다른 의존성을 기다리는 작업은 아직 `isReady == false`여도 반드시 포함해야 합니다. 이미 실행 중인 작업도 마찬가지입니다.

이후 추가된 작업은 이 목록에 없습니다. 여러 생산자가 동시에 큐에 작업을 넣는다면 이 함수를 “큐 전체가 비었다”는 신호로 사용하면 안 됩니다. 정확한 배치를 다루려면 배치 배열을 직접 만들고, 그 배열에 대한 finish operation의 의존성을 **큐에 추가하기 전에** 설정하세요. 의존성 순환이 없어야 하며, 비동기 Operation은 실제 완료 시점에 `isFinished`를 올바르게 보고해야 합니다.

의존성의 완료는 성공을 뜻하지 않습니다. 취소나 실패 결과는 별도로 수집해야 합니다. finish handler는 메인 스레드 실행이 보장되지 않으므로 UI 변경은 메인 큐로 전달하세요.

### 확인할 사례

- A를 기다리는 B(`isReady == false`)가 목록에 있어도 finish가 B보다 먼저 실행되지 않는지
- 호출 후 새로 추가한 C가 대기 대상에 포함되지 않는지
- 빈 목록, 취소된 작업, 비동기 Operation의 종료 보고를 각각 처리하는지

위 항목은 재현 시 확인할 목록이며 이번 검토에서 실행한 테스트 결과는 아닙니다.

[Apple Concurrency Programming Guide: Operation dependencies](https://developer.apple.com/library/archive/documentation/General/Conceptual/ConcurrencyProgrammingGuide/OperationObjects/OperationObjects.html)
