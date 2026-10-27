---
title   : 애플 개발 문서 읽기
summary : UIKit 앱 구조와 메타데이터에 관한 2019년 학습 메모
date    : 2019-03-20 23:16:43 +0900
updated : 2019-03-20 23:39:57 +0900
tags    : apple, ios, mac, documentation
toc     : true
public  : true
parent  : study.md
parenttitle : 공부, 그리고 공부
latex   : false
---

> **2026-10-28 검토:** 2019년에 UIKit 문서를 읽으며 남긴 학습 메모입니다. 문서 전체의 번역은 아니며, 당시 앱 구조 설명과 현재 보충 내용을 구분했습니다.


# About App Development with UIKit
## 개요
UIKit framework 으로는 iOS, tvOS 개발이 가능하다. 콘텐트를 화면에 뿌리고 콘텐트와 상호작용하는데 사용할 수 있다.
`Xcode가 필요하다.`
Xcode에서는 템플릿 프로젝트로 앱 개발을 시작하게 된다.

## 필요한 자원
- App icons
- Launch screen storyboard

### 필요한 메타데이터
- Info.plist 파일은 앱의 설정과 필요한 기능·권한 설명 등의 메타데이터를 담고 있다.
    - 자세한 내용은 [Information Property List Key Reference](https://developer.apple.com/library/archive/documentation/General/Reference/InfoPlistKeyReference/Introduction/Introduction.html#//apple_ref/doc/uid/TP40009247)에서 찾아보자

## Code Structure of a UIKit App

- UIKit 앱은 MVC 디자인 패턴에 기반한다.
    - Model은 앱의 데이터와 비즈니스 로직을 담는다.
    - View는 데이터를 가시적으로 표현한다.
    - Controller는 View와 Model 사이에서 데이터의 흐름을 주선한다.

UIKit과 Foundation framework는 모델의 기본 타입을 제공하고, UIKit에서 제공하는 UIDocument는 디스크 기반의 데이터 구조를 구성할 수 있다. Foundation은 문자열, 숫자, 배열 등의 기타 데이터 타입을 제공한다.
UIKit는 UIView 클래스를 통해 사용자의 콘텐트를 표현하고, UIApplication 객체를 통해서는 앱의 메인 이벤트 루프와 라이프 사이클을 수행한다.

## 지금 읽을 때 참고할 점

- 위의 Launch screen storyboard는 당시 메모입니다. 현재 프로젝트에서는 대상 OS와 요구 사항에 따라 [`UILaunchScreen`](https://developer.apple.com/documentation/BundleResources/Information-Property-List/UILaunchScreen) 설정도 확인해야 합니다.
- 앱 전체의 이벤트 처리는 `UIApplication`과 관련되지만, 장면을 사용하는 앱의 화면별 생명주기는 [`UIScene`](https://developer.apple.com/documentation/uikit/uiscene) 문서를 함께 읽어야 합니다.
- MVC 설명은 UIKit의 전통적인 역할 구분입니다. 모든 앱이 반드시 같은 아키텍처로 구현되어야 한다는 뜻은 아닙니다.
