---
layout: post
title   : 
summary : 
date    : 2018-04-09 22:40:10 +0900
updated : 2018-04-10 22:13:39 +0900
tags    : 
toc     : true
public  : true
parent  : swift
latex   : false
---
* TOC
{:toc}

### Xcode 9.3

#### 새로운 64 비트 테스트 모드

개발자들은 macOS 10.13.4에서 64 비트 호환성 테스트를 위한 새로운 64 비트 테스트 모드를 사용할 수 있습니다.

**주의:** 이 모드는 숙련된 IT 관리자나 개발자들만 활성화 할 것을 강력히 권고합니다.

64 비트 테스트모드를 활성하 하기 위해서는:

1. 부팅시 Command + R키를 눌러 OS 복구 모드로 진입.
2. 터미널 실행
3. 다음의 코드를 실행: `nvram boot-args="-no32exec"`
4. 재부팅

64 비트 테스트 모드에서는 기동시 32비트 프로세스가 실행되지 않습니다. 32비트에 기반한 소프트웨어를 실행하는 경우 실행하지 못한다는 알림을 표시합니다. 32 비트 버전의 대시보드나 WebKit 플러그인, 설정 창들(preference panes)같은 타입의 소프트웨어는 특별한 안내 없이 실패할 수 있습니다.

소프트웨어가 64 비트에서 동작하도록 업데이트 되면, 테스트 모드를 비활성화 하세요.

64 비트 테스트 모드를 비활성화 하기:

1. 복구 모드로 부팅하기 위해, 재기동 하신 후, Command + R 키를 누르고 계세요.
2. 터미널을 여세요.
3. 다음의 명령어를 실행하세요: `nvram boot-args=""`
4. 기기를 재기동 하세요.

나중 버전부터는 64 비트 테스트 모드에서 테스트와 소프트웨어 품질을 위한 추가적인 정보를 개발자에게 제공할 수 있습니다.

#### Xcode changes for deprecation of macOS 32-bit support

- Removed the 32-bit option from the Architectures build settings UI. (35517385)
- Building for 32-bit architecture on macOS now emits a warning. (35709244)

#### Deprecation and Removal Warnings

- The Core Animation instrument and template have been deprecated in Instruments. The functionality previously under "Debug Options" has moved to Xcode, under "Debug > View Debugging > Rendering". (22971414)
- The OpenGL ES Analyzer Instrument is no longer supported. It has been replaced by the GPU Frame Debugger in Xcode and will be removed in a future version of Instruments. (35104029)

#### General

##### New Features

- The new [Energy organizer](http://help.apple.com/xcode/mac/current/#/dev36a5a9141) shows logs generated when your app or app extension exceeds a reasonable CPU threshold in the foreground or background causing battery drain on your user's device. (28640769)

  The [Energy organizer](http://help.apple.com/xcode/mac/current/#/dev36a5a9141) features include:

  - Energy logs are reported for your app when distributed on TestFlight or the App Store.
  - Server-side symbolication when uploading symbol information to Apple.
  - Automatic client-side symbolication when symbol information is saved locally.
  - CPU sample reports that are generated when your process is terminated for high CPU usage while the app is in the background.
  - Grouping logs with similar backtraces in energy reports.
  - Viewing the heaviest backtrace of CPU sample logs in the Debug navigator.
  - Compressing log stack frames by non-user stack frames and low sample count stack frames.

- Code coverage can now select the targets to include in a code coverage report. (27752500)

  To configure the targets to include:

  1. Open the Scheme editor.
  2. Select the Test action.
  3. Show the Options pane.
  4. In the pane, enable Code Coverage.
  5. In the pop-up menu, choose "some targets."
  6. Select the targets for the code coverage report.

- Text in the Code Snippets library filter bar now includes code completion shortcuts. (8147546)

- User-defined code snippets now appear at the top of the library, rather than the bottom. (8901028)

##### Resolved Issues

- Xcode 9.3 adds a new `IDEWorkspaceChecks.plist` file to a workspace's shared data, to store the state of necessary workspace checks. Committing this file to source control will prevent unnecessary rerunning of those checks for each user opening the workspace. (37293167)
- Resolved a performance issue when switching away from Issue Navigator into other Navigators, especially the Find Navigator. (35363603)
- The source editor find and replace control now supports Full Keyboard Access. (33666790)

#### Apple LLVM Compiler

##### Resolved Issues

- A class and instance method with the same selector on an Objective-C protocol are both callable on a class that implements that protocol. (34596043)

#### Asset Catalog

##### Known Issues

- Dragging an image from Finder to an empty sticker pack is rejected. Xcode crashes when dragging an image in the Project navigator to an empty Sticker pack. (38509180)

  *Workaround*: Create a new sticker in the empty sticker pack, then drag the image from Finder or Project navigator into the new sticker well.

- App Icon set in Asset Catalog in a new Watch OS template app does not include the App store icon. (37480050)

  *Workaround*: Select watchOS 1.0 and later in the Attributes Inspector, this will generate the App store icon, set it back to watchOS 2.0 and later if only watchOS 2.0 is supported.

#### Build System

##### New Features

- Xcode now runs more Swift build tasks in parallel with other commands. This may improve build times for Swift projects, but may also increase memory use during the build. This feature can be disabled from Terminal by setting a user default with `defaults write com.apple.dt.Xcode BuildSystemScheduleInherentlyParallelCommandsSerially -bool YES`. (35551983)

- Added an option to optimizing by size (`-Osize`) to the Optimization Level for the Swift compiler to the Build Settings pane of the Project editor. When this mode is selected the Swift compiler minimizes the size of compiled code. (36887476)

  The choice for compiling Swift code by file or by module moved from the Optimization Level setting to Compilation Mode, which is a new setting for the Swift compiler in the Build Settings pane of the Project editor. Previously this choice was combined with others in the Optimization Level setting. Compiling by file enables building only the files that changed, enabling faster builds. Compiling by module enables better optimization. (36887476)

##### Known Issues

- When an .xcconfig file contains multiple assignments of the same build setting, later assignments using `$(inherited)` will inherit from earlier assignments when using the new build system. The old build system discards all except the last assignment. This can cause the evaluated result to be different if `$(inherited)` is used in the value. You can enable a setting to emit a warning if any of these cases are found by running `defaults write com.apple.dt.XCBuild EnableCompatibilityWarningsForXCBuildTransition YES`. (37833468)

##### Resolved Issues

- The new build system now supports all of the Product > Perform Action > Compile, Analyze, Preprocess, or Assemble operations for single-files. (31072405)
- Improved new build system rebuild times for configurations which have the "DWARF with dSYM File" build setting enabled by performing only the necessary work for dSYM generation during incremental rebuilds. (30668974)
- Prevented Spotlight from indexing the module cache folder for builds, by renaming the folder to `ModuleCache.noindex` which results in an improvement in overall build performance. (35212165)
- Fixed an issue in which the Clean Build Folder command could fail to complete. (36117298)
- When using the new build system, navigating from a build issue to a header now correctly opens the header in the project source instead of the copy built into the product. (29060887)
- Fixed a bug which would sometimes cause the `-showBuildSettings` option to `xcodebuild` to hang. (33881306)
- Single file actions in the new build system use the active run destination. (23767795)
- Fixed several issues which could cause Convert to Current Swift Syntax not to work when using the new build system. (36265451)
- Fixed an issue in the new build system that incorrectly rebuilt files on the next build after a build error. (35319783)
- "Build system information" errors from the new build system now appear in both the Issue Navigator and in the build logs. (34873210)
- Fixed an issue in which using Build and Analyze with the new build system could cause Xcode to crash. (32920792)

#### Code Completion

##### Resolved Issues

- Fixed a problem with code completion on a line containing emoji or non-ASCII characters. (24906321)

#### Core Data

##### Resolved Issues

- In the Core Data editor, property settings for `NSFetchRequest` are now included in the compiled data model. (13432055)

#### Debugging

##### New Features

- Memory graph debugging now uses a cleaner, more compact layout for non-cycle graphs. (36987034)
- Added new Core Animation debug options for iOS and tvOS devices that were previously available only in the Core Animation Instrument. Choose Debug > View Debugging > Rendering to access the options. (27976406)

##### Resolved Issues

- Enhanced the performance of the `po` command when printing Objective-C objects in the console. (34197161)
- NSLayoutConstraints listed for a selected view when debugging an app’s view hierarchy now show their identifier in the inspector. (34736382)

#### Devices

##### Known Issues

- The Connect via Network checkbox may become unchecked when first enabling network development for a device. (36797900)

  *Workaround*: Check the checkbox again.

##### Resolved Issues

- The Activity view no longer displays "Untitled" instead of the progress of a device operation, such as an app install. (35620763)
- Xcode may fail to capture a screen shot from an attached device. (36632000)

#### Help

##### Known Issues

- Documentation for the HealthKit framework is missing from the Developer Documentation window. (39005708)

  *Workaround*: Read [the HealthKit framework documentation](https://developer.apple.com/documentation/healthkit) on the web. 

#### Instruments

##### New Features

- The "Import Sampler Data..." menu item has been removed from Instruments. Open the sample text output by selecting through the normal "Open..." panel. (36866911)
- The Cocoa Layout template has been removed. The instrument is still available in the Library palette. To use the Cocoa Layout instrument, open the Library palette, create a document using the Blank template, and drag in the Cocoa Layout instrument from the library to the new document. (21963317)

##### Known Issues

- The "Energy Log" instrument doesn't work for iPhone X and iPhone 8. (36569629)

- The SceneKit instrument shows a warning icon on the right of the target selection with messages “view settings could not be restored”. The SceneKit Instrument still works correctly and the warning can be safely ignored. (38081921)

- Profiling iOS framework unit tests works only for the Release configuration. (26883826)

  *Workaround*: Modify the scheme's Test option to use the Release build configuration.

  1. Product -> Scheme -> Edit Scheme…
  2. Select the Test tab.
  3. Change the Build Configuration to be Release.
  4. Attempt to profile the framework unit test again.

#### Interface Builder

##### Known Issues

- Using a color from an asset catalog in the large title text attributes of a UINavigationBar results in a runtime exception. (35645022)

- SKView from the object library does not behave correctly in Mac documents. (37127877)

  *Workaround*: Drag out a custom view and set its class to SKView.

##### Resolved Issues

- Toolbars or multiline labels in stack views no longer result in an Auto Layout misalignment on the canvas. This issue resulted in problems such as zero width multi-line labels, or in extra tall toolbars when an iPhone X was selected in the device bar. (35377301)
- Placeholder text for `UITextField` now appears correctly on the Interface Builder canvas. (35909580)
- Changing a segue from "Show Detail" to "Show" no longer keeps the action selector for Show Detail. This default action will be automatically restored when compiling or saving a storyboard with Xcode 9.3 or later. (23505175)
- Removed spurious warnings for using `NSImageNameTouchBar*` constants in Touch Bar. (35773248)
- System-provided fonts are no longer archived in the `<customFonts>` XML element for iOS and tvOS documents. This resolves exceptions in `libFontParser.dylib` when launching apps. (35126633)
- Fixed an issue compiling macOS storyboards that resulted in incorrectly logging: "Unknown Window class (null) in Interface Builder file, creating generic Window instead." (34994636)
- Increased the helpfulness of the VoiceOver descriptions and tooltips for control and text alignment items in the Attributes inspector. (29782636)

#### Localization

##### New Features

- Added the LOCALIZED_STRING_MACRO_NAMES build setting for adding custom localized string macros in addition to the default `NSLocalizedString` and `CFLocalizedString` families of macros. Each entry in the build setting is the base name for a set of four localization macros. For example, adding `MyErrorString` to the list enables using `MyErrorString()`, `MyErrorStringFromTable()`, `MyErrorStringFromTableInBundle()`, and `MyErrorStringWithDefaultValue()` to localize strings in your project. (14842118)

#### Organizer

##### Resolved Issues

- Resolved a crash that could occur when selecting a log in the Crashes organizer. (34869501)
- Resolved a crash that could occur when selecting the app version in the Crashes organizer. (35786034)
- Resolved an issue that resulted in the incorrect error message "No accounts with iTunes Connect access have been found [...]" when uploading an app to the App Store. (18369136)
- Improved the performance of the Organizer window when scrolling and resizing, and when loading many archives or many iTunes Connect apps. (18978906)

#### Playgrounds

##### Known Issues

- Selecting text contained in rendered markup in the Find Navigator may not work as expected. (36382602)

  *Workaround*: Choose "Editor > Show Raw Markup" before selecting the text.

##### Resolved Issues

- Playgrounds with nested functions run correctly when using a custom toolchain from swift.org. (28784059)
- tvOS playgrounds now display their live views at the correct size. (35951627)
- Find Navigator now correctly searches all playground page content. (35751178)
- Fixed a crash that occurred when deleting text in a playground page that is displayed in multiple tabs. (34364618)

#### Project Model

##### New Features

- Projects created in Xcode 9.3 use a new project format that is incompatible with earlier versions of Xcode. To open projects in earlier versions, change the project format by selecting the project in the Project navigator, opening the Document inspector, and selecting the desired format from the Project Format pop-up menu. (35207662)

##### Resolved Issues

- When adding a framework to a target, Xcode also checks that the path of the directory containing the added framework doesn't already exist in SYSTEM_FRAMEWORK_SEARCH_PATHS before adding that path to FRAMEWORK_SEARCH_PATHS. (29851042)

#### Provisioning

##### New Features

- Xcode provides a new quick look preview generator for provisioning profiles. The preview includes the app identifier, expiration date, certificates, device identifiers, and entitlements encoded within the profile. (37042581)

#### Refactoring

##### Resolved Issues

- Fixed a problem where a "Rename Failed" error would occur the second time you used the Refactor > Rename command. (36304316)

#### Server

##### New Features

- Updated the Report navigator for Xcode Server integrations to show repository commits, logs, and sub-nodes for test and coverage results. (34493798)

- The debugger on macOS now requires the entitlement `com.apple.security.get-task-allow` to attach to apps built for macOS or for iOS, tvOS or watchOS apps built for Simulator. Xcode automatically injects this entitlement to your builds. The entitlement is stripped from apps distributed using the Organizer window. (34638816)

  To disable Xcode injecting the entitlement, set  `CODE_SIGN_INJECT_BASE_ENTITLEMENTS` to `NO` in the build settings for the target or app. (34638816)

##### Known Issues

- When starting Xcode Server, an alert may appear asking to provide the passphrase to access the xcsd keychain. (37795722)

  *Workaround*: Enter the passphrase which is stored in /Library/Developer/XcodeServer/SharedSecrets/XCSDKeychainSharedSecret.

#### Signing and Distribution

##### Resolved Issues

- Resolves an issue that would cause Xcode to sign with entitlements from a different build configuration. (37324488)
- Resolves an issue where modifying your entitlements file sometimes did not trigger code signing to occur during your next build. (36882851)

#### Simulator

##### Known Issues

- On macOS 10.13.4, booting iOS 11 and later in the Simulator may take several minutes the first time. (35628711)

##### Resolved Issues

- Improved the visual quality of scaled simulated iOS devices resulting in fewer visual artifacts. To get the best results, turn off Optimize Rendering in the Debug menu. (35295090)

#### Source Control

##### New Features

- The Comparison View of the Version Editor has been redesigned with improved scrolling and visual styling. (35254006)
- Renamed user interface elements to clarify the information presented. In the Version editor "Blame View" is now "Authors View" and in the Source editor "Show Blame For Line" is now "Show Last Change For Line." (35031446)

##### Resolved Issues

- Reverting changes in the Comparison View now restores the original whitespace even if it doesn't match the current formatting options. (35009545)
- Git checkout operations no longer require committing changes to files that are unaffected by the operation. (35837784)
- Tagging a branch in Git now tags the most recent available revision of that branch. (35250057)

#### Source Editor

##### New Features

- Added Callers to the Structured Selection Action Popover. You can now command-click on functions, methods, and properties and quickly navigate to their callers. (32587508)

- Text anti-aliasing can be disabled in the source editor by opening Terminal and running the following command:

  `defaults write com.apple.dt.Xcode SourceEditorDisableAntialiasing -bool YES`

  Set the default to `NO` to turn anti-aliasing on. (31378200)

- Compiler notes can now be viewed in the source editor by clicking on the diagnostic icon. (35898603)

- Enhanced Jump to Definition to show the file and line number for each result to help distinguish similar results. (32020190)

##### Resolved Issues

- Fixed a problem where Undoing would not cancel an Edit All in Scope session when undoing past changes made with Edit All in Scope. (31906590)
- Code coverage highlighting in a group of lines in the source editor now works correctly when a group contains multiple subranges with different highlighting. (34802960)
- Fixed a problem with Edit All in Scope where typing was not coalesced into a single undo group. (31364117)
- Significantly improved performance editing and navigating large, multi-megabyte files. (31689732)
- Fixed a problem where printing would cut off the right and bottom edges of each page. (35427028)
- Fixed a problem where scrolling by a page using Option-Page Up or Option-Page Down would scroll too far. (34873829)
- Fixed a problem where copying text would not always preserve the syntax coloring when pasted into Keynote. (32823164)
- Live issues no longer remain in the source editor after a build succeeds. (35810806)
- Improved the reliability of Command-Click in the source editor. (35937969)
- The source editor page guide is now positioned correctly when line wrapping is disabled and the editor is horizontally scrolled. (32699889)
- Improved the accessibility of breakpoints, test statuses, issues, and warnings in the source editor. (33593039)
- Fixed a problem where the source editor did not respect the "Reduce Motion" System Preference when folding code. (35474751)
- Code coverage highlights in the source editor are no longer shown in the incorrect columns. (33040660)
- Resolved an issue where breakpoints may appear on the incorrect line when code is folded. (38082660)
- Improved the scroll bar accuracy for scrolling in large files. (32473788)
- The code coverage ribbon now shows correctly when line wrapping is disabled in the source editor. (20928769)
- Copying and pasting the contents of entire documents no longer adds an additional trailing newline. (36042915)
- Fixed a problem where Quick Help, Find Call Hierarchy, Reveal in Symbol Navigator, and Copy Symbol Name would give information for the wrong symbol. (31889593)

#### Swift Compiler

##### New Features

- Implicitly unwrapped optionals may be used only as a top level type for properties, function parameters, function return values, and variables. Nesting them inside other types is deprecated and results in a warning. This will change to an error in a later version of Swift. ([SR-3023](https://bugs.swift.org/browse/SR-3023), [SE-0054](https://github.com/apple/swift-evolution/blob/master/proposals/0054-abolish-iuo.md)) 

- Swift now consistently enforces that you can’t override a computed property with a stored property, even when the overridden property is marked as `lazy`. If you need to use a stored value when overriding a property, define a separate property as backing storage and make it available through your override. (35870371)

- The type checker now resolves a function overload as ambiguous when there is an overload that returns an optional type, another overload that returns a function type, and the function is called in a context where either overload's return type could be used. For example, on the last line of the the code example below, the type checker can't resolve which version of `f` to call because  `result` has no explicit type information. (36892416)

  | `**struct** S<T> {}`                                         |
  | ------------------------------------------------------------ |
  | ` `                                                          |
  | `**func** f<T>(**_**: S<T>) -> T? { … }`                     |
  | `**func** f<T>(**_**: S<T>) -> (T) -> Int { … }`             |
  | ` `                                                          |
  | `**let** s = S<String>()`                                    |
  | `**let** result = f(s)    // now correctly reports the ambiguity as an error` |

- Passing different kinds of optionals (`?` or `!`) to a function as `inout` no longer requires overriding that function. (36913150)

  For example, the following code is now correct:

  | `**func** takesOptional(i: **inout** Int?) { … }` |
  | ------------------------------------------------- |
  | `**var** x: Int! = 1`                             |
  | `takesOptional(&x)`                               |

- Swift now supports conditional compilation based on available modules using `canImport()` with an argument that is the name of a module that may not be present on all platforms. This condition tests whether it's possible to import the module, but doesn't actually import it. If the module is present, the platform condition returns true; otherwise, it returns false. ([SE-0075](https://github.com/apple/swift-evolution/blob/master/proposals/0075-import-test.md))

  | `**#if** **canImport**(**UIKit**)` |
  | ---------------------------------- |
  | `<#module-specific code#>`         |
  | `**#endif**`                       |

- When `swiftc` is run from the command line, the default deployment target is set to the version of the currently running OS. (29948658)

- Use of ownership keywords `weak` and `unowned` for property declarations in protocols now result in a warning ([SE-0186](https://github.com/apple/swift-evolution/blob/master/proposals/0186-remove-ownership-keyword-support-in-protocols.md)). However, as noted in ([SR-7182](https://bugs.swift.org/browse/SR-7182)), ownership keywords still have an effect when defining a protocol marked `@objc`, because they control the interface presented in the generated Objective-C header. No warnings will be issued if the protocol is marked `@objc`.

- Overriding a function when the only difference in the signature is the kind of optional (`?` or `!`) for an `inout` parameter is deprecated in all versions of Swift and results in a compiler warning. This will change to an error in a future version of Swift. ([SR-6685](https://bugs.swift.org/browse/SR-6685))

- Swift supports a new platform condition `targetEnvironment` with a single valid argument `simulator`. Conditional compilation of the form `#if targetEnvironment(simulator)` can now be used to detect when the build target is a simulator. The Swift compiler will attempt to detect, warn, and suggest the use of `targetEnvironment(simulator)` when evaluating platform conditions that appear to be testing for simulator environments indirectly, via the existing `os()` and `arch()` platform conditions. ([SE-0190](https://github.com/apple/swift-evolution/blob/master/proposals/0190-target-environment-platform-condition.md))

- The compiler now warns for more cases of non-exclusive memory access. These are shown as warnings in the Swift 4.1 compiler and may become errors for all language modes in future versions of the compiler.

  Examples of the new warnings include: an access to memory inside a nonescaping closure conflicting with an access that is already in progress, and a conflict in a closure with a non-generic type that is passed to a function expecting a generic closure. ([SR-6103](https://bugs.swift.org/browse/SR-6103))

  For example, the compiler now warns about overlapping accesses to the variable `value`:

  | `**var** value = 7`                      |
  | ---------------------------------------- |
  | `withUnsafeMutablePointer(to: &value) {` |
  | `    $0.pointee = value + 1`             |
  | `}`                                      |

  One way to avoid the warning is to make a copy of the local variable before passing it as `inout`:

  | `**var** value = 7`                      |
  | ---------------------------------------- |
  | `**let** valueCopy = value`              |
  | `withUnsafeMutablePointer(to: &value) {` |
  | `    $0.pointee = valueCopy + 1`         |
  | `}`                                      |

  Another way is to refer to the variable using a closure parameter instead of capturing it:

  | `**var** value = 7`                      |
  | ---------------------------------------- |
  | `withUnsafeMutablePointer(to: &value) {` |
  | `    $0.pointee = $0.pointee + 1`        |
  | `}`                                      |

- Calls to unavailable functions are permitted if the calling context is also marked unavailable. This simplifies writing code that can be compiled with and without application extension restrictions enabled. (34949130)

##### Known Issues

- When a class conforms to a `private` or `fileprivate` protocol in one file, and the class is subclassed in another file or target, the compiler crashes with the messages "DESERIALIZATION FAILURE" and "top-level value not found." (22672176)

  *Workaround*: Change the protocol to `internal` instead of `private` or `fileprivate`, or set the Optimization Level build setting to Whole Module Optimization (`-O -whole-module-optimization`.)

- If a nested type in a codable type has the same name as a property of the codable type, the compiler will crash. (37570349)

  *Workaround*: Rename either the nested type or the property.

- A crash can occur during runtime whenever there is a generic class or a subclass of a generic class with a stored protocol metatype property. (38394640)

  Example:

  | `**protocol** P { }`                   |
  | -------------------------------------- |
  | `**class** Generic<T> {`               |
  | `    **let** protocolMetatype: P.Type` |
  | `}`                                    |

  *Workaround*: Box the metatype in a class.

  | `**class** BoxedType {`                        |
  | ---------------------------------------------- |
  | `    **let** p: P.Type`                        |
  | `    **init**(**_** type: P.Type) {`           |
  | `        p = type`                             |
  | `    }`                                        |
  | `}`                                            |
  | ` `                                            |
  | `**class** Generic<T> {`                       |
  | `    **let** boxedProtocolMetatype: BoxedType` |
  | `}`                                            |

- In circumstances where protocol methods or base class methods defined in Objective-C claim to take non-null arguments of type `id` in their headers, but get invoked with `nil` values at runtime, Swift code compiled by Xcode 9.3 that overrides those methods may crash when the Swift implementations are invoked. (38675815)

  *Workaround*: Change the Swift override to take a value of type `Any?`. For example, if you implement the `UIApplicationDelegate` protocol's `application(_:open:sourceApplication:annotation:)` method:

  | `**class** AppDelegate: UIApplicationDelegate {`             |
  | ------------------------------------------------------------ |
  | `    **func** application(**_** application: UIApplication, open url: URL, sourceApplication: String?, annotation: **Any**) -> Bool {` |
  | `        **return** **true**`                                |
  | `    }`                                                      |
  | `}`                                                          |

  The program may crash when passed `nil` as the annotation argument. Avoid the crash by making the `annotation` argument have type `Any?`:

  | `**class** AppDelegate: UIApplicationDelegate {`             |
  | ------------------------------------------------------------ |
  | `    **func** application(**_** application: UIApplication, open url: URL, sourceApplication: String?, annotation: **Any**?) -> Bool {` |
  | `        **return** **true**`                                |
  | `    }`                                                      |
  | `}`                                                          |

- Conditional conformances are unsupported when performing a dynamic cast (with `is` or `as`). ([SE-0143](https://github.com/apple/swift-evolution/blob/master/proposals/0143-conditional-conformances.md))

  For example:

  | `print([1, 2, 3] **is** Codable) // Prints "false", but [Int]` |
  | ------------------------------------------------------------ |
  | `// instances really are Codable.`                           |
  | `**try** JSONEncoder().encode([1, 2, 3]) // Successfully encodes` |
  | `// the array as JSON.`                                      |

  Arrays only conform to `Codable` when their elements are also `Codable`, but checking for this conformance isn't supported at runtime.

  While performing the `is` cast, the Swift runtime warns that it can't evaluate the conditional conformance:

  `warning: Swift runtime does not yet support dynamically querying conditional conformance ('Swift.Array<Swift.Int>': 'Swift.Decodable')`

##### Resolved Issues

- Generated headers for Swift content can be imported when a macro named `any` is defined. (34168022)
- Assigning a Swift closure expression into a global block variable that is declared in Objective-C now works correctly. (36843476)
- In a Swift class that is exposed to Objective-C, if `init()` is not supported then the `+new` method is marked as unavailable. (32405588)
- Objective-C methods with selectors that start with `add` or `remove` are now named consistently when imported into Swift. Previously, each occurrence of the same selector could be nondeterministically named by using or not using the portion of the name after `add` or `remove`, such as importing `addThing:` as either `add(_:)` or `addThing(_:)`. (33836975)

#### Swift Language

##### New Features

- A synthesized implementation of `==` is automatically added to a structure or enumeration that declares a conformance to `Equatable`. This requires that all stored properties of a structure or all enumeration cases with associated values are `Equatable`.

  Similarly, a synthesized implementation of `hashValue` is added when declaring a conformance to `Hashable`. This requires that all stored properties of a `struct` or all `enum` cases with associated values are `Hashable`.

  Providing your own implementation of `==` or `hashValue` overrides the one synthesized by the compiler. ([SE-0185](https://github.com/apple/swift-evolution/blob/master/proposals/0185-synthesize-equatable-hashable.md))

- If an extension adds an initializer to a structure that was declared in another module, the new initializer can't access `self` until it calls an initializer from the defining module. Attempting to access `self` before calling such an initializer results in a warning in Swift 4 and may result in an error in Swift 5. The requirement prevents an app from accidentally depending on the implementation details of a library. It also matches the existing requirement that cross-module initializers must be convenience initializers.

  Code that extends a struct imported from C is most likely to be impacted. However, most imported C structs are given a zeroing no-argument initializer that can be called as `self.init()` before modifying specific properties.

  Swift library authors who wish to continue allowing initialization on a per-member basis should explicitly declare a public memberwise initializer for clients that are in other modules. ([SE-0189](https://github.com/apple/swift-evolution/blob/master/proposals/0189-restrict-cross-module-struct-initializers.md))

- New *recursive* constraints require that the associated type conform to the enclosing protocol. The standard library protocols have been updated to use recursive constraints including:

  - The `Indices` associated type has the same traversal requirements as the enclosing protocol, for example `Collection.Indices` conforms to `Collection`.
  - Requiring that `Numeric.Magnitude` conform to `Numeric`.
  - Using more efficient `SubSequence` types for lazy filter and map.
  - Eliminating the `*Indexable` protocols.

  ([SE-0157](https://github.com/apple/swift-evolution/blob/master/proposals/0157-recursive-protocol-constraints.md))

  For example, the `SubSequence` associated type of `Sequence` follows the enclosing protocol:

  | `**protocol** Sequence {`                                    |
  | ------------------------------------------------------------ |
  | `    **associatedtype** Element`                             |
  | `    **associatedtype** SubSequence: Sequence`               |
  | `    **where** SubSequence.Element == Element,`              |
  | `    SubSequence.SubSequence == SubSequence`                 |
  | `    // ...`                                                 |
  | `}`                                                          |
  | ` `                                                          |
  | `**protocol** Collection: Sequence **where** Self.SubSequence: Collection {` |
  | `    // ...`                                                 |
  | `}`                                                          |

- Access control is enforced for subclasses of generic classes. A `public` class may not subclass an `internal` class. For source compatibility, these new diagnostics are warnings in Swift 4.1. (35119972)

- KeyPaths now support subscript, optional chaining, and optional force-unwrapping components. (31768715)

#### Swift Package Manager

##### New Features

- Performance of the dependency resolution algorithm has been significantly improved when there are shared dependencies in a package graph. Up to a 12X improvement has been observed in certain cases (36777215).

##### Resolved Issues

- When compiling jobs in parallel, the package manager determines the number of CPUs to use instead of using a hardcoded value. (35042923)
- In a package graph that uses different URL schemes, such as `ssh` and `http`, dependencies are now resolved correctly by the package manager. (27573226)
- The package manager now warns if a dependency is declared but not used. (35174605)
- The package manager now displays an error when there are two products with the same name. (34494792)
- Compiler warnings in Package.swift no longer prevent a build from completing successfully. (36324891)
- The `build` command in Swift package manager now works correctly when products of type `automatic` are used with the `--product` option. (36509350)
- The `edit` command for a package now finds a dependency correctly when the base name of the URL for the package and the name of the package in `Package.swift` don't match. ([SR-6758](https://bugs.swift.org/browse/SR-6758))

#### Swift Standard Library

##### New Features

- `Encodable` and `Decodable` are now conditional conformances of `Optional`, `Array`, `Dictionary`, and `Set` that are available only when the type parameters conform to `Encodable` or `Decodable`. ([SE-0143](https://github.com/apple/swift-evolution/blob/master/proposals/0143-conditional-conformances.md), [SE-0166](https://github.com/apple/swift-evolution/blob/master/proposals/0166-swift-archival-serialization.md))

- `Optional`, `Array`, and `Dictionary` now conform to the `Equatable` protocol if their element types conform to `Equatable` enabling the comparison of two values of composed types, such as `[Int: [Int?]?]`. ([SE-0143](https://github.com/apple/swift-evolution/blob/master/proposals/0143-conditional-conformances.md))

- Index types for most standard library collections now conform to `Hashable` enabling the indices to be used in key-path subscripts and in hashed collections. ([SE-0188](https://github.com/apple/swift-evolution/blob/master/proposals/0188-stdlib-index-types-hashable.md))

  For example:

  | `**let** s = "Hashable"`             |
  | ------------------------------------ |
  | `**let** p = \String.[s.startIndex]` |
  | `s[keyPath: p] // "H"`               |

- The variant of `Sequence.flatMap(_:)` that accepts a closure returning an `Optional` value has been deprecated. Other variants of `flatMap(_:)` on both `Sequence` and `Optional` remain as is. ([SE-0187](https://github.com/apple/swift-evolution/blob/master/proposals/0187-introduce-filtermap.md))

- Instances of `IndexDistance` associated type in the Swift standard library have been replaced by the concrete type `Int`. Algorithms that currently constrain `IndexDistance` to `Int` in their `where` clause, and algorithms that use `IndexDistance` within the body of a method, are supported by a deprecated type alias for `IndexDistance` in an extension on `Collection`. ([SE-0191](https://github.com/apple/swift-evolution/blob/master/proposals/0191-eliminate-indexdistance.md))

##### Resolved Issues

- Reconciled APIs between the multiple forms of unsafe pointers: `UnsafePointer`, `UnsafeMutablePointer`, `UnsafeRawPointer`, `UnsafeMutableRawPointer`, `UnsafeBufferPointer`, `UnsafeMutableBufferPointer`, `UnsafeRawBufferPointer`, and `UnsafeMutableRawBufferPointer`. Functionality previously only available in some interfaces are now available in all the relevant interfaces. ([SE-0184](https://github.com/apple/swift-evolution/blob/master/proposals/0184-unsafe-pointers-add-missing.md))

  The changes are additive with the following exceptions:

  - ​

    `deallocate(capacity:)` and `deallocate(bytes:alignedTo:)` are replaced by `deallocate()`. Simply removing the `capacity` argument or the `bytes` and `alignedTo` arguments preserves the behavior of the code.

    ​

  - ​

    `UnsafeMutableRawBufferPointer.allocate(count:)` is replaced by `UnsafeMutableRawBufferPointer.allocate(byteCount:alignment:)`. The behavior of the code can be preserved by adding an `alignment` argument, `MemoryLayout<UInt>.alignment`, to specify alignment on word boundaries.

    ​

  - ​

    `initializeMemory<T>(as:at:count:to:)`, is replaced by `initializeMemory<T>(as:repeating:count:)`. The `at` parameter is removed. Initializing at an offset can be achieved by multiplying the element index by `MemoryLayout<T>.stride`and adding to the raw pointer base.

    ​

- Some groups of collection types in the standard library, including slices and lazy collection wrappers, are now collapsed into single types using conditional conformance. The old types are available as deprecated type aliases for source compatibility. For more information on conditional conformance, see <https://swift.org/blog/conditional-conformance/>. (21935030)

#### Testing

##### New Features

- `xccov` is a new command-line utility for inspecting the contents of Xcode coverage reports. It can be used to view coverage data in both human-readable and machine parseable format. To learn more, enter `man xccov` in Terminal. (37172926)

##### Resolved Issues

- Classes that inherit from subclasses of `XCTestCase` now show inherited test methods in the Test navigator correctly. (34838443)
- The code coverage line execution counts for block literals are now correct. (22581085)
- Fixed an issue that could result in a code coverage report missing header files and any code in those header files. (28915357)
- Code coverage data is now captured for applications that are the target of UI tests when tests are run with xcodebuild. (23913271)
- Fixed an issue that resulted in the coverage report incorrectly displaying the "No Coverage Data" message. (36040075)
- Fixed several performance bottlenecks with code coverage including generating coverage reports and loading coverage reports in the Reports Navigator. In addition, navigating between files in the source editor while viewing code coverage no longer results in the spinning cursor. (33353328)
- Running tests on an iOS device with code coverage enabled no longer results in temporary freezes of the UI while downloading the code coverage profiles. (29681809)
- An issue that could cause `-[XCUIApplication launch]` and `-[XCUIApplication terminate]` to fail if code coverage is enabled and the debugger is disabled has been resolved. (36590025)
- The code coverage report now contains correct counts for static inline functions. (22520187)
- XCTest UI interruption monitors now work correctly on devices and simulators running iOS 10. (33278282)

