---
date: 2016-07-06 07:32:10+00:00
title: Mixing swift and objective c for Framework
categories:
- swift
- XCode
---

> **2026-10-28 검토:** 2016년 framework 이전 경험입니다. 헤더의 공개 범위, Clang 모듈 export, Swift 접근 제어는 서로 다른 설정입니다. 당시 module map은 보존하되 외부에서 숨겨진다는 보장으로 해석하지 않도록 보완했습니다.


저는 최근에 오래된 프로젝트를 통째로 리팩토링하면서 기존의 스태틱라이브러리들을 몽땅 Framework로 이전하는 작업을 진행하고 완료했습니다. 그 와중에 Swift도 섞어 쓰고 있었죠.

Objective C와 Swift를 함께 사용하는 Framework프로젝트에서 가장 곤란한 에러는 private으로 선언한 Objecive C헤더를 같은 Framework안의 다른 Swift코드에서 사용하는 것입니다. 이는 Swift로만 개발하거나 Objective C로만 개발하면 만날일이 없는 일이지만, 세상이 어디 마음대로 되나요.

Swift는 Clang 모듈을 통해 Objective-C 선언을 가져오기 때문에 헤더가 모듈에 어떻게 포함되어 있는지가 중요합니다. Objective-C에서도 헤더 검색 경로와 빌드 설정은 영향을 줍니다. Xcode의 Public/Private/Project 헤더 분류가 Swift의 `public`/`internal`/`private` 접근 제어와 같은 뜻은 아닙니다.

참고로, [Clang docs](https://clang.llvm.org/docs/Modules.html)에 보면 modules에 대한 레퍼런스가 있습니다.

이를 해결하기 위해서는  Framework가 빌드 정보를 통해 모듈맵을 구성할 때 private header를 별도로 추가하는 것입니다.

[예제 소스 링크입니다.](https://github.com/singcodes/Framework-for-swift-and-ObjC)

예제 소스는 다음으로 구성되어 있습니다.





  * FrameworkTest - App 프로젝트입니다.


    * AppDelegate


    * ViewController





  * Framework1 - 문제의 framework 프로젝트입니다.


    * Framework1.h - umbrella header라고 합니다. 모듈이 포함할 헤더를 모아 주는 대표 헤더입니다. 외부에 보이는 선언은 umbrella header만이 아니라 module map의 다른 header/export 선언에도 영향을 받습니다. 앱 target의 bridging header와는 구분해야 합니다.


    * Public.h, .m - public 클래스입니다. framework외부에서 접근이 가능합니다.


    * Private.h, .m - private 클래스입니다. framework내부에서 Objective C만 접근이 가능합니다.


    * Log.swift - swift 파일입니다.






이 경우에 Log.swift는 Private.h에는 접근이 불가능하지만, module map을 새로 구성해줌으로써 private header에 접근할 방법이 생깁니다.

먼저 제가 구성한 modulemap입니다.

```text
framework module Framework1 {
umbrella header "Framework1.h"
private header "Private.h"

export *
module * { export * }
}

explicit module Framework1.Private {
header "Private.h"
export *
}
```

해당파일을 module.modulemap으로 Framework1 프로젝트(여기서는 target)에 저장했습니다.

![스크린샷 2016-07-06 오후 4.29.13](/assets/images/posts/swift-mixing-01.png)

중간에 보시면 굵은 글씨의 Module Map File 항목이 보입니다. 원래 Framework는 자신의 모듈맵을 설정에 따라 자동으로 만들어 주는데, 아쉽게도 private헤더를 추가해주지는 않습니다. 그래서 직접 만든 모듈맵을 사용하도록 Module Map File에 만든 모듈맵 파일의 경로를 지정합니다.

_설정 밑에는 **_Private Module Map File_**도 있습니다_  처음에는 거기다 설정하면 되지 않을까해서 이것저것 시도해봤는데, 잘 안되더라구요. 시도는 계속 해볼예정이고 성공하면 또 올리겠습니다.

여기까지만 해주시면 같은 framework안에서 swift에서도 private scope에 속하는 Objective C 객체에 접근할 수가 있게됩니다.

framework의 modules 구현도 상당히 흥미로운 부분입니다. 파이썬처럼 서브모듈을 만들수도 있고 다양한 기능과 옵션이 있으니, 저도 여러분도 좀더 공부하면 재미나겠죠?

## 외부 노출 여부는 별도로 확인하기

위 구성은 내부 Swift 코드의 import 문제를 풀려고 시도한 기록이다. `explicit module Framework1.Private`를 선언했다고 외부 소비자가 절대로 import할 수 없다는 뜻은 아니다. 배포된 framework에 헤더와 모듈이 들어 있다면 사용 범위를 별도로 점검해야 한다.

현재 Clang 문서는 별도 `module.private.modulemap`과 `Framework1_Private` 같은 최상위 private module 이름을 설명한다. `Framework1.Private` 하위 모듈 이름은 권장 방식과 다르다. [Private Module Map Files](https://clang.llvm.org/docs/Modules.html#private-module-map-files)를 기준으로 사용하는 Xcode/Clang 버전에 맞게 결정한다.

검증할 때는 같은 framework 내부 Swift target과 별도의 소비 앱 target을 나눠 빌드한다. 내부에서는 필요한 선언이 import되는지, 소비 앱에서는 공개 API만 사용하는지, 배포 산출물의 `Headers`·`PrivateHeaders`·`Modules`에 무엇이 포함되는지 확인한다. 이 글에 그 조합의 빌드 결과나 당시 Xcode 세부 버전은 남아 있지 않다.
