---
title   : 런타임 앱
summary :
date    : 2018-08-07 01:11:50 +0900
updated : 2018-08-07 23:17:35 +0900
tags    :
toc     : true
public  : true
parent  : uselesses
parenttitle : 쓸모 없는 것들
latex   : false
---

> **2026-10-28 검토:** 2018년의 앱 설계 메모입니다. 아래 항목은 구현·테스트 완료 보고가 아니라 만들려던 동작과 검증할 조건입니다.


# repo

[https://github.com/NotCatLaunch/runtime](https://github.com/NotCatLaunch/runtime)

# 1. 기본적인 의도를 정의한다.

1. 이 메모에서는 새 프로세스의 실행뿐 아니라 백그라운드에서 포그라운드로 돌아오는 시점도 한 번의 진입으로 센다. 진입 시각을 저장한다. 프로세스가 새로 시작한 횟수만 세는 기능과는 구분한다.
2. 실행 시간과 재실행 시간사이의 간격을 계산해 출력한다. 초단위로 하자. 처음 실행한 경우에는 0이다. 즉 초기 데이터가 없다면 저장한 데이터와 이전 데이터를 동일하다고 판단한다.
3. 다시 포그라운드에 진입하면, 기록된 데이터와 재실행 시점의 데이터를 계산하여 초로 출력하고 재실행 시점의 데이터를 이전 데이터에 덮어쓴다.

# 2. 개발환경
1. 데이터의 저장은 어떻게 할까?
    2. 어차피 내 맘대로 할 거니 CoreData를 쓰겠다.
2. 시간 데이터의 저장과 저장한 데이터의 습득은 ApplicationRepository를 만든다. 여기서는 AppDelegate자체를 AppModel로 사용한다.
3. ApplicationRepository는 CoreData를 통해 시간 데이터의 입출력을 수행한다.
4. 시간 데이터의 출력은 ViewModel를 통해 ApplicationRepository에 접근하여 데이터를 습득한다.
5. ViewModel과 ViewController간의 데이터교환은 RxSwift를 사용한다.
6. 중요한것! 테스트 케이스부터 작성한다.

## 확인할 테스트

- 저장값이 없는 첫 진입은 0초를 표시하고 현재 시각을 저장한다.
- 같은 프로세스의 백그라운드 복귀와 프로세스 종료 후 재실행을 각각 확인한다.
- 시스템 시각이 바뀌면 간격이 음수가 될 수 있다. 벽시계 시각으로 계산하는 현재 설계에서 이를 어떻게 표시할지 정해야 한다.
- Core Data 저장 실패와 이전 기록 읽기 실패를 첫 실행으로 조용히 처리하지 않도록 오류 경로를 구분한다.

이 항목들의 실행 결과는 아직 이 글에 기록되어 있지 않다. 현재 UIKit 앱에 옮길 때는 앱 단위와 scene 단위 진입도 구분해야 한다. [Apple의 앱 생명주기 문서](https://developer.apple.com/documentation/uikit/managing-your-app-s-life-cycle)를 기준으로 콜백을 정한다.
