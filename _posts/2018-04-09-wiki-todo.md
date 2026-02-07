---
layout: post
title: Wiki TODO
---

### TODO
- [o]  모든 HTML 템플릿에 Vue.js 적용
    - [X] wiki link replace 함수 추가(from [johngrib](https://johngrib.github.io))
    ~~~javascript
function replaceWikiLink(query) {
    var content = document.querySelector(query);
    content.innerHTML = content.innerHTML.replace(/\[\[(.+?)\]\]\{(.+?)\}/g, '<a href="wiki/$1">$2</a>'); == ==
    content.innerHTML = content.innerHTML.replace(/\[\[(.+?)\]\]/g, '<a href="wiki/$1">$1</a>');
}
    ~~~
- [X] Disqus를 적용해보자
- [X]  마크다운 파일 생성시 yaml 자동 생성 할 수 있는 방법을 모색해보자
- [ ]  한글 링크 처리를 어떻게 하면 좋을지 고민해보자
    - 공백문자 특수문자등이 다 안되는군요.
    - 두가지 방법이 있겠다.
        - 공백문자와 특수문자를 실제 링크로 만들지 말고 타이틀에만 넣어보자
        - 지킬을 수정하보자


