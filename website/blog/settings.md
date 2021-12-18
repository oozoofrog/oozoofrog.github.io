---
layout  : wiki
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
* TOC
{:toc}

# Karabiner에서 ESC+영문전환키

karabiner의 설정값은 JSON으로 되어있다. 여기에 쓰는 팁은 mac에서 vim을 편하게 쓰기 위한 것으로 ESC를 누르면 vim의 ESC로 동작하며 약간의 시차를 두고 일본어 영자키를 호출하여 normal mode에서 영자키 전환이 이루어지게 하려는 목적이다.

1. [karabiner 12.0.0 버전](https://pqrs.org/osx/karabiner/files/Karabiner-Elements-12.0.0.dmg )을 다운 받는다.
2. karabiner를 실행한다.
3. 3번째 탭인 Complex Modifications를 클릭
4. 하단의 `+ Add rule` 버튼을 클릭
5. 상단의 `Import more rules from the Internet(open a web browser)`버튼을 클릭
6. 웹 페이지가 열리고 이것저것 다운받을수 있는 설정값들이 뜬다.
7. 목록을 보면 Change escape key (rev 3)이라는 항목이 있다. [Import]한다.
8. Post caps_lock 어쩌구를 enable한다.
9. 이제부터는 karabiner.json 파일 수정을 통해 건드려보자
10. ~/.config/karabiner/karabiner.json 파일을 열어보자
~~~
...
                "rules": [
                    {
                        "description": "
...
~~~
이라는 내용이 보일텐데, 해당 부분에서 좀 더 내려가면
~~~
...
"to_if_alone": [
                                    {
                                        "hold_down_milliseconds": 500,
                                        "key_code": "어쩌구"
...
~~~
가 보일 거이다.

나는 저 key_code의 어쩌구값을 japanese_eisuu로 바꿔서 일본어 키의 영자 전환키가 호출되도록 수정했다.

끗

# Xcode Xvim2 설정하기
