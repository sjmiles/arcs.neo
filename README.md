Arcs.neo
========

Repository is divided into several _components|properties_ (bikeshedding needed).

Components generally contain their own tooling and compilation or
build rules and try to be as atomic as is practical.

Some ubiquitous tooling is provided at the top level components, e.g.
**typescript**.

Code components generally are structured like so:

- [component-name]
  - dist
    - files to be consumed by users of the component
  - src
    - ts source files
  - tsconfig.json

Rarely updated components commit their dist files to the repo, affording
dramatically reduced setup requirements for most users (i.e. end-users not modifying low-level code will not need to install/configure/invoke dependent tooling).

Entry Points
------------
_...for trying stuff in browser_

- play with parser output
  - http://localhost/.../arcs.neo/manifest-parser/toy

- examine recipe2plan output
  - http://localhost/.../arcs.neo/tools/recipe2plan/smoke
