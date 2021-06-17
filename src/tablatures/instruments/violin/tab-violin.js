/*
Emit tab for violin staff
*/
var TabRenderer = require('../../tab-renderer');
var TabDrawer = require('../../tab-drawer');
var Tablature = require('./tablature');

var plugin = {

  // private stuff


  renderVoice: function (tablature, voice) {
    var absChild; 
    for (ii = 0; ii < voice.children.length; ii++) {
      absChild = voice.children[ii];
      for (jj = 0; jj < absChild.children.length; jj++) {
        var relChild = absChild.children[jj];
        var scoreType = relChild.parent.abcelem.el_type;
        switch (scoreType) {
          case 'clef':
            tablature.tab(relChild);
            break;
          case 'bar':
            tablature.bar(relChild);
            break
        }
      }
    }
  },

  // public stuf

  /**
   * upon init mainly store provided instances for later usage
   * @param {*} abcTune  the parsed tune AST tree
  *  @param {*} tuneNumber  the parsed tune AST tree
   * @param {*} params  complementary args provided to Tablature Plugin
   */
  init: function (abcTune, tuneNumber, params) {
    this.tune = abcTune;
    this.params = params;
    this.tuneNumber = tuneNumber;
    this.tabRenderer = null;
    this.tabDrawer = null;
    this.lineSpace = 12;
    this.nbLines = 4;
    this.topStaffY = -1;
    console.log('ViolinTab plugin inited');
  },


  /**
   * render a score line staff using current abcjs renderer 
   * NB : we assume that renderer , current tunes info + tab params 
   * operational inside plugin instance
   * @param {*} renderer
   * @param {*} staff
   * @return the current height of displayed tab 
   */
  render: function (renderer, voice, curVoice) {
    console.log('ViolinTab plugin rendered');
    if (this.tabRenderer == null) {
      this.tabRenderer = new TabRenderer(renderer);
    }
    if (this.tabDrawer == null) {
      this.tabDrawer = new TabDrawer(renderer);
    }
    this.topStaffY = renderer.tablatures.topStaff;
    // write instrument name first
    var name = this.params.name;
    if (!name) {
      name = 'violin';
    }
    // Instrument name + tablature frame
    this.tabRenderer.instrumentName(name);
    this.tabDrawer.drawNonMusic(this.tabRenderer.rendered)
    var tablature = new Tablature(this.tabDrawer,
      this.nbLines,
      this.lineSpace);
    tablature.print();
    // draw starting vertical line 
    tablature.verticalLine(tablature.startx, this.topStaffY, tablature.bottomLine);
    // deal with current voice line
    this.renderVoice(tablature,voice);

    // draw ending vertical line
    tablature.verticalLine(tablature.endx, this.topStaffY, tablature.bottomLine);
    // cleanup tabRenderer
    this.tabRenderer.reset();
    // return tab size
    return this.lineSpace * this.nbLines;
  }
};

//
// Tablature plugin definition
//
var AbcViolinTab = function() {
  return { name: 'ViolinTab', tablature: plugin };
}

module.exports = AbcViolinTab;