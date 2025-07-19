## All Resouces

- https://itzispyder.github.io/
- https://itzispyder.github.io/bookmarks
- https://itzispyder.github.io/cc
- https://itzispyder.github.io/desmoshelper
- https://itzispyder.github.io/canvas/v1
- https://itzispyder.github.io/canvas/v2
- https://itzispyder.github.io/clickcrystals/ccs
- https://itzispyder.github.io/clickcrystals/bulletin.json
- https://itzispyder.github.io/clickcrystals/info.json
- https://itzispyder.github.io/clickcrystals/tools/bulletin
- https://itzispyder.github.io/clickcrystals/tools/scriptformatter

---

## ClickCrystals Mini JS Library (WIP)
- https://itzispyder.github.io/clickcrystals/scripts/js/clickcrystals.js

### Implementation
```html
<script src="https://itzispyder.github.io/clickcrystals/scripts/js/clickcrystals.js"></script>
```
### Example Usage
```js
main()

async function main() {
    // enum lists
    console.log(await ClickCrystals.SCRIPTING.requestConditionals())
    console.log(await ClickCrystals.SCRIPTING.requestEvents())
    console.log(await ClickCrystals.SCRIPTING.requestInputs())
    console.log(await ClickCrystals.SCRIPTING.requestEntityTargets())
    console.log(await ClickCrystals.SCRIPTING.requestPackets())

    // info json
    console.log(ClickCrystals.INFO)
    console.log(ClickCrystals.INFO.versionMappings)
    console.log(ClickCrystals.INFO.latest)
}
```