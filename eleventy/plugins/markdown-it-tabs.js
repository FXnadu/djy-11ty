// markdown-it plugin: Tab blocks
// Syntax: consecutive ::: tab Title blocks are grouped into a tab bar
module.exports = function markdownItTabs(md) {
  md.block.ruler.before("fence", "tab_blocks", function (state, startLine, endLine, silent) {
    // Collect all consecutive ::: tab blocks
    const lines = [];
    let line = startLine;

    while (line < endLine) {
      const pos = state.bMarks[line] + state.tShift[line];
      const max = state.eMarks[line];
      const text = state.src.slice(pos, max).trim();

      if (text === "" || text === "\n") {
        // Skip blank lines between tabs
        line++;
        continue;
      }

      if (text.match(/^:::\s+tab\s+/)) {
        // Find the closing :::
        const title = text.replace(/^:::\s+tab\s+/, "").trim();
        const contentStart = line + 1;
        let contentEnd = contentStart;

        while (contentEnd < endLine) {
          const cpos = state.bMarks[contentEnd] + state.tShift[contentEnd];
          const cmax = state.eMarks[contentEnd];
          const ctext = state.src.slice(cpos, cmax).trim();
          if (ctext === ":::") break;
          contentEnd++;
        }

        if (contentEnd >= endLine) return false;

        lines.push({
          title,
          contentStart,
          contentEnd
        });

        line = contentEnd + 1;
      } else if (lines.length > 0) {
        // We had some tabs but hit a non-tab line
        break;
      } else {
        return false;
      }
    }

    if (lines.length === 0) return false;
    if (silent) return true;

    // Generate tokens
    // Tab group container
    let token = state.push("tabgroup_open", "div", 1);
    token.attrSet("class", "tab-group");
    token.block = true;
    token.map = [startLine, line];

    // Tab list (buttons)
    token = state.push("tablist_open", "div", 1);
    token.attrSet("class", "tab-list");
    token.block = true;

    lines.forEach(function (tab, idx) {
      const btnOpen = state.push("tabbutton_open", "button", 1);
      btnOpen.attrSet("class", idx === 0 ? "tab-btn active" : "tab-btn");
      btnOpen.attrSet("data-tab", idx.toString());
      btnOpen.block = true;

      const btnText = state.push("text", "", 0);
      btnText.content = tab.title;

      const btnClose = state.push("tabbutton_close", "button", -1);
      btnClose.block = true;
    });

    token = state.push("tablist_close", "div", -1);
    token.block = true;

    // Tab panels
    lines.forEach(function (tab, idx) {
      const panelOpen = state.push("tabpanel_open", "div", 1);
      panelOpen.attrSet("class", idx === 0 ? "tab-panel active" : "tab-panel");
      panelOpen.attrSet("data-tab", idx.toString());
      panelOpen.block = true;

      // Parse content between ::: tab and :::
      state.md.block.tokenize(state, tab.contentStart, tab.contentEnd);

      const panelClose = state.push("tabpanel_close", "div", -1);
      panelClose.block = true;
    });

    token = state.push("tabgroup_close", "div", -1);
    token.block = true;

    state.line = line;
    return true;
  });
};
