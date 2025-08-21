const input = document.getElementById('input')
const output = document.getElementById('output')
const button = document.getElementById('format-button')
const copy = document.getElementById('copy-button')

var beautifyStrategy = ScriptBeautifyStrategy.DEFAULT

document.addEventListener('keyup', onKeyPress)
button.addEventListener('click', toggleFormat)
copy.addEventListener('click', copyToClipboard)

async function onKeyPress(e) {
    copy.innerText = 'Copy'
    var reader = new ScriptReader(input.value)
    output.value = await reader.parse().format(beautifyStrategy)
}

function toggleFormat(e) {
    switch (beautifyStrategy) {
        case ScriptBeautifyStrategy.DEFAULT:
            beautifyStrategy = ScriptBeautifyStrategy.EXPANDED
            break
        case ScriptBeautifyStrategy.EXPANDED:
            beautifyStrategy = ScriptBeautifyStrategy.SINGLE_LINE
            break
        case ScriptBeautifyStrategy.SINGLE_LINE:
            beautifyStrategy = ScriptBeautifyStrategy.DEFAULT
            break            
    }
    output.style.textWrap = (beautifyStrategy == ScriptBeautifyStrategy.DEFAULT || beautifyStrategy == ScriptBeautifyStrategy.EXPANDED) ? 'nowrap' : 'balance'
    button.innerText = beautifyStrategy
    onKeyPress(null)
}

function copyToClipboard(e) {
    navigator.clipboard.writeText(output.value)
    copy.innerText = 'Copied!'
}

onKeyPress(null)
