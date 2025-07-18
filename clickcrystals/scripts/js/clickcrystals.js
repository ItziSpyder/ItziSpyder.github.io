class Requester {
    URL_CONDITIONALS = "https://raw.githubusercontent.com/clickcrystals-development/ClickCrystals/refs/heads/main/src/main/java/io/github/itzispyder/clickcrystals/modules/scripts/Conditionals.java"
    URL_EVENTS = "https://raw.githubusercontent.com/clickcrystals-development/ClickCrystals/refs/heads/main/src/main/java/io/github/itzispyder/clickcrystals/modules/scripts/syntax/OnEventCmd.java"
    URL_PACKETS = "https://raw.githubusercontent.com/clickcrystals-development/ClickCrystals/refs/heads/main/src/main/java/io/github/itzispyder/clickcrystals/client/networking/PacketMapper.java"
    URL_INPUTS = "https://raw.githubusercontent.com/clickcrystals-development/ClickCrystals/refs/heads/main/src/main/java/io/github/itzispyder/clickcrystals/modules/scripts/InputType.java"
    URL_ENTITY_TARGETS = "https://raw.githubusercontent.com/clickcrystals-development/ClickCrystals/refs/heads/main/src/main/java/io/github/itzispyder/clickcrystals/modules/scripts/TargetType.java"

    async requestConditionals() {
        return await this.#request(this.URL_CONDITIONALS, line => {
            var matcher = line.match(/public static final Conditional ([A-Z_]+);/)
            return matcher == null ? null : matcher[1].toLowerCase()
        })
    }

    async requestEvents() {
        return await this.#request(this.URL_EVENTS, line => {
            var matcher = line.match(/^\s+([A-Z_]+),?\s*$/m)
            return matcher == null ? null : matcher[1].toLowerCase()
        })
    }

    async requestPackets() {
        return await this.#request(this.URL_PACKETS, line => {
            var matcher = line.match(/new Info\(\"(\w+)\",.*\)/)
            return matcher == null ? null : matcher[1]
        })
    }

    async requestInputs() {
        return await this.#request(this.URL_INPUTS, line => {
            var matcher = line.match(/\s+([A-Z_]+)\(.*\),?/)
            return matcher == null ? null : matcher[1].toLowerCase()
        })
    }

    async requestEntityTargets() {
        return await this.#request(this.URL_ENTITY_TARGETS, line => {
            var matcher = line.match(/^\s+([A-Z_]+),?\s*$/m)
            return matcher == null ? null : matcher[1].toLowerCase()
        })
    }

    async #request(url, lineFunction) {
        var response = await fetch(url)
        var content = await response.text()
        var lines = content.split("\n")
        var result = []

        for (var i = 0; i < lines.length; i++) {
            var line = lines[i]
            var captured = lineFunction(line)
            if (captured != null)
                result.push(captured)
        }
        return result
    }

    async test() {
        console.log(await this.requestConditionals())
        console.log(await this.requestEvents())
        console.log(await this.requestPackets())
        console.log(await this.requestInputs())
        console.log(await this.requestEntityTargets())
    }
}

class ClickCrystals {
    static SCRIPTING
    static INFO

    static async init() {
        ClickCrystals.SCRIPTING = new Requester()
        ClickCrystals.INFO = await ClickCrystals.#fetchInfo()
    }

    static async #fetchInfo() {
        var response = await fetch("https://itzispyder.github.io/clickcrystals/info.json")
        return await response.json()
    }
}

ClickCrystals.init()