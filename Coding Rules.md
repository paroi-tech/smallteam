# Coding rules

## Common rules

* Encoding: use `UTF-8`
* Indentation: use 2 spaces

## ECMAScript

* Naming: `myFunction`, `myVariable`, `myConstant`, `MyClass`.
* Use `undefined`. Do not use `null` except for representing a SQL `null`.
* Do not use class inheritance.
* Only use ES5 getters or setters when you are absolutely sure that no exceptions can be thrown.
* Prefer `++i` and `--i` over `i++` and `i--`.
* Avoid using `bind()`.
* Loop and conditional bodies: Curly braces can be omitted only with a one line and one instruction block. Statements on the same line are not allowed.
* Prefer `new Error()` over `Error()`.
* In generics, type have single-letter names, such as `T`, `K`, etc.
* Do not use semicolons at the end of statements
* Use double quotes for strings.
* Prefer `const` over `let`.
* Never use `==` or `!=`.

## TypeScript

* Do not use: `enum`, `abstract`, `protected`.
* Do not use the `public` keyword, except as a shorthand in the constructor.
* Do not use "I" as a prefix for interface names.

## CSS

* We use [Pleasant BEM](https://paleo.casa/pleasant-bem.html);
* Sort CSS properties alphabetically;
* Prefer double quotes over single quotes.

## HTML

* In a markup, write the attribute `class` first, and non-attributes `h` at last position.

## More documentation

Here are rules that apply to other teams:

* Camel case from Google: Read [this section](https://google.github.io/styleguide/javaguide.html#s5.3-camel-case) of the Java guide.
* JSON from Google: https://google.github.io/styleguide/jsoncstyleguide.xml
* HTML and CSS from Google: https://google.github.io/styleguide/htmlcssguide.html
