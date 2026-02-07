---
title   : SIL 스터디
summary : 
date    : 2018-07-07 00:23:15 +0900
updated : 2018-07-07 00:34:16 +0900
tags    : 
toc     : true
public  : true
parent  : swift
parenttitle : swift
latex   : false
---

원코드
```swift

class Task {
  var task: (() -> Void)?

  func run() {
    if task == nil {
      var count = 0

      self.task = { 
        print(count)
        count = count + 1
      }

      count = count + 1
    }
    self.task?()
  }
}

let task = Task()

for _ in 0..<5 {
  task.run()
}

```

## Swift Intermedite Language

```sil
sil_stage raw

import Builtin
import Swift
import SwiftShims

// task
// 전역변수 task의 타입을 선언
sil_global hidden [let] @test.task : test.Task : $Task

// main
sil @main : $@convention(c) (Int32, UnsafeMutablePointer<Optional<UnsafeMutablePointer<Int8>>>) -> Int32 {
bb0(%0 : $Int32, %1 : $UnsafeMutablePointer<Optional<UnsafeMutablePointer<Int8>>>):
  // task 변수가 Task 타입인 전역변수임을 명시
  alloc_global @test.task : test.Task           // id: %2
  // 전역 변수 task에 대한 주소 참조를 레지스터 %3에 대입
  %3 = global_addr @test.task : test.Task : $*Task // users: %50, %47, %7
  // Task 타입에 대한 메타타입 작성
  %4 = metatype $@thick Task.Type                 // user: %6
  // function_ref Task.__allocating_init()
  %5 = function_ref @test.Task.__allocating_init() -> test.Task : $@convention(method) (@thick Task.Type) -> @owned Task // user: %6
  %6 = apply %5(%4) : $@convention(method) (@thick Task.Type) -> @owned Task // user: %7
  store %6 to [init] %3 : $*Task                  // id: %7
  %8 = alloc_box ${ var IndexingIterator<CountableRange<Int>> }, var, name "$generator" // users: %52, %9
  %9 = project_box %8 : ${ var IndexingIterator<CountableRange<Int>> }, 0 // users: %38, %33
  %10 = alloc_stack $CountableRange<Int>          // users: %35, %29, %26
  %11 = metatype $@thin Int.Type
  %12 = metatype $@thick Int.Type                 // user: %26
  %13 = metatype $@thin Int.Type                  // user: %16
  %14 = integer_literal $Builtin.Int2048, 0       // user: %16
  // function_ref Int.init(_builtinIntegerLiteral:)
  %15 = function_ref @Swift.Int.init(_builtinIntegerLiteral: Builtin.Int2048) -> Swift.Int : $@convention(method) (Builtin.Int2048, @thin Int.Type) -> Int // user: %16
  %16 = apply %15(%14, %13) : $@convention(method) (Builtin.Int2048, @thin Int.Type) -> Int // user: %18
  %17 = alloc_stack $Int                          // users: %28, %26, %18
  store %16 to [trivial] %17 : $*Int              // id: %18
  %19 = metatype $@thin Int.Type                  // user: %22
  %20 = integer_literal $Builtin.Int2048, 5       // user: %22
  // function_ref Int.init(_builtinIntegerLiteral:)
  %21 = function_ref @Swift.Int.init(_builtinIntegerLiteral: Builtin.Int2048) -> Swift.Int : $@convention(method) (Builtin.Int2048, @thin Int.Type) -> Int // user: %22
  %22 = apply %21(%20, %19) : $@convention(method) (Builtin.Int2048, @thin Int.Type) -> Int // user: %24
  %23 = alloc_stack $Int                          // users: %27, %26, %24
  store %22 to [trivial] %23 : $*Int              // id: %24
  // function_ref static Strideable<>...< infix(_:_:)
  %25 = function_ref @static (extension in Swift):Swift.Strideable< where A.Stride: Swift.SignedInteger>...< infix(A, A) -> Swift.CountableRange<A> : $@convention(method) <τ_0_0 where τ_0_0 : Strideable, τ_0_0.Stride : SignedInteger> (@in τ_0_0, @in τ_0_0, @thick τ_0_0.Type) -> @out CountableRange<τ_0_0> // user: %26
  %26 = apply %25<Int, Int>(%10, %17, %23, %12) : $@convention(method) <τ_0_0 where τ_0_0 : Strideable, τ_0_0.Stride : SignedInteger> (@in τ_0_0, @in τ_0_0, @thick τ_0_0.Type) -> @out CountableRange<τ_0_0>
  dealloc_stack %23 : $*Int                       // id: %27
  dealloc_stack %17 : $*Int                       // id: %28
  %29 = load [trivial] %10 : $*CountableRange<Int> // user: %31
  %30 = alloc_stack $CountableRange<Int>          // users: %34, %33, %31
  store %29 to [trivial] %30 : $*CountableRange<Int> // id: %31
  // function_ref Collection<>.makeIterator()
  %32 = function_ref @(extension in Swift):Swift.Collection< where A.Iterator == Swift.IndexingIterator<A>>.makeIterator() -> Swift.IndexingIterator<A> : $@convention(method) <τ_0_0 where τ_0_0 : Collection, τ_0_0.Iterator == IndexingIterator<τ_0_0>> (@in_guaranteed τ_0_0) -> @out IndexingIterator<τ_0_0> // user: %33
  %33 = apply %32<CountableRange<Int>>(%9, %30) : $@convention(method) <τ_0_0 where τ_0_0 : Collection, τ_0_0.Iterator == IndexingIterator<τ_0_0>> (@in_guaranteed τ_0_0) -> @out IndexingIterator<τ_0_0>
  dealloc_stack %30 : $*CountableRange<Int>       // id: %34
  dealloc_stack %10 : $*CountableRange<Int>       // id: %35
  br bb1                                          // id: %36

bb1:                                              // Preds: bb3 bb0
  %37 = alloc_stack $Optional<Int>                // users: %43, %42, %40
  %38 = begin_access [modify] [unknown] %9 : $*IndexingIterator<CountableRange<Int>> // users: %41, %40
  // function_ref IndexingIterator.next()
  %39 = function_ref @Swift.IndexingIterator.next() -> A.Element? : $@convention(method) <τ_0_0 where τ_0_0 : Collection> (@inout IndexingIterator<τ_0_0>) -> @out Optional<τ_0_0.Element> // user: %40
  %40 = apply %39<CountableRange<Int>>(%37, %38) : $@convention(method) <τ_0_0 where τ_0_0 : Collection> (@inout IndexingIterator<τ_0_0>) -> @out Optional<τ_0_0.Element>
  end_access %38 : $*IndexingIterator<CountableRange<Int>> // id: %41
  %42 = load [trivial] %37 : $*Optional<Int>      // user: %44
  dealloc_stack %37 : $*Optional<Int>             // id: %43
  switch_enum %42 : $Optional<Int>, case #Optional.some!enumelt.1: bb3, case #Optional.none!enumelt: bb2 // id: %44

bb2:                                              // Preds: bb1
  br bb4                                          // id: %45

bb3(%46 : $Int):                                  // Preds: bb1
  %47 = load_borrow %3 : $*Task                   // users: %50, %49, %48
  %48 = class_method %47 : $Task, #Task.run!1 : (Task) -> () -> (), $@convention(method) (@guaranteed Task) -> () // user: %49
  %49 = apply %48(%47) : $@convention(method) (@guaranteed Task) -> ()
  end_borrow %47 from %3 : $Task, $*Task          // id: %50
  br bb1                                          // id: %51

bb4:                                              // Preds: bb2
  destroy_value %8 : ${ var IndexingIterator<CountableRange<Int>> } // id: %52
  %53 = integer_literal $Builtin.Int32, 0         // user: %54
  %54 = struct $Int32 (%53 : $Builtin.Int32)      // user: %55
  return %54 : $Int32                             // id: %55
} // end sil function 'main'

// variable initialization expression of Task.task
sil hidden [transparent] @variable initialization expression of test.Task.task : () -> ()? : $@convention(thin) () -> @owned Optional<@callee_guaranteed () -> ()> {
bb0:
  %0 = alloc_stack $Optional<@callee_guaranteed (@in ()) -> @out ()> // users: %14, %4, %3
  %1 = metatype $@thin Optional<() -> ()>.Type    // user: %3
  // function_ref Optional.init(nilLiteral:)
  %2 = function_ref @Swift.Optional.init(nilLiteral: ()) -> A? : $@convention(method) <τ_0_0> (@thin Optional<τ_0_0>.Type) -> @out Optional<τ_0_0> // user: %3
  %3 = apply %2<(() -> ())>(%0, %1) : $@convention(method) <τ_0_0> (@thin Optional<τ_0_0>.Type) -> @out Optional<τ_0_0>
  %4 = load [take] %0 : $*Optional<@callee_guaranteed (@in ()) -> @out ()> // user: %5
  switch_enum %4 : $Optional<@callee_guaranteed (@in ()) -> @out ()>, case #Optional.some!enumelt.1: bb1, case #Optional.none!enumelt: bb2 // id: %5

// %6                                             // user: %8
bb1(%6 : $@callee_guaranteed (@in ()) -> @out ()): // Preds: bb0
  // function_ref thunk for @escaping @callee_guaranteed (@in ()) -> (@out ())
  %7 = function_ref @reabstraction thunk helper from @escaping @callee_guaranteed (@in ()) -> (@out ()) to @escaping @callee_guaranteed () -> () : $@convention(thin) (@guaranteed @callee_guaranteed (@in ()) -> @out ()) -> () // user: %8
  %8 = partial_apply [callee_guaranteed] %7(%6) : $@convention(thin) (@guaranteed @callee_guaranteed (@in ()) -> @out ()) -> () // user: %9
  %9 = enum $Optional<@callee_guaranteed () -> ()>, #Optional.some!enumelt.1, %8 : $@callee_guaranteed () -> () // user: %10
  br bb3(%9 : $Optional<@callee_guaranteed () -> ()>) // id: %10

bb2:                                              // Preds: bb0
  %11 = enum $Optional<@callee_guaranteed () -> ()>, #Optional.none!enumelt // user: %12
  br bb3(%11 : $Optional<@callee_guaranteed () -> ()>) // id: %12

// %13                                            // user: %15
bb3(%13 : $Optional<@callee_guaranteed () -> ()>): // Preds: bb2 bb1
  dealloc_stack %0 : $*Optional<@callee_guaranteed (@in ()) -> @out ()> // id: %14
  return %13 : $Optional<@callee_guaranteed () -> ()> // id: %15
} // end sil function 'variable initialization expression of test.Task.task : () -> ()?'

// Optional.init(nilLiteral:)
sil [transparent] [serialized] @Swift.Optional.init(nilLiteral: ()) -> A? : $@convention(method) <τ_0_0> (@thin Optional<τ_0_0>.Type) -> @out Optional<τ_0_0>

// thunk for @escaping @callee_guaranteed (@in ()) -> (@out ())
sil shared [transparent] [serializable] [reabstraction_thunk] @reabstraction thunk helper from @escaping @callee_guaranteed (@in ()) -> (@out ()) to @escaping @callee_guaranteed () -> () : $@convention(thin) (@guaranteed @callee_guaranteed (@in ()) -> @out ()) -> () {
// %0                                             // user: %3
bb0(%0 : $@callee_guaranteed (@in ()) -> @out ()):
  %1 = alloc_stack $()                            // users: %6, %3
  %2 = alloc_stack $()                            // users: %5, %3
  %3 = apply %0(%2, %1) : $@callee_guaranteed (@in ()) -> @out ()
  %4 = tuple ()                                   // user: %7
  dealloc_stack %2 : $*()                         // id: %5
  dealloc_stack %1 : $*()                         // id: %6
  return %4 : $()                                 // id: %7
} // end sil function 'reabstraction thunk helper from @escaping @callee_guaranteed (@in ()) -> (@out ()) to @escaping @callee_guaranteed () -> ()'

// Task.task.getter
sil hidden [transparent] @test.Task.task.getter : () -> ()? : $@convention(method) (@guaranteed Task) -> @owned Optional<@callee_guaranteed () -> ()> {
// %0                                             // users: %2, %1
bb0(%0 : $Task):
  debug_value %0 : $Task, let, name "self", argno 1 // id: %1
  %2 = ref_element_addr %0 : $Task, #Task.task    // user: %3
  %3 = begin_access [read] [dynamic] %2 : $*Optional<@callee_guaranteed () -> ()> // users: %5, %4
  %4 = load [copy] %3 : $*Optional<@callee_guaranteed () -> ()> // user: %6
  end_access %3 : $*Optional<@callee_guaranteed () -> ()> // id: %5
  return %4 : $Optional<@callee_guaranteed () -> ()> // id: %6
} // end sil function 'test.Task.task.getter : () -> ()?'

// Task.task.setter
sil hidden [transparent] @test.Task.task.setter : () -> ()? : $@convention(method) (@owned Optional<@callee_guaranteed () -> ()>, @guaranteed Task) -> () {
// %0                                             // users: %11, %10, %4, %2
// %1                                             // users: %6, %3
bb0(%0 : $Optional<@callee_guaranteed () -> ()>, %1 : $Task):
  debug_value %0 : $Optional<@callee_guaranteed () -> ()>, let, name "value", argno 1 // id: %2
  debug_value %1 : $Task, let, name "self", argno 2 // id: %3
  %4 = begin_borrow %0 : $Optional<@callee_guaranteed () -> ()> // users: %10, %5
  %5 = copy_value %4 : $Optional<@callee_guaranteed () -> ()> // user: %8
  %6 = ref_element_addr %1 : $Task, #Task.task    // user: %7
  %7 = begin_access [modify] [dynamic] %6 : $*Optional<@callee_guaranteed () -> ()> // users: %9, %8
  assign %5 to %7 : $*Optional<@callee_guaranteed () -> ()> // id: %8
  end_access %7 : $*Optional<@callee_guaranteed () -> ()> // id: %9
  end_borrow %4 from %0 : $Optional<@callee_guaranteed () -> ()>, $Optional<@callee_guaranteed () -> ()> // id: %10
  destroy_value %0 : $Optional<@callee_guaranteed () -> ()> // id: %11
  %12 = tuple ()                                  // user: %13
  return %12 : $()                                // id: %13
} // end sil function 'test.Task.task.setter : () -> ()?'

// closure #1 in Task.task.materializeForSet
sil private [transparent] @closure #1 : () in test.Task.task.materializeForSet : () -> ()? : $@convention(method) (Builtin.RawPointer, @inout Builtin.UnsafeValueBuffer, @inout Task, @thick Task.Type) -> () {
// %1                                             // user: %4
bb0(%0 : $Builtin.RawPointer, %1 : $*Builtin.UnsafeValueBuffer, %2 : $*Task, %3 : $@thick Task.Type):
  end_unpaired_access [dynamic] %1 : $*Builtin.UnsafeValueBuffer // id: %4
  %5 = tuple ()                                   // user: %6
  return %5 : $()                                 // id: %6
} // end sil function 'closure #1 : () in test.Task.task.materializeForSet : () -> ()?'

// Task.task.materializeForSet
sil hidden [transparent] @test.Task.task.materializeForSet : () -> ()? : $@convention(method) (Builtin.RawPointer, @inout Builtin.UnsafeValueBuffer, @guaranteed Task) -> (Builtin.RawPointer, Optional<Builtin.RawPointer>) {
// %1                                             // user: %4
// %2                                             // user: %3
bb0(%0 : $Builtin.RawPointer, %1 : $*Builtin.UnsafeValueBuffer, %2 : $Task):
  %3 = ref_element_addr %2 : $Task, #Task.task    // users: %5, %4
  begin_unpaired_access [modify] [dynamic] %3 : $*Optional<@callee_guaranteed () -> ()>, %1 : $*Builtin.UnsafeValueBuffer // id: %4
  %5 = address_to_pointer %3 : $*Optional<@callee_guaranteed () -> ()> to $Builtin.RawPointer // user: %9
  // function_ref closure #1 in Task.task.materializeForSet
  %6 = function_ref @closure #1 : () in test.Task.task.materializeForSet : () -> ()? : $@convention(method) (Builtin.RawPointer, @inout Builtin.UnsafeValueBuffer, @inout Task, @thick Task.Type) -> () // user: %7
  %7 = thin_function_to_pointer %6 : $@convention(method) (Builtin.RawPointer, @inout Builtin.UnsafeValueBuffer, @inout Task, @thick Task.Type) -> () to $Builtin.RawPointer // user: %8
  %8 = enum $Optional<Builtin.RawPointer>, #Optional.some!enumelt.1, %7 : $Builtin.RawPointer // user: %9
  %9 = tuple (%5 : $Builtin.RawPointer, %8 : $Optional<Builtin.RawPointer>) // user: %10
  return %9 : $(Builtin.RawPointer, Optional<Builtin.RawPointer>) // id: %10
} // end sil function 'test.Task.task.materializeForSet : () -> ()?'

// Task.run()
sil hidden @test.Task.run() -> () : $@convention(method) (@guaranteed Task) -> () {
// %0                                             // users: %56, %55, %38, %37, %5, %4, %1
bb0(%0 : $Task):
  debug_value %0 : $Task, let, name "self", argno 1 // id: %1
  %2 = metatype $@thin Optional<() -> ()>.Type    // user: %20
  %3 = alloc_stack $Optional<@callee_guaranteed (@in ()) -> @out ()> // users: %21, %20, %15
  %4 = class_method %0 : $Task, #Task.task!getter.1 : (Task) -> () -> (() -> ())?, $@convention(method) (@guaranteed Task) -> @owned Optional<@callee_guaranteed () -> ()> // user: %5
  %5 = apply %4(%0) : $@convention(method) (@guaranteed Task) -> @owned Optional<@callee_guaranteed () -> ()> // user: %6
  switch_enum %5 : $Optional<@callee_guaranteed () -> ()>, case #Optional.some!enumelt.1: bb1, case #Optional.none!enumelt: bb2 // id: %6

// %7                                             // user: %9
bb1(%7 : $@callee_guaranteed () -> ()):           // Preds: bb0
  // function_ref thunk for @escaping @callee_guaranteed () -> ()
  %8 = function_ref @reabstraction thunk helper from @escaping @callee_guaranteed () -> () to @escaping @callee_guaranteed (@in ()) -> (@out ()) : $@convention(thin) (@in (), @guaranteed @callee_guaranteed () -> ()) -> @out () // user: %9
  %9 = partial_apply [callee_guaranteed] %8(%7) : $@convention(thin) (@in (), @guaranteed @callee_guaranteed () -> ()) -> @out () // user: %10
  %10 = enum $Optional<@callee_guaranteed (@in ()) -> @out ()>, #Optional.some!enumelt.1, %9 : $@callee_guaranteed (@in ()) -> @out () // user: %11
  br bb3(%10 : $Optional<@callee_guaranteed (@in ()) -> @out ()>) // id: %11

bb2:                                              // Preds: bb0
  %12 = enum $Optional<@callee_guaranteed (@in ()) -> @out ()>, #Optional.none!enumelt // user: %13
  br bb3(%12 : $Optional<@callee_guaranteed (@in ()) -> @out ()>) // id: %13

// %14                                            // user: %15
bb3(%14 : $Optional<@callee_guaranteed (@in ()) -> @out ()>): // Preds: bb2 bb1
  store %14 to [init] %3 : $*Optional<@callee_guaranteed (@in ()) -> @out ()> // id: %15
  %16 = metatype $@thin _OptionalNilComparisonType.Type // user: %18
  // function_ref _OptionalNilComparisonType.init(nilLiteral:)
  %17 = function_ref @Swift._OptionalNilComparisonType.init(nilLiteral: ()) -> Swift._OptionalNilComparisonType : $@convention(method) (@thin _OptionalNilComparisonType.Type) -> _OptionalNilComparisonType // user: %18
  %18 = apply %17(%16) : $@convention(method) (@thin _OptionalNilComparisonType.Type) -> _OptionalNilComparisonType // user: %20
  // function_ref static Optional.== infix(_:_:)
  %19 = function_ref @static Swift.Optional.== infix(A?, Swift._OptionalNilComparisonType) -> Swift.Bool : $@convention(method) <τ_0_0> (@in Optional<τ_0_0>, _OptionalNilComparisonType, @thin Optional<τ_0_0>.Type) -> Bool // user: %20
  %20 = apply %19<(() -> ())>(%3, %18, %2) : $@convention(method) <τ_0_0> (@in Optional<τ_0_0>, _OptionalNilComparisonType, @thin Optional<τ_0_0>.Type) -> Bool // user: %23
  dealloc_stack %3 : $*Optional<@callee_guaranteed (@in ()) -> @out ()> // id: %21
  // function_ref Bool._getBuiltinLogicValue()
  %22 = function_ref @Swift.Bool._getBuiltinLogicValue() -> Builtin.Int1 : $@convention(method) (Bool) -> Builtin.Int1 // user: %23
  %23 = apply %22(%20) : $@convention(method) (Bool) -> Builtin.Int1 // user: %24
  cond_br %23, bb4, bb5                           // id: %24

bb4:                                              // Preds: bb3
  %25 = alloc_box ${ var Int }, var, name "count" // users: %52, %33, %26
  %26 = project_box %25 : ${ var Int }, 0         // users: %49, %40, %34, %31
  %27 = metatype $@thin Int.Type                  // user: %30
  %28 = integer_literal $Builtin.Int2048, 0       // user: %30
  // function_ref Int.init(_builtinIntegerLiteral:)
  %29 = function_ref @Swift.Int.init(_builtinIntegerLiteral: Builtin.Int2048) -> Swift.Int : $@convention(method) (Builtin.Int2048, @thin Int.Type) -> Int // user: %30
  %30 = apply %29(%28, %27) : $@convention(method) (Builtin.Int2048, @thin Int.Type) -> Int // user: %31
  store %30 to [trivial] %26 : $*Int              // id: %31
  // function_ref closure #1 in Task.run()
  %32 = function_ref @closure #1 () -> () in test.Task.run() -> () : $@convention(thin) (@guaranteed { var Int }) -> () // user: %35
  %33 = copy_value %25 : ${ var Int }             // user: %35
  mark_function_escape %26 : $*Int                // id: %34
  %35 = partial_apply [callee_guaranteed] %32(%33) : $@convention(thin) (@guaranteed { var Int }) -> () // user: %36
  %36 = enum $Optional<@callee_guaranteed () -> ()>, #Optional.some!enumelt.1, %35 : $@callee_guaranteed () -> () // user: %38
  %37 = class_method %0 : $Task, #Task.task!setter.1 : (Task) -> ((() -> ())?) -> (), $@convention(method) (@owned Optional<@callee_guaranteed () -> ()>, @guaranteed Task) -> () // user: %38
  %38 = apply %37(%36, %0) : $@convention(method) (@owned Optional<@callee_guaranteed () -> ()>, @guaranteed Task) -> ()
  %39 = metatype $@thin Int.Type                  // user: %48
  %40 = begin_access [read] [unknown] %26 : $*Int // users: %42, %41
  %41 = load [trivial] %40 : $*Int                // user: %48
  end_access %40 : $*Int                          // id: %42
  %43 = metatype $@thin Int.Type                  // user: %46
  %44 = integer_literal $Builtin.Int2048, 1       // user: %46
  // function_ref Int.init(_builtinIntegerLiteral:)
  %45 = function_ref @Swift.Int.init(_builtinIntegerLiteral: Builtin.Int2048) -> Swift.Int : $@convention(method) (Builtin.Int2048, @thin Int.Type) -> Int // user: %46
  %46 = apply %45(%44, %43) : $@convention(method) (Builtin.Int2048, @thin Int.Type) -> Int // user: %48
  // function_ref static Int.+ infix(_:_:)
  %47 = function_ref @static Swift.Int.+ infix(Swift.Int, Swift.Int) -> Swift.Int : $@convention(method) (Int, Int, @thin Int.Type) -> Int // user: %48
  %48 = apply %47(%41, %46, %39) : $@convention(method) (Int, Int, @thin Int.Type) -> Int // user: %50
  %49 = begin_access [modify] [unknown] %26 : $*Int // users: %51, %50
  assign %48 to %49 : $*Int                       // id: %50
  end_access %49 : $*Int                          // id: %51
  destroy_value %25 : ${ var Int }                // id: %52
  br bb5                                          // id: %53

bb5:                                              // Preds: bb4 bb3
  %54 = alloc_stack $Optional<@callee_guaranteed () -> ()> // users: %74, %67, %65, %63, %62, %60, %57
  %55 = class_method %0 : $Task, #Task.task!getter.1 : (Task) -> () -> (() -> ())?, $@convention(method) (@guaranteed Task) -> @owned Optional<@callee_guaranteed () -> ()> // user: %56
  %56 = apply %55(%0) : $@convention(method) (@guaranteed Task) -> @owned Optional<@callee_guaranteed () -> ()> // user: %57
  store %56 to [init] %54 : $*Optional<@callee_guaranteed () -> ()> // id: %57
  %58 = integer_literal $Builtin.Int1, -1         // user: %60
  %59 = integer_literal $Builtin.Int1, 0          // user: %60
  %60 = select_enum_addr %54 : $*Optional<@callee_guaranteed () -> ()>, case #Optional.some!enumelt.1: %58, default %59 : $Builtin.Int1 // user: %61
  cond_br %60, bb7, bb6                           // id: %61

bb6:                                              // Preds: bb5
  destroy_addr %54 : $*Optional<@callee_guaranteed () -> ()> // id: %62
  dealloc_stack %54 : $*Optional<@callee_guaranteed () -> ()> // id: %63
  br bb9                                          // id: %64

bb7:                                              // Preds: bb5
  %65 = unchecked_take_enum_data_addr %54 : $*Optional<@callee_guaranteed () -> ()>, #Optional.some!enumelt.1 // user: %66
  %66 = load [copy] %65 : $*@callee_guaranteed () -> () // users: %73, %70, %68
  destroy_addr %54 : $*Optional<@callee_guaranteed () -> ()> // id: %67
  %68 = begin_borrow %66 : $@callee_guaranteed () -> () // users: %70, %69
  %69 = apply %68() : $@callee_guaranteed () -> ()
  end_borrow %68 from %66 : $@callee_guaranteed () -> (), $@callee_guaranteed () -> () // id: %70
  %71 = tuple ()                                  // user: %72
  %72 = enum $Optional<()>, #Optional.some!enumelt.1, %71 : $() // user: %75
  destroy_value %66 : $@callee_guaranteed () -> () // id: %73
  dealloc_stack %54 : $*Optional<@callee_guaranteed () -> ()> // id: %74
  br bb8(%72 : $Optional<()>)                     // id: %75

bb8(%76 : $Optional<()>):                         // Preds: bb9 bb7
  %77 = tuple ()                                  // user: %78
  return %77 : $()                                // id: %78

bb9:                                              // Preds: bb6
  %79 = enum $Optional<()>, #Optional.none!enumelt // user: %80
  br bb8(%79 : $Optional<()>)                     // id: %80
} // end sil function 'test.Task.run() -> ()'

// thunk for @escaping @callee_guaranteed () -> ()
sil shared [transparent] [serializable] [reabstraction_thunk] @reabstraction thunk helper from @escaping @callee_guaranteed () -> () to @escaping @callee_guaranteed (@in ()) -> (@out ()) : $@convention(thin) (@in (), @guaranteed @callee_guaranteed () -> ()) -> @out () {
// %2                                             // user: %3
bb0(%0 : $*(), %1 : $*(), %2 : $@callee_guaranteed () -> ()):
  %3 = apply %2() : $@callee_guaranteed () -> ()
  %4 = tuple ()                                   // user: %5
  return %4 : $()                                 // id: %5
} // end sil function 'reabstraction thunk helper from @escaping @callee_guaranteed () -> () to @escaping @callee_guaranteed (@in ()) -> (@out ())'

// _OptionalNilComparisonType.init(nilLiteral:)
sil [transparent] [serialized] @Swift._OptionalNilComparisonType.init(nilLiteral: ()) -> Swift._OptionalNilComparisonType : $@convention(method) (@thin _OptionalNilComparisonType.Type) -> _OptionalNilComparisonType

// static Optional.== infix(_:_:)
sil [transparent] [serialized] @static Swift.Optional.== infix(A?, Swift._OptionalNilComparisonType) -> Swift.Bool : $@convention(method) <τ_0_0> (@in Optional<τ_0_0>, _OptionalNilComparisonType, @thin Optional<τ_0_0>.Type) -> Bool

// Bool._getBuiltinLogicValue()
sil [transparent] [serialized] @Swift.Bool._getBuiltinLogicValue() -> Builtin.Int1 : $@convention(method) (Bool) -> Builtin.Int1

// Int.init(_builtinIntegerLiteral:)
sil [transparent] [serialized] @Swift.Int.init(_builtinIntegerLiteral: Builtin.Int2048) -> Swift.Int : $@convention(method) (Builtin.Int2048, @thin Int.Type) -> Int

// closure #1 in Task.run()
sil private @closure #1 () -> () in test.Task.run() -> () : $@convention(thin) (@guaranteed { var Int }) -> () {
// %0                                             // user: %1
bb0(%0 : ${ var Int }):
  %1 = project_box %0 : ${ var Int }, 0           // users: %34, %25, %14, %2
  debug_value_addr %1 : $*Int, var, name "count", argno 1 // id: %2
  %3 = integer_literal $Builtin.Word, 1           // user: %5
  // function_ref _allocateUninitializedArray<A>(_:)
  %4 = function_ref @Swift._allocateUninitializedArray<A>(Builtin.Word) -> ([A], Builtin.RawPointer) : $@convention(thin) <τ_0_0> (Builtin.Word) -> (@owned Array<τ_0_0>, Builtin.RawPointer) // user: %5
  %5 = apply %4<Any>(%3) : $@convention(thin) <τ_0_0> (Builtin.Word) -> (@owned Array<τ_0_0>, Builtin.RawPointer) // users: %11, %10, %6
  %6 = begin_borrow %5 : $(Array<Any>, Builtin.RawPointer) // users: %10, %9, %7
  %7 = tuple_extract %6 : $(Array<Any>, Builtin.RawPointer), 0 // user: %8
  %8 = copy_value %7 : $Array<Any>                // user: %23
  %9 = tuple_extract %6 : $(Array<Any>, Builtin.RawPointer), 1 // user: %12
  end_borrow %6 from %5 : $(Array<Any>, Builtin.RawPointer), $(Array<Any>, Builtin.RawPointer) // id: %10
  destroy_value %5 : $(Array<Any>, Builtin.RawPointer) // id: %11
  %12 = pointer_to_address %9 : $Builtin.RawPointer to [strict] $*Any // user: %13
  %13 = init_existential_addr %12 : $*Any, $Int   // user: %17
  %14 = begin_access [read] [unknown] %1 : $*Int  // users: %16, %15
  %15 = load [trivial] %14 : $*Int                // user: %17
  end_access %14 : $*Int                          // id: %16
  store %15 to [trivial] %13 : $*Int              // id: %17
  // function_ref default argument 1 of print(_:separator:terminator:)
  %18 = function_ref @default argument 1 of Swift.print(Any..., separator: Swift.String, terminator: Swift.String) -> () : $@convention(thin) () -> @owned String // user: %19
  %19 = apply %18() : $@convention(thin) () -> @owned String // user: %23
  // function_ref default argument 2 of print(_:separator:terminator:)
  %20 = function_ref @default argument 2 of Swift.print(Any..., separator: Swift.String, terminator: Swift.String) -> () : $@convention(thin) () -> @owned String // user: %21
  %21 = apply %20() : $@convention(thin) () -> @owned String // user: %23
  // function_ref print(_:separator:terminator:)
  %22 = function_ref @Swift.print(Any..., separator: Swift.String, terminator: Swift.String) -> () : $@convention(thin) (@owned Array<Any>, @owned String, @owned String) -> () // user: %23
  %23 = apply %22(%8, %19, %21) : $@convention(thin) (@owned Array<Any>, @owned String, @owned String) -> ()
  %24 = metatype $@thin Int.Type                  // user: %33
  %25 = begin_access [read] [unknown] %1 : $*Int  // users: %27, %26
  %26 = load [trivial] %25 : $*Int                // user: %33
  end_access %25 : $*Int                          // id: %27
  %28 = metatype $@thin Int.Type                  // user: %31
  %29 = integer_literal $Builtin.Int2048, 1       // user: %31
  // function_ref Int.init(_builtinIntegerLiteral:)
  %30 = function_ref @Swift.Int.init(_builtinIntegerLiteral: Builtin.Int2048) -> Swift.Int : $@convention(method) (Builtin.Int2048, @thin Int.Type) -> Int // user: %31
  %31 = apply %30(%29, %28) : $@convention(method) (Builtin.Int2048, @thin Int.Type) -> Int // user: %33
  // function_ref static Int.+ infix(_:_:)
  %32 = function_ref @static Swift.Int.+ infix(Swift.Int, Swift.Int) -> Swift.Int : $@convention(method) (Int, Int, @thin Int.Type) -> Int // user: %33
  %33 = apply %32(%26, %31, %24) : $@convention(method) (Int, Int, @thin Int.Type) -> Int // user: %35
  %34 = begin_access [modify] [unknown] %1 : $*Int // users: %36, %35
  assign %33 to %34 : $*Int                       // id: %35
  end_access %34 : $*Int                          // id: %36
  %37 = tuple ()                                  // user: %38
  return %37 : $()                                // id: %38
} // end sil function 'closure #1 () -> () in test.Task.run() -> ()'

// _allocateUninitializedArray<A>(_:)
sil [serialized] [always_inline] @Swift._allocateUninitializedArray<A>(Builtin.Word) -> ([A], Builtin.RawPointer) : $@convention(thin) <τ_0_0> (Builtin.Word) -> (@owned Array<τ_0_0>, Builtin.RawPointer)

// default argument 1 of print(_:separator:terminator:)
sil [noinline] @default argument 1 of Swift.print(Any..., separator: Swift.String, terminator: Swift.String) -> () : $@convention(thin) () -> @owned String

// default argument 2 of print(_:separator:terminator:)
sil [noinline] @default argument 2 of Swift.print(Any..., separator: Swift.String, terminator: Swift.String) -> () : $@convention(thin) () -> @owned String

// print(_:separator:terminator:)
sil [noinline] @Swift.print(Any..., separator: Swift.String, terminator: Swift.String) -> () : $@convention(thin) (@owned Array<Any>, @owned String, @owned String) -> ()

// static Int.+ infix(_:_:)
sil [transparent] [serialized] @static Swift.Int.+ infix(Swift.Int, Swift.Int) -> Swift.Int : $@convention(method) (Int, Int, @thin Int.Type) -> Int

// Task.deinit
sil hidden @test.Task.deinit : $@convention(method) (@guaranteed Task) -> @owned Builtin.NativeObject {
// %0                                             // users: %4, %2, %1
bb0(%0 : $Task):
  debug_value %0 : $Task, let, name "self", argno 1 // id: %1
  %2 = ref_element_addr %0 : $Task, #Task.task    // user: %3
  destroy_addr %2 : $*Optional<@callee_guaranteed () -> ()> // id: %3
  %4 = unchecked_ref_cast %0 : $Task to $Builtin.NativeObject // user: %5
  %5 = unchecked_ownership_conversion %4 : $Builtin.NativeObject, @guaranteed to @owned // user: %6
  return %5 : $Builtin.NativeObject               // id: %6
} // end sil function 'test.Task.deinit'

// Task.__deallocating_deinit
sil hidden @test.Task.__deallocating_deinit : $@convention(method) (@owned Task) -> () {
// %0                                             // users: %6, %5, %3, %1
bb0(%0 : $Task):
  debug_value %0 : $Task, let, name "self", argno 1 // id: %1
  // function_ref Task.deinit
  %2 = function_ref @test.Task.deinit : $@convention(method) (@guaranteed Task) -> @owned Builtin.NativeObject // user: %4
  %3 = begin_borrow %0 : $Task                    // users: %5, %4
  %4 = apply %2(%3) : $@convention(method) (@guaranteed Task) -> @owned Builtin.NativeObject // user: %7
  end_borrow %3 from %0 : $Task, $Task            // id: %5
  end_lifetime %0 : $Task                         // id: %6
  %7 = unchecked_ref_cast %4 : $Builtin.NativeObject to $Task // user: %8
  dealloc_ref %7 : $Task                          // id: %8
  %9 = tuple ()                                   // user: %10
  return %9 : $()                                 // id: %10
} // end sil function 'test.Task.__deallocating_deinit'

// Task.__allocating_init()
sil hidden @test.Task.__allocating_init() -> test.Task : $@convention(method) (@thick Task.Type) -> @owned Task {
bb0(%0 : $@thick Task.Type):
  %1 = alloc_ref $Task                            // user: %3
  // function_ref Task.init()
  %2 = function_ref @test.Task.init() -> test.Task : $@convention(method) (@owned Task) -> @owned Task // user: %3
  %3 = apply %2(%1) : $@convention(method) (@owned Task) -> @owned Task // user: %4
  return %3 : $Task                               // id: %4
} // end sil function 'test.Task.__allocating_init() -> test.Task'

// Task.init()
sil hidden @test.Task.init() -> test.Task : $@convention(method) (@owned Task) -> @owned Task {
// %0                                             // users: %2, %1
bb0(%0 : $Task):
  debug_value %0 : $Task, let, name "self"        // id: %1
  %2 = mark_uninitialized [rootself] %0 : $Task   // users: %12, %11, %10, %5
  // function_ref variable initialization expression of Task.task
  %3 = function_ref @variable initialization expression of test.Task.task : () -> ()? : $@convention(thin) () -> @owned Optional<@callee_guaranteed () -> ()> // user: %4
  %4 = apply %3() : $@convention(thin) () -> @owned Optional<@callee_guaranteed () -> ()> // user: %8
  %5 = begin_borrow %2 : $Task                    // users: %10, %6
  %6 = ref_element_addr %5 : $Task, #Task.task    // user: %7
  %7 = begin_access [modify] [dynamic] %6 : $*Optional<@callee_guaranteed () -> ()> // users: %9, %8
  assign %4 to %7 : $*Optional<@callee_guaranteed () -> ()> // id: %8
  end_access %7 : $*Optional<@callee_guaranteed () -> ()> // id: %9
  end_borrow %5 from %2 : $Task, $Task            // id: %10
  %11 = copy_value %2 : $Task                     // user: %13
  destroy_value %2 : $Task                        // id: %12
  return %11 : $Task                              // id: %13
} // end sil function 'test.Task.init() -> test.Task'

// static Strideable<>...< infix(_:_:)
sil [transparent] [serialized] @static (extension in Swift):Swift.Strideable< where A.Stride: Swift.SignedInteger>...< infix(A, A) -> Swift.CountableRange<A> : $@convention(method) <τ_0_0 where τ_0_0 : Strideable, τ_0_0.Stride : SignedInteger> (@in τ_0_0, @in τ_0_0, @thick τ_0_0.Type) -> @out CountableRange<τ_0_0>

// Collection<>.makeIterator()
sil [serialized] [always_inline] @(extension in Swift):Swift.Collection< where A.Iterator == Swift.IndexingIterator<A>>.makeIterator() -> Swift.IndexingIterator<A> : $@convention(method) <τ_0_0 where τ_0_0 : Collection, τ_0_0.Iterator == IndexingIterator<τ_0_0>> (@in_guaranteed τ_0_0) -> @out IndexingIterator<τ_0_0>

// IndexingIterator.next()
sil [serialized] [always_inline] @Swift.IndexingIterator.next() -> A.Element? : $@convention(method) <τ_0_0 where τ_0_0 : Collection> (@inout IndexingIterator<τ_0_0>) -> @out Optional<τ_0_0.Element>

sil_vtable Task {
  #Task.task!getter.1: (Task) -> () -> (() -> ())? : test.Task.task.getter : () -> ()?	// Task.task.getter
  #Task.task!setter.1: (Task) -> ((() -> ())?) -> () : test.Task.task.setter : () -> ()?	// Task.task.setter
  #Task.task!materializeForSet.1: (Task) -> (Builtin.RawPointer, inout Builtin.UnsafeValueBuffer) -> (Builtin.RawPointer, Builtin.RawPointer?) : test.Task.task.materializeForSet : () -> ()?	// Task.task.materializeForSet
  #Task.run!1: (Task) -> () -> () : test.Task.run() -> ()	// Task.run()
  #Task.init!initializer.1: (Task.Type) -> () -> Task : test.Task.init() -> test.Task	// Task.init()
  #Task.deinit!deallocator: test.Task.__deallocating_deinit	// Task.__deallocating_deinit
}




``` 
