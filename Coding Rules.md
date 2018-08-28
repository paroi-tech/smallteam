# Coding rules

## ECMAScript

Naming: `myFunction`, `myVariable`, `myProperty`, `MyClass`.

* Encoding: use `UTF-8`
* Identation: use 2 spaces
* Do not use semicolons at the end of statements
* Use double quotes for strings.
* Use `undefined`. Do not use `null` except for representing a SQL `null`.
* Do not use class inheritance.
* Only use ES5 getters or setters when you are absolutely sure that no exceptions can be thrown.
* The only case where `export default` is welcome is from the `main` file of a npm package.
* Never use `==` or `!=`.
* Prefer `++i` and `--i` over `i++` and `i--`.
* Avoid using `bind()` (justification [here](https://stackoverflow.com/questions/42117911/lambda-functions-vs-bind-memory-and-performance))
* Loop and conditional bodies: Curly braces can be omitted only with a one line and one instruction block. Statements on the same line are not allowed.

## TypeScript

* Do not use: `enum`, `abstract`, `protected`.
* Do not use the `public` keyword, except as a shorthand in the constructor.
* Do not use "I" as a prefix for interface names
* Do not use "_" as a prefix for private properties.


## More documentation

Here are rules that apply to other teams:

* Camel case from Google: Read [this section](https://google.github.io/styleguide/javaguide.html#s5.3-camel-case) of the Java guide.
* JSON from Google: https://google.github.io/styleguide/jsoncstyleguide.xml
* HTML and CSS from Google: https://google.github.io/styleguide/htmlcssguide.html
* TypeScript from Microsoft: https://github.com/Microsoft/TypeScript/wiki/Coding-guidelines
