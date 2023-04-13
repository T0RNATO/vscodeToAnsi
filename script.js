document.querySelector("#convert").addEventListener("click", convert)
document.querySelector("#copy").addEventListener("click", copyContent)

const parser = new DOMParser()

const discordColours = {
    31: [214, 60, 54],
    32: [135, 152, 35],
    33: [171, 134, 35],
    34: [51, 138, 206],
    35: [205, 63, 129],
    36: [60, 159, 151],
    37: [238, 232, 214]
}

function getClosestColour(cssString, coloursToUse) {
    const colour = cssString.slice(4, -1).split(",");
    
    [r, g, b] = colour;
    const colourDiffs = {};

    for (const [ansiCode, rgb] of Object.entries(coloursToUse)) {
        [cr, cg, cb] = rgb
        const colourDiff = Math.sqrt((r - cr)**2 + (g - cg)**2 + (b - cb)**2)

        colourDiffs[ansiCode] = colourDiff;
    }

    return Object.keys(colourDiffs).find(key => colourDiffs[key] === Math.min(...Object.values(colourDiffs)));
}

async function convert() {
    let processedColours = {};

    let doc;
    await navigator.clipboard.read().then(async (data) => {
        await data[0].getType("text/html").then(async (d) => {
            await d.text().then((ata) => {
                doc = parser.parseFromString(ata, "text/html")
            })
        })
    })

    let output = "";

    doc = doc.body.children[0];

    const mode = document.querySelector('input[name="mode"]:checked').value;

    for (const line of doc.children) {
        for (const span of line.children) {
            if (span.textContent !== " ") {
                let colour = span.style.getPropertyValue("color");
                if (!(colour in processedColours)) {
                    if (mode === "contrast") {
                        availableColours = {};

                        for (const [ansiCode, rgb] of Object.entries(discordColours)) {
                            if (!(Object.values(processedColours).includes(ansiCode))) {
                                availableColours[ansiCode] = rgb
                            }
                        }

                        console.log(availableColours);

                        if (Object.values(availableColours).length === 0) {
                            availableColours = discordColours;
                        }

                        processedColours[colour] = getClosestColour(colour, availableColours);
                    } else if (mode === "accuracy") {
                        processedColours[colour] = getClosestColour(colour, discordColours);
                    }
                }

                output += `[${processedColours[colour]}m${span.textContent}`;

            } else {
                output += " ";
            }
        }
        output += "\n"
    }

    document.querySelector("#output").value = `\`\`\`ansi
${output}
\`\`\``;
}

function copyContent() {
    navigator.clipboard.writeText(document.querySelector("#output").value)
}