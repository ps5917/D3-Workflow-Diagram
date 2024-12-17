// Data structure for workflow
const workflowData = {
    nodes: [
        { id: 1, label: "Work Order\nReceived", type: "process" },
        { id: 2, label: "Accept job?", type: "decision" },
        { id: 3, label: "Move On", type: "process" },
        { id: 4, label: "Pricing", type: "process" },
        { id: 5, label: "Quote", type: "process" },
        { id: 6, label: "Art", type: "process" },
        { id: 7, label: "Samples?", type: "decision" },
        { id: 8, label: "Approve?", type: "decision" },
        { id: 9, label: "Inquire for\nNew Samples", type: "process" },
        { id: 10, label: "Mayco Prep", type: "process" },
        { id: 11, label: "Roxy Prep", type: "process" },
        { id: 12, label: "Roxy seeks\nmaterial", type: "process" },
        { id: 13, label: "Materials\nprinted", type: "process" },
        { id: 14, label: "Materials cut", type: "process" },
        { id: 15, label: "Assembly", type: "process" },
        { id: 16, label: "QC?", type: "decision" },
        { id: 17, label: "Tape", type: "process" },
        { id: 18, label: "Bagging", type: "process" },
        { id: 19, label: "Packing", type: "process" },
        { id: 20, label: "Stripping", type: "process" },
        { id: 21, label: "Remake?", type: "decision" },
        { id: 22, label: "Remove from\nTeams", type: "process" },
        { id: 23, label: "Invoice to\nQuickbooks", type: "process" },
        { id: 24, label: "Await\nPayment", type: "process" },
        { id: 25, label: "Deposit\nPayment", type: "process" }
    ],
    links: [
        { source: 1, target: 2 },
        { source: 2, target: 3, label: "No" },
        { source: 2, target: 4, label: "Yes" },
        { source: 4, target: 5 },
        { source: 5, target: 6 },
        { source: 6, target: 7 },
        { source: 7, target: 8, label: "Tim/Mayco\nDiscuss" },
        { source: 8, target: 9, label: "No" },
        { source: 9, target: 7 },
        { source: 8, target: 10, label: "Yes" },
        { source: 10, target: 11 },
        { source: 11, target: 12 },
        { source: 12, target: 13 },
        { source: 13, target: 14 },
        { source: 14, target: 15 },
        { source: 15, target: 16 },
        { source: 16, target: 17 },
        { source: 17, target: 18 },
        { source: 18, target: 19 },
        { source: 19, target: 20 },
        { source: 20, target: 21 },
        { source: 21, target: 22, label: "No" },
        { source: 22, target: 23 },
        { source: 23, target: 24 },
        { source: 24, target: 25 }
    ]
};

// Configuration object
const config = {
    width: 1000,
    height: 600,
    nodeRadius: {
        process: 25,
        decision: 30
    },
    linkDistance: 100,
    chargeStrength: -1000
};

// Helper functions
const wrapText = (text, width) => {
    text.each(function() {
        const text = d3.select(this);
        const words = text.text().split(/\n/);
        const y = text.attr("y");
        const dy = parseFloat(text.attr("dy"));
        
        text.text(null);
        
        words.forEach((word, i) => {
            text.append("tspan")
                .attr("x", 0)
                .attr("y", y)
                .attr("dy", i === 0 ? dy + "em" : "1.2em")
                .text(word);
        });
    });
};

// D3 force simulation setup
const setupSimulation = (nodes, links) => {
    return d3.forceSimulation(nodes)
        .force("link", d3.forceLink(links).id(d => d.id).distance(config.linkDistance))
        .force("charge", d3.forceManyBody().strength(config.chargeStrength))
        .force("center", d3.forceCenter(config.width / 2, config.height / 2))
        .force("collision", d3.forceCollide().radius(50));
};

// Drag handlers
const dragHandlers = {
    started: (event) => {
        if (!event.active) simulation.alphaTarget(0.3).restart();
        event.subject.fx = event.subject.x;
        event.subject.fy = event.subject.y;
    },
    dragged: (event) => {
        event.subject.fx = event.x;
        event.subject.fy = event.y;
    },
    ended: (event) => {
        if (!event.active) simulation.alphaTarget(0);
        event.subject.fx = null;
        event.subject.fy = null;
    }
};

// Create SVG
const svg = d3.select("#diagram")
    .append("svg")
    .attr("width", config.width)
    .attr("height", config.height);

// Initialize simulation
const simulation = setupSimulation(workflowData.nodes, workflowData.links);

// Create links
const link = svg.append("g")
    .selectAll("g")
    .data(workflowData.links)
    .join("g");

link.append("path")
    .attr("class", "link");

link.append("text")
    .attr("class", "link-label")
    .attr("dy", -5)
    .append("textPath")
    .attr("href", (d, i) => "#linkPath" + i)
    .attr("startOffset", "50%")
    .style("text-anchor", "middle")
    .text(d => d.label);

// Create nodes
const node = svg.append("g")
    .selectAll(".node")
    .data(workflowData.nodes)
    .join("g")
    .attr("class", "node")
    .call(d3.drag()
        .on("start", dragHandlers.started)
        .on("drag", dragHandlers.dragged)
        .on("end", dragHandlers.ended));

node.append("circle")
    .attr("r", d => config.nodeRadius[d.type])
    .attr("transform", d => d.type === "decision" ? "rotate(45)" : "");

node.append("text")
    .attr("dy", ".35em")
    .attr("text-anchor", "middle")
    .text(d => d.label)
    .call(wrapText, 70);

// Update simulation on tick
simulation.on("tick", () => {
    link.select("path")
        .attr("d", d => {
            const dx = d.target.x - d.source.x;
            const dy = d.target.y - d.source.y;
            return `M${d.source.x},${d.source.y}L${d.target.x},${d.target.y}`;
        })
        .attr("id", (d, i) => "linkPath" + i);

    node.attr("transform", d => `translate(${d.x},${d.y})`);
});