---
layout  : post
title   : Swift compiler architecture
summary : Swift Compiler 의 구조 정리
date    : 2022-01-15 15:50:00 +0900
updated : 2022-01-16 11:30:00 +0900
categories : swift compiler architecture
---

[TOC]

# Swift compiler architecture

*[Qiita](https://qiita.com)에 [@rintaro](https://qiita.com/rintaro)님이 포스팅한 포스팅한 일본어 [원문](https://l.facebook.com/l.php?u=https%3A%2F%2Fqiita.com%2Frintaro%2Fitems%2F3ad640e3938207218c20%3Ffbclid%3DIwAR1NiW77-FJuHqHYi5PJjIS6BFtEKP3H2s4UIAI-GvTfEjcbwNlL3Gp58jQ&h=AT059KvKJPmm7UMHygfBeYAj3bDVF7nrvZ5M0aOgTG2uZdUzxGMEZYcoJ4XVPwh1Fb5eVqy5wIw3iephiwzYfwWgWBw4axeQ_6GXYUUupLs3Ph9e1XLOm-S6rhkbuX87qTjrzOPbMw&__tn__=-UK-y-R&c[0]=AT02ywht0jPSBe90GR_6d-r83cssAeMPYzSKAgAORNhCERtlk9-l5KuScz-N6ArSlTo3uObBA9ViZpc74uzdAWGgKFTKaGcQu73IjmGhPGKrOpGgQ6rPed8THV2fQUjPkBX7f6A_Rl70V86t8ZOf0PDdfIfD-DwedwHk36e43B6CuUiAJbeJ3xLwI_OEprXl8oNG2kDZmuRIqOHE)을 번역한 글입니다.*

*글 자체는 2017년도의 글이라 업데이트를 글 작성 후에 개인적으로 진행해야겠네요*

Swift 컴파일러 개발을 시작해보고 싶은 분들을 위해, 컴파일러의 전체 구성이 어떻게 되어있는지 대략적으로 설명해보겠습니다. 코드를 읽을 때 참고가 되면 좋겠네요.

저는 프로그램을 파악할 때, 엔트리포인트(entrypoint, 최초로 실행되는 곳, main 함수)를 알지 못하면 불안해집니다. 바꿔 말하면, 엔트리포인트만 알면 거기서부터 처리 과정을 따라가면 좋기 때문에, 그 다음 과정에 대한 이해도 굉장히 쉬워집니다. 그렇기 때문에 가장 먼저 swift 명령어의 엔트리포인트 부터 시작하겠습니다.

주의: 각 진입부는 깃헙에 있는 실제 코드의 링크를 달고 있는데, 행번호는 시간이 지나면서 변경되기 때문에, 파일까지의 링크만 달아놓았습니다. 함수명등으로 검색해주세요.



## 드라이버 (Driver)

`swift` 명령어 인데, 실체는 [tools/driver](https://github.com/apple/swift/tree/master/tools/driver) 입니다.

tools/driver/driver.cpp에 main 함수가 있어, 여기서부터 [lib 디렉토리](https://github.com/apple/swift/tree/master/lib) 에서 구현하고 있는 각종 라이브러리를 호출하도록 되어있습니다.

드라이버에는 명령어 argument에 따른 몇개의 모드가 존재합니다.



### 서브명령어 런처 (sub-command launcher)

`swift package`로 호출되면 `swift`실행파일과 동일한 디렉토리에 있는 `swift-package`를 기동할 뿐인 런처입니다. `swift`명령어의 가장 첫 번째 argument가 아래의 조건에 모두 일치할 때 실행됩니다.

- -로 시작하지 않는다
- .을 포함하지 않는다 (파일명이 아니다)
- repl이 아니다 <sup>[1](#1)</sup>

시험삼아 `swift oozoofrog` 같은 느낌으로 명령어를 실행하면 swift-oozoofrog 라는 서브명령어를 찾지 못했다는 에러를 표시하게 됩니다.
```shell
$ swift oozoofrog
error: unable to invoke subcommand: /Applications/Xcode.app/Contents/Developer/Toolchains/XcodeDefault.xctoolchain/usr/bin/swift-oozoofrog (No such file or directory) 
```

### batch mode

`swiftc`명령어 입니다. `swiftc`는 `swift`의 심볼릭 링크로 되어있습니다. `argv[0]`가 `"swiftc"`인 경우 batch mode가 됩니다. 소스파일을 실행가능한 파일로 만드는데는, 컴파일러나 링크등 여러가지 단계를 거쳐야할 필요가 있고, 이 모드는 그러한 작업들을 일괄 처리 가능한 상태로 실행합니다.

```swift
// hello.swift
func hello() {
	print("Hello Swift!")
}
```

```swift
// main.swift
hello()
```

-v 옵션을 붙이면 서브프로세스를 호출하는 모습을 확인할 수 있습니다.

```shell
# 실행하는 서브프로세스를 표시하면서 컴파일
$ swiftc -v -o hello main.swift hello.swift
Apple Swift version 3.1 (swiftlang-802.0.53 clang-802.0.42)
Target: x86_64-apple-macosx10.9
/Applications/Xcode.app/Contents/Developer/Toolchains/XcodeDefault.xctoolchain/usr/bin/swift -frontend -c -primary-file main.swift hello.swift -target x86_64-apple-macosx10.9 -enable-objc-interop -sdk /Applications/Xcode.app/Contents/Developer/Platforms/MacOSX.platform/Developer/SDKs/MacOSX10.12.sdk -color-diagnostics -module-name hello -o /var/folders/y0/845byh512k53x98tw3ch5j2w0000gn/T/main-4e5977.o
/Applications/Xcode.app/Contents/Developer/Toolchains/XcodeDefault.xctoolchain/usr/bin/swift -frontend -c main.swift -primary-file hello.swift -target x86_64-apple-macosx10.9 -enable-objc-interop -sdk /Applications/Xcode.app/Contents/Developer/Platforms/MacOSX.platform/Developer/SDKs/MacOSX10.12.sdk -color-diagnostics -module-name hello -o /var/folders/y0/845byh512k53x98tw3ch5j2w0000gn/T/hello-6eeba6.o
/Applications/Xcode.app/Contents/Developer/Toolchains/XcodeDefault.xctoolchain/usr/bin/ld /var/folders/y0/845byh512k53x98tw3ch5j2w0000gn/T/main-4e5977.o /var/folders/y0/845byh512k53x98tw3ch5j2w0000gn/T/hello-6eeba6.o -force_load /Applications/Xcode.app/Contents/Developer/Toolchains/XcodeDefault.xctoolchain/usr/lib/arc/libarclite_macosx.a -framework CoreFoundation -syslibroot /Applications/Xcode.app/Contents/Developer/Platforms/MacOSX.platform/Developer/SDKs/MacOSX10.12.sdk -lobjc -lSystem -arch x86_64 -L /Applications/Xcode.app/Contents/Developer/Toolchains/XcodeDefault.xctoolchain/usr/lib/swift/macosx -rpath /Applications/Xcode.app/Contents/Developer/Toolchains/XcodeDefault.xctoolchain/usr/lib/swift/macosx -macosx_version_min 10.9.0 -no_objc_category_merging -o hello
```

1. 소스 파일마다 `swift -frontend -c` 를 호출해서 `.o`파일을 작성
2. 링커인 `ld`로 `.o`를 링크해서 실행파일을 작성

라는 느낌입니다. `-frontend`는 다음에 이야기할 frontend mode입니다.

```shell
# 실행하는 명령어 작업 표시하기(macOS)
$ swiftc -driver-print-jobs -o hello main.swift hello.swift 
```



<a name="1">1</a> 최근(여기선 2017년)까지는 run도 대상이었습니다만, 내장하고 있는 swift run은 [SE-0179](https://github.com/apple/swift-evolution/blob/master/proposals/0179-swift-run-command.md)의 swiftpm의 기능을 덮어쓰기 때문에 폐기되었습니다. [SR-5332](https://bugs.swift.org/browse/SR-5332)

