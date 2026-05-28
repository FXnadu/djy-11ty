// markdown-it plugin: Tab blocks
// Syntax: consecutive ::: tab Title blocks are grouped into a tab bar
module.exports = function markdownItTabs(md) {
  md.block.ruler.before("fence", "tab_blocks", function (state, startLine, endLine, silent) {
    // Collect all consecutive ::: tab blocks
    var lines = [];
    var line = startLine;

    while (line < endLine) {
      var pos = state.bMarks[line] + state.tShift[line];
      var max = state.eMarks[line];
      var text = state.src.slice(pos, max).trim();

      if (text === "" || text === "\n") {
        // Skip blank lines between tabs
        line++;
        continue;
      }

      if (text.match(/^:::\s+tab\s+/)) {
        // Find the closing :::
        var title = text.replace(/^:::\s+tab\s+/, "").trim();
        var contentStart = line + 1;
        var contentEnd = contentStart;

        while (contentEnd < endLine) {
          var cpos = state.bMarks[contentEnd] + state.tShift[contentEnd];
          var cmax = state.eMarks[contentEnd];
          var ctext = state.src.slice(cpos, cmax).trim();
          if (ctext === ":::") break;
          contentEnd++;
        }

        if (contentEnd >= endLine) return false;

        lines.push({
          title: title,
          contentStart: contentStart,
          contentEnd: contentEnd
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
    var token = state.push("tabgroup_open", "div", 1);
    token.attrSet("class", "tab-group");
    token.block = true;
    token.map = [startLine, line];

    // Tab list (buttons)
    token = state.push("tablist_open", "div", 1);
    token.attrSet("class", "tab-list");
    token.block = true;

    lines.forEach(function (tab, idx) {
      var btnOpen = state.push("tabbutton_open", "button", 1);
      btnOpen.attrSet("class", idx === 0 ? "tab-btn active" : "tab-btn");
      btnOpen.attrSet("data-tab", idx.toString());
      btnOpen.block = true;

      var btnText = state.push("text", "", 0);
      btnText.content = tab.title;

      var btnClose = state.push("tabbutton_close", "button", -1);
      btnClose.block = true;
    });

    token = state.push("tablist_close", "div", -1);
    token.block = true;

    // Tab panels
    lines.forEach(function (tab, idx) {
      var panelOpen = state.push("tabpanel_open", "div", 1);
      panelOpen.attrSet("class", idx === 0 ? "tab-panel active" : "tab-panel");
      panelOpen.attrSet("data-tab", idx.toString());
      panelOpen.block = true;

      // Parse content between ::: tab and :::
      state.md.block.tokenize(state, tab.contentStart, tab.contentEnd);

      var panelClose = state.push("tabpanel_close", "div", -1);
      panelClose.block = true;
    });

    token = state.push("tabgroup_close", "div", -1);
    token.block = true;

    state.line = line;
    return true;
  });
};
