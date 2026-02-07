---
layout: post
title   : View Controller Programming Guide for iOS 번역
summary : 
date    : 2018-04-10 22:43:02 +0900
updated : 2018-04-12 22:45:11 +0900
tags    : 
toc     : true
public  : true
parent  : 
latex   : false
---
* TOC
{:toc}

*이 글은 View Controller Programming Guide for iOS를 제대로 읽으며 제가 그동안 얼마나 제가 사용하고 있던 컴포넌트에 대해 무지했는지 반성하기 위해 번역하는 글입니다.*

### 뷰 컨트롤러의 역할

뷰 컨트롤러는 앱의 내부 구조를 이루는 기반입니다. 모든 앱은 최소 하나 이상의 뷰 컨트롤러를 가지고 있습니다. 각 뷰 컨트롤러는 인터페이스와 기반이 되는 데이터 사이의 상호 작용과 앱의 사용자 인터페이스의 한 부분을 담당합니다. 또한 뷰 컨트롤러는 사용자 인터페이스의 각 부분들간의 전환을 돕습니다.

앱에서 이런 중요한 역할을 담당하고 있는 이유로, 뷰 컨트롤러는 앱이 수행하는 모든 작업의 중심에 있습니다. [UIViewController](https://developer.apple.com/documentation/uikit/uiviewcontroller)는 뷰의 관리, 이벤트 처리, 뷰 컨트롤러간의 전환, 앱의 다른 부분과의 연계를 위한 메소드와 프로퍼티를 정의합니다. `UIViewController`(혹은 그 하위 클래스 중 하나)를 하위 클래스로 만들고 앱의 동작을 구현하는데 필요한 상속받아 만든 서브클래스에서 앱의 동작을 보증하기 위해 사용자 지정 코드를 추가합니다.

뷰 컨트롤러에는 두 가지 형태가 있습니다.:

- *Content View Controller*는 앱이 제공하는 내용의 부분 부분을 관리하며, 개발자가 작성하는 가장 주된 형태의 뷰 컨트롤러입니다.
- *Container View Controllers*는 child 뷰 컨트롤러s로부터 정보를 수집하여 뷰 컨트롤러마다의 규칙을 가지고 해당 컨텐트를 표시하거나 탐색을 돕는 방법을 제시합니다.

대부분의 앱은 이 두 가지 형태가 섞여있습니다.

### 뷰 관리

뷰 컨트롤러의 가장 중요한 역할중 하나는 뷰의 계정을 관리하는 것입니다. 모든 뷰 컨트롤러는 그 뷰 컨트롤러의 모든 컨텐트를 가지고 있는 하나의 root view를 가집니다. 컨텐트를 표시하기 위해서 root view에 관련한 view들을 더하게 됩니다. 그림 1-1은 뷰 컨트롤러와 뷰 사이의 관계를 그리고 있습니다. 그 뷰 컨트롤러는 항상 자신의 root view의 참조를 가지고 있으며, 각 뷰는 각 하위 뷰를 강한 참조로 가지고 있습니다.

*그림 1-1 뷰 컨트롤러와 view의 관계*

![img](https://developer.apple.com/library/content/featuredarticles/ViewControllerPGforiPhoneOS/Art/VCPG_ControllerHierarchy_fig_1-1_2x.png)

> 주석
>
> 보통 [outlet](https://developer.apple.com/library/content/documentation/General/Conceptual/Devpedia-CocoaApp/Outlet.html#//apple_ref/doc/uid/TP40009071-CH4)을 이용해서 뷰 컨트롤러의 view 계층에 접근할 수 있습니다. 뷰 컨트롤러는 모든 뷰의 컨텐트를 관리하기 때문에, outlet으로 필요한 뷰의 참조를 저장할 수 있게 해줍니다. 스토리 보드로부터 뷰를 로드 할 때 outlet이 자동적으로 해당 뷰 객체에 연결됩니다.

컨텐트 뷰 컨트롤러는 모든 뷰를 직접 관리합니다. 컨테이너 뷰 컨트롤러는 자신의 뷰에다 하위 뷰 컨트롤러들의 루트 뷰들을 관리합니다. 컨테이너는 하위 뷰 컨트롤러들의 컨텐트에는 관여하지 않습니다. 오직 컨테이너의 설계에 따라 루트 뷰, 사이즈 계산과 위치 지정을 관리합니다. 그림 1-2는 스플릿(split) 뷰 컨트롤러와 하위 뷰 컨트롤러들간의 관계도를 나타냅니다. 스플릿 뷰 컨트롤러는 하위 뷰 컨트롤러가 뷰의 실제적인 내용을 관리하는 것을 제외하고, 하위 뷰의 전반적인 사이즈와 위치를 관리합니다.

*그림 1-2 뷰 컨트롤러는 다른 뷰 컨트롤러의 형상(\*역주: 이 부분이 content라고 되어있는데, 앞에서 쓰이는 content와 같다는 생각을 할 수 없어 형상이라고 번역했습니다. 오류가 있다면 알려주시기 바랍니다.)을 관리할 수 있다.*

뷰 컨트롤러의 뷰를 관리하는 방법에 대해서는 [뷰 레이아웃 관리(Managing View Layout)](https://developer.apple.com/library/content/featuredarticles/ViewControllerPGforiPhoneOS/DefiningYourSubclass.html#//apple_ref/doc/uid/TP40007457-CH7-SW6)를 참조하시기 바랍니다.

데이터 마샬링([참조](https://ko.wikipedia.org/wiki/%EB%A7%88%EC%83%AC%EB%A7%81_(%EC%BB%B4%ED%93%A8%ED%84%B0_%EA%B3%BC%ED%95%99)))

컨텐트 뷰 컨트롤러는 관리하는 내용과 앱의 데이터 사이에서 중개자 역할을 합니다. [UIViewController](https://translate.googleusercontent.com/translate_c?act=url&depth=1&hl=ko&ie=UTF8&prev=_t&rurl=translate.google.com&sl=en&sp=nmt4&tl=ko&u=https://developer.apple.com/documentation/uikit/uiviewcontroller&xid=25657,15700023,15700105,15700124,15700149,15700168,15700201&usg=ALkJrhh1Acmte_kb4l0PPv88dOkCecHTcw)클래스의 메소드와 프로퍼티를 이용해 앱의 시각적 표현을 관리할 수 있습니다. *UIViewController*의 서브 클래스를 만들 때, 데이터를 관리하기 위한 여러 가지 변수를 추가하게 됩니다. 사용자 변수를 추가하는 것은 그림 1-3과 같이 뷰 컨트롤러가 데이터의 참조를 가지고 있고 그 데이터를 표시하기 위한 뷰의 관계가 만들어집니다. 그 둘 사이에서 데이터를 움직이는 것은 개발자의 책임입니다.

*그림 1-3 뷰 컨트롤러는 데이터 객체와 뷰를 중개*

![img](https://developer.apple.com/library/content/featuredarticles/ViewControllerPGforiPhoneOS/Art/VCPG_CustomSubclasses_fig_1-3_2x.png) 

여러분은 항상 뷰 컨트롤러와 데이터 객체들 간의 책임을 깔끔하게 분리하도록 해야합니다. 데이터 구조의 무결성을 보장하는 대부분의 로직은 데이터 객체들 자신에 있습니다. 뷰 컨트롤러는 뷰로부터의 입력을 검증해야 하고, 데이터 객체들이 요구하는 형식에 맞게 입력을 가공할 수 있지만, 실제 데이터의 관리에 대해서는 뷰 컨트롤러의 역할을 최소로 유지해야 합니다.

[`UIDocument`](https://developer.apple.com/documentation/uikit/uidocument ) 객체는 뷰 컨트롤러로 부터 데이터를 분리해서 관리하는 방법중의 하나입니다. document 객체는 영구 저장소에서 데이터를 읽고 쓰는 방법을 제공하는 컨트롤러 객체입니다. 서브 클래스를 만들 때, 여러분은 데이터를 추출하고 그것을 뷰 컨트롤러나 앱의 다른 부분에 전달하기 위한 로직과 메소드를 더해야 합니다. 뷰 컨트롤러는 뷰를 쉽게 갱신할 수 있도록 어떤 데이터는 복사본을 저장해야 하지만, 원본 데이터는 항상 document가 가지게 됩니다.

### 사용자와의 상호작용
뷰 컨트롤러는 responder 객체이며(UIResponder를 상속) responder 체인으로 내려온 이벤트들을 처리할 수 있습니다. 그리고 가능은 하지만, 터치 이벤트를 직접 처리하지는 않습니다. 대신, 대개의 상황에서 뷰들이 자신의 터치 이벤트를 처리하고 그 결과를 delegate나 target 객체에 보고 합니다. 따라서, 뷰 컨트롤러 내의 대부분의 이벤트들은 delegate 메소드나 action 메소드를 이용하여 처리합니다.

뷰 컨트롤러 내에서의 action 메소드의 구현에 대해서 더 알고 싶다면, [Handling User Interaction](https://developer.apple.com/library/content/featuredarticles/ViewControllerPGforiPhoneOS/DefiningYourSubclass.html#//apple_ref/doc/uid/TP40007457-CH7-SW11 )를 살펴보세요. 다른 타입의 이벤트에 대해서 알고 싶다면, [Cocoa Event Handling Guide](https://developer.apple.com/library/content/documentation/Cocoa/Conceptual/EventOverview/Introduction/Introduction.html#//apple_ref/doc/uid/10000060i )를 살펴보세요.

