import { Plugin, WorkspaceLeaf, CanvasNode } from "obsidian";
import { requireApiVersion } from "obsidian";



export default class CanvasBrainstormPlugin extends Plugin {
	onload() {
		this.registerEvent(
			this.app.workspace.on("active-leaf-change", async (leaf: WorkspaceLeaf | null) => {
				if (!leaf) return;
				if (leaf.view?.getViewType() !== "canvas") return;

				await this.injectButtonWhenReady(leaf);
			})
		);
	}

	async injectButtonWhenReady(leaf: WorkspaceLeaf) {
		const container = leaf.view.containerEl;

		const tryInject = () => {
			const controlGroups = container.querySelectorAll(".canvas-control-group");
			if (controlGroups.length === 0) return false;

			const targetGroup = controlGroups[controlGroups.length - 1];
			if (targetGroup.querySelector(".brainstorm-button")) return true;

			const button = document.createElement("button");
			button.textContent = "🧠";
			button.className = "brainstorm-button";


button.onclick = () => {
  const canvas = (leaf.view as any).canvas;
  if (!canvas) return;

  const selection = canvas.selection;
  const selected = Array.from(selection.values())[0];

  if (!selected) {
    // ⬅️ No selection — fall back to default behavior
    const isFirst = canvas.nodes.size === 0;
    const vp = canvas.getViewportBBox();
    const centerX = (vp.minX + vp.maxX) / 2;
    const centerY = (vp.minY + vp.maxY) / 2;
    const W = 200, H = 100;
    const x = centerX - W/2, y = centerY - H/2;

    let node: any;
    if (!requireApiVersion("1.1.10")) {
      node = canvas.createTextNode({ x, y }, { width: W, height: H }, true);
      node.setText(isFirst ? "Root Node" : "New Node");
    } else {
      node = canvas.createTextNode({
        pos: { x, y },
        text: isFirst ? "Root Node" : "New Node",
        focus: true,
        save: true,
        size: { width: W, height: H, x, y }
      });
    }

    if (isFirst && node?.setColor) node.setColor("#ff0000");
    canvas.requestSave();
    return;
  }



  if (selection.size === 1 && selected) {
    const parent = selected as CanvasNode;
    const spacing = 50;
    const W = 200, H = 100;
    const x = parent.x + parent.width + spacing;
    const y = parent.y;

    // Create the child node
    let child: any;
    if (!requireApiVersion("1.1.10")) {
      child = canvas.createTextNode({ x, y }, { width: W, height: H }, true);
      child.setText("Child Node");
    } else {
      child = canvas.createTextNode({
        pos: { x, y },
        text: "Child Node",
        focus: true,
        save: true,
        size: { width: W, height: H, x, y }
      });
    }

    // === Manually add an edge ===
    // 1. Grab existing data
    const data = canvas.getData();
    // 2. Build a new edge record
    const newEdge: any = {
      id: `edge-${Date.now()}`,       // or uuidv4()
      fromNode: parent.id,
      fromSide: "right",
      toNode: child.id,
      toSide: "left"
    };
    data.edges.push(newEdge);
    // 3. Re-import to the canvas (preserves history by default)
    canvas.importData({ nodes: data.nodes, edges: data.edges }, /* clear= */ false, /* silent= */ false);

    // Focus the new node
    canvas.deselectAll();
    canvas.selectOnly(child);
    canvas.zoomToSelection();
    canvas.requestSave();
    return;
  }




};

      




			targetGroup.appendChild(button);
			return true;
		};

		let attempts = 0;
		const interval = setInterval(() => {
			if (tryInject() || attempts++ > 10) clearInterval(interval);
		}, 100);

		
	}



}


