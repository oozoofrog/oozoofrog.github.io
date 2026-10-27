---
title   : 가지가지 설정법
summary : 
date    : 2018-04-17 08:45:11 +0900
updated : 2018-04-17 09:05:50 +0900
tags    : 
toc     : true
public  : true
parent  : 
latex   : false
---

> **2026-10-28 검토:** Karabiner-Elements 12.0.0을 사용하던 2018년 설정 메모입니다. 가져온 규칙의 전체 JSON과 정확한 이름이 남아 있지 않아 그대로 따라 할 수 있는 설치 가이드는 아닙니다. 현재 버전에 옛 설정 파일을 통째로 덮어쓰지 마세요.


# Karabiner에서 ESC+영문전환키

karabiner의 설정값은 JSON으로 되어있다. 여기에 쓰는 팁은 mac에서 vim을 편하게 쓰기 위한 것으로 ESC를 누르면 vim의 ESC로 동작하며 약간의 시차를 두고 일본어 영자키를 호출하여 normal mode에서 영자키 전환이 이루어지게 하려는 목적이다.

1. [karabiner 12.0.0 버전](https://pqrs.org/osx/karabiner/files/Karabiner-Elements-12.0.0.dmg )을 다운 받는다.
2. karabiner를 실행한다.
3. 3번째 탭인 Complex Modifications를 클릭
4. 하단의 `+ Add rule` 버튼을 클릭
5. 상단의 `Import more rules from the Internet(open a web browser)`버튼을 클릭
6. 웹 페이지가 열리고 이것저것 다운받을수 있는 설정값들이 뜬다.
7. 목록을 보면 Change escape key (rev 3)이라는 항목이 있다. [Import]한다.
8. 가져온 규칙을 enable한다. (당시 선택한 규칙의 정확한 이름은 기록에 남아 있지 않다.)
9. 이제부터는 karabiner.json 파일 수정을 통해 건드려보자
10. ~/.config/karabiner/karabiner.json 파일을 열어보자
~~~text
...
                "rules": [
                    {
                        "description": "
...
~~~
이라는 내용이 보일텐데, 해당 부분에서 좀 더 내려가면
~~~text
...
"to_if_alone": [
                                    {
                                        "hold_down_milliseconds": 500,
                                        "key_code": "기존 키 코드"
...
~~~
가 보일 것이다.

나는 저 `key_code`의 값을 japanese_eisuu로 바꿔서 일본어 키의 영자 전환키가 호출되도록 수정했다.

핵심은 아래 속성이다. 이것은 전체 규칙이 아니라 `to_if_alone` 안에 들어가는 이벤트 객체의 예시다.

```json
{
  "key_code": "japanese_eisuu"
}
```

`to_if_alone`은 키를 단독으로 눌렀을 때의 동작이다. `hold_down_milliseconds`는 이벤트를 누르고 있는 시간이며, 그 자체가 두 동작 사이의 지연을 지정하는 것은 아니다. ESC 이벤트와 입력 소스 전환의 순서는 가져온 규칙 전체를 확인해야 한다. `japanese_eisuu`가 원하는 입력 소스로 전환되는지도 키보드와 macOS 입력 소스 설정에 따라 직접 확인해야 한다.

수정 전에는 설정을 백업하고, 한 규칙씩 켠 뒤 ESC 동작과 영문 입력을 각각 시험하자. 현재 형식은 [공식 complex modifications 문서](https://karabiner-elements.pqrs.org/docs/json/complex-modifications-manipulator-definition/)와 [`to_if_alone` 설명](https://karabiner-elements.pqrs.org/docs/json/complex-modifications-manipulator-definition/to-if-alone/)을 기준으로 확인한다.

끗

# Xcode XVim2 설정하기

미작성 항목. 이 메모에는 설치 절차나 검증한 Xcode 버전이 남아 있지 않다.
