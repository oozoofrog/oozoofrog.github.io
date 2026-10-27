---
date: 2016-07-07 02:43:40+00:00
title: Deferable for Swift and more smaller defer
categories:
- swift
---

> **2026-10-28 review:** This is a Swift 2-era experiment from 2016. The formatting has been repaired, and the scope and resource-lifetime explanation corrected. The historical example below has not been run with a Swift 2 toolchain during this edit.

I have been happily using `defer`. Like Python's `with`, it is useful when working with a resource that needs closing, such as `NSFileHandle`, although the two constructs have different language rules.

`defer` runs when execution leaves the scope where it was declared. That scope can be a function, but it can also be a smaller `do` block. So a custom operator is not required just to make cleanup happen earlier:

```swift
// Swift 2-era Foundation names. `path` is a path supplied by the caller.
if let file = NSFileHandle(forReadingAtPath: path) {
    do {
        defer { file.closeFile() }
        print(file.readDataOfLength(10))
    } // The file has been closed here.
}
```

Still, I wondered what a small resource-handling operator would look like. This is the idea I tried:

```swift
// Historical Swift 2 syntax, not a current-Swift drop-in example.
protocol Deferable {
    func finish()
}

extension NSFileHandle: Deferable {
    func finish() {
        closeFile()
    }
}

infix operator !! {}

func !! <D: Deferable>(lhs: D, rhs: (target: D) -> Void) -> D {
    defer {
        lhs.finish()
        print("finished")
    }
    rhs(target: lhs)
    return lhs
}

// `path` must point to a readable file. Handle open failure explicitly.
if let file = NSFileHandle(forReadingAtPath: path) {
    file !! {
        print("read \($0.readDataOfLength(10))")
    }
}
```

The intended order is “read …”, then “finished”. The displayed data depends on the file; this is not a newly measured output.

## A returned handle can already be closed

The operator returns `lhs`, but its `defer` executes **before the caller receives that return value**. For this file handle, `finish()` has therefore already closed the resource. Returning the object does not make it safe to read from it again. A production helper should make that contract explicit, or return only the result computed inside the closure rather than the resource itself. It should also define how cleanup errors are handled.

This was a small experiment, not a recommendation to replace ordinary `do` and `defer`. It made programming in Swift more fun for me.

Reference: [The Swift Programming Language — defer statement](https://docs.swift.org/swift-book/documentation/the-swift-programming-language/statements/#Defer-Statement).

<details>
<summary>Original 2016 experiment (historical, not the recommended example)</summary>

The original experiment and wording are preserved below; only broken quote markup and repeated empty lines have been removed. Its claim that a smaller scope needs a custom operator is corrected above. The sample uses Swift 2 syntax, an unspecified `path`, a forced unwrap and an already-finished return value. It is not a complete runnable program.

I have been using defer for very happy. It’ like with keyword on python, using easily for needs closing context like NSFileHandle.

anyway defer is very useful statement for function scope.

However, I thinking now, What if i can use more small defer.

below, that’s codes of idea.

```swift
// firstly, create Deferable protocol for decorating.
protocol Deferable {
    func finish()
}
// secondly, extension NSFileHandle for deferable
extension NSFileHandle: Deferable {}
extension Deferable {
    func finish() {
        switch self {
        case let fh as NSFileHandle:
            fh.closeFile()
        default:
            break
        }
    }
}
// i have no skill create keyword for swift. so i make custom operator
infix operator !! {}
func !! <D: Deferable>(lhs: D, rhs:(target: D)->Void) -> D{
    defer {
        lhs.finish()
        print("finished")
    }
    rhs(target: lhs)
    return lhs
}
// for testing
class Test {
    func test() {
        NSFileHandle(forReadingAtPath: path)! !! {
            print("read \($0.readDataOfLength(10))")
        }
    }
}
Test().test()
```


->

`read <blah blah...>`

**finished**

**i have no idea this is how to useful.**

**but it is make me more funny programming on swift.**

**thankyou **

</details>
