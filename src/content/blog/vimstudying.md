---
title   : VIM 공부
summary : 
date    : 2018-04-08 23:00:56 +0900
updated : 2018-04-10 22:17:51 +0900
tags    : 
toc     : true
public  : true
parent  : developing
latex   : false
---

> **2026-10-28 검토:** 2018년의 Vim/Neovim 사용 기록입니다. 아래의 Python 패키지명은 당시 명칭이며, 현재 설정 확인 방법을 별도로 덧붙였습니다.


# 텍스트 다루기

- macOS에서 비주얼 모드로 선택한 **줄 범위 전체**를 클립보드에 보내려면 `:'<,'>write !pbcopy`를 사용할 수 있다. 문자 단위로 선택했더라도 이 Ex 명령은 선택한 문자가 아니라 해당 줄들을 전달한다.
- 문자 단위 선택만 복사하려면 클립보드 지원이 있는 Vim에서 비주얼 선택 후 `"+y`를 사용한다. Vim 빌드의 클립보드 지원 여부와 Neovim의 provider 설정을 먼저 확인하자.
- 참고: [Vim의 범위 쓰기 명령](https://vimhelp.org/editing.txt.html#%3Awrite_c).

# neovim

- nvim을 사용하기로 했는데, 초반에 바보 같은 실수로 몇 십분 고생했다.
- junegunn님의 [vim-plug](https://github.com/junegunn/vim-plug.git)를 사용중인데, nvim 플러그인 파일의 위치가 다르다는 것을 생각하지 못하고, vim설정들을 그냥 옮겼더니 계속 문제가 발생했었다. 걍 vim-plugin README에 neovim 설치방법이 나와있었다.
- 당시에는 Python provider 관련 오류에 대응하며 `pip3 install --upgrade neovim`을 사용했다. 이 명령이 모든 플러그인의 Python 오류를 해결한다는 뜻은 아니다.
- 현재 Python provider의 패키지명은 `pynvim`이다. 설치 방식과 Python 환경 선택은 [Neovim provider 문서](https://neovim.io/doc/user/provider/)를 확인하고, Neovim에서 `:checkhealth`로 감지 결과를 점검한다. Python을 사용하는 플러그인의 별도 요구 사항도 확인해야 한다.
