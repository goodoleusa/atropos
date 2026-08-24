<%*
/**
 * 2-New Technique — code runs FIRST. Prompts then outputs frontmatter + body.
 */
const technique_name = await tp.system.prompt("Technique name?", "Unknown");
if (!technique_name) { tR = ""; return; }

const category = await tp.system.prompt("Category?", "OSINT");
const difficulty = await tp.system.prompt("Difficulty (Easy/Medium/Hard)?", "Medium");
const accuracy = await tp.system.prompt("Accuracy (High/Medium/Low)?", "Medium");
const speed = await tp.system.prompt("Speed (Fast/Medium/Slow)?", "Medium");
const cost = await tp.system.prompt("Cost (Free/Low/Medium/High)?", "Free");
const detection_risk = await tp.system.prompt("Detection risk (Low/Medium/High)?", "Low");
const now = tp.date.now("YYYY-MM-DD");
const investigation_id = window.investigation_id || "";

let parentLink = "";
const parent_note = await tp.system.prompt("Parent note (filename, optional)?", "");
if (parent_note.trim()) parentLink = `[[${parent_note.trim()}]]`;

const content = `---
type: reference
reference_type: technique
date_created: "${now}"
date_modified: "${now}"
status: active
difficulty: ${difficulty}
accuracy: ${accuracy}
speed: ${speed}
cost: ${cost}
detection_risk: ${detection_risk}
parent: ${parentLink ? '"' + parentLink + '"' : []}
sibling: []
child: []
tags:
  - reference
  - technique
title: "Technique - ${technique_name}"
aliases:
  - "${technique_name}"
---

# ${technique_name}

**Category**: ${category}  
**Difficulty**: ${difficulty}  
**Accuracy**: ${accuracy}  
**Speed**: ${speed}  
**Cost**: ${cost}  
**Detection Risk**: ${detection_risk}  

---

## Description

[What is this technique and when to use it]

---

## How It Works

[Step-by-step explanation]

1. Step 1
2. Step 2
3. Step 3

---

## Tools Used

- [[Tool - Name 1]]
- [[Tool - Name 2]]

---

## Data Sources

[Which APIs, databases, or services this technique queries]

---

## Effectiveness

- **Accuracy**: ${accuracy}
- **Speed**: ${speed}
- **Cost**: ${cost}
- **Detection Risk**: ${detection_risk}

---

## Limitations

- [Limitation 1]
- [Limitation 2]

---

## Alternatives

[[Technique - Alternative 1]] | [[Technique - Alternative 2]]

---

## Example Workflow

\`\`\`
[Example of using this technique]
\`\`\`

---

## Notes

[Personal experience, variations, pro tips, lessons learned]
`;

tR = content;
%>
