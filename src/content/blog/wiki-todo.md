---
title: Wiki TODO
date    : 2018-04-09 00:00:00 +0900
---

> **2026-10-28 검토:** 2018년 Jekyll 위키를 만들던 할 일 기록입니다. 체크 표시는 당시 기록이며 현재 Astro 사이트의 구현 상태를 뜻하지 않습니다. 아래 JavaScript는 당시 예제의 문법을 고친 것으로 현재 사이트에 적용한 코드가 아닙니다.


### TODO
- [o]  모든 HTML 템플릿에 Vue.js 적용
    - [X] wiki link replace 함수 추가(from [johngrib](https://johngrib.github.io))

~~~javascript
function replaceWikiLink(query) {
    var content = document.querySelector(query);
    if (!content) return;
    content.innerHTML = content.innerHTML.replace(/\[\[(.+?)\]\]\{(.+?)\}/g, '<a href="wiki/$1">$2</a>');
    content.innerHTML = content.innerHTML.replace(/\[\[(.+?)\]\]/g, '<a href="wiki/$1">$1</a>');
}
~~~

- [X] Disqus를 적용해보자
- [X]  마크다운 파일 생성시 yaml 자동 생성 할 수 있는 방법을 모색해보자
- [ ]  한글 링크 처리를 어떻게 하면 좋을지 고민해보자
    - 공백문자 특수문자등이 다 안되는군요.
    - 두가지 방법이 있겠다.
        - 공백문자와 특수문자를 실제 링크로 만들지 말고 타이틀에만 넣어보자
        - 지킬을 수정해보자



### 예제의 적용 범위

`[[page]]{표시 이름}`과 `[[page]]`를 옛 `wiki/` 경로의 링크로 바꾸는 예제다. 잘못 붙어 있던 `== ==`를 제거하고 대상 요소가 없을 때는 반환하도록 했다. `innerHTML`에 치환 문자열을 넣으므로 외부 입력이나 신뢰하지 않는 콘텐츠에 적용하면 안 된다. 현재 사이트의 `/blog/` 라우팅이나 일반적인 안전한 Markdown 변환기로 사용할 코드는 아니다.
