---
layout  : post
title   : Swift compiler architecture
summary : Swift Compiler 의 구조 정리
date    : 2022-01-15 15:50:00 +0900
updated : 2022-01-15 15:50:00 +0900
categories : swift compiler architecture
---

# Swift compiler architecture

*[Qiita](https://qiita.com)에 [@rintaro](https://qiita.com/rintaro)님이 포스팅한 포스팅한 일본어 [원문](https://l.facebook.com/l.php?u=https%3A%2F%2Fqiita.com%2Frintaro%2Fitems%2F3ad640e3938207218c20%3Ffbclid%3DIwAR1NiW77-FJuHqHYi5PJjIS6BFtEKP3H2s4UIAI-GvTfEjcbwNlL3Gp58jQ&h=AT059KvKJPmm7UMHygfBeYAj3bDVF7nrvZ5M0aOgTG2uZdUzxGMEZYcoJ4XVPwh1Fb5eVqy5wIw3iephiwzYfwWgWBw4axeQ_6GXYUUupLs3Ph9e1XLOm-S6rhkbuX87qTjrzOPbMw&__tn__=-UK-y-R&c[0]=AT02ywht0jPSBe90GR_6d-r83cssAeMPYzSKAgAORNhCERtlk9-l5KuScz-N6ArSlTo3uObBA9ViZpc74uzdAWGgKFTKaGcQu73IjmGhPGKrOpGgQ6rPed8THV2fQUjPkBX7f6A_Rl70V86t8ZOf0PDdfIfD-DwedwHk36e43B6CuUiAJbeJ3xLwI_OEprXl8oNG2kDZmuRIqOHE)을 번역한 글입니다.*

*글 자체는 2017년도의 글이라 업데이트를 글 작성 후에 개인적으로 진행해야겠네요*

Swift 컴파일러 개발을 시작해보고 싶은 분들을 위해, 컴파일러의 전체 구성이 어떻게 되어있는지 대략적으로 설명해보겠습니다. 코드를 읽을 때 참고가 되면 좋겠네요.

저는 프로그램을 파악할 때, 엔트리포인트(entrypoint, 최초로 실행되는 곳, main 함수)를 알지 못하면 불안해집니다. 바꿔 말하면, 엔트리포인트만 알면 거기서부터 처리 과정을 따라가면 좋기 때문에, 그 다음 과정에 대한 이해도 굉장히 쉬워집니다. 그렇기 때문에 가장 먼저 swift 명령어의 엔트리포인트 부터 시작하겠습니다.

주의: 각 진입부는 깃헙에 있는 실제 코드의 링크를 달고 있는데, 행번호는 시간이 지나면서 변경되기 때문에, 파일까지의 링크만 달아놓았습니다. 함수명등으로 검색해주세요.



## 드라이버 (Driver)

`swift` 명령어 인데, 실체는 [tools/driver](https://github.com/apple/swift/tree/master/tools/driver) 입니다.

tools/driver/driver.cpp에 main 함수가 있어, 여기서부터 [lib 디렉토리](https://github.com/apple/swift/tree/master/lib) 에서 구현하고 있는 각종 라이브러리를 호출하도록 되어있습니다.

드라이버에는 커맨드라인 argument에 따른 몇개의 모드가 존재합니다.



### 서브커맨드 런처 (subcommand launcher)