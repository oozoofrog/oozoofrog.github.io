---
title: vimwiki+jekyll+깃헙페이지 개발하는 이야기
date    : 2018-04-09 00:00:00 +0900
updated: 2018-04-09 23:57:27 +0900
parent: developing
---

> **2026-10-28 검토:** 2018년에 Vimwiki와 Jekyll을 연결하던 개발 기록입니다. 현재 사이트의 설치 가이드는 아니며, 신규 파일 이벤트와 Issues 설명을 정정했습니다.


# 숙제들

- **[해결]** utteranc.es 잘 작동 안한다. 모색중
    - 당시 메모에는 새 저장소를 만드는 방법을 해결책으로 적어두었다. 다만 fork라는 이유만으로 Issues를 사용할 수 없는 것은 아니다. 저장소 Settings에서 Issues를 활성화할 수 있는지 확인하고, utterances가 요구하는 공개 저장소·앱 설치·권한을 확인하면 된다. [utterances 설정 안내](https://utteranc.es/)와 [GitHub Issues 설정](https://docs.github.com/en/repositories/managing-your-repositorys-settings-and-features/enabling-features-for-your-repository/disabling-issues) 참조.

# 진행

**아래에 쓴 것보다 더 좋은 방법을 [johngrib](https://johngrib.github.io/wiki/vimwiki/#vimscript-서포트-코드 )님의 블로그에서 찾았습니다.**

### 처음 작성해본 함수
처음 위키 파일을 만들면 yaml을 상단 자동으로 생성하게 하고 싶었다. 그래서 아래와 같은 함수를 만드는데... 2시간 걸렸다...

`.vimrc`
~~~vimscript
function! AddYAML()
    " 빈 버퍼에만 삽입한다. 기존의 한 줄짜리 문서를 덮어쓰지 않는다.
    if line('$') == 1 && getline(1) ==# ''
        " normal 모드에서 i(nsert)를 사용해서 문자열을 추가
        exe "normal i"."---\nlayout: wiki\ntitle: " . expand('%:t') . "\n---"
    endif
endfunction

" 기존 파일을 읽거나 새 파일의 버퍼를 만들 때 실행한다.
" vimrc를 다시 읽어도 자동 명령이 중복 등록되지 않도록 그룹을 사용한다.
augroup WikiYAML
    autocmd!
    autocmd BufRead,BufNewFile *.md call AddYAML()
augroup END
~~~

`BufRead`만으로는 아직 디스크에 없는 새 파일을 잡을 수 없다. [`BufNewFile`](https://vimhelp.org/autocmd.txt.html#BufNewFile)을 함께 등록한다. 이 예제의 `layout: wiki`는 당시 Jekyll용 필드이며, 다른 사이트 생성기에 그대로 적용하는 설정은 아니다. 빈 파일과 이미 내용이 있는 파일을 각각 열어 자동 삽입 범위를 확인하자.
