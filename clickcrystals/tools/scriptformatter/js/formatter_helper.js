class ScriptReader {
    input
    beautifyStrategy

    constructor(script) {
        this.input = script
        this.beautifyStrategy = ScriptBeautifyStrategy.DEFAULT
    }

    parse() {
        const root = new ScriptToken()
        const context = new ScriptReadContext(root)
        const chars = [...this.input] // split into array of chars

        for (let i = 0; i < chars.length; i++) {
            context.currIndex = i
            context.prevChar = i > 0 ? chars[i - 1] : null
            context.currChar = chars[i]
            context.nextChar = i < chars.length - 1 ? chars[i + 1] : null

            if (context.stringEscaped()) {
                this.readChar(context)
                context.isEscaped = false
                continue
            }

            if (context.evaluateReadability()) {
                this.readChar(context)
            }
        }

        context.finish()
        return root
    }

    readChar(context) {
        if (context.currToken == null) {
            context.currToken = new ScriptToken()
            context.rootToken.children.push(context.currToken)
        }
        if (context.currToken.value == null) {
            context.currToken.value = ""
        }
        context.currToken.value += context.currChar
    }
}

// value { children... }
class ScriptToken {
    parent
    value
    children = []
    nestCount = 0

    async format(beautifyStrategy) {
        switch (beautifyStrategy) {
            case ScriptBeautifyStrategy.DEFAULT:
                return await this.formatDefault()
            case ScriptBeautifyStrategy.EXPANDED:
                return await this.formatExpanded()
            case ScriptBeautifyStrategy.SINGLE_LINE:
                return await this.formatSingleLine()
        }
    }

    async formatDefault() {
        const isParent = this.children.length > 0
        const indent = "   ".repeat(this.nestCount)
        let builder = indent

        if (this.value != null) {
            builder += this.value.trim()
            if (isParent) builder += " "
        }

        if (isParent) {
            if (this.value != null) builder += "{"
            builder += "\n"
            for (const child of this.children) {
                if ((child.value != null && child.value.trim() != "") || child.children.length > 0) {
                    builder += await child.formatDefault() + "\n"
                }
            }
            if (this.value != null) builder += indent + "}"
        }

        return builder
    }

    async formatSingleLine() {
        const isParent = this.children.length > 0
        let builder = ""

        if (this.value != null) {
            builder += this.value.trim()
            if (isParent) builder += " "
            else builder += "; "
        }

        if (isParent) {
            if (this.value != null) builder += "{ "
            for (const child of this.children) {
                if ((child.value != null && child.value.trim() != "") || child.children.length > 0) {
                    builder += await child.formatSingleLine()
                }
            }
            if (this.value != null) builder += "} "
        }

        return builder
    }

    async formatExpanded() {
        const isParent = this.children.length > 0
        const indent = "   ".repeat(this.nestCount)
        let builder = indent

        if (isParent) {
            if (this.value != null) builder += this.value.trim() + " {"
            builder += "\n"
            for (const child of this.children) {
                if ((child.value != null && child.value.trim() != "") || child.children.length > 0) {
                    builder += await child.formatExpanded() + "\n"
                }
            }
            if (this.value != null) builder += indent + "}"
        } else if (this.value != null) {
            const commandPattern = await ScriptBeautifyStrategy.getCommandPattern()
            const openerPattern = await ScriptBeautifyStrategy.getCodeBlockOpenerPattern()

            let subNests = 0
            let match

            // fresh scanner with global flag, cloned from the real pattern
            const scanFlags = commandPattern.flags.includes('g') ? commandPattern.flags : commandPattern.flags + 'g'
            const scanner = new RegExp(commandPattern.source, scanFlags)

            while ((match = scanner.exec(this.value)) != null) {
                const command = match[0]
                openerPattern.lastIndex = 0       // ensure .test is stateless
                if (!openerPattern.test(command)) {
                    builder += command + " "
                    continue
                }
                builder += command + " {\n" + "   ".repeat(this.nestCount + (++subNests))
            }

            for (let subNest = subNests - 1; subNest >= 0; subNest--) {
                builder += "\n" + "   ".repeat(this.nestCount + subNest) + "}"
            }
        }

        return builder
    }
}


class ScriptBeautifyStrategy {
    static DEFAULT = 'Default'
    static EXPANDED = 'Expanded'
    static SINGLE_LINE = 'Single-Line'

    static commandPattern
    static codeBlockOpenerPattern

    static async cachePatternsIfNecessary() {
        if (this.commandPattern && this.codeBlockOpenerPattern) return

        const commandRegex = await this.fetchRegex(
            "https://raw.githubusercontent.com/clickcrystals-development/ClickCrystalsScripting/refs/heads/master/DOCUMENTATION/regex.txt",
            "g"         // scanner needs global
        )
        const openerRegex = await this.fetchRegex(
            "https://raw.githubusercontent.com/clickcrystals-development/ClickCrystalsScripting/refs/heads/master/DOCUMENTATION/code_block_openers.txt",
            ""          // IMPORTANT: no 'g' here, .test must be stateless
        )

        this.commandPattern = commandRegex
        this.codeBlockOpenerPattern = openerRegex
    }

    static async fetchRegex(url, flags = "") {
        const response = await fetch(url)
        const content = (await response.text()).trim()
        return new RegExp(content, flags)
    }

    static async getCodeBlockOpenerPattern() {
        await this.cachePatternsIfNecessary()
        return this.codeBlockOpenerPattern
    }

    static async getCommandPattern() {
        await this.cachePatternsIfNecessary()
        return this.commandPattern
    }
}


class ScriptReadContext {
    currIndex
    prevChar
    currChar
    nextChar
    inString = false
    isEscaped = false
    rootToken
    currToken
    nest = []

    constructor(rootToken) {
        this.rootToken = rootToken
        this.currToken = null
        this.prevChar = null
        this.currChar = null
        this.nextChar = null
    }

    finish() {
        if (this.nest.length > 0)
            throw new Error("unclosed brackets (did you escape your brackets?)")
        if (this.inString)
            throw new Error("unclosed quotation marks (did you escape your quotation marks?)")
    }

    stringEscaped() {
        return this.inString && this.isEscaped
    }

    evaluateReadability() {
        switch (this.currChar) {
            case '\\':
                if (this.inString) {
                    this.isEscaped = true
                    return false
                }
                return true

            case '"':
                this.inString = !this.inString
                if (!this.inString) this.isEscaped = false
                return true

            case '{':
                if (!this.inString) {
                    const token = new ScriptToken()
                    token.nestCount = this.nest.length + 1
                    token.parent = this.currToken
                    this.currToken.children.push(token)
                    this.currToken = token
                    this.nest.push(token)
                }
                return this.inString

            case '}':
                if (!this.inString) {
                    this.nest.pop()
                    this.currToken = this.nest.length == 0 ? this.rootToken : this.nest[this.nest.length - 1]
                }
                return this.inString

            case ' ':
            case '\t':
                if (this.inString) return true
                return this.prevChar != ' ' && this.prevChar != '\t'

            case ';':
            case '\n':
                if (!this.inString) {
                    const token = new ScriptToken()
                    token.nestCount = this.currToken.nestCount
                    token.parent = this.currToken.parent
                    const parent = this.currToken.parent == null ? this.rootToken : this.currToken.parent
                    parent.children.push(token)
                    this.currToken = token
                }
                return this.inString

            default:
                return true
        }
    }
}
