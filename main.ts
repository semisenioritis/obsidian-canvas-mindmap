import { Plugin, WorkspaceLeaf } from "obsidian";
import { requireApiVersion } from "obsidian";
import { addEdge, addNode, buildTrees, createChildFileNode, random } from "utils";
import type { CanvasNode } from 'obsidian';


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
      button.onclick = () => this.onBrainstormClick(leaf.view);




			targetGroup.appendChild(button);
			return true;
		};

		let attempts = 0;
		const interval = setInterval(() => {
			if (tryInject() || attempts++ > 10) clearInterval(interval);
		}, 100);

		this.injectNavButtons(container);
	}

	injectNavButtons(container: HTMLElement) {
		if (container.querySelector(".brainstorm-nav")) return;

    console.log("Injecting navigation buttons");
    console.log("Container:", container);

		const nav = document.createElement("div");
		nav.className = "brainstorm-nav";
		nav.style.position = "fixed";
		nav.style.bottom = "var(--size-4-5)";
		nav.style.right = "var(--size-4-2)";
		nav.style.display = "grid";
		nav.style.gridTemplateColumns = "40px 40px 40px";
		nav.style.gridTemplateRows = "40px 40px";
		nav.style.gap = "5px";
		nav.style.zIndex = "9999";

		const makeBtn = (label: string, row: number, col: number, action: () => void) => {
			const btn = document.createElement("button");
			btn.textContent = label;
			btn.style.gridRow = `${row}`;
			btn.style.gridColumn = `${col}`;
			btn.onclick = action;
			nav.appendChild(btn);
		};

		makeBtn("⬆️", 1, 2, () => console.log("up"));
		makeBtn("⬅️", 2, 1, () => console.log("left"));
		makeBtn("⬇️", 2, 2, () => console.log("down"));
		makeBtn("➡️", 2, 3, () => console.log("right"));

		container.appendChild(nav);
	}


  onBrainstormClick(canvasView: any) {
    // @ts-ignore
    const canvas = canvasView.canvas;
    if (!canvas) {
      console.log("Canvas not found.");
      return;
    }

    if (canvas.selection.size === 0) {
      console.log("No node is selected. Creating a new card...");

      const nodeCount = canvas.nodes.size;

      let node;
      const pos = { x: 0, y: 0 }; // your hardcoded fallback

      if (!requireApiVersion("1.1.10")) {
        node = canvas.createTextNode(pos, { width: 200, height: 100 }, true);
      } else {
        node = canvas.createTextNode({
          pos: { ...pos, width: 200, height: 100 },
          text: "",
          focus: true,
          save: true,
          size: { ...pos, width: 200, height: 100 }
        });
      }

      // if no other nodes exist, color this node red
      if (nodeCount === 0 && node?.setColor) {
        node.setColor("#ff0000");
      }

      canvas.requestSave();
    }else if (canvas.selection.size === 1) {

      console.log("Exactly one node is selected. Creating child node...");
      this.createChildNode(canvas);

    }
  }


  createChildNode(canvas: any) {
    const parent = Array.from(canvas.selection.values())[0] as CanvasNode;
    const offset = { x: parent.x + 300, y: parent.y };

    let child;
    if (!requireApiVersion("1.1.10")) {
      child = canvas.createTextNode(offset, { width: 200, height: 100 }, true);
    } else {
      child = canvas.createTextNode({
        pos: { ...offset, width: 200, height: 100 },
        text: "",
        focus: true,
        save: true,
        size: { ...offset, width: 200, height: 100 }
      });
    }

    this.createEdge(parent, child, canvas);
    canvas.requestSave();
  }

  createEdge = async (node1: any, node2: any, canvas: any) => {

	addEdge(canvas, random(16), {
		fromOrTo: "from",
		side: "right",
		node: node1
	}, {
		fromOrTo: "to",
		side: "left",
		node: node2
	});

};
}


